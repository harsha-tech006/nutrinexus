import datetime
import sys
from bson import ObjectId
from database.db import get_db

class MedicineReminder:
    def __init__(self, user_id, medicine_name, dosage, time, days=None, is_active=True):
        if isinstance(user_id, str) and ObjectId.is_valid(user_id):
            self.user_id = ObjectId(user_id)
        else:
            self.user_id = user_id
            
        self.medicine_name = medicine_name.strip() if medicine_name else ''
        self.dosage = dosage.strip() if dosage else ''  # e.g., "1 pill", "5ml"
        self.time = time.strip() if time else ''        # Format: HH:MM (e.g. 08:30)
        self.days = days if days is not None else ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        self.is_active = is_active
        self.created_at = datetime.datetime.utcnow()

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "medicine_name": self.medicine_name,
            "dosage": self.dosage,
            "time": self.time,
            "days": self.days,
            "is_active": self.is_active,
            "created_at": self.created_at
        }

    @staticmethod
    def get_collection():
        db = get_db()
        return db['medicinereminders']

    @classmethod
    def create(cls, data):
        collection = cls.get_collection()
        result = collection.insert_one(data)
        data['_id'] = result.inserted_id
        return data

    @classmethod
    def get_by_user(cls, user_id):
        try:
            if not user_id:
                return []
            
            query_conditions = []
            if isinstance(user_id, str):
                if ObjectId.is_valid(user_id):
                    query_conditions.append({"user_id": ObjectId(user_id)})
                query_conditions.append({"user_id": user_id})
            elif isinstance(user_id, ObjectId):
                query_conditions.append({"user_id": user_id})
                query_conditions.append({"user_id": str(user_id)})

            if len(query_conditions) > 1:
                query = {"$or": query_conditions}
            elif len(query_conditions) == 1:
                query = query_conditions[0]
            else:
                query = {"user_id": user_id}

            return list(cls.get_collection().find(query).sort("time", 1))
        except Exception as e:
            print(f"[MedicineReminder.get_by_user ERROR] {e}", file=sys.stderr)
            return []

    @classmethod
    def update_reminder(cls, reminder_id, user_id, updates):
        try:
            rem_oid = ObjectId(reminder_id) if isinstance(reminder_id, str) and ObjectId.is_valid(reminder_id) else reminder_id
            u_oid = ObjectId(user_id) if isinstance(user_id, str) and ObjectId.is_valid(user_id) else user_id
            
            cls.get_collection().update_one(
                {"_id": rem_oid, "user_id": u_oid},
                {"$set": updates}
            )
            return cls.get_collection().find_one({"_id": rem_oid})
        except Exception as e:
            print(f"[MedicineReminder.update_reminder ERROR] {e}", file=sys.stderr)
            return None

    @classmethod
    def delete(cls, reminder_id, user_id):
        try:
            rem_oid = ObjectId(reminder_id) if isinstance(reminder_id, str) and ObjectId.is_valid(reminder_id) else reminder_id
            u_oid = ObjectId(user_id) if isinstance(user_id, str) and ObjectId.is_valid(user_id) else user_id
            
            return cls.get_collection().delete_one({"_id": rem_oid, "user_id": u_oid})
        except Exception as e:
            print(f"[MedicineReminder.delete ERROR] {e}", file=sys.stderr)
            class EmptyResult:
                deleted_count = 0
            return EmptyResult()
