import React, { useState } from "react";

const API_URL =
  "https://honeypot-monitoring-dashboard.onrender.com";

function Login({ onLogin }) {

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");


  const handleLogin = async (e) => {

    e.preventDefault();

    setMessage("⏳ Connecting to backend...");


    try {

      const response = await fetch(
        `${API_URL}/api/events/generate`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            source_ip: "127.0.0.1",

            username: username,

            password: password

          })
        }
      );


      if (!response.ok) {

        throw new Error(
          `Server returned ${response.status}`
        );

      }


      const data =
        await response.json();


      console.log(
        "Backend response:",
        data
      );


      setMessage(
        "✅ Unauthorized login recorded"
      );


      onLogin();


      setUsername("");

      setPassword("");


    } catch (error) {

      console.error(
        "Backend error:",
        error
      );


      setMessage(
        "❌ Backend is not connected"
      );

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

        fontFamily: "Arial"
      }}
    >

      <div
        style={{
          width: "350px",

          padding: "30px",

          background: "#172033",

          borderRadius: "15px",

          color: "white"
        }}
      >

        <h1>
          🔐 Fake Login
        </h1>


        <p>
          Honeypot Security System
        </p>


        <form
          onSubmit={handleLogin}
        >

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            required

            style={{
              width: "100%",

              padding: "12px",

              margin: "10px 0",

              boxSizing: "border-box"
            }}
          />


          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required

            style={{
              width: "100%",

              padding: "12px",

              margin: "10px 0",

              boxSizing: "border-box"
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

              cursor: "pointer"
            }}
          >
            Login
          </button>

        </form>


        {message && (

          <p
            style={{
              marginTop: "20px"
            }}
          >
            {message}
          </p>

        )}

      </div>

    </div>

  );
}


export default Login;