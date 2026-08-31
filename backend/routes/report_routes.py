from flask import Blueprint, request
from controllers.report_controller import (
    get_weekly_report_data, get_monthly_report_data, download_pdf_report,
    get_goals_status, update_goals_status
)
from middleware.auth_middleware import token_required

report_bp = Blueprint('report', __name__)

@report_bp.route('/weekly', methods=['GET'])
@token_required
def weekly_report():
    return get_weekly_report_data()

@report_bp.route('/monthly', methods=['GET'])
@token_required
def monthly_report():
    return get_monthly_report_data()

@report_bp.route('/pdf', methods=['GET'])
@token_required
def pdf_report():
    return download_pdf_report()

@report_bp.route('/goals', methods=['GET'])
@token_required
def goals_get():
    return get_goals_status()

@report_bp.route('/goals', methods=['POST'])
@token_required
def goals_update():
    data = request.get_json() or {}
    return update_goals_status(data)
