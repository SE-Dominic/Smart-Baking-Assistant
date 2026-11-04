import { useEffect, useState } from "react";
import RecipePage from "./RecipePage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  const [sensor, setSensor] = useState(null);
  const [ledOn, setLedOn] = useState(false);
  const [status, setStatus] = useState("connecting...");
  // keeps track of which page is being shown
const [currentPage, setCurrentPage] = useState("recipes");

  useEffect(() => {
    const proto = location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${location.host}/ws`);
    ws.onopen = () => setStatus("connected");
    ws.onclose = () => setStatus("disconnected");
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "sensor") setSensor(msg.value);
    };
    return () => ws.close();
  }, []);

  const toggleLed = async () => {
    const next = !ledOn;
    const res = await fetch("/api/led", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ on: next }),
    });
    if (res.ok) setLedOn(next);
  };

  
return (
  <div>
    {/* buttons to switch between the recipe page and UNO Q test */}
    <nav style={{
      display: "flex",
      justifyContent: "center",
      gap: "12px",
      padding: "12px",
      background: "#f3f1eb"
    }}>
      <button onClick={() => setCurrentPage("recipes")}>
        Recipes
      </button>

      <button onClick={() => setCurrentPage("hardware")}>
        UNO Q Test

      </button>
            <button onClick={() => setCurrentPage("login")}>
        Log In
      </button>
    </nav>

       {currentPage === "recipes" && <RecipePage />}

    {currentPage === "login" && <LoginPage />}

    {currentPage === "hardware" && (
      <main style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h1>UNO Q Link Test</h1>
        <p>WebSocket: {status}</p>
        <p>
          Sensor (A0): <strong>{sensor ?? "waiting..."}</strong>
        </p>
        <button onClick={toggleLed}>
          LED: {ledOn ? "ON" : "OFF"}
        </button>
      </main>
    )}
  </div>
);

}
