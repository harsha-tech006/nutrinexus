import sys
from functools import wraps
from flask import request, jsonify, g
import jwt
from config.config import Config
from models.User import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        print(f"[AUTH MIDDLEWARE] Headers: {dict(request.headers)}", file=sys.stderr)
        # Check Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
        
        print(f"[AUTH MIDDLEWARE] Extracted token: {token}", file=sys.stderr)
        if not token:
            return jsonify({'message': 'Authorization token is missing!'}), 401
        
        try:
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            print(f"[AUTH MIDDLEWARE] Decoded payload: {payload}", file=sys.stderr)
            user_id = payload['sub']
            current_user = User.find_by_id(user_id)
            if not current_user:
                print(f"[AUTH MIDDLEWARE] User not found for id: {user_id}", file=sys.stderr)
                return jsonify({'message': 'User not found!'}), 401
            
            # Attach current user to Flask global context g
            g.user = current_user
            g.user_id = str(current_user['_id'])
        except jwt.ExpiredSignatureError as e:
            print(f"[AUTH MIDDLEWARE] Expired token: {e}", file=sys.stderr)
            return jsonify({'message': 'Authorization token has expired!'}), 401
        except jwt.InvalidTokenError as e:
            print(f"[AUTH MIDDLEWARE] Invalid token: {e}", file=sys.stderr)
            return jsonify({'message': 'Invalid authorization token!'}), 401
        except Exception as e:
            print(f"[AUTH MIDDLEWARE] Auth exception: {e}", file=sys.stderr)
            return jsonify({'message': f'Authorization error: {str(e)}'}), 401
            
        return f(*args, **kwargs)
    
    return decorated
