from bson import ObjectId
from database.db import get_db
import datetime

class HealthAssessment:
    @staticmethod
    def get_collection():
        db = get_db()
        return db['health_assessments'] if db is not None else None

    @classmethod
    def save_assessment(cls, user_id, assessment_data):
        collection = cls.get_collection()
        entry = {
            "user_id": str(user_id),
            "date": assessment_data.get("date", datetime.date.today().isoformat()),
            "health_status": assessment_data.get("health_status", "Healthy"), # Healthy, Improving, Moderate Concern, Serious Concern, High Risk
            "risk_level": assessment_data.get("risk_level", "Low Risk"), # Low Risk, Moderate Risk, Serious Risk, High Risk
            "risk_score": int(assessment_data.get("risk_score", 22)), # 0 to 100
            "diet_adherence_pct": float(assessment_data.get("diet_adherence_pct", 85.0)),
            "trend": assessment_data.get("trend", "Improving"), # Positive, Stable, Negative
            "factors": assessment_data.get("factors", []),
            "recommendations": assessment_data.get("recommendations", []),
            "created_at": datetime.datetime.utcnow().isoformat()
        }

        if collection is not None:
            query = {"user_id": str(user_id), "date": entry["date"]}
            collection.update_one(query, {"$set": entry}, upsert=True)
        return entry

    @classmethod
    def get_latest_assessment(cls, user_id):
        collection = cls.get_collection()
        if collection is None:
            return None
        doc = collection.find_one({"user_id": str(user_id)}, sort=[("date", -1)])
        if doc:
            doc['_id'] = str(doc['_id'])
        return doc
