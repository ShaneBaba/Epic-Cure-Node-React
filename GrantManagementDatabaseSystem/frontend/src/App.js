import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminToolsPage from "./components/AdminToolsPage";
import LoginPage from "./components/LoginPage";
import DocumentsPage from "./components/DocumentsPage";
import GrantList from "./components/GrantList";
import Dashboard from "./components/Dashboard";
import AcceptInvitePage from "./components/AcceptInvitePage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";   
import ResetPasswordPage from "./components/ResetPasswordPage";
import FAQPage from "./components/FAQPage";   
import MyAccountPage from './components/MyAccountPage';
import Help from "./components/help";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 
                <Route path="/reset-password" element={<ResetPasswordPage />} />  

                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/grants" element={<GrantList />} />
                <Route path="/faqs" element={<FAQPage />} />
                <Route path="/invite-users" element={<AdminToolsPage />} />
                <Route path="/accept-invite" element={<AcceptInvitePage />} />
                <Route path="/help" element={<Help />} />
                <Route path="/my-account" element={<MyAccountPage />} />
            </Routes>
        </Router>
    );
}

export default App;