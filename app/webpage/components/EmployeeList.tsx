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

type Props = {
    employees: Employee[] | null | undefined;
    loading?: boolean;
    error?: string | null;
    onDelete?: (leadId: number | string) => void;
    onAddLead: () => void;
};

export default function EmployeeList({
    employees,
    loading,
    error,
    onDelete,
    onAddLead,
}: Props) {
    const router = useRouter();
    const [query, setQuery] = useState("");

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
                marginTop: 16,
                background: "#ffffff",
                borderRadius: 4,
                boxShadow: "0 0 4px rgba(0,0,0,0.08)",
                overflow: "hidden",
            }}
        >
            {/* --------------------------------------------- */}
            {/* ---------- Top bar: Add Lead + Search ---------- */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                    padding: "16px",
                }}
            >
                {/* Add Lead Button */}
                <button
                    onClick={onAddLead}
                    style={{
                        background: "#2563eb",
                        color: "white",
                        padding: "7px 12px",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 13,
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                >
                    Add Lead
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

            {/* --------------------------------------------- */}
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
                                        <div style={{ fontWeight: "bold", fontSize: 9.52, fontFamily: "sans-serif" }}>
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
                                    <td style={{ ...tdStyle, verticalAlign: "middle" }}>
                                        {emp.Contacts && emp.Contacts.length > 0 ? (
                                            emp.Contacts.map((c, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        marginBottom: 8,
                                                        paddingBottom: 1,
                                                        borderBottom:
                                                            index !== emp.Contacts.length - 1
                                                                ? "1px dashed #e1e4ed"
                                                                : "none",
                                                    }}
                                                >
                                                    {/* Name + Role */}
                                                    <div style={{ fontWeight: "bold", fontSize: "9.52px" }}>
                                                        {c.ContactName || "—"}
                                                        {c.ContactRoleName && (
                                                            <span
                                                                style={{
                                                                    fontSize: 10,
                                                                    color: "#666",
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
                                                                color: "#555",
                                                                marginTop: 2,
                                                            }}
                                                        >
                                                            {c.ContactTitle}
                                                        </div>
                                                    )}

                                                    {/* Email */}
                                                    {c.ContactEmail && (
                                                        <div
                                                            style={{
                                                                fontSize: "9.52px",
                                                                color: "#444",
                                                                marginTop: 4,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 4,
                                                            }}
                                                        >
                                                            <span>
                                                                <Image
                                                                    src="/email.png"
                                                                    alt="email"
                                                                    width={11}
                                                                    height={11}
                                                                />
                                                            </span>
                                                            <a
                                                                href={`mailto:${c.ContactEmail}`}
                                                                style={{
                                                                    color: "#0b5fff",
                                                                    textDecoration: "none",
                                                                    wordBreak: "break-all",
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
                                                                marginTop: 2,
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
                                        <div style={{ fontSize: 9.52 }}>{emp.LeadSource || "—"}</div>
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
                                                    color: "#1f6fdc",
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
    //   borderBottom: "1px solid #3b414d",
    //   borderRight: "0.0px solid #e4e9f0",
    //   borderLeft: "0.1px solid #e4e9f0",
    border: "1px solid rgba(184, 183, 183, 0.4)",
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
    //   borderBottom: "1px solid #e1e4ed",
    //   borderRight: "0.01px solid #bebbbbff",
    //   borderLeft: "0.01px solid #bebbbbff",
    border: "1px solid rgba(145, 145, 146, 0.4)",
    verticalAlign: "top",
};

const trStyle: React.CSSProperties = {
    transition: "background-color 0.15s ease",
};
