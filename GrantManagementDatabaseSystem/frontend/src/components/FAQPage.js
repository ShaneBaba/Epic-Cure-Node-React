import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "./FAQPage.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";
function FAQPage() {
    const [faqs, setFaqs] = useState([]);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [usedCategories, setUsedCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [error, setError] = useState("");
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [showViewPopup, setShowViewPopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [selectedFAQ, setSelectedFAQ] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const faqsPerPage = 10;
    const token = localStorage.getItem("authToken");
    const authUserRaw = localStorage.getItem("authUser");
    const authUser = authUserRaw ? JSON.parse(authUserRaw) : null;
    const isAdmin = authUser?.role === "ADMIN";
    const authHeaders = React.useMemo(() => {
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, [token]);

    const fetchFAQs = async (filters = {}) => {
        try {
            setError("");
            const params = new URLSearchParams(filters).toString();

            const res = await fetch(`${API}/api/faqs${params ? `?${params}` : ""}`, {
                headers: authHeaders,
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) throw new Error(data?.message || "Failed to load FAQs");

            setFaqs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(err.message);
            setFaqs([]);
        }
    };

    const fetchUsedCategories = async () => {
        try {
            const res = await fetch(`${API}/api/faqs/categories`, {
                headers: authHeaders,
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error();

            setUsedCategories(Array.isArray(data) ? data : []);
        } catch {
            setUsedCategories([]);
        }
    };

    const fetchAllCategories = async () => {
        try {
            const res = await fetch(`${API}/api/faq-categories`, {
                headers: authHeaders,
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error();

            setAllCategories(Array.isArray(data) ? data : []);
        } catch {
            setAllCategories([]);
        }
    };

    useEffect(() => {
        if (!token) {
            setError("You are not logged in.");
            return;
        }

        fetchFAQs();
        fetchUsedCategories();
        fetchAllCategories();
    }, []);

    useEffect(() => {
        if (!token) return;

        const filters = {};
        if (search.trim()) filters.search = search.trim();
        if (categoryFilter) filters.category = categoryFilter;

        fetchFAQs(filters);
    }, [search, categoryFilter]);

    useEffect(() => {
        const handleUpdate = () => {
            fetchUsedCategories();
            fetchAllCategories();
        };

        window.addEventListener("categoriesUpdated", handleUpdate);

        return () => window.removeEventListener("categoriesUpdated", handleUpdate);
    }, []);

    const clearFilters = () => {
        setSearch("");
        setCategoryFilter("");
        fetchFAQs();
    };

    const addFAQ = async (newFAQ) => {
        try {
            const res = await fetch(`${API}/api/faqs`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders },
                body: JSON.stringify(newFAQ),
            });

            const data = await res.json();

            if (!res.ok) return false;

            setFaqs((prev) => [data, ...prev]);
            return true;
        } catch {
            setError("Failed to add FAQ.");
            return false;
        }
    };

    const updateFAQ = async (updatedFAQ) => {
        try {
            const res = await fetch(`${API}/api/faqs/${updatedFAQ.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...authHeaders },
                body: JSON.stringify(updatedFAQ),
            });

            const data = await res.json();

            if (!res.ok) return false;

            setFaqs((prev) =>
                prev.map((f) => (f.id === data.id ? data : f))
            );

            setSelectedFAQ(data);
            return true;
        } catch {
            setError("Failed to update FAQ.");
            return false;
        }
    };

    const deleteFAQ = async (id) => {
        if (!isAdmin) return;

        if (!window.confirm("Delete this FAQ?")) return;

        try {
            const res = await fetch(`${API}/api/faqs/${id}`, {
                method: "DELETE",
                headers: authHeaders,
            });

            if (!res.ok) throw new Error();

            setFaqs((prev) => prev.filter((f) => f.id !== id));
            setShowViewPopup(false);
        } catch {
            setError("Failed to delete FAQ.");
        }
    };

    const totalPages = Math.ceil(faqs.length / faqsPerPage);
    const indexOfLastFAQ = currentPage * faqsPerPage;
    const indexOfFirstFAQ = indexOfLastFAQ - faqsPerPage;
    const currentFAQs = faqs.slice(
        (currentPage - 1) * faqsPerPage,
        currentPage * faqsPerPage
    );

    return (
        <div className="layout">
            <Sidebar />

            <main className="faqs-page">
                <div className="faqs-header">
                    <div className="faqs-header-content">
                        <h2 className="faqs-title">FAQS</h2>
                        <div className="faqs-title-underline"></div>
                    </div>
                </div>

                {error && <div className="dashboard-error">{error}</div>}

                <div className="faqs-controls">
                    <label className="search-label" htmlFor="search">Search:</label>
                    <input
                        className="faqs-search"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        className="faqs-select"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {usedCategories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    <button className="faqs-button" onClick={clearFilters}>
                        Clear
                    </button>
                </div>

                <button className="btn-upload" onClick={() => setShowAddPopup(true)}>
                    Add FAQ
                </button>

                <p className="faqs-count">
                    Showing {indexOfFirstFAQ + 1}–{Math.min(indexOfLastFAQ, faqs.length)} of {faqs.length} FAQ{faqs.length !== 1 ? "s" : ""}
                </p>

                <table className="faqs-table">
                    <thead>
                        <tr>
                            <th>Question</th>
                            <th>Answer</th>
                            <th>Category</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentFAQs.length > 0 ? (
                            currentFAQs.map((f) => (
                                <tr key={f.id}>
                                    <td>{f.question}</td>
                                    <td>{f.answer}</td>
                                    <td>{f.category}</td>
                                    <td>
                                        <button
                                            className="faqs-button"
                                            onClick={() => {
                                                setSelectedFAQ(f);
                                                setShowViewPopup(true);
                                            }}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4}>No FAQs found</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</button>

                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>

                        {(() => {
                            const pages = [];
                            const delta = 2;
                            const left = currentPage - delta;
                            const right = currentPage + delta;
                            let lastPushed = null;

                            for (let i = 1; i <= totalPages; i++) {
                                if (i === 1 || i === totalPages || (i >= left && i <= right)) {
                                    if (lastPushed && i - lastPushed > 1) {
                                        pages.push(
                                            <span key={`ellipsis-${i}`} className="pagination-ellipsis">
                                                ...
                                            </span>
                                        );
                                    }

                                    pages.push(
                                        <button
                                            key={i}
                                            className={currentPage === i ? "active-page" : ""}
                                            onClick={() => setCurrentPage(i)}
                                        >
                                            {i}
                                        </button>
                                    );

                                    lastPushed = i;
                                }
                            }

                            return pages;
                        })()}

                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>

                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            »
                        </button>
                    </div>
                )}

                {showViewPopup && selectedFAQ && (
                    <div className="popup-overlay" onClick={(e) => e.target.className === "popup-overlay" && setShowViewPopup(false)}>
                        <div className="popup">
                            <button className="close-btn" onClick={() => setShowViewPopup(false)}>×</button>

                            <h3>FAQ Details</h3>

                            <p>Question: {selectedFAQ.question}</p>
                            <p>Answer: {selectedFAQ.answer}</p>
                            <p>Category: {selectedFAQ.category}</p>
                            <p>Created By: {selectedFAQ.createdByName}</p>
                            <p>Last Edited By: {selectedFAQ.lastEditedByName}</p>

                            <div className="actions">
                                <button
                                    className="btn-edit"
                                    onClick={() => {
                                        setShowViewPopup(false);
                                        setShowEditPopup(true);
                                    }}
                                >
                                    Edit
                                </button>
                                {isAdmin && (
                                    <button className="btn-delete" onClick={() => deleteFAQ(selectedFAQ.id)}>
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {showEditPopup && selectedFAQ && (
                    <FAQPopup
                        title="Edit FAQ"
                        existingFAQ={selectedFAQ}
                        onClose={() => setShowEditPopup(false)}
                        onSave={updateFAQ}
                        categories={allCategories}
                    />
                )}

                {showAddPopup && (
                    <FAQPopup
                        title="Add FAQ"
                        onClose={() => setShowAddPopup(false)}
                        onSave={addFAQ}
                        categories={allCategories}
                    />
                )}
            </main>
        </div>
    );
}

function FAQPopup({ title, onClose, onSave, existingFAQ, categories }) {
    const [faqData, setFaqData] = useState(
        existingFAQ || { question: "", answer: "", category: "" }
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFaqData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!faqData.question.trim()) return alert("Question is required");
        if (!faqData.answer.trim()) return alert("Answer is required");
        if (!faqData.category.trim()) return alert("Category is required");
        const payload = { ...faqData };
        if (existingFAQ) payload.id = existingFAQ.id;
        const result = await onSave(payload);
        if (result === false) {
            onClose();
        }
    };

    return (
        <div className="popup-overlay" onClick={(e) => e.target.className === "popup-overlay" && onClose()}>
            <div className="popup">
                <button className="close-btn" onClick={onClose}>×</button>

                <h3>{title}</h3>

                <form onSubmit={handleSubmit}>
                    <label>Question:</label>
                    <input className="faqs-input" name="question" value={faqData.question} onChange={handleChange} />

                    <label>Answer:</label>
                    <textarea className="faqs-input" name="answer" value={faqData.answer} onChange={handleChange} />

                    <label>Category:</label>
                    <select
                        className="faqs-select"
                        name="category"
                        value={faqData.category}
                        onChange={handleChange}
                    >
                        <option value="">Select a category...</option>
                        {categories.map((cat) => (
                            <option key={cat.category_id} value={cat.category_name}>
                                {cat.category_name}
                            </option>
                        ))}
                    </select>
                    {existingFAQ && (
                        <>
                            <p>Created By: {faqData.createdByName}</p>
                            <p>Last Edited By: {faqData.lastEditedByName}</p>
                        </>
                    )}
                    <div className="actions">
                        <button className="btn-save" type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FAQPage