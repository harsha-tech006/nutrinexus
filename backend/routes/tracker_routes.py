from flask import Blueprint, request
from controllers.tracker_controller import (
    log_meal_entry, delete_meal_entry, get_daily_tracker_summary,
    log_water_intake, log_exercise_entry, get_food_history_list,
    delete_exercise_entry, toggle_fitness_skip_api
)
from middleware.auth_middleware import token_required

tracker_bp = Blueprint('tracker', __name__)

@tracker_bp.route('/meal', methods=['POST'])
@token_required
def log_meal():
    data = request.get_json() or {}
    return log_meal_entry(data)

@tracker_bp.route('/meal/<meal_id>', methods=['DELETE'])
@token_required
def delete_meal(meal_id):
    return delete_meal_entry(meal_id)

@tracker_bp.route('/summary', methods=['GET'])
@token_required
def summary():
    date_str = request.args.get('date')
    return get_daily_tracker_summary(date_str)

@tracker_bp.route('/water', methods=['POST'])
@token_required
def log_water():
    data = request.get_json() or {}
    return log_water_intake(data)

@tracker_bp.route('/exercise', methods=['POST'])
@token_required
def log_exercise():
    data = request.get_json() or {}
    return log_exercise_entry(data)

@tracker_bp.route('/exercise/skip', methods=['POST'])
@token_required
def skip_exercise():
    return toggle_fitness_skip_api()

@tracker_bp.route('/exercise/<exercise_id>', methods=['DELETE'])
@token_required
def delete_exercise(exercise_id):
    return delete_exercise_entry(exercise_id)

@tracker_bp.route('/history', methods=['GET'])
@token_required
def food_history():
    return get_food_history_list()
