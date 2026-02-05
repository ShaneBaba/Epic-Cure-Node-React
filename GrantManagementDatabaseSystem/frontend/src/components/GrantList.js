import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import NotificationPopup from "./NotificationPopup";
import "./GrantList.css";

function GrantList() {
  const [grants, setGrants] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingGrant, setEditingGrant] = useState(null);
  const [showGrantDetails, setShowGrantDetails] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [notification, setNotification] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dueWindow, setDueWindow] = useState(false);
  const [zipFilter, setZipFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

  const token = localStorage.getItem("authToken");
  const authUserRaw = localStorage.getItem("authUser");
  const authUser = authUserRaw ? JSON.parse(authUserRaw) : null;

  // If your backend stores roles like "ADMIN" and "GRANT_WRITER"
  const isAdmin = authUser?.role === "ADMIN";

  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const triggerNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const fetchGrants = async (filters = {}) => {
    try {
      setError("");

      const params = new URLSearchParams(filters).toString();
      const url = `${API}/api/grants${params ? `?${params}` : ""}`;

      const res = await fetch(url, { headers: authHeaders });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || `Request failed (${res.status})`);
      }

      const list = Array.isArray(data) ? data : data?.grants;
      setGrants(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error loading grants:", err);
      setGrants([]);
      setError(err.message || "Could not load grants");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API}/api/grants/categories`, {
        headers: authHeaders,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || `Request failed (${res.status})`);
      }

      // Support either: ["A","B"] OR { categories: ["A","B"] }
      const list = Array.isArray(data) ? data : data?.categories;
      setCategories(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setCategories([]);
      // don't necessarily block the page for categories errors
    }
  };

  useEffect(() => {
    if (!token) {
      setError("You are not logged in. Please log in again.");
      setGrants([]);
      setCategories([]);
      return;
    }

    fetchGrants();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    const filters = {};

    if (searchName.trim()) filters.name = searchName.trim();
    if (statusFilter) filters.status = statusFilter;
    if (dueWindow) filters.dueWindow = "60";
    if (zipFilter.trim()) filters.zipcodes = zipFilter.trim();
    if (categoryFilter.trim()) filters.category = categoryFilter.trim();

    fetchGrants(filters);
  };

  const clearFilters = () => {
    setSearchName("");
    setStatusFilter("");
    setDueWindow(false);
    setZipFilter("");
    setCategoryFilter("");
    fetchGrants();
  };

  const addGrant = async (newGrant) => {
    try {
      const res = await fetch(`${API}/api/grants`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(newGrant),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || `Create failed (${res.status})`);
      }

      setGrants((prev) => [...prev, data]);
      fetchCategories();
      triggerNotification("New grant added!");
    } catch (err) {
      console.error("Add grant failed:", err);
      triggerNotification(err.message || "Failed to add grant");
    }
  };

  const updateGrant = async (updatedGrant) => {
    try {
      const res = await fetch(`${API}/api/grants/${updatedGrant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(updatedGrant),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || `Update failed (${res.status})`);
      }

      setGrants((prev) => prev.map((g) => (g.id === data.id ? data : g)));
      fetchCategories();
      triggerNotification("Grant updated!");
    } catch (err) {
      console.error("Update grant failed:", err);
      triggerNotification(err.message || "Failed to update grant");
    }
  };

  const deleteGrant = async (id) => {
    if (!isAdmin) {
      triggerNotification("Only admins can permanently delete grants.");
      return;
    }

    if (!window.confirm("Delete this grant?")) return;

    try {
      const res = await fetch(`${API}/api/grants/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || `Delete failed (${res.status})`);
      }

      setGrants((prev) => prev.filter((g) => g.id !== id));
      setShowEditPopup(false);
      fetchCategories();
      triggerNotification("Grant deleted!");
    } catch (err) {
      console.error("Delete grant failed:", err);
      triggerNotification(err.message || "Failed to delete grant");
    }
  };

  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeGrants = Array.isArray(grants) ? grants : [];

  return (
    <div className="layout">
      <Sidebar />
      <NotificationPopup message={notification} />

      <div className="grant-page">
        <h2>Grant List</h2>

        {error && <div className="dashboard-error">{error}</div>}

        <button onClick={() => setShowAddPopup(true)}>Add Grant</button>

        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search grant name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Filter by Zip Code..."
            value={zipFilter}
            onChange={(e) => setZipFilter(e.target.value)}
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {safeCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Complete">Complete</option>
            <option value="Submitted/Under Review">Submitted/Under Review</option>
          </select>

          <button
            className={dueWindow ? "active" : ""}
            onClick={() => setDueWindow((prev) => !prev)}
          >
            +/- 60 Days
          </button>

          <button onClick={applyFilters}>Apply Filters</button>
          <button onClick={clearFilters}>Clear Filters</button>
        </div>

        <table className="grant-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Due Date</th>
              <th>Zip Codes</th>
              <th>Status</th>
              <th>Category</th>
              <th>Website</th>
              <th>Documents</th>
              <th>Edit</th>
            </tr>
          </thead>

          <tbody>
            {safeGrants.map((g) => (
              <tr key={g.id}>
                <td
                  className="grant-link"
                  onClick={() => {
                    setSelectedGrant(g);
                    setShowGrantDetails(true);
                  }}
                >
                  {g.name}
                </td>
                <td>{g.duedate}</td>
                <td>{g.zipcodes}</td>
                <td>{g.submissionstatus}</td>
                <td>{g.category}</td>
                <td>{g.website}</td>
                <td>{g.documents}</td>
                <td>
                  <button
                    onClick={() => {
                      setEditingGrant(g);
                      setShowEditPopup(true);
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showAddPopup && (
          <GrantPopup
            title="Add New Grant"
            onClose={() => setShowAddPopup(false)}
            onSave={addGrant}
            isAdmin={isAdmin}
          />
        )}

        {showEditPopup && editingGrant && (
          <GrantPopup
            title="Edit Grant"
            onClose={() => setShowEditPopup(false)}
            onSave={updateGrant}
            onDelete={deleteGrant}
            existingGrant={editingGrant}
            isAdmin={isAdmin}
          />
        )}

        {showGrantDetails && selectedGrant && (
          <div
            className="popup-overlay"
            onClick={() => setShowGrantDetails(false)}
          >
            <div className="popup">
              <button
                className="close-btn"
                onClick={() => setShowGrantDetails(false)}
              >
                X
              </button>

              <h3>{selectedGrant.name}</h3>
              <p>Status: {selectedGrant.submissionstatus}</p>
              <p>Category: {selectedGrant.category}</p>
              <p>Zip Codes: {selectedGrant.zipcodes}</p>
              <p>Website: {selectedGrant.website}</p>
              <p>Documents: {selectedGrant.documents}</p>
              <p>Due Date: {selectedGrant.duedate}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GrantPopup({ title, onClose, onSave, existingGrant, onDelete, isAdmin }) {
  const [grantData, setGrantData] = useState(
    existingGrant || {
      name: "",
      zipcodes: "",
      submissionstatus: "Not Started",
      category: "",
      duedate: "",
      website: "",
      documents: "",
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGrantData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const payload = { ...grantData };
    if (existingGrant) payload.id = existingGrant.id;
    onSave(payload);
    onClose();
  };

  return (
    <div
      className="popup-overlay"
      onClick={(e) => e.target.className === "popup-overlay" && onClose()}
    >
      <div className="popup">
        <button className="close-btn" onClick={onClose}>
          X
        </button>

        <h3>{title}</h3>

        {["name", "category", "zipcodes", "website", "documents"].map((field) => (
          <div className="input-row" key={field}>
            <label>{field[0].toUpperCase() + field.slice(1)}:</label>
            <input
              type="text"
              name={field}
              value={grantData[field]}
              onChange={handleChange}
            />
          </div>
        ))}

        <div className="input-row">
          <label>Status:</label>
          <select
            name="submissionstatus"
            value={grantData.submissionstatus}
            onChange={handleChange}
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Complete">Complete</option>
            <option value="Submitted/Under Review">Submitted/Under Review</option>
          </select>
        </div>

        <div className="input-row">
          <label>Due Date:</label>
          <input
            type="date"
            name="duedate"
            value={grantData.duedate}
            onChange={handleChange}
          />
        </div>

        <div className="button-row">
          <button onClick={handleSubmit}>Save</button>

          {existingGrant && (
            <button
              className="delete-btn"
              onClick={() => onDelete(existingGrant.id)}
              disabled={!isAdmin}
              title={!isAdmin ? "Only admins can permanently delete grants" : ""}
              style={!isAdmin ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
            >
              Delete
            </button>
          )}
        </div>

        {!isAdmin && existingGrant && (
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
            Only admins can permanently delete grants.
          </div>
        )}
      </div>
    </div>
  );
}

export default GrantList;