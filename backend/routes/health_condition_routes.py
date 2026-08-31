from flask import Blueprint
from controllers.health_condition_controller import (
    get_health_status,
    get_health_progress,
    get_disease_progress,
    post_measurement,
    get_ai_health_insight,
    get_notifications,
    mark_notification_read
)

health_condition_bp = Blueprint('health_condition', __name__)

@health_condition_bp.route('/status', methods=['GET'])
def route_status():
    return get_health_status()

@health_condition_bp.route('/progress', methods=['GET'])
def route_progress():
    return get_health_progress()

@health_condition_bp.route('/trends', methods=['GET'])
def route_trends():
    return get_health_progress()

@health_condition_bp.route('/risk-score', methods=['GET'])
def route_risk_score():
    return get_health_status()

@health_condition_bp.route('/measurements', methods=['POST'])
def route_measurements():
    return post_measurement()

@health_condition_bp.route('/symptoms', methods=['POST'])
def route_symptoms():
    return post_measurement()

@health_condition_bp.route('/disease-progress', methods=['GET'])
def route_disease_progress():
    return get_disease_progress()

@health_condition_bp.route('/ai-insight', methods=['GET'])
def route_ai_insight():
    return get_ai_health_insight()

@health_condition_bp.route('/notifications', methods=['GET'])
def route_get_notifications():
    return get_notifications()

@health_condition_bp.route('/notifications/mark-read', methods=['POST'])
def route_mark_notifications_read():
    return mark_notification_read()

@health_condition_bp.route('/monthly-report', methods=['GET'])
def route_monthly_report():
    return get_health_status()
