from flask import Blueprint, request
from controllers.reminder_controller import (
    create_medicine_reminder_entry, get_user_medicine_reminders,
    update_medicine_reminder_status, delete_user_medicine_reminder,
    get_user_notifications, mark_notification_read,
    mark_all_notifications_read, save_user_fcm_token
)
from middleware.auth_middleware import token_required

reminder_bp = Blueprint('reminder', __name__)

@reminder_bp.route('/medicine', methods=['POST'])
@token_required
def create_reminder():
    data = request.get_json() or {}
    return create_medicine_reminder_entry(data)

@reminder_bp.route('/medicine', methods=['GET'])
@token_required
def get_reminders():
    return get_user_medicine_reminders()

@reminder_bp.route('/medicine/<reminder_id>', methods=['PUT'])
@token_required
def update_reminder(reminder_id):
    data = request.get_json() or {}
    return update_medicine_reminder_status(reminder_id, data)

@reminder_bp.route('/medicine/<reminder_id>', methods=['DELETE'])
@token_required
def delete_reminder(reminder_id):
    return delete_user_medicine_reminder(reminder_id)

@reminder_bp.route('/notifications', methods=['GET'])
@token_required
def get_notifications():
    return get_user_notifications()

@reminder_bp.route('/notifications/<notif_id>/read', methods=['POST'])
@token_required
def mark_read(notif_id):
    return mark_notification_read(notif_id)

@reminder_bp.route('/notifications/read-all', methods=['POST'])
@token_required
def mark_read_all():
    return mark_all_notifications_read()

@reminder_bp.route('/fcm', methods=['POST'])
@token_required
def save_fcm():
    data = request.get_json() or {}
    return save_user_fcm_token(data)
