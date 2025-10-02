import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Popup from "./Popup";

function LoginPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("authUser");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  function handleLogout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setUser(null);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Welcome to EPIC-CURE</h1>

      {user ? (
        <div style={{ marginBottom: 16 }}>
          <p>Signed in as <b>{user.username}</b></p>
          <button onClick={handleLogout}>Sign out</button>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setShowPopup(true)}>Login / Create Account</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <Link to="/documents"><button>Documents</button></Link>
        <Link to="/grants"><button>Grants</button></Link>
      </div>

      {}
      <Popup
        open={showPopup}
        onClose={() => setShowPopup(false)}
        onAuthed={(authedUser) => {
          setUser(authedUser);
          setShowPopup(false);
        }}
      />
    </div>
  );
}

export default LoginPage;
