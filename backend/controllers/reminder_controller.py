import sys
from flask import jsonify, g, request
from bson import ObjectId
from models.MedicineReminder import MedicineReminder
from models.Notification import Notification
from models.User import User

def safe_isoformat(val):
    if hasattr(val, 'isoformat'):
        return val.isoformat()
    return str(val) if val is not None else None

def create_medicine_reminder_entry(data):
    """Add a scheduled medicine intake event."""
    try:
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            return jsonify({"message": "User authentication required."}), 401

        medicine_name = str(data.get('medicine_name', '')).strip()
        dosage = str(data.get('dosage', '')).strip()
        time = str(data.get('time', '')).strip()  # Format: HH:MM
        days = data.get('days') or ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        if not medicine_name or not dosage or not time:
            return jsonify({"message": "Medicine name, dosage, and time are required."}), 400

        reminder_obj = MedicineReminder(
            user_id=user_id,
            medicine_name=medicine_name,
            dosage=dosage,
            time=time,
            days=days
        )
        
        doc = reminder_obj.to_dict()
        created = MedicineReminder.create(doc)

        response_reminder = {
            "_id": str(created.get('_id', '')),
            "user_id": str(created.get('user_id', '')),
            "medicine_name": str(created.get('medicine_name', '')),
            "dosage": str(created.get('dosage', '')),
            "time": str(created.get('time', '')),
            "days": list(created.get('days', [])),
            "is_active": bool(created.get('is_active', True)),
            "created_at": safe_isoformat(created.get('created_at'))
        }

        return jsonify({
            "message": "Medicine reminder created successfully.",
            "reminder": response_reminder
        }), 201
    except Exception as e:
        print(f"[create_medicine_reminder_entry ERROR] {e}", file=sys.stderr, flush=True)
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def get_user_medicine_reminders():
    """Retrieve all medicine reminders for logged-in user."""
    try:
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            return jsonify({"reminders": []}), 200

        reminders = MedicineReminder.get_by_user(user_id)
        
        formatted = []
        for r in reminders:
            try:
                formatted.append({
                    "_id": str(r.get('_id', '')),
                    "user_id": str(r.get('user_id', '')),
                    "medicine_name": str(r.get('medicine_name', '')),
                    "dosage": str(r.get('dosage', '')),
                    "time": str(r.get('time', '')),
                    "days": list(r.get('days', [])),
                    "is_active": bool(r.get('is_active', True)),
                    "created_at": safe_isoformat(r.get('created_at'))
                })
            except Exception as item_err:
                print(f"[formatting reminder item ERROR] {item_err}", file=sys.stderr)

        return jsonify({"reminders": formatted}), 200
    except Exception as e:
        print(f"[get_user_medicine_reminders ERROR] {e}", file=sys.stderr)
        return jsonify({"reminders": [], "message": str(e)}), 200

def update_medicine_reminder_status(reminder_id, data):
    """Edit active status or modify reminder properties."""
    try:
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            return jsonify({"message": "User authentication required."}), 401

        updates = {}
        if 'is_active' in data:
            updates['is_active'] = bool(data['is_active'])
        if 'medicine_name' in data:
            updates['medicine_name'] = str(data['medicine_name']).strip()
        if 'dosage' in data:
            updates['dosage'] = str(data['dosage']).strip()
        if 'time' in data:
            updates['time'] = str(data['time']).strip()
        if 'days' in data:
            updates['days'] = list(data['days'])
            
        updated = MedicineReminder.update_reminder(reminder_id, user_id, updates)
        if not updated:
            return jsonify({"message": "Reminder not found or unauthorized."}), 404
            
        response_reminder = {
            "_id": str(updated.get('_id', '')),
            "user_id": str(updated.get('user_id', '')),
            "medicine_name": str(updated.get('medicine_name', '')),
            "dosage": str(updated.get('dosage', '')),
            "time": str(updated.get('time', '')),
            "days": list(updated.get('days', [])),
            "is_active": bool(updated.get('is_active', True)),
            "created_at": safe_isoformat(updated.get('created_at'))
        }
        
        return jsonify({
            "message": "Reminder updated successfully.",
            "reminder": response_reminder
        }), 200
    except Exception as e:
        print(f"[update_medicine_reminder_status ERROR] {e}", file=sys.stderr)
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def delete_user_medicine_reminder(reminder_id):
    """Remove a medicine reminder."""
    try:
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            return jsonify({"message": "User authentication required."}), 401

        result = MedicineReminder.delete(reminder_id, user_id)
        return jsonify({"message": "Reminder deleted successfully."}), 200
    except Exception as e:
        print(f"[delete_user_medicine_reminder ERROR] {e}", file=sys.stderr)
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def get_user_notifications():
    """Retrieve logged system logs/alerts."""
    try:
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            return jsonify({"notifications": []}), 200

        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        notifs = Notification.get_by_user(user_id, unread_only)
        
        formatted = []
        for n in notifs:
            try:
                formatted.append({
                    "_id": str(n.get('_id', '')),
                    "user_id": str(n.get('user_id', '')),
                    "title": str(n.get('title', '')),
                    "body": str(n.get('body', '')),
                    "type": str(n.get('type', 'General')),
                    "is_read": bool(n.get('is_read', False)),
                    "created_at": safe_isoformat(n.get('created_at'))
                })
            except Exception as item_err:
                print(f"[formatting notification item ERROR] {item_err}", file=sys.stderr)
            
        return jsonify({"notifications": formatted}), 200
    except Exception as e:
        print(f"[get_user_notifications ERROR] {e}", file=sys.stderr)
        return jsonify({"notifications": [], "message": str(e)}), 200

def mark_notification_read(notif_id):
    """Mark alert as read."""
    try:
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            return jsonify({"message": "User authentication required."}), 401
            
        Notification.mark_as_read(notif_id, user_id)
        return jsonify({"message": "Notification marked as read."}), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def mark_all_notifications_read():
    """Mark all system alerts as read."""
    try:
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            return jsonify({"message": "User authentication required."}), 401
            
        Notification.mark_all_read(user_id)
        return jsonify({"message": "All notifications marked as read."}), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def save_user_fcm_token(data):
    """Update user profile with device FCM registration token."""
    try:
        user_id = getattr(g, 'user_id', None)
        if not user_id:
            return jsonify({"message": "User authentication required."}), 401

        fcm_token = str(data.get('fcm_token', '')).strip()
        if not fcm_token:
            return jsonify({"message": "FCM token is required."}), 400
            
        User.update(user_id, {"fcm_token": fcm_token})
        return jsonify({"message": "FCM token saved successfully."}), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500
