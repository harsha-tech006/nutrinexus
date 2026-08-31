from flask import Blueprint, request
from controllers.auth_controller import (
    register_user, verify_otp_code, login_user,
    forgot_password_request, reset_password_with_otp,
    get_user_profile, update_user_profile,
    request_login_otp_api, verify_login_otp_api
)
from middleware.auth_middleware import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    return register_user(data)

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json() or {}
    return verify_otp_code(data)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    return login_user(data)

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    return forgot_password_request(data)

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    return reset_password_with_otp(data)

@auth_bp.route('/profile', methods=['GET'])
@auth_bp.route('/me', methods=['GET'])
@token_required
def get_profile():
    return get_user_profile()

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    data = request.get_json() or {}
    return update_user_profile(data)

@auth_bp.route('/login-otp/request', methods=['POST'])
@auth_bp.route('/otp/send-otp', methods=['POST'])
def request_login_otp():
    data = request.get_json() or {}
    return request_login_otp_api(data)

@auth_bp.route('/login-otp/verify', methods=['POST'])
@auth_bp.route('/otp/verify-otp', methods=['POST'])
def verify_login_otp():
    data = request.get_json() or {}
    return verify_login_otp_api(data)

@auth_bp.route('/trigger-reminders', methods=['GET', 'POST'])
def trigger_reminders():
    from scheduler.jobs import check_inactive_users_and_send_emails
    try:
        check_inactive_users_and_send_emails()
        return {"message": "Inactivity and profile completion reminders triggered successfully."}, 200
    except Exception as e:
        return {"error": str(e)}, 500