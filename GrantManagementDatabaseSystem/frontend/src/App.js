// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import DocumentsPage from "./components/DocumentsPage";
import GrantList from "./components/GrantList";
import AddDocuments from "./components/AddDocuments";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/grants" element={<GrantList />} />
        <Route path="/adddocuments" element={<AddDocuments/>}/>
      </Routes>
    </Router>
  );
}

export default App;
