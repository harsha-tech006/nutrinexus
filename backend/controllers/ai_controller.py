import datetime
from flask import jsonify, g, request
from bson import ObjectId
from models.ChatHistory import ChatHistory
from models.MealPlan import MealPlan
from models.FoodHistory import FoodHistory
from models.DailyTracker import DailyTracker
from services.openai_service import generate_ai_chat_response, generate_ai_meal_plan

def post_chat_message(data):
    """Save user chat query, call AI service, and save response."""
    try:
        user_id = g.user_id
        user_profile = g.user if isinstance(g.user, dict) else {}
        message_content = (data.get('message') or '').strip() if isinstance(data, dict) else ''
        
        language = (data.get('language') if isinstance(data, dict) else None) or user_profile.get('language_preference') or 'English'
        language = str(language).strip()

        if not message_content:
            return jsonify({"message": "Message content is required."}), 400

        # Save user message safely
        try:
            ChatHistory.save_message(user_id, "user", message_content)
        except Exception as e:
            print(f"Error saving user message to db: {e}")

        # Retrieve chat history for OpenAI context safely
        messages_for_ai = []
        try:
            history_obj = ChatHistory.get_by_user(user_id)
            if history_obj and isinstance(history_obj.get("messages"), list):
                messages_for_ai = history_obj.get("messages")[-10:]
        except Exception as e:
            print(f"Error getting chat history for AI: {e}")

        if not messages_for_ai:
            messages_for_ai = [{"role": "user", "content": message_content}]

        # Generate response
        try:
            assistant_response = generate_ai_chat_response(messages_for_ai, user_profile, language)
        except Exception as e:
            print(f"Error generating AI chat response: {e}")
            from services.openai_service import generate_mock_chat_response
            assistant_response = generate_mock_chat_response(message_content, user_profile, language)

        # Save assistant response safely
        saved_assistant_msg = {
            "role": "assistant",
            "content": assistant_response,
            "timestamp": datetime.datetime.utcnow().strftime("%H:%M")
        }
        try:
            saved_assistant_msg = ChatHistory.save_message(user_id, "assistant", assistant_response)
        except Exception as e:
            print(f"Error saving assistant message to db: {e}")

        return jsonify({
            "response": assistant_response,
            "message": saved_assistant_msg
        }), 200
    except Exception as e:
        print(f"Server error in post_chat_message: {e}")
        user_profile = g.user if isinstance(g.user, dict) else {}
        msg_content = data.get('message', '') if isinstance(data, dict) else 'hello'
        lang = data.get('language', 'English') if isinstance(data, dict) else 'English'
        from services.openai_service import generate_mock_chat_response
        fallback_resp = generate_mock_chat_response(msg_content, user_profile, lang)
        return jsonify({
            "response": fallback_resp,
            "message": {
                "role": "assistant",
                "content": fallback_resp,
                "timestamp": datetime.datetime.utcnow().strftime("%H:%M")
            }
        }), 200

def get_chat_history_summary():
    """Retrieve full chat logs for current user."""
    try:
        user_id = g.user_id
        history = ChatHistory.get_by_user(user_id)
        if not history:
            return jsonify({"history": {"messages": []}}), 200
        
        # Format id safely
        if '_id' in history:
            history['_id'] = str(history['_id'])
        if 'user_id' in history:
            history['user_id'] = str(history['user_id'])
        if 'created_at' in history and hasattr(history['created_at'], 'isoformat'):
            history['created_at'] = history['created_at'].isoformat()
        if 'updated_at' in history and hasattr(history['updated_at'], 'isoformat'):
            history['updated_at'] = history['updated_at'].isoformat()
        
        return jsonify({"history": history}), 200
    except Exception as e:
        print(f"Error retrieving chat history: {e}")
        return jsonify({"history": {"messages": []}}), 200

def clear_chat_history():
    """Delete all chat logs for user."""
    try:
        user_id = g.user_id
        ChatHistory.clear_history(user_id)
        return jsonify({"message": "Chat history cleared successfully."}), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def generate_meal_plan_api():
    """Build a customized weekly or daily diet routine."""
    try:
        user_id = g.user_id
        user_profile = g.user
        plan_type = request.args.get('plan_type', 'daily').strip().lower() # daily, weekly, monthly
        regenerate = request.args.get('regenerate', 'false').strip().lower() == 'true'
        date_str = request.args.get('date', datetime.date.today().isoformat()).strip()

        if plan_type not in ['daily', 'weekly', 'monthly']:
            return jsonify({"message": "Plan type must be daily, weekly, or monthly."}), 400

        if plan_type == 'daily':
            if not user_profile.get('age') or not user_profile.get('weight') or not user_profile.get('height'):
                return jsonify({
                    "empty_profile": True,
                    "message": "Complete your profile to receive personalized AI meal recommendations."
                }), 200

            plan = None if regenerate else MealPlan.get_by_date(user_id, date_str)
            if not plan:
                plan_data = MealPlan.generate_local_plan(user_profile, date_str)
                plan = MealPlan.create_or_update(user_id, date_str, plan_data)

            plan['_id'] = str(plan['_id'])
            plan['user_id'] = str(plan['user_id'])
            
            tracker = DailyTracker.find_or_create(user_id, date_str)
            tracker['_id'] = str(tracker['_id'])
            tracker['user_id'] = str(tracker['user_id'])
            if 'created_at' in tracker: tracker['created_at'] = tracker['created_at'].isoformat()
            if 'updated_at' in tracker: tracker['updated_at'] = tracker['updated_at'].isoformat()

            return jsonify({
                "meal_plan": plan,
                "tracker": tracker
            }), 200

        meal_plan = generate_ai_meal_plan(user_profile, plan_type)
        return jsonify({"meal_plan": meal_plan}), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def mark_meal_eaten_api():
    """Toggles eaten status of a meal and logs or removes it in FoodHistory and DailyTracker."""
    try:
        user_id = g.user_id
        data = request.get_json() or {}
        meal_type = data.get('meal_type', '').strip().lower()
        eaten = data.get('eaten', True)
        date_str = data.get('date', datetime.date.today().isoformat())

        if meal_type not in ['breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner']:
            return jsonify({"message": "Invalid meal type."}), 400

        updated_plan = MealPlan.mark_meal_eaten(user_id, date_str, meal_type, eaten)
        if not updated_plan:
            return jsonify({"message": "Meal plan not found."}), 404

        meal_data = updated_plan['meals'][meal_type]

        if eaten:
            fh_meal_type = "snacks" if "snack" in meal_type else meal_type
            FoodHistory.create({
                "user_id": ObjectId(user_id),
                "date": date_str,
                "time": datetime.datetime.utcnow().strftime("%H:%M"),
                "meal_type": fh_meal_type,
                "food_name": meal_data['name'],
                "calories": float(meal_data['calories']),
                "protein": float(meal_data['protein']),
                "carbs": float(meal_data['carbs']),
                "fat": float(meal_data['fat']),
                "fiber": float(meal_data.get('fiber', 0.0)),
                "food_image": meal_data.get('imageUrl'),
                "created_at": datetime.datetime.utcnow()
            })
            DailyTracker.recalculate_meals(user_id, date_str)
        else:
            fh_meal_type = "snacks" if "snack" in meal_type else meal_type
            FoodHistory.get_collection().delete_one({
                "user_id": ObjectId(user_id),
                "date": date_str,
                "meal_type": fh_meal_type,
                "food_name": meal_data['name']
            })
            DailyTracker.recalculate_meals(user_id, date_str)

        updated_plan['_id'] = str(updated_plan['_id'])
        updated_plan['user_id'] = str(updated_plan['user_id'])
        
        tracker = DailyTracker.find_or_create(user_id, date_str)
        tracker['_id'] = str(tracker['_id'])
        tracker['user_id'] = str(tracker['user_id'])
        if 'created_at' in tracker: tracker['created_at'] = tracker['created_at'].isoformat()
        if 'updated_at' in tracker: tracker['updated_at'] = tracker['updated_at'].isoformat()

        return jsonify({
            "message": f"{meal_type.replace('_', ' ').capitalize()} marked successfully.",
            "meal_plan": updated_plan,
            "tracker": tracker
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def mark_meal_skipped_api():
    """Toggles skipped status of a meal and removes it from FoodHistory if it was logged as eaten."""
    try:
        user_id = g.user_id
        data = request.get_json() or {}
        meal_type = data.get('meal_type', '').strip().lower()
        skipped = data.get('skipped', True)
        date_str = data.get('date', datetime.date.today().isoformat())

        if meal_type not in ['breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner']:
            return jsonify({"message": "Invalid meal type."}), 400

        updated_plan = MealPlan.mark_skipped(user_id, date_str, meal_type, skipped)
        if not updated_plan:
            return jsonify({"message": "Meal plan not found."}), 404

        # If marked skipped, delete it from food history just in case it was logged as eaten
        if skipped:
            from models.Notification import Notification
            readable_meal = meal_type.replace('_', ' ').capitalize()
            Notification.create({
                "user_id": ObjectId(user_id),
                "title": f"Meal Skipped: {readable_meal}",
                "body": f"You marked your {readable_meal} as skipped today. Adjust your remaining nutrition targets accordingly.",
                "type": "Food",
                "is_read": False,
                "created_at": datetime.datetime.utcnow()
            })

            fh_meal_type = "snacks" if "snack" in meal_type else meal_type
            meal_data = updated_plan['meals'][meal_type]
            FoodHistory.get_collection().delete_one({
                "user_id": ObjectId(user_id),
                "date": date_str,
                "meal_type": fh_meal_type,
                "food_name": meal_data['name']
            })
            DailyTracker.recalculate_meals(user_id, date_str)

        updated_plan['_id'] = str(updated_plan['_id'])
        updated_plan['user_id'] = str(updated_plan['user_id'])
        
        tracker = DailyTracker.find_or_create(user_id, date_str)
        tracker['_id'] = str(tracker['_id'])
        tracker['user_id'] = str(tracker['user_id'])
        if 'created_at' in tracker: tracker['created_at'] = tracker['created_at'].isoformat()
        if 'updated_at' in tracker: tracker['updated_at'] = tracker['updated_at'].isoformat()

        return jsonify({
            "message": f"{meal_type.replace('_', ' ').capitalize()} marked as skipped.",
            "meal_plan": updated_plan,
            "tracker": tracker
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def update_water_consumed_api():
    """Records logged water intake in current meal plan and DailyTracker."""
    try:
        user_id = g.user_id
        data = request.get_json() or {}
        water_ml = float(data.get('water_ml', 0.0))
        date_str = data.get('date', datetime.date.today().isoformat())

        updated_plan = MealPlan.update_water_consumed(user_id, date_str, water_ml)
        if not updated_plan:
            return jsonify({"message": "Meal plan not found."}), 404

        DailyTracker.update_tracker(user_id, date_str, {"water_intake": water_ml})

        updated_plan['_id'] = str(updated_plan['_id'])
        updated_plan['user_id'] = str(updated_plan['user_id'])

        tracker = DailyTracker.find_or_create(user_id, date_str)
        tracker['_id'] = str(tracker['_id'])
        tracker['user_id'] = str(tracker['user_id'])
        if 'created_at' in tracker: tracker['created_at'] = tracker['created_at'].isoformat()
        if 'updated_at' in tracker: tracker['updated_at'] = tracker['updated_at'].isoformat()

        return jsonify({
            "message": "Water intake updated successfully.",
            "meal_plan": updated_plan,
            "tracker": tracker
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def replace_meal_api():
    """Generates a fresh alternative for a single meal slot."""
    try:
        user_id = g.user_id
        user_profile = g.user
        data = request.get_json() or {}
        meal_type = data.get('meal_type', '').strip().lower()
        date_str = data.get('date', datetime.date.today().isoformat())

        if meal_type not in ['breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner']:
            return jsonify({"message": "Invalid meal type."}), 400

        plan = MealPlan.get_by_date(user_id, date_str)
        if not plan:
            return jsonify({"message": "Meal plan not found."}), 404

        fresh_plan = MealPlan.generate_local_plan(user_profile, date_str)
        new_meal = fresh_plan['meals'][meal_type]

        collection = MealPlan.get_collection()
        meal_key = f"meals.{meal_type}"
        collection.update_one(
            {"_id": plan["_id"]},
            {"$set": {meal_key: new_meal, "updated_at": datetime.datetime.utcnow()}}
        )

        updated_plan = collection.find_one({"_id": plan["_id"]})
        updated_plan['_id'] = str(updated_plan['_id'])
        updated_plan['user_id'] = str(updated_plan['user_id'])

        return jsonify({
            "message": f"{meal_type.replace('_', ' ').capitalize()} replaced successfully.",
            "meal_plan": updated_plan
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500


def food_recognition_placeholder(data):
    """Simulated AI image recognition for food calories identification."""
    try:
        image_base64 = data.get('image')
        if not image_base64:
            return jsonify({"message": "Image data is required."}), 400

        # Simulate delay or return parsed food item
        # A real implementation would parse via Google Vision / OpenAI GPT-4 Vision.
        # We supply an educational demonstration response:
        food_details = {
            "name": "Avocado Chicken Salad",
            "confidence": "94.5%",
            "nutrition": {
                "calories": 380,
                "protein": 28,
                "carbs": 12,
                "fat": 24
            },
            "dietary_flags": ["High Protein", "Keto Friendly", "Low GI"],
            "suggestion": "Excellent option for muscle gain or diabetes control. Good fats from avocado support brain health."
        }

        return jsonify({
            "message": "Food recognized successfully (educational placeholder demo).",
            "recognized": True,
            "food": food_details
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500
