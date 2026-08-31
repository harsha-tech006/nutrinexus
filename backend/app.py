import os
import pkgutil
import importlib.util

def patched_get_loader(module_or_name):
    try:
        spec = importlib.util.find_spec(module_or_name)
        return spec.loader if spec else None
    except Exception:
        return None

if not hasattr(pkgutil, 'get_loader'):
    pkgutil.get_loader = patched_get_loader

from flask import Flask, jsonify
from flask_cors import CORS
from flask_mail import Mail
from apscheduler.schedulers.background import BackgroundScheduler
import firebase_admin
from firebase_admin import credentials

from config.config import Config
from database.db import init_db

# Initialize Flask extensions
mail = Mail()
scheduler = BackgroundScheduler()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS
    origins = [url.strip() for url in Config.FRONTEND_URL.split(",")]
    CORS(app, resources={r"/api/*": {"origins": origins}}, supports_credentials=True)

    # Initialize extensions
    mail.init_app(app)
    
    # Initialize DB
    init_db()

    # Seed Database Guides
    try:
        from models.Disease import Disease
        from models.Yoga import Yoga
        from models.Hospital import Hospital
        from models.Doctor import Doctor
        Disease.seed_data()
        Yoga.seed_data()
        Hospital.seed_data()
        Doctor.seed_video_data()
        Doctor.seed_session_data()
    except Exception as e:
        app.logger.error(f"Database seeding failed: {str(e)}")

    # Initialize Firebase Admin if credentials file path is provided and exists
    firebase_cred_path = Config.FIREBASE_CREDENTIALS_JSON
    if firebase_cred_path and os.path.exists(firebase_cred_path):
        try:
            cred = credentials.Certificate(firebase_cred_path)
            firebase_admin.initialize_app(cred)
            app.logger.info("Firebase Admin initialized successfully.")
        except Exception as e:
            app.logger.error(f"Firebase Admin initialization failed: {str(e)}")
    else:
        app.logger.warning("Firebase credentials not configured or file not found. Push notifications will be disabled.")

    # Register blueprints (To be implemented in subsequent phases)
    from routes.auth_routes import auth_bp
    from routes.tracker_routes import tracker_bp
    from routes.report_routes import report_bp
    from routes.ai_routes import ai_bp
    from routes.reminder_routes import reminder_bp
    from routes.disease_routes import disease_bp
    from routes.admin_routes import admin_bp
    from routes.hospital_routes import hospital_bp
    from routes.doctor_routes import doctor_bp
    from routes.women_health_routes import women_health_bp
    from routes.health_condition_routes import health_condition_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(tracker_bp, url_prefix='/api/tracker')
    app.register_blueprint(report_bp, url_prefix='/api/report')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(reminder_bp, url_prefix='/api/reminders')
    app.register_blueprint(disease_bp, url_prefix='/api/guide')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(hospital_bp, url_prefix='/api/hospitals')
    app.register_blueprint(doctor_bp, url_prefix='/api/doctors')
    app.register_blueprint(women_health_bp, url_prefix='/api/women-health')
    app.register_blueprint(health_condition_bp, url_prefix='/api/health')

    # Start APScheduler
    if not scheduler.running:
        from scheduler.jobs import register_scheduled_jobs
        register_scheduled_jobs(scheduler)
        scheduler.start()
        app.logger.info("APScheduler background scheduler started.")

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "healthy",
            "message": "NutriNexus Flask Backend is running successfully!",
            "database": "connected"
        }), 200

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
