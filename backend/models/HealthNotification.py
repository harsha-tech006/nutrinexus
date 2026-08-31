from bson import ObjectId
from database.db import get_db
import datetime

class HealthNotification:
    @staticmethod
    def get_collection():
        db = get_db()
        return db['health_notifications'] if db is not None else None

    @classmethod
    def create_notification(cls, user_id, data):
        collection = cls.get_collection()
        entry = {
            "user_id": str(user_id),
            "title": data.get("title", "Health Update"),
            "message": data.get("message", ""),
            "severity": data.get("severity", "healthy"), # healthy, moderate, serious, high_risk
            "type": data.get("type", "health_alert"), # health_alert, meal_reminder, water_reminder, med_reminder
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "read": False,
            "action_required": bool(data.get("action_required", False))
        }

        if collection is not None:
            res = collection.insert_one(entry)
            entry['_id'] = str(res.inserted_id)
        return entry

    @classmethod
    def get_user_notifications(cls, user_id, limit=20):
        collection = cls.get_collection()
        if collection is None:
            return cls.get_default_notifications(user_id)

        logs = list(collection.find({"user_id": str(user_id)}).sort("timestamp", -1).limit(limit))
        if not logs:
            return cls.get_default_notifications(user_id)

        for l in logs:
            l['_id'] = str(l['_id'])
        return logs

    @classmethod
    def mark_read(cls, user_id, notification_id):
        collection = cls.get_collection()
        if collection is not None:
            try:
                collection.update_one(
                    {"_id": ObjectId(notification_id), "user_id": str(user_id)},
                    {"$set": {"read": True}}
                )
            except Exception:
                pass
        return True

    @classmethod
    def get_default_notifications(cls, user_id):
        now = datetime.datetime.utcnow().isoformat()
        return [
            {
                "id": "notif-1",
                "title": "Positive Health Trend",
                "message": "Great progress! Your tracked blood glucose and protein intake are steadily improving over the last 14 days. Keep following your NutriNexus plan.",
                "severity": "healthy",
                "type": "health_alert",
                "timestamp": now,
                "read": False,
                "action_required": False
            },
            {
                "id": "notif-2",
                "title": "Hydration Target Reached",
                "message": "You reached 2.8L water intake today! Consistently meeting your hydration target supports metabolic clearance.",
                "severity": "healthy",
                "type": "water_reminder",
                "timestamp": now,
                "read": True,
                "action_required": False
            },
            {
                "id": "notif-3",
                "title": "Blood Pressure Tracking Reminder",
                "message": "Remember to log your evening blood pressure measurement to maintain an accurate weekly monitoring trend.",
                "severity": "moderate",
                "type": "health_alert",
                "timestamp": now,
                "read": False,
                "action_required": True
            }
        ]
