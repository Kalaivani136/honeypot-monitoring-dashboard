import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

function AttackTrendChart({ events = [] }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const safeEvents = Array.isArray(events) ? events : [];

    // ==========================================
    // GROUP ATTACKS INTO 5-MINUTE IST INTERVALS
    // ==========================================

    const fiveMinuteCounts = {};

    safeEvents.forEach((event) => {
      if (!event || !event.timestamp) return;

      /*
        Backend timestamp:

        YYYY-MM-DD HH:MM:SS

        Example:
        2026-10-01 13:40:53

        This timestamp is already IST.
        DO NOT use new Date(timestamp)
        because browser timezone conversion can
        change the displayed time.
      */

      const match = event.timestamp.match(
        /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/
      );

      if (!match) return;

      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      const hour = Number(match[4]);
      const minute = Number(match[5]);

      // Round down to nearest 5 minutes
      const roundedMinutes = Math.floor(minute / 5) * 5;

      const key =
        `${year}-${String(month).padStart(2, "0")}-` +
        `${String(day).padStart(2, "0")} ` +
        `${String(hour).padStart(2, "0")}:` +
        `${String(roundedMinutes).padStart(2, "0")}`;

      fiveMinuteCounts[key] =
        (fiveMinuteCounts[key] || 0) + 1;
    });

    // ==========================================
    // SORT CHRONOLOGICALLY
    // ==========================================

    const entries = Object.entries(fiveMinuteCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10);

    // ==========================================
    // CREATE IST LABELS
    // ==========================================

    const labels = entries.map(([key]) => {
      const time = key.split(" ")[1];

      const [hourString, minute] = time.split(":");

      let hour = Number(hourString);

      const period = hour >= 12 ? "PM" : "AM";

      hour = hour % 12 || 12;

      return `${hour}:${minute} ${period}`;
    });

    const data = entries.map(([, count]) => count);

    // ==========================================
    // DESTROY OLD CHART
    // ==========================================

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    // ==========================================
    // CREATE CHART
    // ==========================================

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",

      data: {
        labels: labels,

        datasets: [
          {
            label: "Attacks per 5 Minutes",

            data: data,

            borderColor: "#38bdf8",

            backgroundColor: "rgba(56, 189, 248, 0.15)",

            borderWidth: 3,

            pointRadius: 5,

            pointHoverRadius: 7,

            pointBackgroundColor: "#38bdf8",

            pointBorderColor: "#38bdf8",

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
            display: true,

            labels: {
              color: "white",

              font: {
                size: 14,
              },
            },
          },

          tooltip: {
            callbacks: {
              title: function (tooltipItems) {
                return `${tooltipItems[0].label} IST`;
              },

              label: function (context) {
                return ` Attacks: ${context.raw}`;
              },
            },
          },
        },

        scales: {
          x: {
            title: {
              display: true,

              text: "5-Minute Interval (IST)",

              color: "white",

              font: {
                size: 14,
              },
            },

            ticks: {
              color: "white",

              maxRotation: 0,

              autoSkip: false,
            },

            grid: {
              color: "rgba(255,255,255,0.08)",
            },
          },

          y: {
            beginAtZero: true,

            suggestedMax:
              data.length > 0
                ? Math.max(...data, 1) + 1
                : 2,

            title: {
              display: true,

              text: "Number of Attacks",

              color: "white",

              font: {
                size: 14,
              },
            },

            ticks: {
              color: "white",

              stepSize: 1,

              precision: 0,
            },

            grid: {
              color: "rgba(255,255,255,0.08)",
            },
          },
        },
      },
    });

    // ==========================================
    // CLEANUP
    // ==========================================

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