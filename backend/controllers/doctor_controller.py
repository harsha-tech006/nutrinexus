from flask import jsonify, request, g
from models.Doctor import Doctor
import uuid
import datetime

def get_doctor_videos():
    """Retrieve curated doctor session videos filtered by category or search."""
    try:
        category = request.args.get('category', '').strip()
        search = request.args.get('search', '').strip()

        videos = Doctor.get_videos(category=category, search=search)

        for v in videos:
            if '_id' in v:
                v['_id'] = str(v['_id'])

        categories = ["All", "Cardiology", "Diabetes", "Nutrition", "Mental Health", "Emergency First Aid"]

        return jsonify({
            "success": True,
            "count": len(videos),
            "videos": videos,
            "categories": categories
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500

def get_live_doctor_sessions():
    """Retrieve upcoming and live doctor teleconsultation sessions & webinars."""
    try:
        sessions = Doctor.get_live_sessions()

        for s in sessions:
            if '_id' in s:
                s['_id'] = str(s['_id'])

        doctors_available = [
            {
                "id": "doc-101",
                "name": "Dr. Sarah Jenkins",
                "title": "MD, Senior Cardiologist & Clinical Nutritionist",
                "hospital": "Apollo Heart Institute",
                "rating": 4.9,
                "consultations_count": 1420,
                "experience_years": 14,
                "status": "ONLINE_NOW",
                "fee": "Free Preview / Included",
                "avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80",
                "specialties": ["Cardiology", "Emergency Nutrition", "Lipid Management"]
            },
            {
                "id": "doc-102",
                "name": "Dr. Alok Verma",
                "title": "MD, DM (Diabetology & Metabolic Care)",
                "hospital": "Max Super Specialty Hospital",
                "rating": 4.8,
                "consultations_count": 980,
                "experience_years": 12,
                "status": "ONLINE_NOW",
                "fee": "Free Preview / Included",
                "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
                "specialties": ["Diabetes", "Insulin Protocol", "Obesity Management"]
            },
            {
                "id": "doc-103",
                "name": "Dr. Elena Rostova",
                "title": "DNB, Acute Triage & General Medicine",
                "hospital": "St. Jude Emergency Center",
                "rating": 4.9,
                "consultations_count": 2150,
                "experience_years": 16,
                "status": "BUSY",
                "next_available": "In 15 mins",
                "fee": "Free Preview / Included",
                "avatar": "https://images.unsplash.com/photo-1594824813571-2b533411efa0?auto=format&fit=crop&w=300&q=80",
                "specialties": ["Emergency Medicine", "General Health", "Infection Control"]
            }
        ]

        return jsonify({
            "success": True,
            "live_sessions": sessions,
            "doctors_available": doctors_available
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500

def book_doctor_consultation():
    """Book or launch an instant 1-on-1 teleconsultation room session."""
    try:
        data = request.get_json() or {}
        doctor_id = data.get('doctor_id', 'doc-101')
        doctor_name = data.get('doctor_name', 'Dr. Sarah Jenkins')
        patient_name = data.get('patient_name', 'User')
        symptoms = data.get('symptoms', 'General Consultation & Nutrition Check')
        reason = data.get('reason', 'Routine checkup and dietary advice')

        room_id = f"tele-room-{uuid.uuid4().hex[:8]}"

        booking = {
            "booking_id": f"BK-{uuid.uuid4().hex[:6].upper()}",
            "room_id": room_id,
            "doctor_id": doctor_id,
            "doctor_name": doctor_name,
            "patient_name": patient_name,
            "symptoms": symptoms,
            "reason": reason,
            "status": "CONFIRMED",
            "join_url": f"/live-doctor-sessions?room={room_id}",
            "created_at": datetime.datetime.utcnow().isoformat(),
            "prescription_preview": {
                "medications": ["Tab. Vitamin D3 60,000 IU (Once weekly)", "Tab. Multivitamin & Minerals (Once daily after breakfast)"],
                "dietary_notes": "Increase daily water intake to 3.0L. Limit sodium under 2,000mg. Follow Mediterranean meal balance.",
                "doctor_signature": "Digitally Signed by " + doctor_name
            }
        }

        return jsonify({
            "success": True,
            "message": f"Tele-consultation session booked successfully with {doctor_name}!",
            "booking": booking
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500
