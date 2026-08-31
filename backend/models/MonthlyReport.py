import datetime
from bson import ObjectId
from database.db import get_db

class MonthlyReport:
    @staticmethod
    def get_collection():
        db = get_db()
        return db['monthlyreports']

    @classmethod
    def get_by_user_month(cls, user_id, year, month):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return cls.get_collection().find_one({
            "user_id": user_id,
            "year": int(year),
            "month": int(month)
        })

    @classmethod
    def create_or_update(cls, user_id, year, month, report_data):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        collection = cls.get_collection()
        existing = collection.find_one({
            "user_id": user_id,
            "year": int(year),
            "month": int(month)
        })
        
        report_data['updated_at'] = datetime.datetime.utcnow()
        if existing:
            collection.update_one({"_id": existing['_id']}, {"$set": report_data})
            return collection.find_one({"_id": existing['_id']})
        else:
            report_data['user_id'] = user_id
            report_data['year'] = int(year)
            report_data['month'] = int(month)
            report_data['created_at'] = datetime.datetime.utcnow()
            result = collection.insert_one(report_data)
            report_data['_id'] = result.inserted_id
            return report_data
