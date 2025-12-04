// app/api/leads/prospects/route.ts

import { NextResponse } from "next/server";
import { getPool } from "../../../../lib/db"; 


export async function GET() {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT 
        l.LeadId,
        l.CompanyName,
        l.CompanyLocation,
        l.LeadSource,
        l.LeadDate,
        l.LeadNotes,
        ls.StatusName,
        lc.ContactName,
        lc.ContactTitle,
        lc.ContactEmail,
        lc.ContactPhone,
        cr.Role AS ContactRoleName,
        u.UserName AS OwnerName,
        at.AccountTypeId,
        at.Name
      FROM Leads l
      LEFT JOIN LeadStatuses ls
        ON l.StatusId = ls.StatusId
      LEFT JOIN LeadContacts lc
        ON lc.LeadId = l.LeadId
      LEFT JOIN ContactRoles cr
        ON lc.ContactRoleId = cr.RoleId
      LEFT JOIN dbo.Users u
        ON l.OwnerId = u.UserId
      LEFT JOIN dbo.AccountTypes at
        ON l.AccountTypeId = at.AccountTypeId   
      WHERE at.Name = 'Account'  
    `);

    const rows = result.recordset;
    const grouped: any = {};

    rows.forEach((row) => {
      if (!grouped[row.LeadId]) {
        grouped[row.LeadId] = {
          LeadId: row.LeadId,
          CompanyName: row.CompanyName,
          CompanyLocation: row.CompanyLocation,
          LeadSource: row.LeadSource,
          LeadDate: row.LeadDate,
          LeadNotes: row.LeadNotes,
          StatusName: row.StatusName,
          OwnerName: row.OwnerName,
          AccountTypeId: row.AccountTypeId,
          Name: row.Name,
          Contacts: []
        };
      }

      // Push contact only if present
      if (row.ContactName || row.ContactEmail || row.ContactPhone) {
        grouped[row.LeadId].Contacts.push({
          ContactName: row.ContactName,
          ContactTitle: row.ContactTitle,
          ContactEmail: row.ContactEmail,
          ContactPhone: row.ContactPhone,
          ContactRoleName: row.ContactRoleName,
        });
      }
    });

    const finalResult = Object.values(grouped);

    return NextResponse.json(finalResult);
  } catch (err) {
    console.error("Error fetching prospect leads:", err);
    return NextResponse.json(
      { error: "Failed to fetch prospect leads" },
      { status: 500 }
    );
  }
}
