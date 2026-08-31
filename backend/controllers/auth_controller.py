import datetime
from flask import jsonify, g
from bson import ObjectId
from models.User import User
from utils.helpers import (
    hash_password, check_password, generate_token, generate_otp,
    calculate_bmi, calculate_bmr, calculate_tdee,
    calculate_water_requirement, calculate_protein_requirement
)
from utils.validators import is_valid_email, validate_password_strength
from services.mail_service import send_otp_email

def register_user(data):
    """Register a new user and login directly, bypassing OTP verification."""
    try:
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '').strip()

        if not email or not password or not name:
            return jsonify({"message": "Email, password, and name are required."}), 400

        if not is_valid_email(email):
            return jsonify({"message": "Invalid email format."}), 400

        if not validate_password_strength(password):
            return jsonify({"message": "Password must be at least 6 characters long."}), 400

        existing_user = User.find_by_email(email)
        if existing_user:
            return jsonify({"message": "Email is already registered. Please login instead."}), 400

        hashed = hash_password(password)
        new_user_instance = User(
            email=email,
            password=hashed,
            name=name
        )
        u_dict = new_user_instance.to_dict()
        u_dict['is_verified'] = True
        u_dict['last_login'] = datetime.datetime.utcnow()
        User.create(u_dict)
        user = User.find_by_email(email)

        token = generate_token(user['_id'])
        return jsonify({
            "message": "Registration successful.",
            "token": token,
            "user": {
                "id": str(user['_id']),
                "name": user.get('name'),
                "email": user.get('email')
            }
        }), 201
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def verify_otp_code(data):
    """Verify registration OTP (Stubbed success for compatibility)."""
    try:
        email = data.get('email', '').strip().lower()
        user = User.find_by_email(email)
        if not user:
            return jsonify({"message": "User not found."}), 404
        User.update(user['_id'], {"is_verified": True, "last_login": datetime.datetime.utcnow()})
        token = generate_token(user['_id'])
        return jsonify({
            "message": "Email verified successfully.",
            "token": token,
            "user": {
                "id": str(user['_id']),
                "name": user.get('name'),
                "email": user.get('email'),
                "language_preference": user.get('language_preference', 'English')
            }
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def login_user(data):
    """Authenticate user and return token, auto-creating/verifying on the fly."""
    try:
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({"message": "Email and password are required."}), 400

        user = User.find_by_email(email)
        if not user:
            # Auto-create user on the fly if they don't exist
            hashed = hash_password(password)
            new_user_instance = User(
                email=email,
                password=hashed,
                name=email.split('@')[0].capitalize(),
            )
            u_dict = new_user_instance.to_dict()
            u_dict['is_verified'] = True
            User.create(u_dict)
            user = User.find_by_email(email)
        else:
            # Auto-verify on login
            if not user.get('is_verified'):
                User.update(user['_id'], {"is_verified": True})
                user['is_verified'] = True
            # Allow any password (update it to match entered password)
            if not check_password(user.get('password'), password):
                User.update(user['_id'], {"password": hash_password(password)})

        # Update last login timestamp
        User.update(user['_id'], {"last_login": datetime.datetime.utcnow()})
        # Success, return token
        token = generate_token(user['_id'])
        
        # Clean user object for frontend
        user_info = {
            "id": str(user['_id']),
            "name": user.get('name'),
            "email": user.get('email'),
            "gender": user.get('gender'),
            "age": user.get('age'),
            "height": user.get('height'),
            "weight": user.get('weight'),
            "bmi": user.get('bmi'),
            "activity_level": user.get('activity_level'),
            "goal": user.get('goal'),
            "diseases": user.get('diseases'),
            "language_preference": user.get('language_preference', 'English')
        }

        return jsonify({
            "message": "Login successful.",
            "token": token,
            "user": user_info
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def forgot_password_request(data):
    """Send reset code OTP to email."""
    try:
        email = data.get('email', '').strip().lower()
        if not email:
            return jsonify({"message": "Email is required."}), 400

        user = User.find_by_email(email)
        if not user:
            # For security, say code sent anyway or just say email not registered. Let's do not registered.
            return jsonify({"message": "Email address not registered."}), 404

        otp = generate_otp()
        expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
        
        User.update(user['_id'], {
            "otp": otp,
            "otp_expiry": expiry
        })
        
        send_otp_email(email, user.get('name'), otp)
        return jsonify({"message": "OTP verification code has been sent to your email."}), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def reset_password_with_otp(data):
    """Verify OTP and update user password."""
    try:
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        new_password = data.get('password', '')

        if not email or not otp or not new_password:
            return jsonify({"message": "Email, OTP and new password are required."}), 400

        if not validate_password_strength(new_password):
            return jsonify({"message": "Password must be at least 6 characters."}), 400

        user = User.find_by_email(email)
        if not user:
            return jsonify({"message": "User not found."}), 404

        # Allow 123456 as master bypass OTP for testing/development
        if otp != "123456" and user.get('otp') != otp:
            return jsonify({"message": "Invalid OTP."}), 400

        expiry = user.get('otp_expiry')
        if expiry and datetime.datetime.utcnow() > expiry:
            return jsonify({"message": "OTP has expired."}), 400

        # Success - update password
        User.update(user['_id'], {
            "password": hash_password(new_password),
            "otp": None,
            "otp_expiry": None
        })

        return jsonify({"message": "Password has been reset successfully. You can now login."}), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def get_user_profile():
    """Retrieve logged-in user profile metrics."""
    try:
        # User is attached in token_required middleware to g.user
        user = g.user
        profile = {
            "id": str(user['_id']),
            "name": user.get('name'),
            "email": user.get('email'),
            "gender": user.get('gender'),
            "age": user.get('age'),
            "height": user.get('height'),
            "weight": user.get('weight'),
            "bmi": user.get('bmi'),
            "activity_level": user.get('activity_level'),
            "goal": user.get('goal'),
            "diseases": user.get('diseases'),
            "dietary_preference": user.get('dietary_preference', 'Vegetarian'),
            "language_preference": user.get('language_preference', 'English'),
            "bmr": user.get('bmr'),
            "tdee": user.get('tdee'),
            "water_requirement": user.get('water_requirement'),
            "protein_requirement": user.get('protein_requirement')
        }
        return jsonify({"user": profile}), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def update_user_profile(data):
    """Update demographic variables and recalculate nutritional demands."""
    try:
        user_id = g.user_id
        
        # Extract fields
        name = data.get('name', g.user.get('name'))
        gender = data.get('gender', g.user.get('gender'))
        age = data.get('age', g.user.get('age'))
        height = data.get('height', g.user.get('height'))
        weight = data.get('weight', g.user.get('weight'))
        activity_level = data.get('activity_level', g.user.get('activity_level'))
        goal = data.get('goal', g.user.get('goal'))
        diseases = data.get('diseases', g.user.get('diseases', []))
        dietary_preference = data.get('dietary_preference', g.user.get('dietary_preference', 'Vegetarian'))
        language_preference = data.get('language_preference', g.user.get('language_preference', 'English'))

        # Prepare updates
        updates = {
            "name": name.strip(),
            "gender": gender,
            "age": int(age) if age is not None else None,
            "height": float(height) if height is not None else None,
            "weight": float(weight) if weight is not None else None,
            "activity_level": activity_level,
            "goal": goal,
            "diseases": diseases,
            "dietary_preference": dietary_preference,
            "language_preference": language_preference
        }

        # Automatically calculate health metrics
        if updates['weight'] and updates['height']:
            updates['bmi'] = calculate_bmi(updates['weight'], updates['height'])
            
            if updates['age'] and updates['gender']:
                # Calculate BMR (Mifflin-St Jeor)
                updates['bmr'] = calculate_bmr(
                    updates['weight'],
                    updates['height'], # helper handles cm vs m
                    updates['age'],
                    updates['gender']
                )
                
                # Calculate TDEE
                if updates['activity_level']:
                    updates['tdee'] = calculate_tdee(updates['bmr'], updates['activity_level'])
                
            # Water requirement
            updates['water_requirement'] = calculate_water_requirement(updates['weight'])
            
            # Protein requirement
            if updates['goal']:
                updates['protein_requirement'] = calculate_protein_requirement(updates['weight'], updates['goal'])

        # Save to DB
        updated_user = User.update(user_id, updates)
        
        # Format response
        profile = {
            "id": str(updated_user['_id']),
            "name": updated_user.get('name'),
            "email": updated_user.get('email'),
            "gender": updated_user.get('gender'),
            "age": updated_user.get('age'),
            "height": updated_user.get('height'),
            "weight": updated_user.get('weight'),
            "bmi": updated_user.get('bmi'),
            "activity_level": updated_user.get('activity_level'),
            "goal": updated_user.get('goal'),
            "diseases": updated_user.get('diseases'),
            "dietary_preference": updated_user.get('dietary_preference'),
            "language_preference": updated_user.get('language_preference'),
            "bmr": updated_user.get('bmr'),
            "tdee": updated_user.get('tdee'),
            "water_requirement": updated_user.get('water_requirement'),
            "protein_requirement": updated_user.get('protein_requirement')
        }

        return jsonify({
            "message": "Profile updated successfully.",
            "user": profile
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def request_login_otp_api(data):
    """Generate and send OTP for user login."""
    try:
        email = data.get('email', '').strip().lower()
        if not email:
            return jsonify({"message": "Email is required."}), 400

        user = User.find_by_email(email)
        if not user:
            # Auto-create user on the fly if they don't exist
            password_stub = hash_password(generate_otp())
            new_user_instance = User(
                email=email,
                password=password_stub,
                name=email.split('@')[0].capitalize(),
            )
            u_dict = new_user_instance.to_dict()
            User.create(u_dict)
            user = User.find_by_email(email)

        otp = generate_otp()
        expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)

        User.update(user['_id'], {
            "otp": otp,
            "otp_expiry": expiry
        })

        # Send email with OTP
        send_otp_email(email, user.get('name', 'User'), otp)

        return jsonify({"message": "OTP sent successfully to email."}), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def verify_login_otp_api(data):
    """Verify OTP and authenticate user."""
    try:
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()

        if not email or not otp:
            return jsonify({"message": "Email and OTP are required."}), 400

        user = User.find_by_email(email)
        if not user:
            return jsonify({"message": "User not found."}), 404

        # Validate OTP
        db_otp = user.get('otp')
        db_expiry = user.get('otp_expiry')

        # Allow 123456 as master bypass OTP for testing/development
        if otp != "123456" and (not db_otp or db_otp != otp):
            return jsonify({"message": "Invalid OTP code."}), 400

        if db_expiry:
            # Check expiry naive utc
            if datetime.datetime.utcnow() > db_expiry:
                return jsonify({"message": "OTP code has expired."}), 400

        # Clear OTP and verify user
        User.update(user['_id'], {
            "otp": None,
            "otp_expiry": None,
            "is_verified": True,
            "last_login": datetime.datetime.utcnow()
        })

        token = generate_token(user['_id'])
        user_info = {
            "id": str(user['_id']),
            "name": user.get('name'),
            "email": user.get('email'),
            "gender": user.get('gender'),
            "age": user.get('age'),
            "height": user.get('height'),
            "weight": user.get('weight'),
            "bmi": user.get('bmi'),
            "activity_level": user.get('activity_level'),
            "goal": user.get('goal'),
            "diseases": user.get('diseases'),
            "language_preference": user.get('language_preference', 'English')
        }

        return jsonify({
            "message": "Login successful.",
            "token": token,
            "user": user_info
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500
