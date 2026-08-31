import datetime
from bson import ObjectId
from database.db import get_db
from models.DailyTracker import DailyTracker

class YogaProgress:
    @staticmethod
    def get_collection():
        db = get_db()
        return db['yogaprogress']

    @classmethod
    def find_or_create_progress(cls, user_id):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        collection = cls.get_collection()
        progress = collection.find_one({"user_id": user_id})
        
        if not progress:
            progress = {
                "user_id": user_id,
                "favorites": [],              # List of pose names or IDs
                "completed_sessions": [],     # List of { pose_id, pose_name, date, duration_sec, calories_burned, timestamp }
                "listening_progress": [],     # List of { pose_id, listened_sec, total_sec, completed_listening, updated_at }
                "streak": 0,
                "last_active_date": "",       # format YYYY-MM-DD
                "created_at": datetime.datetime.utcnow(),
                "updated_at": datetime.datetime.utcnow()
            }
            result = collection.insert_one(progress)
            progress['_id'] = result.inserted_id
        else:
            # Ensure new keys are initialized if progress was seeded previously
            updated = False
            if "listening_progress" not in progress:
                progress["listening_progress"] = []
                updated = True
            if updated:
                collection.update_one({"_id": progress["_id"]}, {"$set": progress})
            
        return progress

    @classmethod
    def toggle_favorite(cls, user_id, pose_id):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        progress = cls.find_or_create_progress(user_id)
        favorites = progress.get('favorites', [])
        
        pose_id_str = str(pose_id)
        if pose_id_str in favorites:
            favorites.remove(pose_id_str)
            action = "removed"
        else:
            favorites.append(pose_id_str)
            action = "added"
            
        cls.get_collection().update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "favorites": favorites,
                    "updated_at": datetime.datetime.utcnow()
                }
            }
        )
        return favorites, action

    @classmethod
    def complete_pose(cls, user_id, pose_id, pose_name, duration_sec, calories_burned, listened_sec=0, completed_listening=False):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        progress = cls.find_or_create_progress(user_id)
        completed_sessions = progress.get('completed_sessions', [])
        
        today_str = datetime.datetime.utcnow().strftime("%Y-%m-%d")
        
        # Create session record
        new_session = {
            "pose_id": str(pose_id),
            "pose_name": pose_name,
            "date": today_str,
            "duration_sec": int(duration_sec),
            "calories_burned": float(calories_burned),
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        completed_sessions.append(new_session)
        
        # Calculate new streak
        current_streak = progress.get('streak', 0)
        last_date_str = progress.get('last_active_date', '')
        
        if last_date_str == "":
            new_streak = 1
        elif last_date_str == today_str:
            new_streak = current_streak
        else:
            last_date = datetime.datetime.strptime(last_date_str, "%Y-%m-%d")
            today_date = datetime.datetime.strptime(today_str, "%Y-%m-%d")
            delta = (today_date - last_date).days
            
            if delta == 1:
                new_streak = current_streak + 1
            else:
                new_streak = 1
                
        # Also update listening progress for this pose if logged during complete
        listening_progress = progress.get('listening_progress', [])
        pose_id_str = str(pose_id)
        found = False
        for item in listening_progress:
            if item.get('pose_id') == pose_id_str:
                item['listened_sec'] = int(listened_sec) if listened_sec else item.get('listened_sec', 0)
                item['completed_listening'] = bool(completed_listening) if completed_listening else item.get('completed_listening', False)
                item['updated_at'] = datetime.datetime.utcnow().isoformat()
                found = True
                break
        if not found:
            listening_progress.append({
                "pose_id": pose_id_str,
                "listened_sec": int(listened_sec),
                "total_sec": int(duration_sec),
                "completed_listening": bool(completed_listening),
                "updated_at": datetime.datetime.utcnow().isoformat()
            })

        cls.get_collection().update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "completed_sessions": completed_sessions,
                    "listening_progress": listening_progress,
                    "streak": new_streak,
                    "last_active_date": today_str,
                    "updated_at": datetime.datetime.utcnow()
                }
            }
        )
        
        # Sync with DailyTracker
        try:
            tracker = DailyTracker.find_or_create(user_id, today_str)
            exercises = tracker.get('exercise', [])
            
            new_exercise = {
                "id": str(ObjectId()),
                "name": f"Yoga: {pose_name}",
                "duration_mins": round(float(duration_sec) / 60.0, 1),
                "calories_burned": float(calories_burned),
                "logged_at": datetime.datetime.utcnow().strftime("%H:%M")
            }
            exercises.append(new_exercise)
            total_burned = sum(ex['calories_burned'] for ex in exercises)
            
            DailyTracker.update_tracker(user_id, today_str, {
                "exercise": exercises,
                "calories_burned": round(total_burned, 1)
            })
        except Exception as e:
            print(f"Error syncing yoga completion to DailyTracker: {str(e)}")
            
        return {
            "sessions_count": len(completed_sessions),
            "streak": new_streak,
            "today_completed": [s for s in completed_sessions if s['date'] == today_str]
        }

    @classmethod
    def update_listening(cls, user_id, pose_id, listened_sec, total_sec, completed_listening):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        progress = cls.find_or_create_progress(user_id)
        listening_progress = progress.get('listening_progress', [])
        
        pose_id_str = str(pose_id)
        found = False
        for item in listening_progress:
            if item.get('pose_id') == pose_id_str:
                item['listened_sec'] = int(listened_sec)
                item['total_sec'] = int(total_sec)
                item['completed_listening'] = bool(completed_listening)
                item['updated_at'] = datetime.datetime.utcnow().isoformat()
                found = True
                break
                
        if not found:
            listening_progress.append({
                "pose_id": pose_id_str,
                "listened_sec": int(listened_sec),
                "total_sec": int(total_sec),
                "completed_listening": bool(completed_listening),
                "updated_at": datetime.datetime.utcnow().isoformat()
            })
            
        cls.get_collection().update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "listening_progress": listening_progress,
                    "updated_at": datetime.datetime.utcnow()
                }
            }
        )
        return listening_progress
