from flask import Blueprint, request
from controllers.admin_controller import (
    get_admin_users, delete_admin_user,
    create_admin_disease, update_admin_disease,
    delete_admin_disease, get_admin_system_metrics
)
from middleware.auth_middleware import token_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@token_required
def list_users():
    return get_admin_users()

@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@token_required
def delete_user(user_id):
    return delete_admin_user(user_id)

@admin_bp.route('/diseases', methods=['POST'])
@token_required
def create_disease():
    data = request.get_json() or {}
    return create_admin_disease(data)

@admin_bp.route('/diseases/<disease_id>', methods=['PUT'])
@token_required
def update_disease(disease_id):
    data = request.get_json() or {}
    return update_admin_disease(disease_id, data)

@admin_bp.route('/diseases/<disease_id>', methods=['DELETE'])
@token_required
def delete_disease(disease_id):
    return delete_admin_disease(disease_id)

@admin_bp.route('/metrics', methods=['GET'])
@token_required
def metrics():
    return get_admin_system_metrics()
