import React, { useState } from "react";
import "./help.css";
import Sidebar from "./Sidebar";

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
            <li><strong>Dashboard</strong></li>
            <li><strong>Grants</strong></li>
            <li><strong>Documents</strong></li>
            <li><strong>FAQ</strong></li>
            <li><strong>Admin Tools</strong> (Admin only)</li>
            <li><strong>My Account</strong></li>
            <li><strong>Help</strong></li>
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
            <li>Fill out document details in the form (Name, Type, Status, Date, Notes).</li>
            <li>Upload a file (optional).</li>
            <li>Submit the form.</li>
          </ol>

          <h4>Filtering Documents</h4>
          <p>Users can filter by:</p>
          <ul>
            <li>Search</li>
            <li>Document Type</li>
            <li>Document Status</li>
            <li>Date range</li>
          </ul>

          <h4>Quick Status Filters</h4>
          <p>Below the upload button are four colored cards showing live counts. Click any card to filter, click again to clear:</p>
          <ul>
            <li><strong>Final</strong> (green)</li>
            <li><strong>In Review</strong> (blue)</li>
            <li><strong>In Progress</strong> (amber)</li>
            <li><strong>Drafts</strong> (gray)</li>
          </ul>

          <h4>Editing a Document</h4>
          <ol>
            <li>Click any document row in the list.</li>
            <li>Click <strong>Edit</strong> in the popup.</li>
            <li>Update the information as needed and click <strong>Save</strong>.</li>
            <li>Delete document if needed (Admin only).</li>
          </ol>

          <h4>Document List</h4>
          <ul>
            <li>Located on the bottom half of the page.</li>
            <li>Displays documents in rows with Name, Type, Status, Date, Notes, and Download link.</li>
            <li>Updates based on applied filters.</li>
            <li>Pagination shows 10 documents per page.</li>
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
            <li>Click <strong>Save</strong>.</li>
          </ol>

          <h4>Filtering FAQs</h4>
          <ul>
            <li>Search by typing keywords.</li>
            <li>Filter by category.</li>
          </ul>

          <h4>FAQ List</h4>
          <p>Displays all entries in rows showing Question, Answer, and Category.</p>
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
            <li>Enter email address and select role (Grant Writer or Admin).</li>
            <li>The user receives an invitation link to create their account.</li>
          </ul>

          <h4>2. Manage Users</h4>
          <ul>
            <li>Change user roles.</li>
            <li>Enable or disable accounts.</li>
            <li><em>Awaiting Invite</em> is shown for users who have not yet registered.</li>
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
            <li>Used on the FAQ page.</li>
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

          <h4>Security — Change Password</h4>
          <ol>
            <li>Enter your current password.</li>
            <li>Enter your new password.</li>
            <li>Confirm the new password.</li>
            <li>Click <strong>Submit</strong>.</li>
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
          page anytime for guidance on how to use all features of the application.
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

  // Accordion: only ONE section open at a time. Default to the first.
  const [openId, setOpenId] = useState(sections[0].id);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="help-page">
        <div className="help-header">
          <div className="help-header-content">
            <h2 className="help-title">HELP &amp; USER MANUAL</h2>
            <div className="help-title-underline"></div>
          </div>
        </div>

        <nav className="help-toc">
          <h3>Contents</h3>
          <ul>
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenId(s.id);
                    document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="help-sections">
          {sections.map((s) => {
            const isOpen = openId === s.id;
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
      </main>
    </div>
  );
}

export default Help;