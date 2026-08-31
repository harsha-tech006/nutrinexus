import datetime
from bson import ObjectId
from database.db import get_db

class FoodHistory:
    def __init__(self, user_id, date, meal_type, food_name, calories, protein, carbs, fat, fiber=0.0, time=None, food_image=None):
        self.user_id = ObjectId(user_id) if isinstance(user_id, str) else user_id
        self.date = date  # Format: YYYY-MM-DD
        self.time = time or datetime.datetime.utcnow().strftime("%H:%M")
        self.meal_type = meal_type.lower()  # breakfast, lunch, dinner, snacks
        self.food_name = food_name
        self.calories = float(calories) if calories is not None else 0.0
        self.protein = float(protein) if protein is not None else 0.0
        self.carbs = float(carbs) if carbs is not None else 0.0
        self.fat = float(fat) if fat is not None else 0.0
        self.fiber = float(fiber) if fiber is not None else 0.0
        self.food_image = food_image
        self.created_at = datetime.datetime.utcnow()

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "date": self.date,
            "time": self.time,
            "meal_type": self.meal_type,
            "food_name": self.food_name,
            "calories": self.calories,
            "protein": self.protein,
            "carbs": self.carbs,
            "fat": self.fat,
            "fiber": self.fiber,
            "food_image": self.food_image,
            "created_at": self.created_at
        }

    @staticmethod
    def get_collection():
        db = get_db()
        return db['foodentries']

    @classmethod
    def create(cls, data):
        collection = cls.get_collection()
        result = collection.insert_one(data)
        data['_id'] = result.inserted_id
        return data

    @classmethod
    def get_by_user(cls, user_id, date=None, limit=100):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        query = {"user_id": user_id}
        if date:
            query["date"] = date
        return list(cls.get_collection().find(query).sort("created_at", -1).limit(limit))

    @classmethod
    def delete_by_id(cls, entry_id, user_id):
        if isinstance(entry_id, str):
            entry_id = ObjectId(entry_id)
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return cls.get_collection().delete_one({"_id": entry_id, "user_id": user_id})
