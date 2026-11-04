import { useState } from "react";
import "./LoginPage.css";

export default function LoginPage() {
  // "login" or "signup" — the same form handles both
  const [mode, setMode] = useState("login");

  // what the user has typed into each box
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // a short message shown under the button (errors or success)
  const [message, setMessage] = useState("");

  const isLogin = mode === "login";

  function handleSubmit(event) {
    // stop the browser from reloading the page when the form is sent
    event.preventDefault();

    // TODO (Step 5): send email + password to Supabase here
    setMessage(isLogin ? "Logging in..." : "Creating account...");
  }

  function switchMode() {
    setMode(isLogin ? "signup" : "login");
    setMessage("");
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <span className="login-eyebrow">Your kitchen companion</span>
        <h1>{isLogin ? "Welcome back" : "Create an account"}</h1>
        <p className="login-subtitle">
          {isLogin
            ? "Log in to see your saved recipes."
            : "Sign up to save and favorite recipes."}
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </label>

          <button type="submit" className="login-button">
            {isLogin ? "Log in" : "Sign up"}
          </button>
        </form>

        {message && <p className="login-message">{message}</p>}

        <p className="login-switch">
          {isLogin ? "New here?" : "Already have an account?"}{" "}
          <button type="button" onClick={switchMode}>
            {isLogin ? "Create an account" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}