import random
from datetime import datetime, timezone, timedelta

from database import add_event


# ============================================================
# IST TIMEZONE
# ============================================================

IST = timezone(timedelta(hours=5, minutes=30))


# ============================================================
# FAKE ATTACK DATA
# ============================================================

ATTACKER_IPS = [
    "45.155.205.10",
    "103.25.67.21",
    "185.220.101.5",
    "91.240.118.172",
    "10.0.0.25",
    "172.16.0.15"
]


USERNAMES = [
    "admin",
    "root",
    "administrator",
    "user",
    "test",
    "attacker"
]


PASSWORDS = [
    "admin123",
    "password123",
    "123456",
    "root123",
    "test123",
    "wrong123"
]


SERVICES = [
    {
        "port": 22,
        "protocol": "TCP",
        "service": "SSH"
    },
    {
        "port": 21,
        "protocol": "TCP",
        "service": "FTP"
    },
    {
        "port": 3389,
        "protocol": "TCP",
        "service": "RDP"
    },
    {
        "port": 23,
        "protocol": "TCP",
        "service": "Telnet"
    }
]


# ============================================================
# SEVERITY
# ============================================================

def calculate_severity(service, username):

    if (
        service in ["SSH", "RDP"]
        and username in [
            "admin",
            "root",
            "administrator"
        ]
    ):
        return "High"

    if service in ["FTP", "Telnet"]:
        return "Medium"

    return "Low"


# ============================================================
# GENERATE EVENT
# ============================================================

def generate_event(
    source_ip=None,
    username=None,
    password=None
):

    service_info = random.choice(SERVICES)

    source_ip = (
        source_ip
        or random.choice(ATTACKER_IPS)
    )

    username = (
        username
        or random.choice(USERNAMES)
    )

    password = (
        password
        or random.choice(PASSWORDS)
    )


    # ========================================================
    # CURRENT IST TIME
    # ========================================================

    timestamp = datetime.now(IST).strftime(
        "%Y-%m-%d %H:%M:%S"
    )


    service = service_info["service"]
    port = service_info["port"]
    protocol = service_info["protocol"]


    # ========================================================
    # SEVERITY
    # ========================================================

    severity = calculate_severity(
        service,
        username
    )


    event_type = "Unauthorized Login"


    # ========================================================
    # SAVE EVENT
    # ========================================================

    add_event(
        timestamp,
        source_ip,
        username,
        password,
        port,
        protocol,
        service,
        event_type,
        severity
    )


    # ========================================================
    # EVENT OBJECT
    # ========================================================

    event = {
        "timestamp": timestamp,
        "source_ip": source_ip,
        "username": username,
        "password": password,
        "dest_port": port,
        "protocol": protocol,
        "service": service,
        "event_type": event_type,
        "severity": severity
    }


    # ========================================================
    # TERMINAL OUTPUT
    # ========================================================

    print()
    print("=" * 60)
    print(f"[{timestamp}] 🚨 ATTACK DETECTED")
    print(f"Source IP : {source_ip}")
    print(f"Username  : {username}")
    print(f"Service   : {service}")
    print(f"Port      : {port}")
    print(f"Protocol  : {protocol}")
    print(f"Severity  : {severity}")
    print("=" * 60)


    return event