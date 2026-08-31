import datetime
from bson import ObjectId
from database.db import get_db

class ChatHistory:
    @staticmethod
    def get_collection():
        db = get_db()
        return db['chathistories']

    @classmethod
    def get_by_user(cls, user_id):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        chat = cls.get_collection().find_one({"user_id": user_id})
        if not chat:
            chat = {
                "user_id": user_id,
                "messages": [],
                "created_at": datetime.datetime.utcnow(),
                "updated_at": datetime.datetime.utcnow()
            }
            result = cls.get_collection().insert_one(chat)
            chat['_id'] = result.inserted_id
        return chat

    @classmethod
    def save_message(cls, user_id, role, content):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Ensure history object exists
        cls.get_by_user(user_id)
        
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        cls.get_collection().update_one(
            {"user_id": user_id},
            {
                "$push": {"messages": message},
                "$set": {"updated_at": datetime.datetime.utcnow()}
            }
        )
        return message

    @classmethod
    def clear_history(cls, user_id):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        cls.get_collection().update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "messages": [],
                    "updated_at": datetime.datetime.utcnow()
                }
            }
        )
