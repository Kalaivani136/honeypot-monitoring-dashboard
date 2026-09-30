import random
import time
from datetime import datetime

from database import add_event


# ============================================================
# HONEYPOT ATTACK SIMULATOR
# Generates a safe fake attack every 5 minutes
# ============================================================


# ------------------------------------------------------------
# Fake attacker IP addresses
# ------------------------------------------------------------

ATTACKER_IPS = [
    "45.155.205.10",
    "103.25.67.21",
    "185.220.101.5",
    "91.240.118.172",
    "10.0.0.25",
    "172.16.0.15",
]


# ------------------------------------------------------------
# Common usernames used in the simulation
# ------------------------------------------------------------

USERNAMES = [
    "admin",
    "root",
    "administrator",
    "user",
    "test",
]


# ------------------------------------------------------------
# Fake passwords for demonstration only
# ------------------------------------------------------------

PASSWORDS = [
    "admin123",
    "password123",
    "123456",
    "root123",
    "test123",
]


# ------------------------------------------------------------
# Honeypot services
# ------------------------------------------------------------

SERVICES = [
    {
        "port": 22,
        "protocol": "TCP",
        "service": "SSH",
    },
    {
        "port": 21,
        "protocol": "TCP",
        "service": "FTP",
    },
    {
        "port": 3389,
        "protocol": "TCP",
        "service": "RDP",
    },
    {
        "port": 23,
        "protocol": "TCP",
        "service": "Telnet",
    },
]


# ------------------------------------------------------------
# Calculate attack severity
# ------------------------------------------------------------

def calculate_severity(service, username):

    # High-risk combinations
    if (
        service in ["SSH", "RDP"]
        and username in ["admin", "root", "administrator"]
    ):
        return "High"

    # Medium-risk services
    if service in ["FTP", "Telnet"]:
        return "Medium"

    # Everything else
    return "Low"


# ------------------------------------------------------------
# Generate one fake attack event
# ------------------------------------------------------------

def generate_event(
    source_ip=None,
    username=None,
    password=None,
):

    # Select random service
    service_info = random.choice(SERVICES)

    # Generate random attacker information
    source_ip = source_ip or random.choice(ATTACKER_IPS)

    username = username or random.choice(USERNAMES)

    password = password or random.choice(PASSWORDS)

    # Current date and time
    timestamp = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    # Service information
    service = service_info["service"]

    port = service_info["port"]

    protocol = service_info["protocol"]

    # Calculate severity
    severity = calculate_severity(
        service,
        username,
    )

    # Event type
    event_type = "Unauthorized Login"

    # --------------------------------------------------------
    # Save event to SQLite database
    # --------------------------------------------------------

    add_event(
        timestamp,
        source_ip,
        username,
        password,
        port,
        protocol,
        service,
        event_type,
        severity,
    )

    # --------------------------------------------------------
    # Create event object
    # --------------------------------------------------------

    event = {
        "timestamp": timestamp,
        "source_ip": source_ip,
        "username": username,
        "password": password,
        "dest_port": port,
        "protocol": protocol,
        "service": service,
        "event_type": event_type,
        "severity": severity,
    }

    # --------------------------------------------------------
    # Display event in terminal
    # --------------------------------------------------------

    print()
    print("=" * 60)

    print(
        f"[{timestamp}] "
        f"🚨 ATTACK DETECTED"
    )

    print(
        f"Source IP  : {source_ip}"
    )

    print(
        f"Username   : {username}"
    )

    print(
        f"Service    : {service}"
    )

    print(
        f"Port       : {port}"
    )

    print(
        f"Protocol   : {protocol}"
    )

    print(
        f"Event      : {event_type}"
    )

    print(
        f"Severity   : {severity}"
    )

    print("=" * 60)

    return event


# ============================================================
# AUTOMATIC 5-MINUTE SIMULATION
# ============================================================

if __name__ == "__main__":

    print()
    print("=" * 60)
    print("🍯 HONEYPOT MONITORING SIMULATOR")
    print("=" * 60)

    print(
        "✅ Simulator started successfully."
    )

    print(
        "⏱️ A new simulated attack will be generated every 5 minutes."
    )

    print(
        "💾 Events are saved to the database."
    )

    print(
        "🛑 Press CTRL + C to stop the simulator."
    )

    print("=" * 60)

    try:

        while True:

            # ------------------------------------------------
            # Generate one attack
            # ------------------------------------------------

            generate_event()

            # ------------------------------------------------
            # Wait 5 minutes
            # ------------------------------------------------

            print()
            print(
                "⏳ Next attack will be generated in 5 minutes..."
            )

            print(
                "⏱️ Waiting: 300 seconds"
            )

            time.sleep(300)

    except KeyboardInterrupt:

        print()
        print("=" * 60)
        print("🛑 Honeypot simulator stopped.")
        print("=" * 60)

    except Exception as error:

        print()
        print("=" * 60)
        print("⚠️ Simulator error:")
        print(error)
        print("=" * 60)