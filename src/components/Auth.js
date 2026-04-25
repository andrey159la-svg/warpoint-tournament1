import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Auth({ onAdminLogin, onGuestLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onAdminLogin();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 400, textAlign: "center" }}>
        <div className="logo" style={{ marginBottom: 24, fontSize: 28 }}>
          WAR<span>POINT</span>
        </div>
        <div className="logo-sub" style={{ marginBottom: 32 }}>
          TOURNAMENT MANAGER
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <button
            className="btn btn-primary"
            onClick={onGuestLogin}
            style={{ width: "100%", padding: 14 }}
          >
            👥 ВОЙТИ КАК ГОСТЬ
          </button>

          <div
            style={{
              textAlign: "center",
              color: "var(--text-dim)",
              fontSize: 12,
            }}
          >
            — ИЛИ —
          </div>

          <form onSubmit={handleAdminLogin}>
            <input
              type="email"
              placeholder="EMAIL АДМИНИСТРАТОРА"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginBottom: 12 }}
              required
            />
            <input
              type="password"
              placeholder="ПАРОЛЬ"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginBottom: 12 }}
              required
            />
            {error && (
              <div className="alert" style={{ marginBottom: 12 }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "ВХОД..." : "👑 ВОЙТИ КАК АДМИН"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
