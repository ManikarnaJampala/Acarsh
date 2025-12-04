// app/webpage/leads/Leaddetails/page.tsx

"use client";

import React, { useEffect, useState } from "react";

import { useSearchParams, useRouter } from "next/navigation";

type Contact = {
  ContactName?: string;
  ContactEmail?: string;
  Title?: string;
  Role?: string;
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

type Lead = {
  LeadId?: number | string;

  CompanyName?: string;

  CompanyLocation?: string;

  OwnerName?: string;

  StatusName?: string;

  LeadNotes?: string | null;

  LeadDate?: string | number | Date;

  Contacts?: Contact[];

  Activities?: Activity[];

  Reminders?: Reminder[];
};

export default function LeadDetailsPage(): JSX.Element {
  const searchParams = useSearchParams();

  const router = useRouter();

  const leadId = searchParams?.get("leadId");

  const [lead, setLead] = useState<Lead | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leadId) return;

    let cancelled = false;

    setLoading(true);

    setError(null);

    (async () => {
      try {
        // 1) Try to fetch single lead by ID

        const trySingle = await fetch(
          `/api/employees/${encodeURIComponent(leadId)}`
        );

        if (trySingle.ok) {
          const data = await trySingle.json();

          if (!cancelled) setLead(data);

          return;
        }

        // 2) Fallback: fetch all leads and find matching one

        const res = await fetch("/api/employees");

        if (!res.ok)
          throw new Error(`Failed to fetch employees (${res.status})`);

        const all = await res.json();

        // Normalize array

        const array = Array.isArray(all)
          ? all
          : all?.data && Array.isArray(all.data)
          ? all.data
          : [];

        const found = array.find(
          (x: any) => String(x.LeadId) === String(leadId)
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
  }, [leadId]);

  const container: React.CSSProperties = {
    padding: 20,

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

    background: "#0952d3",

    color: "#fff",

    cursor: "pointer",

    fontWeight: 600,
  };

  const secondaryBtn: React.CSSProperties = {
    padding: "8px 12px",

    borderRadius: 6,

    border: "1px solid #0952d3",

    background: "#fff",

    color: "#0952d3",

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

    background: "#007bff",

    borderRadius: "50%",

    color: "#fff",

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    fontSize: 28,

    cursor: "pointer",

    boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
  };

  return (
    <div style={container}>
      <div style={headerRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.back()} style={backBtn}>
            ← Back
          </button>
        </div>

        <div style={topActions}>
          <button onClick={() => router.back()} style={secondaryBtn}>
            Convert to Prospect
          </button>

          <button style={primaryBtn} onClick={() => alert("Edit action")}>
            Edit
          </button>
        </div>
      </div>

      {!leadId && (
        <div style={{ color: "#b00" }}>
          No lead selected. Please open this page from the leads table.
        </div>
      )}

      {leadId && loading && <div>Loading lead {leadId} …</div>}

      {leadId && error && <div style={{ color: "red" }}>Error: {error}</div>}

      {leadId && !loading && lead && (
        <>
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
                  AIM - MachineConn Goa Summit 21-23 June 2025
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
                  <div style={{ fontWeight: 700 }}>{c.ContactName}</div>

                  {c.Title && (
                    <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                      {c.Title}
                    </div>
                  )}

                  {c.Role && (
                    <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                      {c.Role}
                    </div>
                  )}

                  {c.ContactEmail && (
                    <div style={{ marginTop: 6, color: "#0952d3" }}>
                      {c.ContactEmail}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={notesStyle}>
            <strong>Notes:</strong>{" "}
            <span style={{ marginLeft: 8 }}>{lead.LeadNotes}</span>
          </div>

          {/* Activities */}

          <div style={sectionTitle}>Lead Activities</div>

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

          <div style={sectionTitle}>Lead Reminders</div>

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
        </>
      )}

      <div
        title="Add"
        style={fabStyle}
        onClick={() => alert("Add new activity / reminder")}
      >
        +
      </div>
    </div>
  );
}
