from flask import Flask, jsonify, request
from flask_cors import CORS
import os

from database import (
    init_db,
    get_events,
    get_event_count,
    get_statistics
)

from honeypot import generate_event


app = Flask(__name__)

# Allow frontend to connect
CORS(app)

# Initialize database
init_db()


# ============================================================
# HOME
# ============================================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Honeypot Unauthorized Login Monitoring API",
        "status": "running"
    })


# ============================================================
# GET ALL EVENTS
# ============================================================

@app.route("/api/events", methods=["GET"])
def events():
    return jsonify(get_events())


# ============================================================
# EVENT COUNT
# ============================================================

@app.route("/api/events/count", methods=["GET"])
def event_count():
    return jsonify({
        "count": get_event_count()
    })


# ============================================================
# STATISTICS
# ============================================================

@app.route("/api/statistics", methods=["GET"])
def statistics():
    return jsonify(get_statistics())


# ============================================================
# GENERATE ATTACK / FAKE LOGIN
# ============================================================

@app.route("/api/events/generate", methods=["POST"])
def generate():
    data = request.get_json(silent=True) or {}

    source_ip = data.get(
        "source_ip",
        "127.0.0.1"
    )

    username = data.get(
        "username",
        "attacker"
    )

    password = data.get(
        "password",
        "wrong123"
    )

    event = generate_event(
        source_ip=source_ip,
        username=username,
        password=password
    )

    return jsonify({
        "message": "Unauthorized login attempt recorded",
        "event": event
    })


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    port = int(
        os.environ.get("PORT", 5000)
    )

    print("==========================================")
    print("🍯 HONEYPOT MONITORING API")
    print("==========================================")
    print(f"Running on port: {port}")

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )