import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import './MyAccountPage.css';

function MyAccountPage() {
  const [accountInfo, setAccountInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accountError, setAccountError] = useState('');

  const [accountExpanded, setAccountExpanded] = useState(true);
  const [securityExpanded, setSecurityExpanded] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = 'http://localhost:4000';

  useEffect(() => {
    fetchAccountInfo();
  }, []);

  const toggleSection = (section) => {
    if (section === 'account') {
      setAccountExpanded((prev) => {
        const next = !prev;
        if (next) setSecurityExpanded(false);
        return next;
      });
    }

    if (section === 'security') {
      setSecurityExpanded((prev) => {
        const next = !prev;
        if (next) setAccountExpanded(false);
        return next;
      });
    }
  };

  const fetchAccountInfo = async () => {
    try {
      setLoading(true);
      setAccountError('');

      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/api/account/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load account information.');
      }

      setAccountInfo(data);
    } catch (error) {
      console.error('Error fetching account info:', error);
      setAccountError(error.message || 'Failed to load account information.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/api/account/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password.');
      }

      setPasswordSuccess(data.message || 'Password changed successfully.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(error.message || 'Failed to change password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <main className="my-account-page">
        <div className="my-account-header">
          <h1 className="my-account-title">MY ACCOUNT</h1>
          <div className="my-account-title-underline"></div>
          <p className="my-account-subtitle">
            Manage your account information and update your password.
          </p>
        </div>

        <div className="my-account-card">
          <h3
            className="my-account-collapsible-header"
            onClick={() => toggleSection('account')}
          >
            Account Information
            <span className="my-account-collapse-icon">
              {accountExpanded ? '▲' : '▼'}
            </span>
          </h3>

          {accountExpanded && (
            <div className="my-account-section-body">
              {loading && <p>Loading account information...</p>}
              {accountError && (
                <p className="my-account-message error">{accountError}</p>
              )}

              {!loading && accountInfo && (
                <div className="my-account-info-list">
                  <div className="my-account-info-row">
                    <span className="label">Username</span>
                    <span>{accountInfo.username}</span>
                  </div>
                  <div className="my-account-info-row">
                    <span className="label">Email</span>
                    <span>{accountInfo.email}</span>
                  </div>
                  <div className="my-account-info-row">
                    <span className="label">Role</span>
                    <span>{accountInfo.role}</span>
                  </div>
                  <div className="my-account-info-row">
                    <span className="label">Status</span>
                    <span>{accountInfo.status}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="my-account-card">
          <h3
            className="my-account-collapsible-header"
            onClick={() => toggleSection('security')}
          >
            Security
            <span className="my-account-collapse-icon">
              {securityExpanded ? '▲' : '▼'}
            </span>
          </h3>

          {securityExpanded && (
            <div className="my-account-section-body">
              <form onSubmit={handlePasswordSubmit} className="my-account-form">
                <div className="my-account-form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="my-account-form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="my-account-form-group">
                  <label htmlFor="confirmNewPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    value={passwordForm.confirmNewPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                {passwordError && (
                  <p className="my-account-message error">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="my-account-message success">{passwordSuccess}</p>
                )}

                <button
                  type="submit"
                  className="my-account-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MyAccountPage;