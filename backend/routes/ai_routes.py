from flask import Blueprint, request
from controllers.ai_controller import (
    post_chat_message, get_chat_history_summary,
    clear_chat_history, generate_meal_plan_api,
    mark_meal_eaten_api, mark_meal_skipped_api, update_water_consumed_api,
    replace_meal_api, food_recognition_placeholder
)
from middleware.auth_middleware import token_required

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/chat', methods=['POST'])
@token_required
def chat():
    data = request.get_json() or {}
    return post_chat_message(data)

@ai_bp.route('/chat/history', methods=['GET'])
@token_required
def chat_history():
    return get_chat_history_summary()

@ai_bp.route('/chat/history', methods=['DELETE'])
@token_required
def chat_history_clear():
    return clear_chat_history()

@ai_bp.route('/mealplan', methods=['GET'])
@token_required
def mealplan():
    return generate_meal_plan_api()

@ai_bp.route('/mealplan/eaten', methods=['POST'])
@token_required
def mealplan_eaten():
    return mark_meal_eaten_api()

@ai_bp.route('/mealplan/skip', methods=['POST'])
@token_required
def mealplan_skip():
    return mark_meal_skipped_api()

@ai_bp.route('/mealplan/water', methods=['POST'])
@token_required
def mealplan_water():
    return update_water_consumed_api()

@ai_bp.route('/mealplan/replace', methods=['POST'])
@token_required
def mealplan_replace():
    return replace_meal_api()

@ai_bp.route('/food-recognition', methods=['POST'])
@token_required
def food_recognition():
    data = request.get_json() or {}
    return food_recognition_placeholder(data)

