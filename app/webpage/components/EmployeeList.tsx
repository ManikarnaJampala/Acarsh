"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export type Contact = {
  ContactName: string | null;
  ContactRoleName: string | null;
  ContactTitle: string | null;
  ContactEmail: string | null;
  ContactPhone: string | null;
};

export type Employee = {
  LeadId: number | string;

  CompanyName: string;
  CompanyLocation: string;
  LeadSource: string;
  LeadDate: string | number | Date;
  LeadNotes: string | null;

  StatusName: string | null;
  OwnerName: string | null;

  Contacts: Contact[];
};

type EntityType = "lead" | "prospect" | "account";

type Props = {
  employees: Employee[] | null | undefined;
  loading?: boolean;
  error?: string | null;
  onDelete?: (leadId: number | string) => void;
  onAddLead: () => void;
  onOpenLeadDetails?: (leadId: number | string) => void;
  type: EntityType; 
};

export default function EmployeeList({
  employees,
  loading,
  error,
  onDelete,
  onAddLead,
  onOpenLeadDetails,
  type,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  // Label for the Add button based on `type`
  const addButtonLabel = useMemo(() => {
    switch (type) {
      case "prospect":
        return "Add Prospect";
      case "account":
        return "Add Account";
      case "lead":
      default:
        return "Add Lead";
    }
  }, [type]);

  // Normalize employees prop to a plain array (support wrapper shapes like { data: [...] })
  const employeesList: Employee[] = Array.isArray(employees)
    ? employees
    : employees &&
      (employees as any).data &&
      Array.isArray((employees as any).data)
      ? (employees as any).data
      : [];

  const filteredEmployees = useMemo(() => {
    const q = (query || "").toLowerCase();
    if (!q) return employeesList;
    return employeesList.filter((emp) => {
      const haystack = [
        emp.CompanyName,
        emp.CompanyLocation,
        emp.LeadSource,
        emp.StatusName,
        emp.OwnerName,
        emp.LeadNotes,
        ...(emp.Contacts || []).flatMap((c) => [
          c.ContactName,
          c.ContactRoleName,
          c.ContactTitle,
          c.ContactEmail,
          c.ContactPhone,
        ]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [employeesList, query]);

  //   if (loading) return <div>Loading leads...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (employeesList.length === 0) return <div>No leads found.</div>;

  return (
    <div
      style={{
        marginTop: 60,
        background: "#ffffff",
        borderRadius: 4,
        boxShadow: "0 0 4px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      {/* --------------------------------------------- */}
      {/* ---------- Top bar: Add + Search ---------- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          padding: "16px",
        }}
      >
        {/* Add Button (text depends on `type`) */}
        <button
          onClick={onAddLead}
          style={{
            background: "#3a77e3",
            color: "white",
            padding: "7px 12px",
            border: "none",
            borderRadius: 6,
            fontSize: 13,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {addButtonLabel}
        </button>

        {/* Search Bar */}
        <div style={{ position: "relative", display: "inline-block" }}>
          {/* Search Icon Image */}
          <Image
            src="/search.png"
            alt="search"
            width={18}
            height={18}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />

          {/* Search Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads by company, contact, email, source, status, owner..."
            style={{
              width: "350px",
              marginRight: "300px",
              padding: "13px 40px",
              paddingLeft: "45px",
              borderRadius: 1,
              border: "1px solid #d1d5db",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>
      </div>

      <div style={{ maxHeight: 480, overflowY: "auto", overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            minWidth: 900,
            fontFamily: "Open sans, system-ui, -apple-system, sans-serif",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Company</th>
              <th style={thStyle}>Contacts</th>
              <th style={thStyle}>Source</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Info</th>
              <th style={thStyle}>Owner</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((emp, idx) => {
              const rowStyle: React.CSSProperties = {
                ...trStyle,
                backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f7f8fb",
              };

              return (
                <tr key={emp.LeadId as React.Key} style={rowStyle}>
                  {/* Company Column */}
                  <td style={{ ...tdStyle, verticalAlign: "middle" }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: 9.52,
                        fontFamily: "sans-serif",
                      }}
                    >
                      {emp.CompanyName || "—"}
                    </div>
                    {emp.CompanyLocation && (
                      <div
                        style={{
                          fontSize: "9.52px",
                          color: "#7a7f87",
                          marginTop: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span>
                          <Image
                            src="/location.png"
                            alt="location"
                            width={10}
                            height={10}
                          />
                        </span>
                        <span>{emp.CompanyLocation}</span>
                      </div>
                    )}
                  </td>

                  {/* Contacts Column */}
                  <td style={tdStyle}>
                    {emp.Contacts && emp.Contacts.length > 0 ? (
                      emp.Contacts.map((c, index) => (
                        <div
                          key={index}
                          style={{
                            paddingTop: index === 0 ? 0 : 6,
                            paddingBottom:
                              index === emp.Contacts.length - 1 ? 0 : 6,
                            borderBottom:
                              index !== emp.Contacts.length - 1
                                ? "1px solid #d7d7d7"
                                : "none",
                            margin: 0,
                            display: "block",
                          }}
                        >
                          {/* Name + Role */}
                          <div
                            onDoubleClick={() => onOpenLeadDetails?.(emp.LeadId)}
                            title="Double click to open details"
                            style={{
                              fontWeight: "600",
                              fontSize: "10px",
                              cursor: "pointer",
                            }}
                          >
                            {c.ContactName || "—"}
                            {c.ContactRoleName && (
                              <span
                                style={{
                                  fontSize: 10,
                                  color: "#8a8a8a",
                                  marginLeft: 4,
                                }}
                              >
                                ({c.ContactRoleName})
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          {c.ContactTitle && (
                            <div
                              style={{
                                fontSize: "9.52px",
                                fontWeight: "normal",
                                color: "#000",
                                marginTop: 0,
                              }}
                            >
                              {c.ContactTitle}
                            </div>
                          )}

                          {/* Email */}
                          {c.ContactEmail && (
                            <div
                              style={{
                                fontSize: "10px",
                                color: "#444",
                                marginTop: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                whiteSpace: "nowrap",
                              }}
                            >
                              <Image
                                src="/email.png"
                                alt="email"
                                width={11}
                                height={11}
                              />

                              <a
                                href={`mailto:${c.ContactEmail}`}
                                style={{
                                  color: "#7a7a7aff",
                                  textDecoration: "none",
                                }}
                              >
                                {c.ContactEmail}
                              </a>
                            </div>
                          )}

                          {/* Phone */}
                          {c.ContactPhone && (
                            <div
                              style={{
                                fontSize: 9.52,
                                color: "#444",
                                marginTop: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <span>
                                <Image
                                  src="/call.png"
                                  alt="call"
                                  width={10}
                                  height={10}
                                />
                              </span>
                              <a
                                href={`tel:${c.ContactPhone}`}
                                style={{
                                  color: "inherit",
                                  textDecoration: "none",
                                }}
                              >
                                {c.ContactPhone}
                              </a>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <span>—</span>
                    )}
                  </td>

                  {/* Source */}
                  <td style={{ ...tdStyle, verticalAlign: "middle" }}>
                    <div style={{ fontSize: 9.52 }}>
                      {emp.LeadSource || "—"}
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ ...tdStyle, verticalAlign: "middle" }}>
                    {emp.StatusName ? (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 9.52,
                          fontWeight: 600,
                          backgroundColor: "#e4f2ff",
                          color: "#3a77e3",
                          textTransform: "uppercase",
                        }}
                      >
                        {emp.StatusName}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Info Column */}
                  <td style={{ ...tdStyle, verticalAlign: "middle" }}>
                    {/* Date */}
                    <div style={{ fontSize: 9.52, marginBottom: 2 }}>
                      <span style={{ fontWeight: "bold" }}>Date: </span>
                      {formatDate(emp.LeadDate)}
                    </div>

                    {/* Notes */}
                    <div style={{ fontSize: 9.52 }}>
                      <span style={{ fontWeight: "bold" }}>Notes: </span>
                      {emp.LeadNotes && emp.LeadNotes.trim() !== ""
                        ? emp.LeadNotes
                        : "—"}
                    </div>
                  </td>

                  {/* Owner */}
                  <td style={{ ...tdStyle, verticalAlign: "middle" }}>
                    <div style={{ fontSize: 9.52 }}>{emp.OwnerName || "—"}</div>
                  </td>

                  {/* Actions */}
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <button
                      onClick={() => onDelete && onDelete(emp.LeadId)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <Image
                        src="/delete.png"
                        alt="delete"
                        width={18}
                        height={18}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(value: string | number | Date) {
  if (!value && value !== 0) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  border: "1px solid rgba(148, 148, 148, 0.4)",
  fontWeight: 600,
  fontSize: 12,
  textTransform: "uppercase",
  backgroundColor: "#252b36",
  color: "#ffffff",
  position: "sticky",
  top: 0,
  zIndex: 1,
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid rgba(145, 145, 146, 0.4)",
  verticalAlign: "top",
  fontSize: 13,
};

const trStyle: React.CSSProperties = {
  transition: "background-color 0.15s ease",
};
