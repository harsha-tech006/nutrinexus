import datetime
from bson import ObjectId
from database.db import get_db

class Goals:
    def __init__(self, user_id, goal_type, target_weight, start_weight, target_calories, start_date=None, target_date=None):
        self.user_id = ObjectId(user_id) if isinstance(user_id, str) else user_id
        self.goal_type = goal_type  # Weight Loss, Weight Gain, Muscle Gain, Healthy Lifestyle
        self.target_weight = float(target_weight) if target_weight is not None else 0.0
        self.start_weight = float(start_weight) if start_weight is not None else 0.0
        self.current_weight = float(start_weight) if start_weight is not None else 0.0
        self.target_calories = float(target_calories) if target_calories is not None else 0.0
        self.start_date = start_date or datetime.datetime.utcnow().strftime("%Y-%m-%d")
        self.target_date = target_date
        self.created_at = datetime.datetime.utcnow()
        self.updated_at = datetime.datetime.utcnow()

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "goal_type": self.goal_type,
            "target_weight": self.target_weight,
            "start_weight": self.start_weight,
            "current_weight": self.current_weight,
            "target_calories": self.target_calories,
            "start_date": self.start_date,
            "target_date": self.target_date,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    @staticmethod
    def get_collection():
        db = get_db()
        return db['healthgoals']

    @classmethod
    def get_by_user(cls, user_id):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return cls.get_collection().find_one({"user_id": user_id})

    @classmethod
    def create_or_update(cls, user_id, goal_data):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        collection = cls.get_collection()
        existing = collection.find_one({"user_id": user_id})
        
        goal_data['updated_at'] = datetime.datetime.utcnow()
        if existing:
            # Merge current weight update
            if 'current_weight' in goal_data:
                # Update user weight in user details too
                from models.User import User
                User.update(user_id, {"weight": float(goal_data['current_weight'])})
                
            collection.update_one({"user_id": user_id}, {"$set": goal_data})
            return collection.find_one({"user_id": user_id})
        else:
            goal_data['user_id'] = user_id
            goal_data['created_at'] = datetime.datetime.utcnow()
            result = collection.insert_one(goal_data)
            goal_data['_id'] = result.inserted_id
            return goal_data
