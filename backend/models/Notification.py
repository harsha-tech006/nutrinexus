import datetime
# pyrefly: ignore [missing-import]
from bson import ObjectId
from database.db import get_db

class Notification:
    def __init__(self, user_id, title, body, notif_type="System", is_read=False):
        self.user_id = ObjectId(user_id) if isinstance(user_id, str) else user_id
        self.title = title
        self.body = body
        self.type = notif_type # Water, Medicine, Food, Sleep, System
        self.is_read = is_read
        self.created_at = datetime.datetime.utcnow()

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "title": self.title,
            "body": self.body,
            "type": self.type,
            "is_read": self.is_read,
            "created_at": self.created_at
        }

    @staticmethod
    def get_collection():
        db = get_db()
        return db['notifications']

    @classmethod
    def create(cls, data):
        collection = cls.get_collection()
        result = collection.insert_one(data)
        data['_id'] = result.inserted_id
        return data

    @classmethod
    def get_by_user(cls, user_id, unread_only=False):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        query = {"user_id": user_id}
        if unread_only:
            query["is_read"] = False
        return list(cls.get_collection().find(query).sort("created_at", -1))

    @classmethod
    def mark_as_read(cls, notif_id, user_id):
        if isinstance(notif_id, str):
            notif_id = ObjectId(notif_id)
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        cls.get_collection().update_one(
            {"_id": notif_id, "user_id": user_id},
            {"$set": {"is_read": True}}
        )

    @classmethod
    def mark_all_read(cls, user_id):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        cls.get_collection().update_many(
            {"user_id": user_id},
            {"$set": {"is_read": True}}
        )
