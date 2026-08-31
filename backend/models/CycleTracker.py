from bson import ObjectId
from database.db import get_db
import datetime

class CycleTracker:
    @staticmethod
    def get_collection():
        db = get_db()
        return db['cycle_trackers'] if db is not None else None

    @staticmethod
    def get_symptoms_collection():
        db = get_db()
        return db['period_symptom_logs'] if db is not None else None

    @classmethod
    def get_user_cycle(cls, user_id):
        collection = cls.get_collection()
        if collection is None:
            return cls.get_default_cycle_data(user_id)
        
        cycle = collection.find_one({"user_id": str(user_id)})
        if not cycle:
            return cls.get_default_cycle_data(user_id)
        
        cycle['_id'] = str(cycle['_id'])
        return cycle

    @classmethod
    def save_user_cycle(cls, user_id, cycle_data):
        collection = cls.get_collection()
        if collection is None:
            return cycle_data

        query = {"user_id": str(user_id)}
        update = {"$set": {
            "user_id": str(user_id),
            "last_period_date": cycle_data.get("last_period_date", datetime.date.today().isoformat()),
            "cycle_length": int(cycle_data.get("cycle_length", 28)),
            "period_duration": int(cycle_data.get("period_duration", 5)),
            "updated_at": datetime.datetime.utcnow().isoformat()
        }}
        
        collection.update_one(query, update, upsert=True)
        return cls.get_user_cycle(user_id)

    @classmethod
    def log_symptoms(cls, user_id, log_data):
        collection = cls.get_symptoms_collection()
        entry = {
            "user_id": str(user_id),
            "date": log_data.get("date", datetime.date.today().isoformat()),
            "pain_level": int(log_data.get("pain_level", 0)), # 0 to 10
            "flow": log_data.get("flow", "Medium"), # Light, Medium, Heavy, Spotting
            "symptoms": log_data.get("symptoms", []), # ["Cramps", "Bloating", "Mood Swings"]
            "mood": log_data.get("mood", "Normal"),
            "notes": log_data.get("notes", ""),
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        if collection is not None:
            res = collection.insert_one(entry)
            entry['_id'] = str(res.inserted_id)
        return entry

    @classmethod
    def get_recent_symptom_logs(cls, user_id, limit=14):
        collection = cls.get_symptoms_collection()
        if collection is None:
            return []
        logs = list(collection.find({"user_id": str(user_id)}).sort("date", -1).limit(limit))
        for l in logs:
            l['_id'] = str(l['_id'])
        return logs

    @classmethod
    def get_default_cycle_data(cls, user_id):
        today = datetime.date.today()
        # Default 10 days ago as last period start date for demonstration
        last_start = today - datetime.timedelta(days=10)
        return {
            "user_id": str(user_id),
            "last_period_date": last_start.isoformat(),
            "cycle_length": 28,
            "period_duration": 5
        }
