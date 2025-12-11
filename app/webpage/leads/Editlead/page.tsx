"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type EditLeadProps = {
  leadId?: string | number | null;
  origin?: "leads" | "Prospect" | "Account" | null;
  onBack?: () => void;
};

export default function EditLeadPage({
  leadId: propLeadId,
  origin,
  onBack,
}: EditLeadProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // prefer prop leadId, fallback to query param
  const queryLeadId =
    typeof searchParams?.get === "function" ? searchParams.get("leadId") : null;
  const effectiveLeadId = propLeadId ?? queryLeadId ?? null;

  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<any>({
    CompanyName: "",
    CompanyLocation: "",
    LeadSource: "",
    LeadDate: "",
    OwnerName: "",
    StatusName: "New",
    Contacts: [
      {
        ContactName: "",
        ContactEmail: "",
        ContactTitle: "",
        ContactRoleName: "",
        ContactPhone: "",
      },
    ],
    LeadNotes: "",
    ExpansionAreas: "",
    Tags: "",
  });

  // ---------------- FETCH EXISTING LEAD ----------------
  useEffect(() => {
    if (!effectiveLeadId) {
      setLoading(false);
      return;
    }

    const fetchLead = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/employees/leads/${encodeURIComponent(String(effectiveLeadId))}`
        );
        if (!res.ok) {
          console.error("Failed to fetch lead", res.status);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setLead((prev: any) => ({
          ...prev,
          ...data,
          Contacts: data.Contacts?.length ? data.Contacts : prev.Contacts,
        }));
      } catch (err) {
        console.error("Error loading lead", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveLeadId]);

  // ---------------- INPUT HANDLERS ----------------
  const updateField = (field: string, value: any) => {
    setLead((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateContact = (index: number, field: string, value: any) => {
    const updated = Array.isArray(lead.Contacts) ? [...lead.Contacts] : [];
    updated[index] = { ...updated[index], [field]: value };
    setLead((prev: any) => ({ ...prev, Contacts: updated }));
  };

  const addContact = () => {
    setLead((prev: any) => ({
      ...prev,
      Contacts: [
        ...(prev.Contacts || []),
        {
          ContactName: "",
          ContactEmail: "",
          ContactTitle: "",
          ContactRoleName: "",
          ContactPhone: "",
        },
      ],
    }));
  };

  const removeContact = (i: number) => {
    const updated = Array.isArray(lead.Contacts) ? [...lead.Contacts] : [];
    updated.splice(i, 1);
    setLead((prev: any) => ({ ...prev, Contacts: updated }));
  };

  // ---------------- SAVE CHANGES ----------------
  const saveChanges = async () => {
    try {
      if (!effectiveLeadId) {
        alert("No Lead ID provided");
        return;
      }
      const res = await fetch(
        `/api/employees/leads/${encodeURIComponent(String(effectiveLeadId))}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lead),
        }
      );

      if (res.ok) {
        alert("Lead updated successfully!");
        if (onBack) onBack();
        else router.push(`/webpage?tab=leads`);
      } else {
        alert("Failed to save changes");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving lead");
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading…</p>;

  // ---------------- STYLES ----------------
  const cardStyle: React.CSSProperties = {
    background: "#fff",
    padding: 25,
    borderRadius: 12,
    marginBottom: 25,
    border: "1px solid #e6e6e6",
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 600,
    marginBottom: 6,
    display: "block",
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    gap: 25,
    marginBottom: 18,
  };

 
  return (
    <div style={{ padding: 35, maxWidth: 1100, margin: "auto" }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>
        Edit Lead - {lead.CompanyName}
      </h2>
      <hr style={{ marginBottom: 20 }} />

      {/* ================= COMPANY INFORMATION ================= */}
      <section style={cardStyle}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 25 }}>
          Company Information
        </h3>

        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Company Name</label>
            <input
              className="form-control"
              value={lead.CompanyName}
              onChange={(e) => updateField("CompanyName", e.target.value)}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Location</label>
            <input
              className="form-control"
              value={lead.CompanyLocation}
              onChange={(e) => updateField("CompanyLocation", e.target.value)}
            />
          </div>
        </div>

        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Lead Source</label>
            <input
              className="form-control"
              value={lead.LeadSource}
              onChange={(e) => updateField("LeadSource", e.target.value)}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Lead Date</label>
            <input
              type="date"
              className="form-control"
              value={
                lead.LeadDate
                  ? String(lead.LeadDate).substring(0, 10)
                  : ""
              }
              onChange={(e) => updateField("LeadDate", e.target.value)}
            />
          </div>
        </div>

        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Owner</label>
            <input
              className="form-control"
              value={lead.OwnerName}
              onChange={(e) => updateField("OwnerName", e.target.value)}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Status</label>
            <select
              className="form-control"
              value={lead.StatusName}
              onChange={(e) => updateField("StatusName", e.target.value)}
            >
              <option>New</option>
              <option>Contacted</option>
              <option>Qualified</option>
              <option>Proposal Sent</option>
            </select>
          </div>
        </div>
      </section>

      {/* ================= CONTACT INFORMATION ================= */}
      <section style={cardStyle}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 25 }}>
          Contact Information
        </h3>

        {(lead.Contacts || []).map((c: any, i: number) => (
          <div
            key={i}
            style={{
              border: "1px solid #dcdcdc",
              padding: 18,
              borderRadius: 10,
              marginBottom: 25,
              background: "#fafafa",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong style={{ fontSize: 15 }}>Contact {i + 1}</strong>
              {(lead.Contacts || []).length > 1 && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeContact(i)}
                >
                  Remove
                </button>
              )}
            </div>

            <div style={rowStyle}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Name</label>
                <input
                  className="form-control"
                  value={c.ContactName}
                  onChange={(e) =>
                    updateContact(i, "ContactName", e.target.value)
                  }
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Title</label>
                <input
                  className="form-control"
                  value={c.ContactTitle}
                  onChange={(e) =>
                    updateContact(i, "ContactTitle", e.target.value)
                  }
                />
              </div>
            </div>

            <div style={rowStyle}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Email</label>
                <input
                  className="form-control"
                  value={c.ContactEmail}
                  onChange={(e) =>
                    updateContact(i, "ContactEmail", e.target.value)
                  }
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Phone</label>
                <input
                  className="form-control"
                  value={c.ContactPhone}
                  onChange={(e) =>
                    updateContact(i, "ContactPhone", e.target.value)
                  }
                />
              </div>
            </div>

            <div style={{ width: "50%" }}>
              <label style={labelStyle}>Role</label>
              <select
                className="form-control"
                value={c.ContactRoleName}
                onChange={(e) =>
                  updateContact(i, "ContactRoleName", e.target.value)
                }
              >
                <option>Decision Maker</option>
                <option>Influencer</option>
                <option>Technical</option>
                <option>Finance</option>
              </select>
            </div>
          </div>
        ))}

        <button className="btn btn-success" onClick={addContact}>
          + Add Another Contact
        </button>
      </section>

      {/* ================= ADDITIONAL INFORMATION ================= */}
      <section style={cardStyle}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 25 }}>
          Additional Information
        </h3>

        <label style={labelStyle}>Notes</label>
        <textarea
          className="form-control"
          style={{ height: 80, marginBottom: 20 }}
          value={lead.LeadNotes}
          onChange={(e) => updateField("LeadNotes", e.target.value)}
        />

        <label style={labelStyle}>Expansion Areas</label>
        <input
          className="form-control"
          style={{ marginBottom: 20 }}
          value={lead.ExpansionAreas}
          onChange={(e) => updateField("ExpansionAreas", e.target.value)}
        />

        <label style={labelStyle}>Tags</label>
        <input
          className="form-control"
          value={lead.Tags}
          onChange={(e) => updateField("Tags", e.target.value)}
        />
      </section>

      {/* ================= BUTTONS ================= */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button
          className="btn btn-secondary"
          onClick={() => (onBack ? onBack() : router.back())}
        >
          Cancel
        </button>

        <button className="btn btn-primary" onClick={saveChanges}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
