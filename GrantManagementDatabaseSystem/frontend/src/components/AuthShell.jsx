import React from "react";
import { Link } from "react-router-dom";
import "./LoginPage.css"; // reuse the exact same CSS

export default function AuthShell({ cardTitle, children }) {
  return (
    <div className="login-shell">

      <section className="login-mission">
        <div className="login-mission-top">
          <h1 className="login-brand">Epic-Cure</h1>
          <p className="login-brand-sub">Grant Management System</p>
        </div>

        <div className="login-mission-middle">
          <h2 className="login-h2">Eliminating, Feeding & Teaching</h2>

          <p className="login-p">
            WHAT WE DO            
          </p>

          <p className="login-p">
          Eliminate food waste and hunger through food rescue and distribution and leverage senior citizens to teach children safely prepare meals, providing them with practicals life skills and self-confidence from real achievement, while simultaneously connecting generations through a shared purpose.          
          </p>
        </div>

        <div className="login-mission-bottom">
          <a
            href="https://www.epic-cure.org"
            className="login-footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            epic-cure.org
          </a>
        </div>
      </section>


      {/* RIGHT PANEL */}
      <section className="login-card">
        <div className="login-card-inner">

          <div className="login-card-head">
            <h3 className="login-card-title">
              Epic-Cure<br />
              <span>{cardTitle}</span>
            </h3>
          </div>

          {children}

        </div>
      </section>

    </div>
  );
}