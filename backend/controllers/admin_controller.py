from flask import jsonify, g, request
from bson import ObjectId
from database.db import get_db
from models.User import User
from models.Disease import Disease

def check_admin_auth():
    """Verify if logged-in user is an administrator."""
    user = g.user
    # Standard admin role flag or matches email
    if not user.get('is_admin', False) and not str(user.get('email', '')).startswith('admin@'):
        return False
    return True

def get_admin_users():
    """Get list of registered users (admin only)."""
    try:
        if not check_admin_auth():
            return jsonify({"message": "Forbidden. Admin access required."}), 403

        db = get_db()
        users = list(db['users'].find({}, {"password": 0}))
        
        for u in users:
            u['_id'] = str(u['_id'])
            if 'created_at' in u: u['created_at'] = u['created_at'].isoformat()
            if 'updated_at' in u: u['updated_at'] = u['updated_at'].isoformat()
            
        return jsonify({"users": users}), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def delete_admin_user(user_id):
    """Delete a user account and their records (admin only)."""
    try:
        if not check_admin_auth():
            return jsonify({"message": "Forbidden. Admin access required."}), 403

        db = get_db()
        uid = ObjectId(user_id)
        
        # Delete user
        db['users'].delete_one({"_id": uid})
        # Delete related logs
        db['dailytrackers'].delete_many({"user_id": uid})
        db['foodentries'].delete_many({"user_id": uid})
        db['healthgoals'].delete_many({"user_id": uid})
        db['chathistories'].delete_many({"user_id": uid})
        db['medicinereminders'].delete_many({"user_id": uid})
        db['notifications'].delete_many({"user_id": uid})

        return jsonify({"message": f"User {user_id} and all related health data deleted successfully."}), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def create_admin_disease(data):
    """Insert a new therapeutic disease guide (admin only)."""
    try:
        if not check_admin_auth():
            return jsonify({"message": "Forbidden. Admin access required."}), 403

        name = data.get('name', '').strip()
        overview = data.get('overview', '').strip()
        
        if not name or not overview:
            return jsonify({"message": "Name and overview are required."}), 400

        # Check existing
        existing = Disease.find_by_name(name)
        if existing:
            return jsonify({"message": "Disease guide already exists."}), 400

        disease_data = {
            "name": name,
            "overview": overview,
            "symptoms": data.get('symptoms', []),
            "foods_to_eat": data.get('foods_to_eat', []),
            "foods_to_avoid": data.get('foods_to_avoid', []),
            "lifestyle_advice": data.get('lifestyle_advice', ''),
            "exercise": data.get('exercise', ''),
            "yoga": data.get('yoga', ''),
            "doctor_consultation_advice": data.get('doctor_consultation_advice', '')
        }
        
        created = Disease.create(disease_data)
        created['_id'] = str(created['_id'])
        return jsonify({
            "message": "Disease guide created successfully.",
            "disease": created
        }), 201
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def update_admin_disease(disease_id, data):
    """Edit an existing disease guide (admin only)."""
    try:
        if not check_admin_auth():
            return jsonify({"message": "Forbidden. Admin access required."}), 403

        db = get_db()
        did = ObjectId(disease_id)
        
        disease = db['diseaseguides'].find_one({"_id": did})
        if not disease:
            return jsonify({"message": "Disease guide not found."}), 404
            
        updates = {}
        for key in ['name', 'overview', 'symptoms', 'foods_to_eat', 'foods_to_avoid', 
                    'lifestyle_advice', 'exercise', 'yoga', 'doctor_consultation_advice']:
            if key in data:
                updates[key] = data[key]
                
        db['diseaseguides'].update_one({"_id": did}, {"$set": updates})
        updated = db['diseaseguides'].find_one({"_id": did})
        updated['_id'] = str(updated['_id'])
        
        return jsonify({
            "message": "Disease guide updated successfully.",
            "disease": updated
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def delete_admin_disease(disease_id):
    """Remove a disease guide (admin only)."""
    try:
        if not check_admin_auth():
            return jsonify({"message": "Forbidden. Admin access required."}), 403

        db = get_db()
        did = ObjectId(disease_id)
        
        result = db['diseaseguides'].delete_one({"_id": did})
        if result.deleted_count == 0:
            return jsonify({"message": "Disease guide not found."}), 404
            
        return jsonify({"message": "Disease guide deleted successfully."}), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def get_admin_system_metrics():
    """Retrieve database log quantities (admin only)."""
    try:
        if not check_admin_auth():
            return jsonify({"message": "Forbidden. Admin access required."}), 403

        db = get_db()
        
        user_count = db['users'].count_documents({})
        food_count = db['foodentries'].count_documents({})
        reminders_count = db['medicinereminders'].count_documents({})
        disease_count = db['diseaseguides'].count_documents({})
        chats_count = db['chathistories'].count_documents({})
        
        metrics = {
            "users": user_count,
            "meals_logged": food_count,
            "active_reminders": reminders_count,
            "diseases_documented": disease_count,
            "ai_chats_held": chats_count
        }
        
        return jsonify({"metrics": metrics}), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500
