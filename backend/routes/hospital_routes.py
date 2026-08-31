from flask import Blueprint
from controllers.hospital_controller import get_hospitals, get_hospital_detail

hospital_bp = Blueprint('hospital', __name__)

@hospital_bp.route('', methods=['GET'])
@hospital_bp.route('/', methods=['GET'])
def list_hospitals():
    return get_hospitals()

@hospital_bp.route('/<hospital_id>', methods=['GET'])
def hospital_detail(hospital_id):
    return get_hospital_detail(hospital_id)
