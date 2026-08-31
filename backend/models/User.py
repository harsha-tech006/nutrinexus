import datetime
from bson import ObjectId
from database.db import get_db

class User:
    def __init__(self, email, password, name):
        self.email = email
        self.password = password
        self.name = name
        self.created_at = datetime.datetime.utcnow()

    def to_dict(self):
        return {
            "email": self.email,
            "password": self.password,
            "name": self.name,
            "is_verified": False,
            "gender": None,
            "age": None,
            "height": None,
            "weight": None,
            "bmi": None,
            "activity_level": None,
            "goal": None,
            "diseases": [],
            "language_preference": "English",
            "created_at": self.created_at,
            "updated_at": self.created_at
        }

    @staticmethod
    def get_collection():
        db = get_db()
        return db['users']

    @classmethod
    def find_by_email(cls, email):
        if not email:
            return None
        return cls.get_collection().find_one({"email": email.strip().lower()})

    @classmethod
    def find_by_id(cls, user_id):
        if not user_id:
            return None
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return cls.get_collection().find_one({"_id": user_id})

    @classmethod
    def create(cls, user_dict):
        user_dict['created_at'] = datetime.datetime.utcnow()
        user_dict['updated_at'] = datetime.datetime.utcnow()
        if 'email' in user_dict:
            user_dict['email'] = user_dict['email'].strip().lower()
        result = cls.get_collection().insert_one(user_dict)
        user_dict['_id'] = result.inserted_id
        return user_dict

    @classmethod
    def update(cls, user_id, updates):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        updates['updated_at'] = datetime.datetime.utcnow()
        cls.get_collection().update_one(
            {"_id": user_id},
            {"$set": updates}
        )
        return cls.get_collection().find_one({"_id": user_id})