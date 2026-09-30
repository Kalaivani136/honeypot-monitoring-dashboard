import React, { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
  "http://127.0.0.1:5000/api/events/generate",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_ip: "127.0.0.1",
      username: username,
      password: password,
    }),
  }
);

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      setMessage("✅ " + data.message);
onLogin();

      setUsername("");
      setPassword("");
    } catch (error) {
      console.error("ERROR:", error);
      setMessage("❌ Backend is not connected");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1120",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          width: "350px",
          padding: "30px",
          background: "#172033",
          borderRadius: "15px",
          color: "white",
        }}
      >
        <h1>🔐 Fake Login</h1>
        <p>Honeypot Security System</p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              margin: "10px 0",
              boxSizing: "border-box",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              margin: "10px 0",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "10px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>

        {message && (
          <p style={{ marginTop: "20px" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;