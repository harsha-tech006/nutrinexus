import datetime
from bson import ObjectId
from database.db import get_db

class HealthReport:
    @staticmethod
    def get_collection():
        db = get_db()
        return db['healthreports']

    @classmethod
    def get_by_user(cls, user_id):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return list(cls.get_collection().find({"user_id": user_id}).sort("created_at", -1))

    @classmethod
    def create(cls, report_data):
        collection = cls.get_collection()
        report_data['created_at'] = datetime.datetime.utcnow()
        result = collection.insert_one(report_data)
        report_data['_id'] = result.inserted_id
        return report_data
