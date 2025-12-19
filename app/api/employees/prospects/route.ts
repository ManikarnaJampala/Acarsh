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
      WHERE at.Name = 'Prospect'  
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
 
export async function POST(req: Request) {
  try {
    const body = await req.json();
 
    const {
      CompanyName,
      CompanyLocation,
      LeadSource,
      LeadDate,
      StatusName,
      OwnerName,
      Notes,
      ContactName,
      ContactEmail,
      ContactPhone,
      ContactTitle,
      ContactRoleName,
      AddReminder,
    } = body;
 
    const pool = await getPool();
 
    // 1. Get StatusId
    const statusResult = await pool
      .request()
      .input("StatusName", StatusName)
      .query(`SELECT StatusId FROM LeadStatuses WHERE StatusName = @StatusName`);
 
    const StatusId = statusResult.recordset[0]?.StatusId || 1;
 
    // 2. Get OwnerId
    const ownerResult = await pool
      .request()
      .input("OwnerName", OwnerName)
      .query(`SELECT UserId FROM dbo.Users WHERE UserName = @OwnerName`);
 
    const OwnerId = ownerResult.recordset[0]?.UserId || null;
 
    // 3. Get AccountTypeId for 'Prospect'
    const atResult = await pool
      .request()
      .input("AccountTypeName", "Prospect")
      .query(`SELECT AccountTypeId FROM dbo.AccountTypes WHERE Name = @AccountTypeName`);
 
    const AccountTypeId = atResult.recordset[0]?.AccountTypeId || null;
 
    // 4. Insert Lead (include AccountTypeId)
    const leadInsert = await pool
      .request()
      .input("CompanyName", CompanyName)
      .input("CompanyLocation", CompanyLocation)
      .input("LeadSource", LeadSource)
      .input("LeadDate", LeadDate)
      .input("LeadNotes", Notes)
      .input("StatusId", StatusId)
      .input("OwnerId", OwnerId)
      .input("AccountTypeId", AccountTypeId)
      .query(
        `INSERT INTO Leads
          (CompanyName, CompanyLocation, LeadSource, LeadDate, LeadNotes, StatusId, OwnerId, AccountTypeId)
        OUTPUT INSERTED.LeadId
        VALUES (@CompanyName, @CompanyLocation, @LeadSource, @LeadDate, @LeadNotes, @StatusId, @OwnerId, @AccountTypeId)`
      );
 
    const LeadId = leadInsert.recordset[0].LeadId;
 
    // ---- INSERT CONTACT (STRICT) ----
    if (ContactName || ContactEmail || ContactPhone) {
      if (!ContactRoleName) {
        return NextResponse.json({ error: "Contact role is required" }, { status: 400 });
      }
 
      const roleResult = await pool
        .request()
        .input("Role", ContactRoleName)
        .query(`
          SELECT RoleId
          FROM ContactRoles
          WHERE Role = @Role
        `);
 
      if (!roleResult.recordset.length) {
        return NextResponse.json({ error: "Invalid Contact Role" }, { status: 400 });
      }
 
      const ContactRoleId = roleResult.recordset[0].RoleId;
 
      await pool
        .request()
        .input("LeadId", LeadId)
        .input("ContactName", ContactName)
        .input("ContactEmail", ContactEmail)
        .input("ContactPhone", ContactPhone)
        .input("ContactTitle", ContactTitle)
        .input("ContactRoleId", ContactRoleId)
        .query(`
          INSERT INTO LeadContacts
          (LeadId, ContactName, ContactEmail, ContactPhone, ContactTitle, ContactRoleId)
          VALUES
          (@LeadId, @ContactName, @ContactEmail, @ContactPhone, @ContactTitle, @ContactRoleId)
        `);
    }
 
    // 5. Optional Reminder
    if (AddReminder) {
      await pool.request().input("LeadId", LeadId).query(`
        INSERT INTO Reminders (LeadId, ReminderDate)
        VALUES (@LeadId, GETDATE())
      `);
    }
 
    return NextResponse.json({ message: "Prospect created successfully", LeadId }, { status: 200 });
  } catch (err: any) {
    console.error("Error creating prospect:", err);
    return NextResponse.json({ error: "Failed to create prospect", details: err.message }, { status: 500 });
  }
}
 
 
 