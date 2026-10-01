import React, { useEffect, useState } from "react";
import AttackChart from "./AttackChart";
import AttackTrendChart from "./AttackTrendChart";

const API_URL =
  "https://honeypot-monitoring-dashboard.onrender.com";

function Dashboard() {
  const [statistics, setStatistics] = useState({});
  const [events, setEvents] = useState([]);

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");

  const [alert, setAlert] = useState("");
  const [lastEventId, setLastEventId] = useState(null);

  // =========================================================
  // LOAD DATA FROM LIVE FLASK BACKEND
  // =========================================================

  const loadData = async () => {
    try {
      // Get statistics
      const statsResponse = await fetch(
        `${API_URL}/api/statistics`
      );

      // Get attack events
      const eventsResponse = await fetch(
        `${API_URL}/api/events`
      );

      if (!statsResponse.ok || !eventsResponse.ok) {
        throw new Error("Backend API error");
      }

      const statsData = await statsResponse.json();
      const eventsData = await eventsResponse.json();

      // Make sure events is an array
      const safeEvents = Array.isArray(eventsData)
        ? eventsData
        : [];

      // =====================================================
      // SORT EVENTS
      // Newest event first
      // =====================================================

      const sortedEvents = [...safeEvents].sort((a, b) => {
        const timeA = new Date(
          String(a.timestamp || "").replace(" ", "T")
        ).getTime();

        const timeB = new Date(
          String(b.timestamp || "").replace(" ", "T")
        ).getTime();

        return timeB - timeA;
      });

      // =====================================================
      // NEW ATTACK ALERT
      // =====================================================

      if (sortedEvents.length > 0) {
        const latestEvent = sortedEvents[0];

        if (
          lastEventId !== null &&
          latestEvent.id &&
          latestEvent.id !== lastEventId
        ) {
          setAlert(
            `🚨 New ${latestEvent.severity || "Unknown"} attack detected from ${
              latestEvent.source_ip || "Unknown IP"
            }`
          );

          setTimeout(() => {
            setAlert("");
          }, 5000);
        }

        if (latestEvent.id) {
          setLastEventId(latestEvent.id);
        }
      }

      // =====================================================
      // SAVE DATA
      // =====================================================

      setStatistics(statsData || {});
      setEvents(sortedEvents);
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  // =========================================================
  // AUTOMATIC LIVE REFRESH
  // Checks backend every 3 seconds
  // =========================================================

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================================================
  // SEARCH + SEVERITY FILTER
  // =========================================================

  const filteredEvents = events.filter((event) => {
    const text = search.toLowerCase();

    const matchesSearch =
      String(event.source_ip || "")
        .toLowerCase()
        .includes(text) ||

      String(event.username || "")
        .toLowerCase()
        .includes(text) ||

      String(event.service || "")
        .toLowerCase()
        .includes(text) ||

      String(event.severity || "")
        .toLowerCase()
        .includes(text);

    const matchesSeverity =
      severityFilter === "All" ||
      event.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  // =========================================================
  // DASHBOARD UI
  // =========================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1120",
        color: "white",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >

      {/* ===================================================
          HEADER
      =================================================== */}

      <div>
        <h1
          style={{
            marginBottom: "8px",
            fontSize: "32px",
          }}
        >
          🍯 Honeypot Monitoring Dashboard
        </h1>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "16px",
          }}
        >
          Real-time unauthorized login monitoring
        </p>

        {/* LIVE STATUS */}

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "10px",
            padding: "8px 14px",
            borderRadius: "20px",
            background: "#064e3b",
            color: "#6ee7b7",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          🟢 LIVE
        </div>
      </div>

      {/* ===================================================
          NEW ATTACK ALERT
      =================================================== */}

      {alert && (
        <div
          style={{
            background: "#7f1d1d",
            border: "1px solid #ef4444",
            padding: "15px 20px",
            borderRadius: "10px",
            marginTop: "20px",
            fontWeight: "bold",
          }}
        >
          {alert}
        </div>
      )}

      {/* ===================================================
          MAIN STATISTICS
      =================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >

        <Card
          title="Total Attacks"
          value={statistics.total_events || 0}
          icon="🚨"
        />

        <Card
          title="Unique IPs"
          value={statistics.unique_ips || 0}
          icon="🌐"
        />

        <Card
          title="Targeted Ports"
          value={statistics.open_ports || 0}
          icon="🔌"
        />

        <Card
          title="Login Attempts"
          value={statistics.login_attempts || 0}
          icon="🔐"
        />

      </div>

      {/* ===================================================
          SEVERITY SUMMARY
      =================================================== */}

      <h2
        style={{
          marginTop: "40px",
          marginBottom: "20px",
        }}
      >
        📊 Attack Severity Summary
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >

        <SeverityCard
          title="🔴 High Risk"
          value={statistics.high || 0}
          text="High severity attacks"
        />

        <SeverityCard
          title="🟠 Medium Risk"
          value={statistics.medium || 0}
          text="Medium severity attacks"
        />

        <SeverityCard
          title="🟢 Low Risk"
          value={statistics.low || 0}
          text="Low severity attacks"
        />

      </div>

      {/* ===================================================
          ATTACK SEVERITY CHART
      =================================================== */}

      <h2
        style={{
          marginTop: "40px",
          marginBottom: "20px",
        }}
      >
        📈 Attack Severity Chart
      </h2>

      <AttackChart events={events} />

      {/* ===================================================
          ATTACK ACTIVITY TREND
      =================================================== */}

      <h2
        style={{
          marginTop: "40px",
          marginBottom: "20px",
        }}
      >
        📈 Attack Activity Trend
      </h2>

      <AttackTrendChart events={events} />

      {/* ===================================================
          RECENT ATTACK EVENTS
      =================================================== */}

      <h2
        style={{
          marginTop: "40px",
          marginBottom: "20px",
        }}
      >
        🚨 Recent Attack Events
      </h2>

      {/* SEARCH */}

      <input
        type="text"
        placeholder="🔍 Search IP, username, service, severity..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #374151",
          background: "#111827",
          color: "white",
          fontSize: "16px",
          outline: "none",
          boxSizing: "border-box",
        }}
      />

      {/* ===================================================
          SEVERITY FILTER BUTTONS
      =================================================== */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginTop: "15px",
        }}
      >

        {["All", "High", "Medium", "Low"].map(
          (level) => (
            <button
              key={level}
              onClick={() =>
                setSeverityFilter(level)
              }
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",

                background:
                  severityFilter === level
                    ? "#2563eb"
                    : "#172033",

                color: "white",
                fontWeight: "bold",
              }}
            >
              {level}
            </button>
          )
        )}

      </div>

      {/* ===================================================
          ATTACK TABLE
      =================================================== */}

      <div
        style={{
          overflowX: "auto",
          marginTop: "20px",
        }}
      >

        <table
          style={{
            width: "100%",
            minWidth: "900px",
            borderCollapse: "collapse",
            background: "#172033",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >

          <thead>
            <tr>
              <th style={th}>Time</th>
              <th style={th}>Source IP</th>
              <th style={th}>Username</th>
              <th style={th}>Service</th>
              <th style={th}>Port</th>
              <th style={th}>Event</th>
              <th style={th}>Severity</th>
            </tr>
          </thead>

          <tbody>

            {filteredEvents.length === 0 ? (

              <tr>
                <td
                  colSpan="7"
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    color: "#94a3b8",
                  }}
                >
                  No attack events found.
                </td>
              </tr>

            ) : (

              filteredEvents.map((event, index) => (

                <tr
                  key={
                    event.id ||
                    `${event.timestamp}-${event.source_ip}-${index}`
                  }
                >

                  <td style={td}>
                    {event.timestamp || "-"}
                  </td>

                  <td style={td}>
                    {event.source_ip || "-"}
                  </td>

                  <td style={td}>
                    {event.username || "-"}
                  </td>

                  <td style={td}>
                    {event.service || "-"}
                  </td>

                  <td style={td}>
                    {event.dest_port || "-"}
                  </td>

                  <td style={td}>
                    {event.event_type || "-"}
                  </td>

                  <td style={td}>
                    <SeverityBadge
                      severity={event.severity}
                    />
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* ===================================================
          FOOTER
      =================================================== */}

      <div
        style={{
          marginTop: "40px",
          padding: "20px",
          textAlign: "center",
          color: "#64748b",
          borderTop: "1px solid #1e293b",
        }}
      >
        🍯 Honeypot Monitoring System •
        Real-time Security Dashboard
      </div>

    </div>
  );
}


// ===========================================================
// STATISTICS CARD
// ===========================================================

function Card({ title, value, icon }) {
  return (
    <div
      style={{
        background: "#172033",
        padding: "25px",
        borderRadius: "12px",
        textAlign: "center",
        border: "1px solid #1e293b",
      }}
    >

      <div
        style={{
          fontSize: "28px",
          marginBottom: "8px",
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          margin: "5px 0",
          color: "#cbd5e1",
        }}
      >
        {title}
      </h3>

      <h1
        style={{
          margin: "10px 0 0",
          fontSize: "34px",
        }}
      >
        {value}
      </h1>

    </div>
  );
}


// ===========================================================
// SEVERITY CARD
// ===========================================================

function SeverityCard({
  title,
  value,
  text,
}) {
  return (
    <div
      style={{
        background: "#172033",
        padding: "25px",
        borderRadius: "12px",
        textAlign: "center",
        border: "1px solid #1e293b",
      }}
    >

      <h2>{title}</h2>

      <h1
        style={{
          fontSize: "38px",
          margin: "10px 0",
        }}
      >
        {value}
      </h1>

      <p
        style={{
          color: "#94a3b8",
          margin: 0,
        }}
      >
        {text}
      </p>

    </div>
  );
}


// ===========================================================
// SEVERITY BADGE
// ===========================================================

function SeverityBadge({ severity }) {
  const level = String(
    severity || "Unknown"
  ).toLowerCase();

  let background = "#475569";

  if (level === "high") {
    background = "#dc2626";
  }

  if (level === "medium") {
    background = "#ea580c";
  }

  if (level === "low") {
    background = "#16a34a";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: "20px",
        background: background,
        color: "white",
        fontWeight: "bold",
        fontSize: "13px",
      }}
    >
      {severity || "Unknown"}
    </span>
  );
}


// ===========================================================
// TABLE STYLES
// ===========================================================

const th = {
  padding: "15px",
  borderBottom: "1px solid #374151",
  textAlign: "left",
  color: "#cbd5e1",
  fontSize: "14px",
};

const td = {
  padding: "15px",
  borderBottom: "1px solid #374151",
  color: "#e2e8f0",
};


export default Dashboard;