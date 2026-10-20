from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.config import config_by_name
from app.models import db
from app.models.user import User

jwt = JWTManager()


def create_app(config_name="development"):
    """Application factory for CareerMatch AI backend."""
    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name["default"]))

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
    )

    # JWT Error handlers for consistent JSON responses
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            "success": False,
            "error": "Token Expired",
            "message": "Your session has expired. Please log in again.",
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            "success": False,
            "error": "Invalid Token",
            "message": "Token verification failed. Please log in again.",
        }), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            "success": False,
            "error": "Authorization Required",
            "message": "Authorization token is missing. Please log in.",
        }), 401

    # Standard HTTP Error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"success": False, "error": "Bad Request", "message": str(error)}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "error": "Not Found", "message": "The requested endpoint does not exist."}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"success": False, "error": "Method Not Allowed", "message": "Method not allowed on this route."}), 405

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"success": False, "error": "Internal Server Error", "message": "An unexpected server error occurred."}), 500

    # Health check endpoint
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "success": True,
            "status": "healthy",
            "system": "CareerMatch AI Recommendation Engine",
            "version": "1.0.0",
        }), 200

    # Register API Blueprints
    from app.routes.auth import auth_bp
    from app.routes.students import students_bp
    from app.routes.opportunities import opportunities_bp
    from app.routes.recommendations import recommendations_bp
    from app.routes.skill_gaps import skill_gaps_bp
    from app.routes.saved_opportunities import saved_opportunities_bp
    from app.routes.applications import applications_bp
    from app.routes.analytics import analytics_bp
    from app.routes.admin import admin_bp
    from app.routes.assistant import assistant_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(students_bp, url_prefix="/api/students")
    app.register_blueprint(opportunities_bp, url_prefix="/api/opportunities")
    app.register_blueprint(recommendations_bp, url_prefix="/api/recommendations")
    app.register_blueprint(skill_gaps_bp, url_prefix="/api/skill-gaps")
    app.register_blueprint(saved_opportunities_bp, url_prefix="/api/saved-opportunities")
    app.register_blueprint(applications_bp, url_prefix="/api/applications")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(assistant_bp, url_prefix="/api/assistant")

    return app
