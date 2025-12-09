
import React from "react";

export default function NotificationPopup({ message }) {
    if (!message) return null;

    return (
        <div style={styles.popup}>
            <p>{message}</p>
        </div>
    );
}

const styles = {
    popup: {
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: "#333",
        color: "white",
        padding: "14px 18px",
        borderRadius: "8px",
        zIndex: 9999,
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        animation: "fadeIn 0.3s ease",
    },
};
