// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import DocumentsPage from "./components/DocumentsPage";
import GrantList from "./components/GrantList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/grants" element={<GrantList />} />
      </Routes>
    </Router>
  );
}

export default App;
