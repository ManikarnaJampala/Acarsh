// app/webpage/leads/Leaddetails/page.tsx

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
};

type LeadDetailsProps = {
  leadId?: number | string | null;
  onBack?: () => void;
  onEdit?: () => void;
};

export default function LeadDetailsPage({
  leadId,
  onBack,
  onEdit,
}: LeadDetailsProps): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showAddOpportunity, setShowAddOpportunity] = useState(false);

  // Take ID from props first, else from URL (?leadId=...)
  const leadIdFromQuery = searchParams.get("leadId");
  const effectiveLeadId = leadId ?? leadIdFromQuery;

  const handleBack = () => {
    if (onBack) {
      // When used inside your tab-based HelloPage
      onBack();
    } else {
      // When opened directly as a route
      router.push("/webpage/leads"); // <- this is your leads page
    }
  };
  const handleEdit = () => {
    if (onEdit) {
      // When used inside your tab-based HelloPage
      onEdit();
    } else {
      // When opened directly as a route
      router.push("/webpage/leads/addleed"); // <- this is your leads page
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
        // 1) Try to fetch a single lead
        const trySingle = await fetch(
          `/api/employees/leads/${encodeURIComponent(effectiveLeadId)}`
        );
        if (trySingle.ok) {
          const data = await trySingle.json();
          if (!cancelled) setLead(data);
          return;
        }

        // 2) Fallback: fetch all leads and find matching one
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
  }, [effectiveLeadId]);

  // ---------- EARLY STATES ----------

  if (!effectiveLeadId) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={handleBack} style={backBtnStyle}>
          ← Back to Leads
        </button>
        <p style={{ marginTop: 12 }}>No lead selected.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={handleBack} style={backBtnStyle}>
          ← Back to Leads
        </button>
        <p style={{ marginTop: 12 }}>Loading lead {effectiveLeadId}…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={handleBack} style={backBtnStyle}>
          ← Back to Leads
        </button>
        <p style={{ marginTop: 12, color: "red" }}>Error: {error}</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={handleBack} style={backBtnStyle}>
          ← Back to Leads
        </button>
        <p style={{ marginTop: 12 }}>No data found for this lead.</p>
      </div>
    );
  }

  // ---------- STYLES ----------

  const container: React.CSSProperties = {
    padding: 60,
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
    background: "#efefef",
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
    alignItems: "flex-start",
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
  };

  const value: React.CSSProperties = {
    color: "#222",
  };

  const notesStyle: React.CSSProperties = {
    background: "#fff3cd",
    border: "1px solid #ffeeba",
    padding: "10px 14px",
    borderRadius: 6,
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
    fontWeight: "bold",
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
    width: 500,
    background: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  };

  const modalHeader: React.CSSProperties = {
    background: "#3a77e3",
    color: "white",
    padding: 15,
    fontSize: 18,
    fontWeight: "bold",
  };

  const modalBody: React.CSSProperties = {
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  };

  const modalFooter: React.CSSProperties = {
    padding: 20,
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  };

  const inputBox: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    borderRadius: 4,
    border: "1px solid #ccc",
    fontSize: 14,
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

  // ---------- MAIN RENDER ----------

  return (
    <div style={container}>
      <div style={headerRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={handleBack} style={backBtn}>
            ← Back
          </button>
        </div>

        <div style={topActions}>
          <button
            onClick={() => alert("Convert to Prospect")}
            style={secondaryBtn}
          >
            Convert to Prospect
          </button>

         <button onClick={handleEdit} style={primaryBtn}>
            Edit
          </button>
        </div>
      </div>

      <div style={rowStyle}>
        <div style={cardStyle}>
          <div style={sectionTitle}>Company Information</div>
          <div style={{ marginBottom: 8 }}>
            <span style={label}>Company:</span>
            <span style={value}>{lead.CompanyName}</span>
          </div>

          <div style={{ marginBottom: 8 }}>
            <span style={label}>Location:</span>
            <span style={value}>{lead.CompanyLocation}</span>
          </div>

          <div style={{ marginBottom: 8 }}>
            <span style={label}>Owner:</span>
            <span style={value}>{lead.OwnerName}</span>
          </div>

          <div style={{ marginBottom: 8 }}>
            <span style={label}>Source:</span>
            <span style={value}>
              <span style={value}>{lead.LeadSource}</span>
            </span>
          </div>

          <div style={{ marginBottom: 8 }}>
            <span style={label}>Date:</span>
            <span style={value}>
              {lead.LeadDate
                ? new Date(String(lead.LeadDate)).toLocaleDateString()
                : "—"}
            </span>
          </div>

          <div style={{ marginBottom: 8 }}>
            <span style={label}>Status:</span>
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
          <div style={sectionTitle}>Contacts</div>

          {(lead.Contacts || []).map((c, idx) => (
            <div
              key={idx}
              style={{
                padding: "10px 0",
                borderBottom:
                  idx < (lead.Contacts || []).length - 1
                    ? "1px solid #eee"
                    : "none",
              }}
            >
              <div style={{ fontWeight: 70 }}>
                <span>Name: {c.ContactName}</span>
              </div>

              {c.ContactTitle && (
                <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                  Name: {c.ContactTitle}
                </div>
              )}

              {c.ContactRoleName && (
                <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                  {c.ContactRoleName}
                </div>
              )}

              {c.ContactEmail && (
                <div style={{ marginTop: 6, color: "#3a77e3" }}>
                  {c.ContactEmail}
                </div>
              )}
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
                <td style={tdStyle}>{a.ActivityDate}</td>
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
            <div style={modalHeader}>Add Lead Activity</div>

            <div style={modalBody}>
              <label>Activity Type *</label>
              <select style={inputBox}>
                <option>Select Type</option>
                <option>Call</option>
                <option>Email</option>
                <option>Meeting</option>
                <option>Task</option>
                <option>Note</option>
                <option>Follow-up</option>
              </select>

              <label>Status *</label>
              <select style={inputBox}>
                <option>Select Status</option>
                <option>New</option>
                <option>Contacted</option>
                <option>Follow-up</option>
                <option>Qualified</option>
                <option>Unqualified</option>
                <option>Lost</option>
                <option>Converted</option>
              </select>

              <label>Notes *</label>
              <textarea style={{ ...inputBox, height: 80 }} />
            </div>

            <div style={modalFooter}>
              <button
                style={cancelBtn}
                onClick={() => setShowAddActivity(false)}
              >
                Cancel
              </button>
              <button style={saveBtn}>Save Activity</button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- ADD REMINDER MODAL -------------------- */}
      {showAddReminder && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={modalHeader}>Add Lead Reminder</div>

            <div style={modalBody}>
              <label>Reminder Date *</label>
              <input type="date" style={inputBox} />

              <label>Reminder Notes *</label>
              <textarea style={{ ...inputBox, height: 80 }} />

              <label>Status</label>
              <select style={inputBox}>
                <option>-- Select Status --</option>
                <option>Pending</option>
                <option>Completed</option>
              </select>

              <label>Notification Channels</label>
              <select style={inputBox}>
                <option>-- Select NotificationChannel --</option>
                <option>Email</option>
                <option>SMS</option>
                <option>Email+SMS</option>
                <option>None</option>
              </select>
            </div>

            <div style={modalFooter}>
              <button
                style={cancelBtn}
                onClick={() => setShowAddReminder(false)}
              >
                Cancel
              </button>
              <button style={saveBtn}>Save Reminder</button>
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
              {/* SERVICE + STATUS */}
              <div style={{ display: "flex", gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <label>Service *</label>
                  <select style={inputBox}>
                    <option>-- Select Service --</option>
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
                    <option>-- Select Status --</option>
                    <option>Engagement Model Identified</option>
                    <option>Proposal Sent</option>
                    <option>Negotiation</option>
                    <option>Closed Won</option>
                    <option>Closed Lost</option>
                  </select>
                </div>
              </div>

              {/* PROBABILITY + ENGAGEMENT MODEL */}
              <div style={{ display: "flex", gap: 20 }}>
                {/* Probability */}
                <div style={{ flex: 1 }}>
                  <label>Probability *</label>
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
                  <label>Engagement Model *</label>
                  <select style={inputBox}>
                    <option>-- Select Engagement Model --</option>
                    <option>Competence Center (ODC)</option>
                    <option>Time & Material</option>
                    <option>Fixed Bid</option>
                    <option>Retainer</option>
                  </select>
                </div>
              </div>

              {/* TECHNOLOGY */}
              <label style={{ marginTop: 10 }}>Technology *</label>

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
