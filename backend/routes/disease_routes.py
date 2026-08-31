from flask import Blueprint
from controllers.disease_controller import (
    get_diseases_list, get_disease_by_name,
    get_yogas_list, get_medicine_suggestions_education,
    toggle_yoga_favorite, complete_yoga_pose,
    update_listening_progress,
    get_yoga_progress, get_yoga_daily_plan,
    get_yoga_weekly_challenge, get_yoga_analytics
)
from middleware.auth_middleware import token_required

disease_bp = Blueprint('disease', __name__)

@disease_bp.route('/diseases', methods=['GET'])
def list_diseases():
    return get_diseases_list()

@disease_bp.route('/diseases/<name>', methods=['GET'])
def get_disease(name):
    return get_disease_by_name(name)

@disease_bp.route('/yogas', methods=['GET'])
def list_yogas():
    return get_yogas_list()

@disease_bp.route('/medicines', methods=['GET'])
def list_medicines():
    return get_medicine_suggestions_education()

@disease_bp.route('/yogas/favorite', methods=['POST'])
@token_required
def route_toggle_favorite():
    return toggle_yoga_favorite()

@disease_bp.route('/yogas/complete', methods=['POST'])
@token_required
def route_complete_pose():
    return complete_yoga_pose()

@disease_bp.route('/yogas/listen', methods=['POST'])
@token_required
def route_update_listening():
    return update_listening_progress()

@disease_bp.route('/yogas/progress', methods=['GET'])
@token_required
def route_get_progress():
    return get_yoga_progress()

@disease_bp.route('/yogas/daily-plan', methods=['GET'])
@token_required
def route_daily_plan():
    return get_yoga_daily_plan()

@disease_bp.route('/yogas/weekly-challenge', methods=['GET'])
@token_required
def route_weekly_challenge():
    return get_yoga_weekly_challenge()

@disease_bp.route('/yogas/analytics', methods=['GET'])
@token_required
def route_analytics():
    return get_yoga_analytics()

