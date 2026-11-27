
import { useEffect, useState } from "react";
import RecipePage from "./RecipePage";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

export default function App() {
  const [sensor, setSensor] = useState(null);
  const [ledOn, setLedOn] = useState(false);
  const [status, setStatus] = useState("connecting...");

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

  const HardwarePage = () => (
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
  );

  return (
    <HashRouter>
      <nav style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "12px",
        padding: "12px",
        background: "#f3f1eb"
      }}>
        <Link to="/">Dashboard</Link>
        <Link to="/recipes">Recipes</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/hardware">UNO Q Test</Link>
      </nav>

      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/recipes" element={<RecipePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/hardware" element={<HardwarePage />} />
      </Routes>
    </HashRouter>
  );
}
