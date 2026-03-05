// Dashboard.js
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "./Dashboard.css";

// Convert "YYYY-MM-DD" to Date without timezone issues
function normalizeDate(d) {
    const [year, month, day] = String(d).split("-");
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
        const token = localStorage.getItem("authToken");
        const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

        // If there's no token, don't even try the request
        if (!token) {
            setGrants([]);
            setError("You are not logged in. Please log in again.");
            return;
        }

        fetch(`${API}/api/grants`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    throw new Error(data?.message || `Request failed (${res.status})`);
                }

                // Ensure array shape to prevent crashes
                const list = Array.isArray(data) ? data : data?.grants;
                setGrants(Array.isArray(list) ? list : []);
                setError("");
            })
            .catch((err) => {
                console.error("Error loading grants:", err);
                setGrants([]);
                setError(err.message || "Could not load grants");
            });
    }, []);

    const today = normalizeDate(new Date().toISOString().split("T")[0]);

    // Buckets:
    // - overdue: past due AND not Complete
    // - dueThisWeek: due in 7 days or less (including today)
    // - dueThisMonth: due in 8..30 days
    // - upcoming: due in more than 30 days
    const overdue = [];
    const dueThisWeek = [];
    const dueThisMonth = [];
    const upcoming = [];

    const safeGrants = Array.isArray(grants) ? grants : [];

    safeGrants.forEach((g) => {
        if (!g?.duedate) return;

        const due = normalizeDate(g.duedate);
        const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

        const status = String(g?.submissionstatus || "");
        const isComplete = status === "Complete";

        // Collect overdue but keep them out of the due/upcoming buckets
        if (diffDays < 0) {
            if (!isComplete) overdue.push(g);
            return;
        }

        if (diffDays <= 7) {
            dueThisWeek.push(g);
        } else if (diffDays <= 30) {
            dueThisMonth.push(g);
        } else {
            upcoming.push(g);
        }
    });

    // Optional: sort lists by soonest due date
    const bySoonestDue = (a, b) => normalizeDate(a.duedate) - normalizeDate(b.duedate);
    overdue.sort(bySoonestDue);
    dueThisWeek.sort(bySoonestDue);
    dueThisMonth.sort(bySoonestDue);
    upcoming.sort(bySoonestDue);

    // Status counts (Not Started, In Progress, etc.)
    const statusCounts = safeGrants.reduce((acc, g) => {
        const key = g?.submissionstatus || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    // Add overdue into the status list (even if 0 so it always displays)
    statusCounts["Overdue"] = overdue.length;

    return (
        <div className="layout">
            <Sidebar />

            <div className="dashboard-page">
                <h1 className="dashboard-title">DASHBOARD</h1>
                {error && <div className="dashboard-error">{error}</div>}

                <div className="dashboard-grid">
                    {/* Upcoming Grants (shorter now) */}
                    <section className="dashboard-card dashboard-area-upcoming">
                        <h2 className="dashboard-card-title">Upcoming Grants</h2>
                        {upcoming.length === 0 ? (
                            <p className="dashboard-muted">No upcoming grants.</p>
                        ) : (
                            upcoming.map((g) => {
                                const dueDate = formatDate(g.duedate);
                                const daysLeft = Math.round(
                                    (normalizeDate(g.duedate) - today) / (1000 * 60 * 60 * 24)
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

                    {/* Due This Week (top-right) */}
                    <section className="dashboard-card dashboard-area-dueweek">
                        <h2 className="dashboard-card-title">Due This Week</h2>
                        {dueThisWeek.length === 0 ? (
                            <p className="dashboard-muted">No grants due this week.</p>
                        ) : (
                            dueThisWeek.map((g) => {
                                const dueDate = formatDate(g.duedate);
                                const daysLeft = Math.round(
                                    (normalizeDate(g.duedate) - today) / (1000 * 60 * 60 * 24)
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

                    {/* Overdue (left column, between Upcoming and Total) */}
                    <section className="dashboard-card dashboard-area-overdue">
                        <h2 className="dashboard-card-title">Overdue</h2>
                        {overdue.length === 0 ? (
                            <p className="dashboard-muted">No overdue grants.</p>
                        ) : (
                            overdue.map((g) => {
                                const dueDate = formatDate(g.duedate);
                                const daysOverdue = Math.abs(
                                    Math.round(
                                        (normalizeDate(g.duedate) - today) / (1000 * 60 * 60 * 24)
                                    )
                                );

                                return (
                                    <div key={g.id} className="dashboard-item-row">
                                        <div className="dashboard-item-name">{g.name}</div>
                                        <div className="dashboard-item-meta">
                                            Due: {dueDate} • {daysOverdue} days overdue
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </section>

                    {/* Due This Month (middle-right) */}
                    <section className="dashboard-card dashboard-area-duemonth">
                        <h2 className="dashboard-card-title">Due This Month</h2>
                        {dueThisMonth.length === 0 ? (
                            <p className="dashboard-muted">No grants due this month.</p>
                        ) : (
                            dueThisMonth.map((g) => {
                                const dueDate = formatDate(g.duedate);
                                const daysLeft = Math.round(
                                    (normalizeDate(g.duedate) - today) / (1000 * 60 * 60 * 24)
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

                    {/* Total Grants (bottom-left) */}
                    <section className="dashboard-card-small dashboard-area-total">
                        <h2 className="dashboard-card-title">Total Grants</h2>
                        <div className="dashboard-big-number">{safeGrants.length}</div>
                    </section>

                    {/* Grant Status (bottom-right) */}
                    <section className="dashboard-card-small dashboard-area-status">
                        <h2 className="dashboard-card-title">Grant Status</h2>
                        {Object.keys(statusCounts).length === 0 ? (
                            <p className="dashboard-muted">No data yet.</p>
                        ) : (
                            <ul className="dashboard-status-list">
                                {Object.entries(statusCounts).map(([status, count]) => (
                                    <li key={status} className="dashboard-status-item">
                                        <span>{status}</span>
                                        <span>{count}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;