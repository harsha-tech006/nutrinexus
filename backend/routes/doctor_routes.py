from flask import Blueprint
from controllers.doctor_controller import (
    get_doctor_videos,
    get_live_doctor_sessions,
    book_doctor_consultation
)

doctor_bp = Blueprint('doctor', __name__)

@doctor_bp.route('/videos', methods=['GET'])
def list_videos():
    return get_doctor_videos()

@doctor_bp.route('/live-sessions', methods=['GET'])
def list_live_sessions():
    return get_live_doctor_sessions()

@doctor_bp.route('/book-consultation', methods=['POST'])
def route_book_consultation():
    return book_doctor_consultation()
