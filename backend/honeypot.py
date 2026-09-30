import random
import time
from datetime import datetime

from database import add_event


# Fake attacker data for safe demonstration
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
    "test"
]

PASSWORDS = [
    "admin123",
    "password123",
    "123456",
    "root123",
    "test123"
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


def calculate_severity(service, username):
    if service in ["SSH", "RDP"] and username in ["admin", "root", "administrator"]:
        return "High"

    if service in ["FTP", "Telnet"]:
        return "Medium"

    return "Low"


def generate_event(
    source_ip=None,
    username=None,
    password=None
):
    service_info = random.choice(SERVICES)

    source_ip = source_ip or random.choice(ATTACKER_IPS)
    username = username or random.choice(USERNAMES)
    password = password or random.choice(PASSWORDS)

    timestamp = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    service = service_info["service"]
    port = service_info["port"]
    protocol = service_info["protocol"]

    severity = calculate_severity(
        service,
        username
    )

    event_type = "Unauthorized Login"

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

    print(
        f"[{timestamp}] "
        f"{source_ip} -> "
        f"{service} | "
        f"Username: {username} | "
        f"Unauthorized Login | "
        f"{severity}"
    )

    return event

if __name__ == "__main__":

    print("Honeypot simulator started...")

    while True:
        generate_event()
        time.sleep(5)