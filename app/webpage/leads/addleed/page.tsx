"use client";

import React, { useState } from "react";

type EntityType = "lead" | "prospect" | "account";

type AddLeadPageProps = {
  onBack: () => void;
  type?: EntityType; 
};

export default function AddLeadPage({ onBack, type = "lead" }: AddLeadPageProps) {
  const [form, setForm] = useState({
    CompanyName: "",
    CompanyLocation: "",
    LeadSource: "",
    LeadDate: "",
    StatusName: "New",
    AccountType: "",
    OwnerName: "",

    // Lead / Prospect / Account Details
    ExpansionAreas: "",
    Tags: "",
    Notes: "",

    // Contact
    ContactName: "",
    ContactEmail: "",
    ContactPhone: "",
    ContactTitle: "",
    ContactRoleName: "",
    ContactLocation: "",
    ContactNotes: "",

    // Quick Actions
    AddReminder: false,
  });

  // 🔹 Texts based on type
  const entityLabel: string =
    type === "prospect" ? "Prospect" : type === "account" ? "Account" : "Lead";

  const entityLabelLower = entityLabel.toLowerCase();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // NOTE: API is still /api/leads – you can later change for prospects/accounts if needed
    const res = await fetch("/api/leads", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      alert(`Failed to save ${entityLabelLower}`);
      return;
    }

    alert(`${entityLabel} added successfully!`);
  };

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Segoe UI, system-ui, sans-serif",
        width: "100%",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      {/* PAGE HEADING */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          marginTop:70
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
          {/* 🔹 Dynamic heading */}
          Add New {entityLabel}
        </h2>

        {/* BACK BUTTON */}
        <button
          onClick={onBack}
          style={{
            background: "#f56c00",
            color: "white",
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ---------------------------- COMPANY INFORMATION ---------------------------- */}
        <section style={boxWrapper}>
          <div style={boxHeader}>Company Information</div>

          <div style={sectionBody}>
            <div style={grid3}>
              <div>
                <label style={labelStyle}>
                  Company Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  name="CompanyName"
                  value={form.CompanyName}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">Select Company</option>
                  <option value="Adroitent">Adroitent</option>
                  <option value="TCS">TCS</option>
                  <option value="Infosys">Infosys</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Company Location</label>
                <input
                  type="text"
                  name="CompanyLocation"
                  placeholder="City, State"
                  style={inputStyle}
                  value={form.CompanyLocation}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label style={labelStyle}>Lead Source</label>
                <select
                  name="LeadSource"
                  value={form.LeadSource}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">Select Source</option>
                  <option value="Website">Website</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Email Campaign">Email Campaign</option>
                  <option value="Referral">Referral</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Lead Date</label>
                <input
                  type="date"
                  name="LeadDate"
                  style={inputStyle}
                  value={form.LeadDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label style={labelStyle}>Lead Status</label>
                <input
                  type="text"
                  name="StatusName"
                  value={form.StatusName}
                  readOnly
                  style={{
                    ...inputStyle,
                    background: "#e5e7eb",
                    cursor: "not-allowed",
                  }}
                />
              </div>

              <div>
                <label style={labelStyle}>Account Type</label>
                <input
                  type="text"
                  name="AccountType"
                  style={inputStyle}
                  value={form.AccountType}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Lead Owner <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  name="OwnerName"
                  value={form.OwnerName}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">Select Lead Owner</option>
                  <option value="Ramesh">Ramesh</option>
                  <option value="Suresh">Suresh</option>
                  <option value="Anitha">Anitha</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------- LEAD / PROSPECT / ACCOUNT DETAILS ---------------------------- */}
        <section style={boxWrapper}>
          {/* 🔹 Dynamic section title */}
          <div style={boxHeader}>{entityLabel} Details</div>

          <div style={sectionBody}>
            <div style={grid3}>
              <div>
                <label style={labelStyle}>Expansion Areas</label>
                <textarea
                  name="ExpansionAreas"
                  placeholder="Areas of interest or expansion (e.g., Cloud Migration, Digital Transformation)"
                  style={textareaStyle}
                  value={form.ExpansionAreas}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label style={labelStyle}>Tags</label>
                <input
                  type="text"
                  name="Tags"
                  placeholder="Enter tags separated by commas"
                  style={inputStyle}
                  value={form.Tags}
                  onChange={handleChange}
                />
                <p
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginTop: 4,
                  }}
                >
                  Separate multiple tags with commas
                </p>
              </div>

              <div>
                <label style={labelStyle}>Notes</label>
                <textarea
                  name="Notes"
                  placeholder={`Additional notes about this ${entityLabelLower}...`}
                  style={textareaStyle}
                  value={form.Notes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------- CONTACT ---------------------------- */}
        <section style={boxWrapper}>
          <div style={boxHeader}>Contact</div>

          <div style={sectionBody}>
            <div style={grid3}>
              <div>
                <label style={labelStyle}>
                  Contact Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  name="ContactName"
                  placeholder="Full name"
                  style={inputStyle}
                  value={form.ContactName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label style={labelStyle}>Contact Title</label>
                <input
                  type="text"
                  name="ContactTitle"
                  placeholder="Job title (e.g., CEO, IT Manager)"
                  style={inputStyle}
                  value={form.ContactTitle}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Role <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  name="ContactRoleName"
                  style={inputStyle}
                  value={form.ContactRoleName}
                  onChange={handleChange}
                >
                  <option value="">Select role...</option>
                  <option value="Decision Maker">Decision Maker</option>
                  <option value="Technical Lead">Technical Lead</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Email <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="email"
                  name="ContactEmail"
                  placeholder="email@company.com"
                  style={inputStyle}
                  value={form.ContactEmail}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  type="text"
                  name="ContactPhone"
                  placeholder="+91 98765 43210"
                  style={inputStyle}
                  value={form.ContactPhone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label style={labelStyle}>Contact Location</label>
                <input
                  type="text"
                  name="ContactLocation"
                  placeholder="City, State"
                  style={inputStyle}
                  value={form.ContactLocation}
                  onChange={handleChange}
                />
              </div>

              <div style={{ gridColumn: "1 / span 3" }}>
                <label style={labelStyle}>Contact Notes</label>
                <textarea
                  name="ContactNotes"
                  placeholder="Additional notes about this contact..."
                  style={{ ...textareaStyle, height: 90 }}
                  value={form.ContactNotes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------- QUICK ACTIONS ---------------------------- */}
        <section style={boxWrapper}>
          <div style={boxHeader}>Quick Actions</div>

          <div style={{ padding: 20 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
              }}
            >
              <input
                type="checkbox"
                name="AddReminder"
                checked={form.AddReminder}
                onChange={handleChange}
              />
              Add Reminder
            </label>
          </div>
        </section>

        {/* ---------------------------- BUTTONS ---------------------------- */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <button type="button" style={btnSecondary} onClick={onBack}>
            Cancel
          </button>

          {/* 🔹 Dynamic submit text */}
          <button type="submit" style={btnPrimary}>
            Create {entityLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------------------- STYLES ---------------------------- */

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "#374151",
};

const sectionBody: React.CSSProperties = {
  padding: 20,
  overflowY: "auto",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  marginTop: 4,
  fontSize: 13,
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  marginTop: 4,
  height: 80,
  fontSize: 13,
  resize: "vertical",
  boxSizing: "border-box",
};

const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 20,
};

const boxWrapper: React.CSSProperties = {
  marginTop: 20,
  background: "#ffffff",
  borderRadius: 10,
  boxShadow: "0 0 6px rgba(0,0,0,0.06)",
  padding: 0,
  border: "1px solid #e5e7eb",
};

const boxHeader: React.CSSProperties = {
  background: "#3a77e3",
  color: "#fff",
  padding: "10px 16px",
  fontWeight: 600,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  fontSize: 14,
};

const btnPrimary: React.CSSProperties = {
  background: "#3a77e3",
  color: "white",
  padding: "10px 18px",
  fontSize: 14,
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};

const btnSecondary: React.CSSProperties = {
  background: "#6b7280",
  color: "white",
  padding: "10px 18px",
  fontSize: 14,
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  fontWeight: 500,
};
