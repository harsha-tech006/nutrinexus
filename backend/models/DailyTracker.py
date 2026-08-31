import datetime
from bson import ObjectId
from database.db import get_db

class DailyTracker:
    @staticmethod
    def get_collection():
        db = get_db()
        return db['dailytrackers']

    @classmethod
    def find_or_create(cls, user_id, date_str):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        collection = cls.get_collection()
        tracker = collection.find_one({"user_id": user_id, "date": date_str})
        
        if not tracker:
            tracker = {
                "user_id": user_id,
                "date": date_str,
                "calories_consumed": 0.0,
                "calories_burned": 0.0,
                "protein": 0.0,
                "carbs": 0.0,
                "fat": 0.0,
                "fiber": 0.0,
                "water_intake": 0.0,  # in mL
                "exercise": [],        # list of {name, duration_mins, calories_burned}
                "fitness_skipped": False,
                "created_at": datetime.datetime.utcnow(),
                "updated_at": datetime.datetime.utcnow()
            }
            result = collection.insert_one(tracker)
            tracker['_id'] = result.inserted_id
            
        return tracker

    @classmethod
    def get_by_date(cls, user_id, date_str):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return cls.get_collection().find_one({"user_id": user_id, "date": date_str})

    @classmethod
    def update_tracker(cls, user_id, date_str, updates):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        collection = cls.get_collection()
        updates['updated_at'] = datetime.datetime.utcnow()
        
        # Create if not exists first, then update
        cls.find_or_create(user_id, date_str)
        
        collection.update_one(
            {"user_id": user_id, "date": date_str},
            {"$set": updates}
        )
        return collection.find_one({"user_id": user_id, "date": date_str})

    @classmethod
    def recalculate_meals(cls, user_id, date_str):
        """Recalculate calories and macros from FoodHistory for a specific day."""
        from models.FoodHistory import FoodHistory
        
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        meals = FoodHistory.get_by_user(user_id, date_str)
        
        calories_consumed = sum(item.get('calories', 0.0) for item in meals)
        protein = sum(item.get('protein', 0.0) for item in meals)
        carbs = sum(item.get('carbs', 0.0) for item in meals)
        fat = sum(item.get('fat', 0.0) for item in meals)
        fiber = sum(item.get('fiber', 0.0) for item in meals)
        
        cls.update_tracker(user_id, date_str, {
            "calories_consumed": round(calories_consumed, 1),
            "protein": round(protein, 1),
            "carbs": round(carbs, 1),
            "fat": round(fat, 1),
            "fiber": round(fiber, 1)
        })
