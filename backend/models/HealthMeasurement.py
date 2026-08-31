from bson import ObjectId
from database.db import get_db
import datetime

class HealthMeasurement:
    @staticmethod
    def get_collection():
        db = get_db()
        return db['health_measurements'] if db is not None else None

    @classmethod
    def log_measurement(cls, user_id, data):
        collection = cls.get_collection()
        entry = {
            "user_id": str(user_id),
            "date": data.get("date", datetime.date.today().isoformat()),
            "weight": float(data["weight"]) if data.get("weight") is not None else None,
            "blood_pressure_systolic": int(data["blood_pressure_systolic"]) if data.get("blood_pressure_systolic") is not None else None,
            "blood_pressure_diastolic": int(data["blood_pressure_diastolic"]) if data.get("blood_pressure_diastolic") is not None else None,
            "blood_glucose_fasting": float(data["blood_glucose_fasting"]) if data.get("blood_glucose_fasting") is not None else None,
            "blood_glucose_postprandial": float(data["blood_glucose_postprandial"]) if data.get("blood_glucose_postprandial") is not None else None,
            "heart_rate": int(data["heart_rate"]) if data.get("heart_rate") is not None else None,
            "water_intake_ml": float(data.get("water_intake_ml", 0)),
            "calories": float(data.get("calories", 0)),
            "protein": float(data.get("protein", 0)),
            "carbs": float(data.get("carbs", 0)),
            "fat": float(data.get("fat", 0)),
            "exercise_mins": int(data.get("exercise_mins", 0)),
            "sleep_hours": float(data.get("sleep_hours", 7.0)),
            "symptoms": data.get("symptoms", []),
            "medication_adhered": bool(data.get("medication_adhered", True)),
            "condition": data.get("condition", "General Fitness"),
            "notes": data.get("notes", ""),
            "created_at": datetime.datetime.utcnow().isoformat()
        }

        if collection is not None:
            # Upsert entry for given user and date
            query = {"user_id": str(user_id), "date": entry["date"]}
            collection.update_one(query, {"$set": entry}, upsert=True)
        return entry

    @classmethod
    def get_history(cls, user_id, days=30):
        collection = cls.get_collection()
        if collection is None:
            return cls.get_mock_history(user_id, days)

        start_date = (datetime.date.today() - datetime.timedelta(days=days)).isoformat()
        logs = list(collection.find({
            "user_id": str(user_id),
            "date": {"$gte": start_date}
        }).sort("date", 1))

        if not logs:
            return cls.get_mock_history(user_id, days)

        for l in logs:
            l['_id'] = str(l['_id'])
        return logs

    @classmethod
    def get_mock_history(cls, user_id, days=30):
        today = datetime.date.today()
        logs = []
        # Generate 14 days of realistic mock health tracking history showing improving trend
        for i in range(days - 1, -1, -1):
            d = (today - datetime.timedelta(days=i)).isoformat()
            factor = (days - i) / float(days) # 0.0 to 1.0 (progressing)
            logs.append({
                "user_id": str(user_id),
                "date": d,
                "weight": round(73.5 - (factor * 2.1), 1), # 73.5 kg -> 71.4 kg
                "blood_pressure_systolic": int(136 - (factor * 12)), # 136 mmHg -> 124 mmHg
                "blood_pressure_diastolic": int(88 - (factor * 7)), # 88 mmHg -> 81 mmHg
                "blood_glucose_fasting": round(135.0 - (factor * 28.0), 1), # 135 -> 107 mg/dL
                "blood_glucose_postprandial": round(180.0 - (factor * 35.0), 1), # 180 -> 145 mg/dL
                "heart_rate": int(78 - (factor * 5)),
                "water_intake_ml": round(2100 + (factor * 750)), # 2.1L -> 2.85L
                "calories": round(1950 - (factor * 150)),
                "protein": round(65 + (factor * 25)), # 65g -> 90g
                "carbs": round(220 - (factor * 40)),
                "fat": round(65 - (factor * 15)),
                "exercise_mins": int(20 + (factor * 25)), # 20m -> 45m
                "sleep_hours": round(6.2 + (factor * 1.3), 1), # 6.2h -> 7.5h
                "symptoms": ["Mild Fatigue"] if i > 7 else [],
                "medication_adhered": True if i < 10 else (i % 2 == 0),
                "condition": "Diabetes",
                "notes": "Followed NutriNexus balanced meal plan"
            })
        return logs
