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
  Technology?: string[];
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
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any | null>(null);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [currentOpportunityId, setCurrentOpportunityId] = useState<number | null>(null);
  // removed unused `showModal` state (was causing modal-close bugs)



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

  const resetOpportunityForm = () => {
    setOpportunityForm({
      serviceId: "",
      probabilityId: "",
      statusId: "",
      engagementId: "",
      technologies: [],
    });
  };


  const [opportunityForm, setOpportunityForm] = useState({
    serviceId: "" as number | "",
    statusId: "" as number | "",
    probabilityId: "" as number | "",
    engagementId: "" as number | "",
    technologies: [] as number[],
  });


  // helper to toggle technology ids
  const toggleTechnology = (tech: number) => {
    setOpportunityForm((prev) => ({
      ...prev,
      technologies: prev.technologies.includes(tech)
        ? prev.technologies.filter((t) => t !== tech)
        : [...prev.technologies, tech],
    }));
  };

  const handleAddOpportunityClick = async () => {
    // ensure we have the effective lead id
    const id = effectiveLeadId ?? leadId;
    if (!id) {
      alert("Invalid Lead selected");
      return;
    }

    try {
      const res = await fetch(`/api/employees/leads/${id}/opportunities`);
      if (!res.ok) {
        // if endpoint doesn't return an existing opportunity, open add mode
        setMode("add");
        setCurrentOpportunityId(null);
        resetOpportunityForm();
        setShowAddOpportunity(true);
        return;
      }

      const data = await res.json();

      if (data && data.opportunity) {
        // EDIT MODE - populate with IDs returned by the API
        setMode("edit");
        setCurrentOpportunityId(data.opportunity.OpportunityId ?? null);
        setOpportunityForm({
          serviceId: data.opportunity.ServiceId ?? "",
          probabilityId: data.opportunity.ProbabilityId ?? "",
          statusId: data.opportunity.StatusId ?? "",
          engagementId: data.opportunity.EngagementId ?? "",
          technologies: Array.isArray(data.opportunity.technologies)
            ? data.opportunity.technologies
            : [],
        });
      } else {
        // ADD MODE
        setMode("add");
        setCurrentOpportunityId(null);
        resetOpportunityForm();
      }

      setShowAddOpportunity(true);
    } catch (err) {
      console.error("Failed to load opportunity for edit:", err);
      setMode("add");
      setCurrentOpportunityId(null);
      resetOpportunityForm();
      setShowAddOpportunity(true);
    }
  };


  const handleTechnologyChange = (subCategoryId: number) => {
    setOpportunityForm((prev) => ({
      ...prev,
      technologies: prev.technologies.includes(subCategoryId)
        ? prev.technologies.filter((id) => id !== subCategoryId)
        : [...prev.technologies, subCategoryId],
    }));
  };

  const fetchLeadDetails = async () => {
    if (!effectiveLeadId) return;

    try {
      const res = await fetch(`/api/employees/leads/${effectiveLeadId}`);
      if (!res.ok) {
        console.error("Failed to fetch lead details");
        return;
      }

      const data = await res.json();

      setLead({
        ...data,
        Contacts: data.Contacts || [],
        Activities: data.Activities || [],
        Reminders: data.Reminders || [],
        Opportunities: data.Opportunities || [],
      });
    } catch (error) {
      console.error("Error fetching lead details:", error);
    }
  };


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
      const res = await fetch(`/api/employees/leads/${leadId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Mode: activityForm.Mode,
          Notes: activityForm.Notes,
          Status: activityForm.Status,
          ActivityDate: new Date().toISOString(),
        }),
      });

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

  const formatDateTime = (value?: string) => {
    if (!value) return "—";

    const d = new Date(value);
    if (isNaN(d.getTime())) return value;

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const handleSaveReminder = async () => {
    if (!reminderForm.ReminderDate || !reminderForm.Notes) {
      alert("Please fill all required fields");
      return;
    }

    const leadId = lead?.LeadId;
    if (!leadId) {
      alert("Invalid Lead");
      return;
    }

    try {
      const res = await fetch(`/api/employees/leads/${leadId}/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ReminderDate: reminderForm.ReminderDate,
          Notes: reminderForm.Notes,
          Status: reminderForm.Status, // ✅ NEW
          Notification: reminderForm.Notification,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save reminder");
      }

      const savedReminder = await res.json();

      // ✅ Update UI immediately
      setLead((prev) =>
        prev
          ? {
            ...prev,
            Reminders: [...(prev.Reminders || []), savedReminder],
          }
          : prev
      );

      // Reset form
      setReminderForm({
        ReminderDate: "",
        Notes: "",
        Status: "Pending",
        Notification: "Email",
      });

      setShowAddReminder(false);
    } catch (err: any) {
      alert(err.message || "Reminder save failed");
    }
  };

  const handleSaveOpportunity = async () => {
    const isEdit = !!currentOpportunityId;

    const id = effectiveLeadId ?? leadId;
    if (!id) {
      alert("Invalid Lead selected");
      return;
    }

    const res = await fetch(
      `/api/employees/leads/${id}/opportunities`,
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEdit && { opportunityId: currentOpportunityId }),
          serviceId: opportunityForm.serviceId,
          statusId: opportunityForm.statusId,
          probabilityId: opportunityForm.probabilityId,
          engagementId: opportunityForm.engagementId,
          technologies: opportunityForm.technologies,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to save opportunity");
      return;
    }

    setShowAddOpportunity(false);
    await fetchLeadDetails(); // refresh table
  };



  const leadIdFromQuery = searchParams.get("leadId");

  const effectiveLeadId =
    lead?.LeadId ??
    leadId ??
    (leadIdFromQuery && !isNaN(Number(leadIdFromQuery))
      ? Number(leadIdFromQuery)
      : null);

  // NEW: helpers to pick label / back text
  const getConvertLabel = () => {
    const type = lead?.AccountTypeName ?? "Lead";

    if (type === "Lead") return "Convert to Prospect";
    if (type === "Prospect") return "Convert to Account";
    if (type === "Account") return "Convert to Master Account";

    return "Already a Master Account";
  };


  // const getTargetType = () => {
  //   if (!lead?.AccountTypeName) return "";

  //   if (lead.AccountTypeName === "Lead") return "Prospect";
  //   if (lead.AccountTypeName === "Prospect") return "Account";
  //   if (lead.AccountTypeName === "Account") return "MasterAccount";

  //   return "";
  // };

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
      alert("ID not found");
      return;
    }

    try {
      const res = await fetch(`/api/employees/leads/${lead.LeadId}/convert`, {
        method: "POST",
      });

      if (!res.ok) {
        let errorMessage = "Conversion failed";

        try {
          const err = await res.json();
          errorMessage = err.error || errorMessage;
        } catch {
          // response was not JSON
        }

        throw new Error(errorMessage);
      }

      // Redirect based on CURRENT stage
      // ✅ SHOW SUCCESS POPUP
      if (lead.AccountTypeName === "Lead") {
        alert("Converted successfully to Prospect");
        router.push("/webpage?tab=prospect");
      } else if (lead.AccountTypeName === "Prospect") {
        alert("Converted successfully to Account");
        router.push("/webpage?tab=account");
      } else if (lead.AccountTypeName === "Account") {
        alert("Converted successfully to Master Account");
        router.push("/webpage?tab=masteraccount");
      }
    } catch (err: any) {
      alert(err.message || "Failed to convert");
    }
  };

  useEffect(() => {
    if (!showAddOpportunity) return;

    fetch("/api/masters/categories-with-subcategories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error("Failed to load technologies", err);
      });
  }, [showAddOpportunity]);

  useEffect(() => {
    fetchLeadDetails();
  }, [effectiveLeadId]);



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
    fontSize: 13,
  };

  const modalFooter: React.CSSProperties = {
    padding: 10,
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  };

  const inputBox: React.CSSProperties = {
    width: "100%",
    height: 36,
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    fontSize: 13,
    background: "#fff",
  };

  const formRow3: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 16,
    marginBottom: 16,
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

  const fieldGroup: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
  };

  const inputStyle: React.CSSProperties = {
    height: 36,
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    fontSize: 13,
    width: "100%",
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
          <div
            style={{
              ...sectionTitle,
              borderBottom: "1px solid #e6e6e6",
              paddingBottom: 8,
            }}
          >
            Company Information
          </div>
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
          <div
            style={{
              ...sectionTitle,
              borderBottom: "1px solid #e6e6e6",
              paddingBottom: 8,
            }}
          >
            Contacts
          </div>

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
                <td style={tdStyle}>{formatDateTime(a.ActivityDate)}</td>
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
        <button style={addBtn} onClick={handleAddOpportunityClick}>
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
              <th style={{ ...thStyle, width: 250 }}>Technology</th>
            </tr>
          </thead>

          <tbody>
            {lead.Opportunities?.[0] && (
              <tr>
                <td style={tdStyle}>
                  {formatDateTime(lead.Opportunities[0].CreatedDate)}
                </td>
                <td style={tdStyle}>
                  {lead.Opportunities[0].Service}
                </td>
                <td style={tdStyle}>
                  {lead.Opportunities[0].Probability}
                </td>
                <td style={tdStyle}>
                  {lead.Opportunities[0].Status}
                </td>
                <td style={tdStyle}>
                  {lead.Opportunities[0].EngagementModel}
                </td>
                <td style={tdStyle}>
                  {lead.Opportunities[0].Technology ?? "-"}
                </td>
              </tr>
            )}


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
          <div style={{ ...modalBox, width: "60%", maxWidth: 1100 }}>
            {/* Header */}
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

            {/* Body */}
            <div style={modalBody}>
              {/* FIRST ROW - 3 COLUMNS */}
              <div style={formRow3}>
                <div style={fieldGroup}>

                  <label>Service *</label>
                  <select
                    style={inputBox}
                    value={opportunityForm.serviceId}
                    onChange={(e) =>
                      setOpportunityForm({
                        ...opportunityForm,
                        serviceId: Number(e.target.value),
                      })
                    }
                  >
                    <option value="">-- Select Service --</option>
                    <option value={1}>TalentMatch</option>
                    <option value={2}>DevAlley</option>
                    <option value={3}>Software Engineering</option>
                    <option value={4}>SAAS / ERP</option>
                    <option value={5}>Cloud</option>
                    <option value={6}>BI</option>
                    <option value={7}>AI</option>
                    <option value={8}>Data Works</option>
                  </select>

                </div>

                <div style={fieldGroup}>
                  <label>Status *</label>
                  <select
                    style={inputBox}
                    value={opportunityForm.statusId}
                    onChange={(e) =>
                      setOpportunityForm({
                        ...opportunityForm,
                        statusId: Number(e.target.value),
                      })
                    }
                  >
                    <option value="">-- Select Status --</option>

                    <option value={1}>Imported / Campaign Lead</option>
                    <option value={2}>Inbound Inquiry (Website / Event)</option>
                    <option value={3}>Outbound Prospecting (Cold Email / LinkedIn / Call)</option>
                    <option value={4}>Partner / Referral Lead</option>
                    <option value={5}>Marketing Nurtured Lead</option>
                  </select>
                </div>


                <div style={fieldGroup}>
                  <label>Engagement Model *</label>
                  <select
                    style={inputBox}
                    value={opportunityForm.engagementId}
                    onChange={(e) =>
                      setOpportunityForm({
                        ...opportunityForm,
                        engagementId: Number(e.target.value),
                      })
                    }
                  >
                    <option value="">-- Select Engagement Model --</option>

                    <option value={4}>Competence Center (ODC)</option>
                    <option value={1}>Managed Resourcing</option>
                    <option value={2}>Project</option>
                    <option value={3}>Shared Services</option>
                    <option value={5}>Other</option>
                  </select>

                </div>
              </div>

              {/* PROBABILITY */}
              <div style={fieldGroup}>
                <label>Probability *</label>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    padding: "1px 12px",
                    height: 36,
                    marginRight: 500,
                  }}
                >
                  {[
                    { id: 1, label: "<25%" },
                    { id: 2, label: "50%" },
                    { id: 3, label: "75%" },
                    { id: 4, label: "90%" },
                  ].map((p) => (
                    <label
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="probability"
                        checked={opportunityForm.probabilityId === p.id}
                        onChange={() =>
                          setOpportunityForm({
                            ...opportunityForm,
                            probabilityId: p.id,
                          })
                        }
                      />
                      {p.label}
                    </label>
                  ))}
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
                <div style={{ display: "flex", gap: 40 }}>
                  {categories.map((cat: any) => (
                    <div key={cat.CategoryId}>
                      <b>{cat.CategoryName}</b>

                      {cat.SubCategories.map((sc: any) => (
                        <div key={sc.SubCategoryId} style={{ marginTop: 6 }}>
                          <input
                            type="checkbox"
                            checked={opportunityForm.technologies.includes(
                              sc.SubCategoryId
                            )}
                            onChange={() =>
                              handleTechnologyChange(sc.SubCategoryId)
                            }
                          />
                          &nbsp; {sc.SubCategoryName}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div style={modalFooter}>
              <button
                style={cancelBtn}
                onClick={() => setShowAddOpportunity(false)}
              >
                Cancel
              </button>
              <button style={saveBtn} onClick={handleSaveOpportunity}>
                Save Opportunity
              </button>
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
