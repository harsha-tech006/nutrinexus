from flask import Blueprint
from controllers.women_health_controller import (
    get_cycle_status,
    update_cycle_settings,
    log_period_symptoms,
    get_pregnancy_nutrition_data,
    update_pregnancy_profile
)
from middleware.auth_middleware import token_required

women_health_bp = Blueprint('women_health', __name__)

@women_health_bp.route('/cycle-status', methods=['GET'])
def route_cycle_status():
    return get_cycle_status()

@women_health_bp.route('/cycle-settings', methods=['POST'])
def route_cycle_settings():
    return update_cycle_settings()

@women_health_bp.route('/log-symptoms', methods=['POST'])
def route_log_symptoms():
    return log_period_symptoms()

@women_health_bp.route('/pregnancy-nutrition', methods=['GET'])
def route_pregnancy_nutrition():
    return get_pregnancy_nutrition_data()

@women_health_bp.route('/pregnancy-profile', methods=['POST'])
def route_pregnancy_profile():
    return update_pregnancy_profile()
