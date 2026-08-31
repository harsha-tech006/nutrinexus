from flask import jsonify, request
from models.Hospital import Hospital

def get_hospitals():
    """Retrieve list of hospitals with optional search, specialty, 24x7, and ICU filters."""
    try:
        search = request.args.get('search', '').strip()
        specialty = request.args.get('specialty', '').strip()
        availability_247 = request.args.get('is_24_7', 'false').lower() == 'true'
        icu_only = request.args.get('icu_beds', 'false').lower() == 'true'

        hospitals = Hospital.get_all(
            search=search,
            specialty=specialty,
            availability_247=availability_247,
            icu_only=icu_only
        )

        for h in hospitals:
            if '_id' in h:
                h['_id'] = str(h['_id'])

        emergency_contacts = [
            {"service": "Ambulance Hotline", "number": "108", "description": "National Emergency Ambulance Dispatch"},
            {"service": "General Emergency SOS", "number": "112", "description": "Unified Emergency Line"},
            {"service": "Cardiac & Stroke Hotline", "number": "+91 1800 200 9111", "description": "24/7 Rapid Cardiac Response Unit"},
            {"service": "Poison & Drug Safety", "number": "+91 1800 116 117", "description": "National Toxicology & Poison Emergency"}
        ]

        return jsonify({
            "success": True,
            "count": len(hospitals),
            "hospitals": hospitals,
            "emergency_contacts": emergency_contacts
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500

def get_hospital_detail(hospital_id):
    """Retrieve detailed info for a single hospital."""
    try:
        hospital = Hospital.find_by_id(hospital_id)
        if not hospital:
            return jsonify({"success": False, "message": "Hospital not found."}), 404
        
        if '_id' in hospital:
            hospital['_id'] = str(hospital['_id'])

        return jsonify({"success": True, "hospital": hospital}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500
