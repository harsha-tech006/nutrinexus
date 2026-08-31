from bson import ObjectId
from database.db import get_db
import datetime

class PregnancyProfile:
    @staticmethod
    def get_collection():
        db = get_db()
        return db['pregnancy_profiles'] if db is not None else None

    @classmethod
    def get_profile(cls, user_id):
        collection = cls.get_collection()
        if collection is None:
            return cls.get_default_pregnancy_data(user_id)
        
        prof = collection.find_one({"user_id": str(user_id)})
        if not prof:
            return cls.get_default_pregnancy_data(user_id)
        
        prof['_id'] = str(prof['_id'])
        return prof

    @classmethod
    def save_profile(cls, user_id, data):
        collection = cls.get_collection()
        if collection is None:
            return data

        query = {"user_id": str(user_id)}
        update = {"$set": {
            "user_id": str(user_id),
            "trimester": int(data.get("trimester", 2)), # 1, 2, or 3
            "weeks_pregnant": int(data.get("weeks_pregnant", 18)),
            "due_date": data.get("due_date", (datetime.date.today() + datetime.timedelta(days=154)).isoformat()),
            "prenatal_vitamins_taken": bool(data.get("prenatal_vitamins_taken", True)),
            "water_logged_liters": float(data.get("water_logged_liters", 2.8)),
            "updated_at": datetime.datetime.utcnow().isoformat()
        }}
        
        collection.update_one(query, update, upsert=True)
        return cls.get_profile(user_id)

    @classmethod
    def get_default_pregnancy_data(cls, user_id):
        due = datetime.date.today() + datetime.timedelta(days=154) # ~22 weeks left
        return {
            "user_id": str(user_id),
            "trimester": 2,
            "weeks_pregnant": 18,
            "due_date": due.isoformat(),
            "prenatal_vitamins_taken": True,
            "water_logged_liters": 2.8
        }
