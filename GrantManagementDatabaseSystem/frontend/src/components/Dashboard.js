import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import logo from "../logo.svg";
import "./Dashboard.css";

// Convert "YYYY-MM-DD" to Date without timezone issues
function normalizeDate(d) {
    const [year, month, day] = d.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
}

// print: Feb 15, 2025
function formatDate(d) {
    const date = normalizeDate(d);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function Dashboard() {
    const [grants, setGrants] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("http://localhost:4000/api/grants")
            .then((res) => res.json())
            .then((data) => setGrants(data))
            .catch((err) => {
                console.error("Error loading grants:", err);
                setError("Could not load grants");
            });
    }, []);

    const today = normalizeDate(new Date().toISOString().split("T")[0]);

    const dueToday = [];
    const dueThisWeek = [];
    const upcoming = [];

    grants.forEach((g) => {
        if (!g.duedate) return;

        const due = normalizeDate(g.duedate);
        const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            dueToday.push(g);
        } else if (diffDays > 0 && diffDays <= 7) {
            dueThisWeek.push(g);
        } else if (diffDays > 7) {
            upcoming.push(g);
        }
    });

    // Status counts (Not Started, In Progress, etc.)
    const statusCounts = grants.reduce((acc, g) => {
        const key = g.submissionstatus || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="layout">
            <Sidebar />

            <div className="dashboard-page">
                <h1 className="dashboard-title">DASHBOARD</h1>
                {error && <div className="dashboard-error">{error}</div>}

                <div className="dashboard-grid">

                    {/* Upcoming Grants */}
                    <section className="dashboard-card-tall">
                        <h2 className="dashboard-card-title">Upcoming Grants</h2>
                        {upcoming.length === 0 ? (
                            <p className="dashboard-muted">No upcoming grants.</p>
                        ) : (
                            upcoming.map((g) => {
                                const dueDate = formatDate(g.duedate);
                                const daysLeft = Math.round(
                                    (normalizeDate(g.duedate) - today) /
                                    (1000 * 60 * 60 * 24)
                                );

                                return (
                                    <div key={g.id} className="dashboard-item-row">
                                        <div className="dashboard-item-name">{g.name}</div>
                                        <div className="dashboard-item-meta">
                                            Due: {dueDate} • {daysLeft} days left
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </section>

                    {/* Due Today */}
                    <section className="dashboard-card">
                        <h2 className="dashboard-card-title">Due Today</h2>
                        {dueToday.length === 0 ? (
                            <p className="dashboard-muted">None.</p>
                        ) : (
                            dueToday.map((g) => (
                                <div key={g.id} className="dashboard-item-row">
                                    <div className="dashboard-item-name">{g.name}</div>
                                    <div className="dashboard-item-meta">{g.category}</div>
                                </div>
                            ))
                        )}
                    </section>

                    {/* Due This Week */}
                    <section className="dashboard-card">
                        <h2 className="dashboard-card-title">Due This Week</h2>
                        {dueThisWeek.length === 0 ? (
                            <p className="dashboard-muted">No grants due this week.</p>
                        ) : (
                            dueThisWeek.map((g) => {
                                const dueDate = formatDate(g.duedate);
                                const daysLeft = Math.round(
                                    (normalizeDate(g.duedate) - today) /
                                    (1000 * 60 * 60 * 24)
                                );

                                return (
                                    <div key={g.id} className="dashboard-item-row">
                                        <div className="dashboard-item-name">{g.name}</div>
                                        <div className="dashboard-item-meta">
                                            Due: {dueDate} • {daysLeft} days left
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </section>

                    {/* Total Grants */}
                    <section className="dashboard-card-small">
                        <h2 className="dashboard-card-title">Total Grants</h2>
                        <div className="dashboard-big-number">{grants.length}</div>
                    </section>

                    {/* Grant Status */}
                    <section className="dashboard-card-small">
                        <h2 className="dashboard-card-title">Grant Status</h2>
                        {Object.keys(statusCounts).length === 0 ? (
                            <p className="dashboard-muted">No data yet.</p>
                        ) : (
                            <ul className="dashboard-status-list">
                                {Object.entries(statusCounts).map(
                                    ([status, count]) => (
                                        <li key={status} className="dashboard-status-item">
                                            <span>{status}</span>
                                            <span>{count}</span>
                                        </li>
                                    )
                                )}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
