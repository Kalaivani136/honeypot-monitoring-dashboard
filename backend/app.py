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

CORS(app)

init_db()


@app.route("/")
def home():
    return jsonify({
        "message": "Honeypot Unauthorized Login Monitoring API",
        "status": "running"
    })


@app.route("/api/events", methods=["GET"])
def events():
    return jsonify(get_events())


@app.route("/api/events/count", methods=["GET"])
def event_count():
    return jsonify({
        "count": get_event_count()
    })


@app.route("/api/statistics", methods=["GET"])
def statistics():
    return jsonify(get_statistics())


@app.route("/api/events/generate", methods=["POST"])
def generate():
    data = request.get_json(silent=True) or {}

    source_ip = data.get("source_ip", "127.0.0.1")
    username = data.get("username", "admin")
    password = data.get("password", "admin123")

    event = generate_event(
        source_ip=source_ip,
        username=username,
        password=password
    )

    return jsonify({
        "message": "Unauthorized login attempt recorded",
        "event": event
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    print("Starting Honeypot Monitoring Dashboard...")

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )