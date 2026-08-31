import datetime
from flask import jsonify, g, request
from bson import ObjectId
from models.FoodHistory import FoodHistory
from models.DailyTracker import DailyTracker
from database.db import get_db

def safe_isoformat(val):
    if hasattr(val, 'isoformat'):
        return val.isoformat()
    return str(val) if val is not None else None

def log_meal_entry(data):
    """Log a meal entry, save to history, and update daily tracker."""
    try:
        user_id = g.user_id
        date_str = data.get('date')  # Format: YYYY-MM-DD
        meal_type = data.get('meal_type', '').strip().lower()
        if meal_type == 'snack':
            meal_type = 'snacks'
        food_name = data.get('food_name', '').strip()
        calories = data.get('calories')
        protein = data.get('protein')
        carbs = data.get('carbs')
        fat = data.get('fat')
        fiber = data.get('fiber')
        food_image = data.get('food_image') # Optional base64 or URL

        if not date_str or not meal_type or not food_name:
            return jsonify({"message": "Date, meal type, and food name are required."}), 400

        if meal_type not in ['breakfast', 'lunch', 'dinner', 'snacks']:
            return jsonify({"message": "Meal type must be breakfast, lunch, dinner, or snacks."}), 400

        # Save to FoodHistory
        meal = FoodHistory(
            user_id=user_id,
            date=date_str,
            meal_type=meal_type,
            food_name=food_name,
            calories=calories,
            protein=protein,
            carbs=carbs,
            fat=fat,
            fiber=fiber,
            food_image=food_image
        )
        created_meal = FoodHistory.create(meal.to_dict())

        # Recalculate daily tracker totals
        DailyTracker.recalculate_meals(user_id, date_str)
        updated_tracker = DailyTracker.find_or_create(user_id, date_str)

        # Format output
        created_meal['_id'] = str(created_meal['_id'])
        created_meal['user_id'] = str(created_meal['user_id'])
        created_meal['created_at'] = safe_isoformat(created_meal.get('created_at'))
        
        # Format tracker output
        updated_tracker['_id'] = str(updated_tracker['_id'])
        updated_tracker['user_id'] = str(updated_tracker['user_id'])
        updated_tracker['created_at'] = safe_isoformat(updated_tracker.get('created_at'))
        updated_tracker['updated_at'] = safe_isoformat(updated_tracker.get('updated_at'))

        return jsonify({
            "message": "Meal logged successfully.",
            "meal": created_meal,
            "tracker": updated_tracker
        }), 201
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def get_daily_tracker_summary(date_str):
    """Retrieve daily summary of calories, macros, water, and logged meals."""
    try:
        user_id = g.user_id
        if not date_str:
            date_str = datetime.datetime.utcnow().strftime("%Y-%m-%d")

        tracker = DailyTracker.find_or_create(user_id, date_str)
        meals = FoodHistory.get_by_user(user_id, date_str)

        # Format DB objects
        tracker['_id'] = str(tracker['_id'])
        tracker['user_id'] = str(tracker['user_id'])
        tracker['created_at'] = safe_isoformat(tracker.get('created_at'))
        tracker['updated_at'] = safe_isoformat(tracker.get('updated_at'))

        formatted_meals = []
        for meal in meals:
            meal['_id'] = str(meal['_id'])
            meal['user_id'] = str(meal['user_id'])
            meal['created_at'] = safe_isoformat(meal.get('created_at'))
            formatted_meals.append(meal)

        return jsonify({
            "tracker": tracker,
            "meals": formatted_meals
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def log_water_intake(data):
    """Log water intake in mL (incrementing existing)."""
    try:
        user_id = g.user_id
        date_str = data.get('date')
        amount = data.get('amount')  # in mL, can be positive

        if not date_str or amount is None:
            return jsonify({"message": "Date and amount are required."}), 400

        tracker = DailyTracker.find_or_create(user_id, date_str)
        current_water = tracker.get('water_intake', 0.0)
        new_water = max(0.0, current_water + float(amount))

        updated_tracker = DailyTracker.update_tracker(user_id, date_str, {
            "water_intake": new_water
        })

        # Format output
        updated_tracker['_id'] = str(updated_tracker['_id'])
        updated_tracker['user_id'] = str(updated_tracker['user_id'])
        updated_tracker['created_at'] = safe_isoformat(updated_tracker.get('created_at'))
        updated_tracker['updated_at'] = safe_isoformat(updated_tracker.get('updated_at'))

        return jsonify({
            "message": "Water intake updated successfully.",
            "tracker": updated_tracker
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def log_exercise_entry(data):
    """Log physical exercise and update calories burned."""
    try:
        user_id = g.user_id
        date_str = data.get('date')
        name = data.get('name', '').strip()
        duration = data.get('duration_mins') if data.get('duration_mins') is not None else data.get('duration')
        calories_burned = data.get('calories_burned')

        if not date_str or not name or duration is None or calories_burned is None:
            return jsonify({"message": "Date, name, duration (mins), and calories burned are required."}), 400

        tracker = DailyTracker.find_or_create(user_id, date_str)
        exercises = tracker.get('exercise', [])
        
        new_exercise = {
            "id": str(ObjectId()),
            "name": name,
            "duration_mins": float(duration),
            "calories_burned": float(calories_burned),
            "logged_at": datetime.datetime.utcnow().strftime("%H:%M")
        }
        
        exercises.append(new_exercise)
        total_burned = sum(ex['calories_burned'] for ex in exercises)

        updated_tracker = DailyTracker.update_tracker(user_id, date_str, {
            "exercise": exercises,
            "calories_burned": round(total_burned, 1)
        })

        # Format output
        updated_tracker['_id'] = str(updated_tracker['_id'])
        updated_tracker['user_id'] = str(updated_tracker['user_id'])
        updated_tracker['created_at'] = safe_isoformat(updated_tracker.get('created_at'))
        updated_tracker['updated_at'] = safe_isoformat(updated_tracker.get('updated_at'))

        return jsonify({
            "message": "Exercise logged successfully.",
            "tracker": updated_tracker
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def delete_meal_entry(meal_id):
    """Delete a meal log and update totals."""
    try:
        user_id = g.user_id
        
        # Find the meal first to get its date
        db = get_db()
        meal = db['foodentries'].find_one({"_id": ObjectId(meal_id), "user_id": ObjectId(user_id)})
        
        if not meal:
            return jsonify({"message": "Meal entry not found or unauthorized."}), 404
            
        date_str = meal['date']
        
        # Delete from history
        FoodHistory.delete_by_id(meal_id, user_id)
        
        # Recalculate daily tracker totals
        DailyTracker.recalculate_meals(user_id, date_str)
        updated_tracker = DailyTracker.find_or_create(user_id, date_str)
        
        # Format tracker output
        updated_tracker['_id'] = str(updated_tracker['_id'])
        updated_tracker['user_id'] = str(updated_tracker['user_id'])
        updated_tracker['created_at'] = safe_isoformat(updated_tracker.get('created_at'))
        updated_tracker['updated_at'] = safe_isoformat(updated_tracker.get('updated_at'))
        
        return jsonify({
            "message": "Meal entry deleted successfully.",
            "tracker": updated_tracker
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def get_food_history_list():
    """Retrieve full food history for the user, with searching/filtering."""
    try:
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            return jsonify({"history": []}), 200

        search = request.args.get('search', '').strip()
        meal_type = request.args.get('meal_type', '').strip().lower()
        limit = int(request.args.get('limit', 100))
        
        db = get_db()
        if db is None:
            return jsonify({"history": []}), 200

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

        if search:
            query["food_name"] = {"$regex": search, "$options": "i"}
        if meal_type:
            query["meal_type"] = meal_type
            
        history = list(db['foodentries'].find(query).sort("created_at", -1).limit(limit))
        
        formatted_history = []
        for item in history:
            try:
                formatted_history.append({
                    "_id": str(item.get('_id', '')),
                    "user_id": str(item.get('user_id', '')),
                    "food_name": str(item.get('food_name', '')),
                    "calories": item.get('calories', 0),
                    "protein": item.get('protein', 0),
                    "carbs": item.get('carbs', 0),
                    "fat": item.get('fat', 0),
                    "meal_type": item.get('meal_type', 'breakfast'),
                    "date": safe_isoformat(item.get('date')),
                    "created_at": safe_isoformat(item.get('created_at'))
                })
            except Exception as item_err:
                print(f"[formatting food history item ERROR] {item_err}", file=sys.stderr)
            
        return jsonify({"history": formatted_history}), 200
    except Exception as e:
        print(f"[get_food_history_list ERROR] {e}", file=sys.stderr)
        return jsonify({"history": []}), 200

def delete_exercise_entry(exercise_id):
    """Delete an exercise entry and recalculate calories burned."""
    try:
        user_id = g.user_id
        db = get_db()
        collection = db['dailytrackers']
        
        # Find tracker containing this exercise
        tracker = collection.find_one({
            "user_id": ObjectId(user_id),
            "exercise.id": exercise_id
        })
        
        if not tracker:
            return jsonify({"message": "Exercise entry not found or unauthorized."}), 404
            
        date_str = tracker['date']
        exercises = tracker.get('exercise', [])
        
        # Filter out the exercise to delete
        updated_exercises = [ex for ex in exercises if ex.get('id') != exercise_id]
        total_burned = sum(ex['calories_burned'] for ex in updated_exercises)
        
        updated_tracker = DailyTracker.update_tracker(user_id, date_str, {
            "exercise": updated_exercises,
            "calories_burned": round(total_burned, 1)
        })
        
        # Format output
        updated_tracker['_id'] = str(updated_tracker['_id'])
        updated_tracker['user_id'] = str(updated_tracker['user_id'])
        updated_tracker['created_at'] = safe_isoformat(updated_tracker.get('created_at'))
        updated_tracker['updated_at'] = safe_isoformat(updated_tracker.get('updated_at'))
        
        return jsonify({
            "message": "Exercise entry deleted successfully.",
            "tracker": updated_tracker
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def toggle_fitness_skip_api():
    """Toggles fitness skip status on the daily tracker. If True, sends alert email to the user."""
    try:
        user_id = g.user_id
        user_profile = g.user
        data = request.get_json() or {}
        date_str = data.get('date', datetime.date.today().isoformat())
        skipped = data.get('skipped', True)

        updated_tracker = DailyTracker.update_tracker(user_id, date_str, {
            "fitness_skipped": skipped
        })

        if skipped:
            # Send fitness skipped email notification
            from services.mail_service import send_fitness_skipped_email
            send_fitness_skipped_email(user_profile.get('email'), user_profile.get('name', 'User'))

        # Format output
        updated_tracker['_id'] = str(updated_tracker['_id'])
        updated_tracker['user_id'] = str(updated_tracker['user_id'])
        updated_tracker['created_at'] = safe_isoformat(updated_tracker.get('created_at'))
        updated_tracker['updated_at'] = safe_isoformat(updated_tracker.get('updated_at'))

        return jsonify({
            "message": "Fitness routine skipped status updated." if skipped else "Fitness routine skip cleared.",
            "tracker": updated_tracker
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500
