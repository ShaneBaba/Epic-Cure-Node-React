import React from "react";
import { Link } from "react-router-dom";
import "./LoginPage.css"; // reuse the exact same CSS

export default function AuthShell({ cardTitle, children }) {
  return (
    <div className="login-shell">
      <div className="login-center">
        <div className="login-grid">
          {/* Left panel (MATCHES LoginPage.js) */}
          <section className="login-mission login-glass">
            <h1 className="login-brand">Epic Cure</h1>

            <h2 className="login-h2">Mission Statement</h2>

            <p className="login-p">
              Epic Cure reduces food waste and fights hunger by rescuing surplus
              goods and delivering them to families in need.
            </p>

            <p className="login-p">
              Through volunteer power and strong partnerships, we nourish people,
              protect the environment, and strengthen our community.
            </p>
          </section>

          {/* Right panel */}
          <section className="login-card login-glass">
            <div className="login-card-head">
              <div className="login-card-brand">Epic Cure</div>
              <h3 className="login-card-title">{cardTitle}</h3>
            </div>

            {children}

            {/* Optional: keep the back link down here if you want it on every auth page */}
            {/* <div className="login-btn-row" style={{ marginTop: "1rem" }}>
              <Link className="login-btn-link" to="/login">
                Back to Login
              </Link>
            </div> */}
          </section>
        </div>
      </div>
    </div>
  );
}