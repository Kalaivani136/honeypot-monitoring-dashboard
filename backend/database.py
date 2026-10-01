import sqlite3
from contextlib import contextmanager


DB_PATH = "honeypot.db"


@contextmanager
def get_conn():

    conn = sqlite3.connect(
        DB_PATH
    )

    conn.row_factory = sqlite3.Row

    try:

        yield conn

        conn.commit()

    except Exception:

        conn.rollback()

        raise

    finally:

        conn.close()


# ============================================================
# INITIALIZE DATABASE
# ============================================================

def init_db():

    with get_conn() as conn:

        conn.execute("""
            CREATE TABLE IF NOT EXISTS events (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                timestamp TEXT NOT NULL,

                source_ip TEXT NOT NULL,

                username TEXT,

                password TEXT,

                dest_port INTEGER,

                protocol TEXT,

                service TEXT,

                event_type TEXT,

                severity TEXT
            )
        """)


# ============================================================
# ADD EVENT
# ============================================================

def add_event(
    timestamp,
    source_ip,
    username,
    password,
    dest_port,
    protocol,
    service,
    event_type,
    severity
):

    with get_conn() as conn:

        conn.execute("""
            INSERT INTO events (
                timestamp,
                source_ip,
                username,
                password,
                dest_port,
                protocol,
                service,
                event_type,
                severity
            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            timestamp,
            source_ip,
            username,
            password,
            dest_port,
            protocol,
            service,
            event_type,
            severity
        ))


# ============================================================
# GET EVENTS
# ============================================================

def get_events():

    with get_conn() as conn:

        cursor = conn.execute("""
            SELECT *
            FROM events
            ORDER BY id DESC
        """)

        return [
            dict(row)
            for row in cursor.fetchall()
        ]


# ============================================================
# COUNT
# ============================================================

def get_event_count():

    with get_conn() as conn:

        cursor = conn.execute("""
            SELECT COUNT(*) AS count
            FROM events
        """)

        return cursor.fetchone()["count"]


# ============================================================
# STATISTICS
# ============================================================

def get_statistics():

    with get_conn() as conn:

        total = conn.execute("""
            SELECT COUNT(*) AS count
            FROM events
        """).fetchone()["count"]


        unique_ips = conn.execute("""
            SELECT COUNT(DISTINCT source_ip) AS count
            FROM events
        """).fetchone()["count"]


        open_ports = conn.execute("""
            SELECT COUNT(DISTINCT dest_port) AS count
            FROM events
            WHERE dest_port IS NOT NULL
        """).fetchone()["count"]


        high = conn.execute("""
            SELECT COUNT(*) AS count
            FROM events
            WHERE severity = 'High'
        """).fetchone()["count"]


        medium = conn.execute("""
            SELECT COUNT(*) AS count
            FROM events
            WHERE severity = 'Medium'
        """).fetchone()["count"]


        low = conn.execute("""
            SELECT COUNT(*) AS count
            FROM events
            WHERE severity = 'Low'
        """).fetchone()["count"]


        login_attempts = conn.execute("""
            SELECT COUNT(*) AS count
            FROM events
            WHERE event_type = 'Unauthorized Login'
        """).fetchone()["count"]


        return {

            "total_events": total,

            "unique_ips": unique_ips,

            "open_ports": open_ports,

            "high": high,

            "medium": medium,

            "low": low,

            "login_attempts": login_attempts
        }