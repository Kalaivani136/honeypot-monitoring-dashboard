import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

function AttackChart({ events = [] }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Always make sure events is an array
    const safeEvents = Array.isArray(events) ? events : [];

    // Count severity levels
    const high = safeEvents.filter(
      (event) =>
        String(event.severity || "").toLowerCase() === "high"
    ).length;

    const medium = safeEvents.filter(
      (event) =>
        String(event.severity || "").toLowerCase() === "medium"
    ).length;

    const low = safeEvents.filter(
      (event) =>
        String(event.severity || "").toLowerCase() === "low"
    ).length;

    // Destroy old chart before creating a new one
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",

      data: {
        labels: ["High Risk", "Medium Risk", "Low Risk"],

        datasets: [
          {
            label: "Number of Attacks",
            data: [high, medium, low],

            backgroundColor: [
              "#ef4444",
              "#f97316",
              "#22c55e",
            ],

            borderColor: [
              "#ef4444",
              "#f97316",
              "#22c55e",
            ],

            borderWidth: 1,

            borderRadius: 8,
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
              font: {
                size: 14,
              },
            },
          },
        },

        scales: {
          x: {
            ticks: {
              color: "white",
            },

            grid: {
              color: "rgba(255,255,255,0.08)",
            },
          },

          y: {
            beginAtZero: true,

            ticks: {
              color: "white",
              stepSize: 1,
            },

            grid: {
              color: "rgba(255,255,255,0.08)",
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

export default AttackChart;