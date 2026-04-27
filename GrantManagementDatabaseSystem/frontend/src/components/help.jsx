import React, { useState } from "react";
import "./help.css";

function Help() {
  const sections = [
    {
      id: "intro",
      title: "1. Introduction",
      content: (
        <>
          <p>
            The Grant Management System is a web-based application designed to help users
            manage grants, documents, and related information efficiently. The system
            allows users to track deadlines, organize documents, manage FAQs, and
            administer user access.
          </p>
          <p>
            This manual provides step-by-step instructions for using the system. It is
            intended for both Grant Writers and Administrators.
          </p>
        </>
      ),
    },
    {
      id: "navigation",
      title: "2. System Navigation",
      content: (
        <>
          <p>The system uses a sidebar for navigation. The following pages are accessible:</p>
          <ul>
            <li>Dashboard</li>
            <li>Grants</li>
            <li>Documents</li>
            <li>FAQ</li>
            <li>Admin Tools (Admin only)</li>
            <li>My Account</li>
            <li>Help</li>
          </ul>
          <p>Click any item in the sidebar to navigate to that page.</p>
        </>
      ),
    },
    {
      id: "dashboard",
      title: "3. Dashboard",
      content: (
        <>
          <p>
            The Dashboard provides an overview of all grants in the system using six
            section cards.
          </p>

          <h4>Grant Deadline Sections</h4>
          <p>These cards display:</p>
          <ul>
            <li><strong>Upcoming Grants</strong> – Due in more than one month</li>
            <li><strong>Due This Week</strong> – Due in 7 days or less</li>
            <li><strong>Due This Month</strong> – Due within one month</li>
            <li><strong>Overdue</strong> – Past due date</li>
          </ul>
          <p>Each grant is displayed with grant name, due date, and days remaining.</p>

          <h4>Viewing Filtered Grants</h4>
          <ul>
            <li>Clicking any of the above cards redirects to the Grants page.</li>
            <li>The list will be automatically filtered based on the selected category.</li>
            <li>
              Example: Clicking <em>Upcoming Grants</em> shows only grants due in more
              than a month.
            </li>
          </ul>

          <h4>Summary Sections</h4>
          <ul>
            <li><strong>Total Grants</strong> – Displays total number of grants.</li>
            <li>
              <strong>Grant Status</strong> – Displays number of grants by status:
              <ul>
                <li>In Progress</li>
                <li>Complete</li>
                <li>Submitted / Under Review</li>
                <li>Not Started</li>
                <li>Overdue</li>
              </ul>
            </li>
          </ul>

          <div className="help-note">
            <strong>Important:</strong> Users cannot manually set a grant to{" "}
            <em>Overdue</em>. A grant becomes overdue automatically when its due date
            passes.
          </div>
        </>
      ),
    },
    {
      id: "grants",
      title: "4. Grants Page",
      content: (
        <>
          <p>The Grants page allows users to create, view, search, and edit grants.</p>

          <h4>Creating a Grant</h4>
          <ol>
            <li>Click the <strong>Add Grant</strong> button.</li>
            <li>Fill out the form fields.</li>
            <li>Submit the form.</li>
          </ol>

          <h4>Filtering Grants</h4>
          <p>Users can filter grants by:</p>
          <ul>
            <li>Grant Name (search bar)</li>
            <li>ZIP Code</li>
            <li>Grant Category</li>
            <li>
              Grant Status:
              <ul>
                <li>Not Started</li>
                <li>In Progress</li>
                <li>Completed</li>
                <li>Submitted / Under Review</li>
              </ul>
            </li>
          </ul>

          <h4>Editing a Grant</h4>
          <ol>
            <li>Click any grant in the list.</li>
            <li>Update the information as needed.</li>
            <li>Delete grant if needed (Admin only).</li>
          </ol>

          <h4>Grant List</h4>
          <ul>
            <li>Located on the bottom half of the page.</li>
            <li>Displays all grants by default.</li>
            <li>Shows filtered results when filters are applied.</li>
          </ul>
        </>
      ),
    },
    {
      id: "documents",
      title: "5. Documents Page",
      content: (
        <>
          <p>The Documents page manages document records and file uploads.</p>

          <h4>Uploading a Document</h4>
          <ol>
            <li>Click <strong>Upload Document</strong>.</li>
            <li>Fill out document details in the form.</li>
            <li>Upload a file (optional).</li>
            <li>Submit the form.</li>
          </ol>

          <h4>Filtering Documents</h4>
          <p>Users can filter by:</p>
          <ul>
            <li>Search</li>
            <li>Document Type</li>
            <li>Document Status</li>
            <li>Date</li>
          </ul>

          <h4>Quick Status Filters</h4>
          <p>Below the upload button are four colored buttons:</p>
          <ul>
            <li>Final</li>
            <li>In Review</li>
            <li>In Progress</li>
            <li>Drafts</li>
          </ul>
          <p>Each button displays the number of documents in that status and applies a filter when clicked.</p>

          <h4>Editing a Document</h4>
          <ol>
            <li>Click any document in the list.</li>
            <li>Update the information as needed.</li>
            <li>Delete document if needed (Admin only).</li>
          </ol>

          <h4>Document List</h4>
          <ul>
            <li>Located on the bottom half of the page.</li>
            <li>Displays documents in rows.</li>
            <li>Updates based on applied filters.</li>
          </ul>
        </>
      ),
    },
    {
      id: "faq",
      title: "6. FAQ Page",
      content: (
        <>
          <p>The FAQ page allows users to manage frequently asked questions.</p>

          <h4>Adding an FAQ</h4>
          <ol>
            <li>Click <strong>Add FAQ</strong>.</li>
            <li>Enter the Question, Answer, and Category.</li>
            <li>Save.</li>
          </ol>

          <h4>Filtering FAQs</h4>
          <ul>
            <li>Search by typing keywords.</li>
            <li>Filter by category.</li>
          </ul>

          <h4>FAQ List</h4>
          <p>Displays all entries in rows showing Questions, Answers, and Category.</p>
        </>
      ),
    },
    {
      id: "admin",
      title: "7. Admin Tools (Admin Only)",
      content: (
        <>
          <p>
            The Admin Tools page is accessible only to users with the Admin role. It
            contains five expandable sections.
          </p>

          <h4>1. Invite Users</h4>
          <ul>
            <li>Enter email and select role (Grant Writer or Admin).</li>
            <li>User receives an invitation link to create an account.</li>
          </ul>

          <h4>2. Manage Users</h4>
          <ul>
            <li>Change user roles.</li>
            <li>Enable or disable accounts.</li>
            <li><em>Awaiting Invite</em> is shown for users who have not registered.</li>
          </ul>

          <h4>3. Manage Document Types</h4>
          <ul>
            <li>Add new document types.</li>
            <li>Edit or remove existing types.</li>
            <li>Used in Documents page filters.</li>
          </ul>

          <h4>4. Manage Grant Categories</h4>
          <ul>
            <li>Add, edit, or delete categories.</li>
            <li>Used in Grants page filters.</li>
          </ul>

          <h4>5. Manage FAQ Categories</h4>
          <ul>
            <li>Add, edit, or delete FAQ categories.</li>
            <li>Used in FAQ page.</li>
          </ul>
        </>
      ),
    },
    {
      id: "account",
      title: "8. My Account",
      content: (
        <>
          <p>
            The My Account page allows users to view account details and update their
            password.
          </p>

          <h4>Account Information</h4>
          <p>Displays:</p>
          <ul>
            <li>Username</li>
            <li>Email</li>
            <li>Role (Admin or Grant Writer)</li>
            <li>Status (Active / Inactive)</li>
          </ul>

          <h4>Security</h4>
          <p>To change password:</p>
          <ol>
            <li>Enter current password.</li>
            <li>Enter new password.</li>
            <li>Confirm new password.</li>
            <li>Submit.</li>
          </ol>
        </>
      ),
    },
    {
      id: "help",
      title: "9. Help Page",
      content: (
        <p>
          The Help page contains the User Manual for the system. Users can access this
          page for guidance on how to use all features of the application.
        </p>
      ),
    },
    {
      id: "conclusion",
      title: "10. Conclusion",
      content: (
        <p>
          The Grant Management System provides tools for managing grants, documents,
          FAQs, and users in a centralized platform. By using the dashboard, filters,
          and management tools, users can efficiently track progress and meet deadlines.
        </p>
      ),
    },
  ];

  // All sections open by default; users can collapse what they don't need.
  const [openIds, setOpenIds] = useState(() => new Set(sections.map((s) => s.id)));

  const toggle = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setOpenIds(new Set(sections.map((s) => s.id)));
  const collapseAll = () => setOpenIds(new Set());

  return (
    <div className="help-page">
      <div className="help-header">
        <div className="help-title-underline"></div>
        <h1 className="help-title">Help &amp; User Manual</h1>
        <p className="help-subtitle">
          Step-by-step guidance for every page of the Grant Management System.
        </p>
      </div>

      <div className="help-toolbar">
        <button className="help-btn" onClick={expandAll}>Expand all</button>
        <button className="help-btn" onClick={collapseAll}>Collapse all</button>
      </div>

      <nav className="help-toc">
        <h3>Contents</h3>
        <ul>
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>{s.title}</a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="help-sections">
        {sections.map((s) => {
          const isOpen = openIds.has(s.id);
          return (
            <section key={s.id} id={s.id} className="help-section">
              <button
                className="help-section__toggle"
                onClick={() => toggle(s.id)}
                aria-expanded={isOpen}
              >
                <span>{s.title}</span>
                <span className="help-section__chevron">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && <div className="help-section__body">{s.content}</div>}
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default Help;