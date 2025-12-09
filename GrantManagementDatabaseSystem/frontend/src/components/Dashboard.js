
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import logo from "../logo.svg";

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

            <div style={sx.page}>
                <h1 style={sx.title}>DASHBOARD</h1>
                {error && <div style={sx.error}>{error}</div>}

                <div style={sx.grid}>

                    {/* Upcoming Grants */}
                    <section style={sx.cardTall}>
                        <h2 style={sx.cardTitle}>Upcoming Grants</h2>
                        {upcoming.length === 0 ? (
                            <p style={sx.muted}>No upcoming grants.</p>
                        ) : (
                            upcoming.map((g) => {
                                const dueDate = formatDate(g.duedate);
                                const daysLeft = Math.round(
                                    (normalizeDate(g.duedate) - today) /
                                    (1000 * 60 * 60 * 24)
                                );

                                return (
                                    <div key={g.id} style={sx.itemRow}>
                                        <div style={sx.itemName}>{g.name}</div>
                                        <div style={sx.itemMeta}>
                                            Due: {dueDate} • {daysLeft} days left
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </section>

                    {/* Due Today */}
                    <section style={sx.card}>
                        <h2 style={sx.cardTitle}>Due Today</h2>
                        {dueToday.length === 0 ? (
                            <p style={sx.muted}>None.</p>
                        ) : (
                            dueToday.map((g) => (
                                <div key={g.id} style={sx.itemRow}>
                                    <div style={sx.itemName}>{g.name}</div>
                                    <div style={sx.itemMeta}>{g.category}</div>
                                </div>
                            ))
                        )}
                    </section>

                    {/* Due This Week */}
                    <section style={sx.card}>
                        <h2 style={sx.cardTitle}>Due This Week</h2>
                        {dueThisWeek.length === 0 ? (
                            <p style={sx.muted}>No grants due this week.</p>
                        ) : (
                            dueThisWeek.map((g) => {
                                const dueDate = formatDate(g.duedate);
                                const daysLeft = Math.round(
                                    (normalizeDate(g.duedate) - today) /
                                    (1000 * 60 * 60 * 24)
                                );

                                return (
                                    <div key={g.id} style={sx.itemRow}>
                                        <div style={sx.itemName}>{g.name}</div>
                                        <div style={sx.itemMeta}>
                                            Due: {dueDate} • {daysLeft} days left
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </section>

                    {/* Total Grants */}
                    <section style={sx.cardSmall}>
                        <h2 style={sx.cardTitle}>Total Grants</h2>
                        <div style={sx.bigNumber}>{grants.length}</div>
                    </section>

                    {/* Grant Status */}
                    <section style={sx.cardSmall}>
                        <h2 style={sx.cardTitle}>Grant Status</h2>
                        {Object.keys(statusCounts).length === 0 ? (
                            <p style={sx.muted}>No data yet.</p>
                        ) : (
                            <ul style={sx.statusList}>
                                {Object.entries(statusCounts).map(
                                    ([status, count]) => (
                                        <li key={status} style={sx.statusItem}>
                                            <span>{status}</span>
                                            <span>{count}</span>
                                        </li>
                                    )
                                )}
                            </ul>
                        )}
                    </section>

                    {/* Logo */}
                    <section style={sx.cardSmallCenter}>
                        <h2 style={sx.cardTitle}>Epic Cure</h2>
                        <img
                            src={logo}
                            alt="Company logo"
                            style={{
                                maxWidth: "80%",
                                maxHeight: 80,
                                objectFit: "contain",
                            }}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
}

// Styles remain unchanged
const sx = {
    page: {
        flex: 1,
        padding: "20px 24px",
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
        boxSizing: "border-box",
    },
    title: {
        margin: "0 0 16px 0",
        fontSize: 24,
        letterSpacing: 2,
    },
    error: {
        marginBottom: 12,
        padding: 10,
        background: "#fee2e2",
        border: "1px solid #fecaca",
        color: "#991b1b",
        borderRadius: 8,
        fontSize: 14,
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "2fr 1.2fr",
        gridTemplateRows:
            "minmax(200px, auto) minmax(150px, auto) minmax(150px, auto)",
        gap: 20,
    },
    card: {
        background: "#fff",
        borderRadius: 10,
        padding: 16,
        boxShadow: "0 2px 8px rgba(15,23,42,.12)",
    },
    cardTall: {
        background: "#fff",
        borderRadius: 10,
        padding: 16,
        boxShadow: "0 2px 8px rgba(15,23,42,.12)",
        gridRow: "span 2",
    },
    cardSmall: {
        background: "#fff",
        borderRadius: 10,
        padding: 16,
        boxShadow: "0 2px 8px rgba(15,23,42,.12)",
    },
    cardSmallCenter: {
        background: "#fff",
        borderRadius: 10,
        padding: 16,
        boxShadow: "0 2px 8px rgba(15,23,42,.12)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    cardTitle: {
        margin: "0 0 10px 0",
        fontSize: 16,
        letterSpacing: 1,
    },
    itemRow: {
        marginBottom: 8,
    },
    itemName: {
        fontWeight: 600,
    },
    itemMeta: {
        fontSize: 12,
        color: "#6b7280",
    },
    muted: {
        fontSize: 14,
        color: "#9ca3af",
    },
    bigNumber: {
        fontSize: 40,
        fontWeight: 700,
        textAlign: "center",
        marginTop: 10,
    },
    statusList: {
        listStyle: "none",
        padding: 0,
        margin: 0,
    },
    statusItem: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 14,
        padding: "4px 0",
        borderBottom: "1px solid #e5e7eb",
    },
};

export default Dashboard;
