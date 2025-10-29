import React from "react";
import "./Sidebar.css";
import { Link } from "react-router-dom";

function Sidebar(){

    return (
        <aside className = "sidebar">
            <div className="sidebar__brand">
            <div className="sidebar__title">
          <div className="app-name">Epic-Cure</div>
          <div className="app-sub">Grant Management System</div>
        </div>
      </div>

      <nav className = "sidebar_nav">
        <div className = "nav-group">

            <button className="nav-item">
            <span className="nav-label">Dashboard</span>
            </button>

            <Link to="/grants" className="nav-item">
            <span className="nav-label">Grants</span>
            </Link>

            <Link to="/documents" className="nav-item">
            <span className="nav-label">Documents</span>
            </Link>

            <button className="nav-item">
            <span className="nav-label">FAQ's</span>
            </button>

            <button className="nav-item">
            <span className="nav-label">Profile</span>
            </button>

        </div>
      </nav>

      <div className="sidebar__footer">
        <div className="user">JD</div>
        <div className="user-info">
          <div className="user-name">John Doe</div>
          <div className="user-email">admin@grantflow.com</div>
        </div>
      </div>
        </aside>
    )

}
export default Sidebar;
