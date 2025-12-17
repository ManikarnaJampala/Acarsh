"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Contact = {
  ContactName?: string;
  ContactEmail?: string;
  ContactTitle?: string;
  ContactRoleName?: string;
};
type Activity = {
  ActivityDate: string;
  Mode: string;
  Notes?: string;
  Status?: string;
};

type Reminder = {
  ReminderDate: string;
  Notes?: string;
  Status?: string;
  Notification?: string;
};

type Opportunity = {
  CreatedDate: string;
  Service: string;
  Probability: string;
  Status: string;
  EngagementModel: string;
};

type Lead = {
  LeadId?: number | string;
  CompanyName?: string;
  CompanyLocation?: string;
  OwnerName?: string;
  StatusName?: string;
  LeadNotes?: string | null;
  LeadDate?: string | number | Date;
  LeadSource?: string;
  Contacts?: Contact[];
  Activities?: Activity[];
  Reminders?: Reminder[];
  Opportunities?: Opportunity[];
  AccountTypeId?: number;
  AccountTypeName?: string;
};

// NEW: origin type & prop
type OriginType = "leads" | "Prospect" | "Account" | "MasterAccount";

type LeadDetailsProps = {
  leadId?: number | string | null;
  onBack?: () => void;
  onEdit?: (leadId?: number | string | null) => void;
  origin?: OriginType; // <-- added
};

export default function LeadDetailsPage({
  leadId,
  onBack,
  onEdit,
  origin = "leads",
}: LeadDetailsProps): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const originFromQuery = searchParams.get("origin") as OriginType | null;
  const finalOrigin = originFromQuery ?? origin;
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showAddOpportunity, setShowAddOpportunity] = useState(false);
  // ---------------- FORM STATES ----------------

  const [activityForm, setActivityForm] = useState({
    ActivityDate: "",
    Mode: "",
    Notes: "",
    Status: "",
  });

  const [reminderForm, setReminderForm] = useState({
    ReminderDate: "",
    Notes: "",
    Status: "Pending",
    Notification: "",
  });

  const [opportunityForm, setOpportunityForm] = useState({
    Service: "",
    Probability: "",
    Status: "",
    EngagementModel: "",
  });
  const handleSaveActivity = async () => {
    if (!activityForm.Mode || !activityForm.Status || !activityForm.Notes) {
      alert("Please fill all required fields");
      return;
    }

    // ✅ ALWAYS derive LeadId safely
    const leadId =
      lead?.LeadId ??
      (effectiveLeadId && !isNaN(Number(effectiveLeadId))
        ? Number(effectiveLeadId)
        : null);

    if (!leadId) {
      alert("Invalid Lead selected");
      console.error("LeadId missing:", {
        leadIdFromState: lead?.LeadId,
        effectiveLeadId,
      });
      return;
    }

    try {
      const res = await fetch(
        `/api/employees/leads/${leadId}/activities`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Mode: activityForm.Mode,
            Notes: activityForm.Notes,
            Status: activityForm.Status,
            ActivityDate: new Date().toISOString(),
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error("Activity save failed:", err);
        alert(err.error || "Failed to save activity");
        return;
      }

      const savedActivity = await res.json();

      setLead((prev) =>
        prev
          ? {
            ...prev,
            Activities: [...(prev.Activities || []), savedActivity],
          }
          : prev
      );

      setActivityForm({
        ActivityDate: "",
        Mode: "",
        Status: "",
        Notes: "",
      });

      setShowAddActivity(false);
    } catch (err) {
      console.error("Frontend save error:", err);
      alert("Unexpected error while saving activity");
    }
  };


  const handleSaveReminder = async () => {
    if (!reminderForm.ReminderDate || !reminderForm.Notes) {
      alert("Please fill required fields");
      return;
    }

    const res = await fetch(
      `/api/employees/leads/${effectiveLeadId}/reminders`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reminderForm),
      }
    );

    if (!res.ok) {
      alert("Failed to save reminder");
      return;
    }

    const savedReminder = await res.json();

    setLead((prev) =>
      prev
        ? {
          ...prev,
          Reminders: [...(prev.Reminders || []), savedReminder],
        }
        : prev
    );

    setShowAddReminder(false);
  };
  const handleSaveOpportunity = async () => {
    if (
      !opportunityForm.Service ||
      !opportunityForm.Status ||
      !opportunityForm.Probability ||
      !opportunityForm.EngagementModel
    ) {
      alert("Please fill all required fields");
      return;
    }

    const res = await fetch(
      `/api/employees/leads/${effectiveLeadId}/opportunities`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opportunityForm),
      }
    );

    if (!res.ok) {
      alert("Failed to save opportunity");
      return;
    }

    const saved = await res.json();

    setLead((prev) =>
      prev
        ? {
          ...prev,
          Opportunities: [...(prev.Opportunities || []), saved],
        }
        : prev
    );

    setShowAddOpportunity(false);
  };


  const leadIdFromQuery = searchParams.get("leadId");

  const effectiveLeadId =
    lead?.LeadId ??
    (leadId ??
      (leadIdFromQuery && !isNaN(Number(leadIdFromQuery))
        ? Number(leadIdFromQuery)
        : null));

  // NEW: helpers to pick label / back text
  const getConvertLabel = () => {
    if (!lead?.AccountTypeName) return "Convert";

    if (lead.AccountTypeName === "Lead") return "Convert to Prospect";
    if (lead.AccountTypeName === "Prospect") return "Convert to Account";
    if (lead.AccountTypeName === "Account") return "Convert to Master Account";

    return "Already a Master Account";
  };

  const getTargetType = () => {
    if (!lead?.AccountTypeName) return "";

    if (lead.AccountTypeName === "Lead") return "Prospect";
    if (lead.AccountTypeName === "Prospect") return "Account";
    if (lead.AccountTypeName === "Account") return "MasterAccount";

    return "";
  };


  const getBackLabel = () => {
    if (origin === "leads") return "← Back to Leads";
    if (origin === "Prospect") return "← Back to Prospects";
    if (origin === "Account") return "← Back to Accounts";
    return "← Back";
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    } else {

      if (origin === "Prospect") {
        router.push("/webpage?tab=prospect");
      } else if (origin === "Account") {
        router.push("/webpage?tab=account");
      } else {
        router.push("/webpage?tab=leads");
      }
    }
  };
  const handleEdit = () => {
    if (onEdit) {
      onEdit(lead?.LeadId ?? effectiveLeadId ?? null);
      return;
    } else {
      const id = encodeURIComponent(String(effectiveLeadId));
      const typeParam = origin ? `&type=${encodeURIComponent(origin)}` : "";
      router.push(`/webpage/leads/Editlead?leadId=${id}${typeParam}`);
    }
  };

  const handleConvert = async () => {
    if (!lead?.LeadId) {
      alert("Lead ID not found");
      return;
    }

    const targetType = getTargetType();
    if (!targetType) {
      alert("No further conversion possible");
      return;
    }

    try {
      const res = await fetch("/api/employees/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "convert",
          leadId: lead.LeadId,
          targetType,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Conversion failed");
      }

      alert(`${getConvertLabel()} successful`);

      // ✅ Redirect based on NEXT LEVEL
      if (targetType === "Prospect") {
        router.push("/webpage?tab=prospect");
      } else if (targetType === "Account") {
        router.push("/webpage?tab=account");
      } else if (targetType === "MasterAccount") {
        router.push("/webpage?tab=masteraccount");
      }

    } catch (error: any) {
      console.error("Convert error:", error);
      alert(error.message || "Failed to convert");
    }
  };


  useEffect(() => {
    if (!effectiveLeadId) {
      setLead(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const trySingle = await fetch(
          `/api/employees/leads/${Number(effectiveLeadId)}`
        );
        if (trySingle.ok) {
          const data = await trySingle.json();
          if (!cancelled) setLead(data);
          return;
        }
        const res = await fetch("/api/employees/leads");
        if (!res.ok) {
          throw new Error(`Failed to fetch employees (${res.status})`);
        }

        const all = await res.json();

        const array = Array.isArray(all)
          ? all
          : all?.data && Array.isArray(all.data)
            ? all.data
            : [];

        const found = array.find(
          (x: any) => String(x.LeadId) === String(effectiveLeadId)
        );

        if (!cancelled) {
          if (found) {
            setLead(found);
          } else {
            setError("Lead not found");
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to load lead");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [effectiveLeadId, origin]);

  //  EARLY STATES 

  if (!effectiveLeadId) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={handleBack} style={backBtnStyle}>
          {getBackLabel()}
        </button>
        <p style={{ marginTop: 12 }}>No lead selected.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={handleBack} style={backBtnStyle}>
          {getBackLabel()}
        </button>
        <p style={{ marginTop: 12, color: "red" }}>Error: {error}</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={handleBack} style={backBtnStyle}>
          {getBackLabel()}
        </button>
      </div>
    );
  }

  // STYLES 

  const container: React.CSSProperties = {
    padding: 15,
    maxWidth: 1100,
    margin: "0 auto",
    fontFamily:
      "'Segoe UI', Roboto, system-ui, -apple-system, 'Helvetica Neue', Arial",
  };

  const headerRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  };

  const topActions: React.CSSProperties = {
    display: "flex",
    gap: 8,
    alignItems: "center",
  };

  const backBtn: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 6,
    border: "none",
    background: "#3a77e3",
    cursor: "pointer",
  };

  const primaryBtn: React.CSSProperties = {
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    background: "#3a77e3",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  };

  const secondaryBtn: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #3a77e3",
    background: "#fff",
    color: "#3a77e3",
    cursor: "pointer",
    fontWeight: 600,
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    gap: 20,
    marginBottom: 16,
    alignItems: "stretch",
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 8,
    padding: 18,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    flex: 1,
    border: "1px solid #e6e6e6",
  };

  const rightCardStyle: React.CSSProperties = {
    ...cardStyle,
    maxWidth: 380,
  };
  const contactCardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 8,
    padding: "12px 14px",
    border: "1px solid #eef1f4",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    marginBottom: 12,
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    borderLeft: "4px solid #1e90ff",
  };

  const contactAccentStyle: React.CSSProperties = {
    paddingLeft: 10,
  };

  const contactRowLabel: React.CSSProperties = {
    fontWeight: 700,
    minWidth: 60,
    fontSize: 13,
    color: "#111",
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 10,
    color: "#333",
  };

  const label: React.CSSProperties = {
    fontWeight: 700,
    color: "#444",
    width: 120,
    display: "inline-block",
    fontSize: 13,
  };

  const value: React.CSSProperties = {
    color: "#222",
  };

  const notesStyle: React.CSSProperties = {
    background: "#fff3cd",
    border: "1px solid #ffeeba",
    borderLeft: "6px solid #f1c040",
    padding: "10px 14px 10px 16px",
    borderRadius: 8,
    color: "#856404",
    marginBottom: 16,
  };

  const thStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "8px 12px",
    border: "1px solid rgba(148,148,148,0.4)",
    backgroundColor: "#252b36",
    color: "#ffffff",
    position: "sticky",
    top: 0,
    zIndex: 1,
    fontWeight: 600,
    fontSize: 12,
    textTransform: "uppercase",
  };

  const tdStyle: React.CSSProperties = {
    padding: "10px 12px",
    fontSize: 14,
    borderBottom: "1px solid #e9ecef",
    verticalAlign: "middle",
  };

  const tableWrap: React.CSSProperties = {
    background: "#fff",
    borderRadius: 8,
    padding: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    border: "1px solid #e6e6e6",
    marginBottom: 16,
  };

  const fabStyle: React.CSSProperties = {
    position: "fixed",
    right: 28,
    bottom: 28,
    width: 56,
    height: 56,
    background: "#3a77e3",
    borderRadius: "50%",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 28,
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
  };
  const addBtn = {
    backgroundColor: "#3a77e3",
    color: "white",
    width: 20,
    height: 20,
    borderRadius: 4,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    marginLeft: 6,
    cursor: "pointer",
    fontWeight: "semobold",
    border: "none",
    lineHeight: 0,
  };

  const modalOverlay: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  };

  const modalBox: React.CSSProperties = {
    width: 450,
    background: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  };

  const modalHeader: React.CSSProperties = {
    background: "#3a77e3",
    color: "white",
    padding: 15,
    fontSize: 15,
    fontWeight: "bold",
  };

  const modalBody: React.CSSProperties = {
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontSize: 13
  };

  const modalFooter: React.CSSProperties = {
    padding: 10,
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  };

  const inputBox: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    borderRadius: 4,
    border: "1px solid #ccc",
    fontSize: 12,
  };

  const cancelBtn: React.CSSProperties = {
    padding: "8px 15px",
    background: "#d1d1d1",
    borderRadius: 4,
    border: "none",
    cursor: "pointer",
  };

  const saveBtn: React.CSSProperties = {
    padding: "8px 15px",
    background: "#3a77e3",
    color: "#fff",
    borderRadius: 4,
    border: "none",
    cursor: "pointer",
  };

  // MAIN RENDER 

  return (
    <div style={container}>
      <button onClick={handleBack} style={backBtn}>
        Back
      </button>
      <div style={headerRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <p style={{ color: "grey", fontWeight: 700, fontSize: 20 }}>
            Lead Details
          </p>
        </div>

        <div style={topActions}>
          <button
            onClick={handleConvert}
            style={secondaryBtn}
            disabled={lead.AccountTypeName === "MasterAccount"}
          >
            {lead.AccountTypeName === "MasterAccount"
              ? "Already a Master Account"
              : getConvertLabel()}
          </button>



          <button onClick={handleEdit} style={primaryBtn}>
            Edit
          </button>
        </div>
      </div>

      <div style={rowStyle}>
        <div style={cardStyle}>
          <div style={{ ...sectionTitle, borderBottom: "1px solid #e6e6e6", paddingBottom: 8 }}>Company Information</div>
          <div style={{ marginBottom: 8 }}>
            <span style={contactRowLabel}>Company: </span>
            <span style={value}>{lead.CompanyName}</span>
          </div>

          <div style={{ marginBottom: 8 }}>
            <span style={contactRowLabel}>Location: </span>
            <span style={value}>{lead.CompanyLocation}</span>
          </div>

          <div style={{ marginBottom: 8 }}>
            <span style={contactRowLabel}>Owner: </span>
            <span style={value}>{lead.OwnerName}</span>
          </div>

          <div style={{ marginBottom: 8 }}>
            <span style={contactRowLabel}>Source: </span>
            <span style={value}>
              <span style={value}>{lead.LeadSource}</span>
            </span>
          </div>

          <div style={{ marginBottom: 8 }}>
            <span style={contactRowLabel}>Date: </span>
            <span style={value}>
              {lead.LeadDate
                ? new Date(String(lead.LeadDate)).toLocaleDateString()
                : "—"}
            </span>
          </div>

          <div style={{ marginBottom: 8 }}>
            <span style={contactRowLabel}>Status: </span>
            <span
              style={{
                padding: "2px 8px",
                background: "#e8f3ff",
                borderRadius: 12,
              }}
            >
              {lead.StatusName}
            </span>
          </div>
        </div>

        <div style={rightCardStyle}>
          <div style={{ ...sectionTitle, borderBottom: "1px solid #e6e6e6", paddingBottom: 8 }}>Contacts</div>

          {(lead.Contacts || []).map((c, idx) => (
            <div key={idx} style={contactCardStyle}>
              <div style={contactAccentStyle}>
                <div style={{ display: "flex", marginBottom: 8 }}>
                  <div style={contactRowLabel}>Name:</div>
                  <div style={{ fontSize: 13 }}>{c.ContactName || "—"}</div>
                </div>

                {c.ContactTitle && (
                  <div style={{ display: "flex", marginBottom: 6 }}>
                    <div style={contactRowLabel}>Title:</div>
                    <div style={{ fontSize: 13 }}>{c.ContactTitle}</div>
                  </div>
                )}

                {c.ContactRoleName && (
                  <div style={{ display: "flex", marginBottom: 6 }}>
                    <div style={contactRowLabel}>Role:</div>
                    <div style={{ fontSize: 13 }}>{c.ContactRoleName}</div>
                  </div>
                )}

                {c.ContactEmail && (
                  <div style={{ display: "flex" }}>
                    <div style={contactRowLabel}>Email:</div>
                    <div style={{ fontSize: 13, color: "#3a77e3" }}>
                      <a
                        href={`mailto:${c.ContactEmail}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        {c.ContactEmail}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={notesStyle}>
        <strong>Notes:</strong>{" "}
        <span style={{ marginLeft: 8 }}>{lead.LeadNotes || "—"}</span>
      </div>

      {/* Activities */}
      <div style={{ ...sectionTitle, display: "flex", alignItems: "center" }}>
        Lead Activities
        <button style={addBtn} onClick={() => setShowAddActivity(true)}>
          +
        </button>
      </div>

      <div style={tableWrap}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 200 }}>Activity Date</th>
              <th style={{ ...thStyle, width: 120 }}>Mode</th>
              <th style={{ ...thStyle }}>Notes</th>
              <th style={{ ...thStyle, width: 120 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(lead.Activities || []).map((a, i) => (
              <tr key={i}>
                <td>{a.ActivityDate}</td>
                <td style={tdStyle}>{a.Mode}</td>
                <td style={tdStyle}>{a.Notes}</td>
                <td style={tdStyle}>{a.Status}</td>
              </tr>
            ))}

            {(!lead.Activities || lead.Activities.length === 0) && (
              <tr>
                <td style={tdStyle} colSpan={4}>
                  No activities
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reminders */}
      <div style={{ ...sectionTitle, display: "flex", alignItems: "center" }}>
        Lead Reminders
        <button style={addBtn} onClick={() => setShowAddReminder(true)}>
          +
        </button>
      </div>
      <div style={tableWrap}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 180 }}>Reminder Date</th>
              <th style={{ ...thStyle }}>Notes</th>
              <th style={{ ...thStyle, width: 140 }}>Status</th>
              <th style={{ ...thStyle, width: 140 }}>Notification</th>
            </tr>
          </thead>
          <tbody>
            {(lead.Reminders || []).map((r, i) => (
              <tr key={i}>
                <td style={tdStyle}>{r.ReminderDate}</td>
                <td style={tdStyle}>{r.Notes}</td>
                <td style={tdStyle}>{r.Status}</td>
                <td style={tdStyle}>{r.Notification}</td>
              </tr>
            ))}

            {(!lead.Reminders || lead.Reminders.length === 0) && (
              <tr>
                <td style={tdStyle} colSpan={4}>
                  No reminders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Lead Opportunities */}
      <div style={{ ...sectionTitle, display: "flex", alignItems: "center" }}>
        Lead Opportunities
        <button style={addBtn} onClick={() => setShowAddOpportunity(true)}>
          +
        </button>
      </div>

      <div style={tableWrap}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 180 }}>Created Date</th>
              <th style={{ ...thStyle, width: 150 }}>Service</th>
              <th style={{ ...thStyle, width: 120 }}>Probability</th>
              <th style={{ ...thStyle, width: 200 }}>Status</th>
              <th style={{ ...thStyle, width: 200 }}>Engagement Model</th>
            </tr>
          </thead>

          <tbody>
            {(lead.Opportunities || []).map((o, i) => (
              <tr key={i}>
                <td style={tdStyle}>{o.CreatedDate}</td>
                <td style={tdStyle}>{o.Service}</td>
                <td style={tdStyle}>{o.Probability}</td>
                <td style={tdStyle}>{o.Status}</td>
                <td style={tdStyle}>{o.EngagementModel}</td>
              </tr>
            ))}

            {(!lead.Opportunities || lead.Opportunities.length === 0) && (
              <tr>
                <td colSpan={5} style={tdStyle}>
                  No opportunities
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* -------------------- ADD ACTIVITY MODAL -------------------- */}
      {showAddActivity && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            {/* Header */}
            <div style={modalHeader}>Add Lead Activity</div>

            {/* Body */}
            <div style={modalBody}>
              <label>Activity Type*</label>
              <select
                style={inputBox}
                value={activityForm.Mode}
                onChange={(e) =>
                  setActivityForm({ ...activityForm, Mode: e.target.value })
                }
              >
                <option value="">-- Select Type --</option>
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="Meeting">Meeting</option>
                <option value="Task">Task</option>
                <option value="Note">Note</option>
                <option value="Follow-up">Follow-up</option>
              </select>

              <label>Status*</label>
              <select
                style={inputBox}
                value={activityForm.Status}
                onChange={(e) =>
                  setActivityForm({ ...activityForm, Status: e.target.value })
                }
              >
                <option value="">-- Select Status --</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Qualified">Qualified</option>
                <option value="Unqualified">Unqualified</option>
                <option value="Lost">Lost</option>
                <option value="Converted">Converted</option>
              </select>

              <label>Notes*</label>
              <textarea
                style={{ ...inputBox, height: 60, width: 388 }}
                value={activityForm.Notes}
                onChange={(e) =>
                  setActivityForm({ ...activityForm, Notes: e.target.value })
                }
              />
            </div>

            {/* Footer */}
            <div style={modalFooter}>
              <button
                style={cancelBtn}
                onClick={() => {
                  setShowAddActivity(false);
                  setActivityForm({
                    ActivityDate: "",
                    Mode: "",
                    Status: "",
                    Notes: "",
                  });
                }}
              >
                Cancel
              </button>

              <button style={saveBtn} onClick={handleSaveActivity}>
                Save Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- ADD REMINDER MODAL -------------------- */}
      {showAddReminder && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            {/* Header */}
            <div style={modalHeader}>Add Lead Reminder</div>

            {/* Body */}
            <div style={modalBody}>
              <label>Reminder Date*</label>
              <input
                type="date"
                style={{ ...inputBox, width: 388 }}
                value={reminderForm.ReminderDate}
                onChange={(e) =>
                  setReminderForm({
                    ...reminderForm,
                    ReminderDate: e.target.value,
                  })
                }
              />

              <label>Reminder Notes*</label>
              <textarea
                style={{ ...inputBox, height: 80, width: 388 }}
                value={reminderForm.Notes}
                onChange={(e) =>
                  setReminderForm({
                    ...reminderForm,
                    Notes: e.target.value,
                  })
                }
              />

              <label>Status*</label>
              <select
                style={inputBox}
                value={reminderForm.Status}
                onChange={(e) =>
                  setReminderForm({
                    ...reminderForm,
                    Status: e.target.value,
                  })
                }
              >
                <option value="">-- Select Status --</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>

              <label>Notification Channels*</label>
              <select
                style={inputBox}
                value={reminderForm.Notification}
                onChange={(e) =>
                  setReminderForm({
                    ...reminderForm,
                    Notification: e.target.value,
                  })
                }
              >
                <option value="">-- Select Notification Channel --</option>
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
                <option value="Email+SMS">Email + SMS</option>
                <option value="None">None</option>
              </select>
            </div>

            {/* Footer */}
            <div style={modalFooter}>
              <button
                style={cancelBtn}
                onClick={() => {
                  setShowAddReminder(false);
                  setReminderForm({
                    ReminderDate: "",
                    Notes: "",
                    Status: "",
                    Notification: "",
                  });
                }}
              >
                Cancel
              </button>

              <button style={saveBtn} onClick={handleSaveReminder}>
                Save Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- ADD OPPORTUNITY MODAL -------------------- */}
      {showAddOpportunity && (
        <div style={modalOverlay}>
          <div style={{ ...modalBox, width: "85%", maxWidth: 1100 }}>
            <div
              style={{
                ...modalHeader,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Add Lead Opportunity</span>
              <span
                style={{ cursor: "pointer", fontSize: 22 }}
                onClick={() => setShowAddOpportunity(false)}
              >
                ✕
              </span>
            </div>

            <div style={modalBody}>
              <div style={{ display: "flex", gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <label>Service *</label>
                  <select style={inputBox}>
                    <option>- - Select Service - -</option>
                    <option>AI</option>
                    <option>Cloud</option>
                    <option>Data Engineering</option>
                    <option>DevOps</option>
                    <option>Staff Augmentation</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label>Status *</label>
                  <select style={inputBox}>
                    <option>- - Select Status - -</option>
                    <option>Engagement Model Identified</option>
                    <option>Proposal Sent</option>
                    <option>Negotiation</option>
                    <option>Closed Won</option>
                    <option>Closed Lost</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <label>Probability*</label>
                  <div
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: 6,
                      padding: 12,
                      marginTop: 6,
                    }}
                  >
                    <div>
                      <input type="radio" name="prob" /> &nbsp; &lt;25%
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <input type="radio" name="prob" /> &nbsp; 50%
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <input type="radio" name="prob" /> &nbsp; 75%
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <input type="radio" name="prob" /> &nbsp; 90%
                    </div>
                  </div>
                </div>

                {/* Engagement Model */}
                <div style={{ flex: 1 }}>
                  <label>Engagement Model*</label>
                  <select style={inputBox}>
                    <option>- - Select Engagement Model - -</option>
                    <option>Competence Center (ODC)</option>
                    <option>Time & Material</option>
                    <option>Fixed Bid</option>
                    <option>Retainer</option>
                  </select>
                </div>
              </div>

              {/* TECHNOLOGY */}
              <label style={{ marginTop: 10 }}>Technology*</label>

              <div
                style={{
                  border: "1px solid #ccc",
                  padding: 20,
                  borderRadius: 6,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  {/* DEVELOPMENT STACK */}
                  <div>
                    <b>Development Stack</b>
                    <div>
                      <input type="checkbox" /> &nbsp; LAMP
                    </div>
                    <div>
                      <input type="checkbox" /> &nbsp; MEAN
                    </div>
                    <div>
                      <input type="checkbox" /> &nbsp; MERN
                    </div>
                    <div>
                      <input type="checkbox" /> &nbsp; Java Spring
                    </div>
                    <div>
                      <input type="checkbox" /> &nbsp; .NET Stack
                    </div>
                    <div>
                      <input type="checkbox" /> &nbsp; Other
                    </div>
                  </div>

                  {/* CLOUD PLATFORMS */}
                  <div>
                    <b>Cloud Computing Platforms</b>
                    <div>
                      <input type="checkbox" /> &nbsp; AWS
                    </div>
                    <div>
                      <input type="checkbox" /> &nbsp; Azure
                    </div>
                    <div>
                      <input type="checkbox" /> &nbsp; Google Cloud Platform
                    </div>
                    <div>
                      <input type="checkbox" /> &nbsp; IBM Cloud
                    </div>
                    <div>
                      <input type="checkbox" /> &nbsp; Oracle Cloud
                      Infrastructure
                    </div>
                  </div>

                  {/* DATABASE TECHNOLOGIES */}
                  <div>
                    <b>Database Technologies</b>
                    <div>
                      <input type="checkbox" /> &nbsp; Oracle Database
                    </div>
                    <div>
                      <input type="checkbox" /> &nbsp; SQL Server
                    </div>
                    <div>
                      <input type="checkbox" /> &nbsp; MySQL
                    </div>
                    <div>
                      <input type="checkbox" /> &nbsp; PostgreSQL
                    </div>
                    <div>
                      <input type="checkbox" /> &nbsp; MongoDB
                    </div>
                    <div>
                      <input type="checkbox" /> &nbsp; Cassandra
                    </div>
                    <div>
                      <input type="checkbox" /> &nbsp; Snowflake
                    </div>
                    <div>
                      <input type="checkbox" /> &nbsp; Amazon Redshift
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div style={modalFooter}>
              <button
                style={cancelBtn}
                onClick={() => setShowAddOpportunity(false)}
              >
                Cancel
              </button>
              <button style={saveBtn}>Save Opportunity</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// shared style used in early return above
const backBtnStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "none",
  background: "#efefef",
  cursor: "pointer",
};