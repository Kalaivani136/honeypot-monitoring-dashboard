import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

function AttackTrendChart({ events = [] }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const safeEvents = Array.isArray(events) ? events : [];

    // Group attacks into 5-minute intervals
    const fiveMinuteCounts = {};

    safeEvents.forEach((event) => {
      if (!event || !event.timestamp) return;

      const date = new Date(
        event.timestamp.replace(" ", "T")
      );

      if (isNaN(date.getTime())) return;

      // Round time down to nearest 5 minutes
      const minutes = date.getMinutes();
      const roundedMinutes =
        Math.floor(minutes / 5) * 5;

      const key =
        `${date.getFullYear()}-` +
        `${String(date.getMonth() + 1).padStart(2, "0")}-` +
        `${String(date.getDate()).padStart(2, "0")} ` +
        `${String(date.getHours()).padStart(2, "0")}:` +
        `${String(roundedMinutes).padStart(2, "0")}`;

      fiveMinuteCounts[key] =
        (fiveMinuteCounts[key] || 0) + 1;
    });

    // Sort chronologically
    const entries = Object.entries(fiveMinuteCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10);

    const labels = entries.map(([key]) => {
      const time = key.split(" ")[1];
      const [hourString, minute] = time.split(":");

      let hour = parseInt(hourString);

      const period = hour >= 12 ? "PM" : "AM";

      hour = hour % 12 || 12;

      return `${hour}:${minute} ${period}`;
    });

    const data = entries.map(([, count]) => count);

    // Remove old chart
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",

      data: {
        labels: labels,

        datasets: [
          {
            label: "Attacks per 5 Minutes",

            data: data,

            borderColor: "#38bdf8",

            backgroundColor:
              "rgba(56, 189, 248, 0.15)",

            borderWidth: 3,

            pointRadius: 5,

            pointHoverRadius: 7,

            tension: 0.3,

            fill: true,
          },
        ],
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        plugins: {
          legend: {
            labels: {
              color: "white",
            },
          },
        },

        scales: {
          x: {
            title: {
              display: true,
              text: "5-Minute Interval",
              color: "white",
            },

            ticks: {
              color: "white",
            },

            grid: {
              color:
                "rgba(255,255,255,0.08)",
            },
          },

          y: {
            beginAtZero: true,

            title: {
              display: true,
              text: "Number of Attacks",
              color: "white",
            },

            ticks: {
              color: "white",
              stepSize: 1,
            },

            grid: {
              color:
                "rgba(255,255,255,0.08)",
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [events]);

  return (
    <div
      style={{
        width: "100%",
        height: "350px",
        background: "#172033",
        padding: "20px",
        borderRadius: "12px",
        boxSizing: "border-box",
      }}
    >
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default AttackTrendChart;