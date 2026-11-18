import { useEffect, useState } from "react";
import RecipePage from "./RecipePage";
import { HashRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

export default function App() {
  const [sensor, setSensor] = useState(null);
  const [ledOn, setLedOn] = useState(false);
  const [status, setStatus] = useState("connecting...");
  // keeps track of which page is being shown
const [currentPage, setCurrentPage] = useState("recipes");

  useEffect(() => {
    const proto = location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${location.host}/ws`); //opens web socket connection to the apps /ws endpoint
    ws.onopen = () => setStatus("connected"); //set status on open
    ws.onclose = () => setStatus("disconnected"); //set status on close
    ws.onmessage = (e) => { //how to handle each message received over the connection
      const msg = JSON.parse(e.data);
      if (msg.type === "sensor") setSensor(msg.value); //if its a sensor message
    };
    return () => ws.close(); //close connection when component is unmounted
  }, []); //runs effect after the initial render

  const toggleLed = async () => {
    const next = !ledOn; //next state is opposite of the current value
    const res = await fetch("/api/led", { //send api request to led endpoint
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ on: next }),
    });
    if (res.ok) setLedOn(next); //if the status is 200, then set the led to the next value
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
    </nav>

    {/* show whichever page the user selected */}
    {currentPage === "recipes" ? (
      <RecipePage />
    ) : (
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
/* CODE THAT SHOWS THE READS THE ARDUINO DATA AND SHOWS IT IN THE FRONTEND --> SAVED HERE FOR LATER
<h1>UNO Q Link Test</h1>
<p>WebSocket: {status}</p>
<p>Sensor (A0): <strong>{sensor ?? "waiting..."}</strong></p>
<button onClick={toggleLed}>LED: {ledOn ? "ON" : "OFF"}</button>
*/
  return (
    <HashRouter>
      <main style={{ padding: 24, fontFamily: "sans-serif" }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>

      </main>
    </HashRouter>
  );
}
