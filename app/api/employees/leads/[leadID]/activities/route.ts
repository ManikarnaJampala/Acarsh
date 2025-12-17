import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function POST(
  req: NextRequest,
  { params }: { params: { leadID: string } }
) {
  try {
    const { Mode, Notes, Status, ActivityDate } = await req.json();

    // Strong validation
    if (!Mode?.trim() || !Notes?.trim() || !Status?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const leadId = Number(params.leadID);
    if (isNaN(leadId)) {
      return NextResponse.json(
        { error: "Invalid LeadId" },
        { status: 400 }
      );
    }

    const pool = await getPool();

    //Resolve StatusId safely 
    const statusResult = await pool
      .request()
      .input("StatusName", sql.VarChar, Status)
      .query(`
        SELECT StatusId
        FROM LeadStatuses
        WHERE StatusName = @StatusName
      `);

    const StatusId = statusResult.recordset[0]?.StatusId ?? 1;

    /* Insert Lead Activity (BEST PRACTICE) */
    const insertResult = await pool
      .request()
      .input("LeadId", sql.Int, leadId)
      .input("ActivityType", sql.VarChar, Mode)
      .input("ActivitySubject", sql.VarChar, null)
      .input("Notes", sql.VarChar, Notes)
      .input("StatusId", sql.Int, StatusId)
      .input(
        "ActivityDate",
        sql.DateTime,
        ActivityDate ? new Date(ActivityDate) : new Date()
      )
      .query(`
        INSERT INTO LeadActivities
        (
          LeadId,
          ActivityType,
          ActivitySubject,
          ActivityDate,
          StatusId,
          Notes,
          CreatedOn
        )
        OUTPUT
          INSERTED.ActivityId,
          INSERTED.ActivityType,
          INSERTED.ActivityDate
        VALUES
        (
          @LeadId,
          @ActivityType,
          @ActivitySubject,
          @ActivityDate,
          @StatusId,
          @Notes,
          GETDATE()
        )
      `);

    /* 3️⃣ Return clean response to UI */
    return NextResponse.json({
      ActivityId: insertResult.recordset[0].ActivityId,
      ActivityDate: insertResult.recordset[0].ActivityDate,
      Mode: insertResult.recordset[0].ActivityType,
      Notes,
      Status,
    });
  } catch (error) {
    console.error("Activity API error:", error);
    return NextResponse.json(
      { error: "Activity save failed" },
      { status: 500 }
    );
  }
}
// export async function GET(
//   req: NextRequest,
//   { params }: { params: { leadID: string } }
// ) {
//   try {
//     const leadId = Number(params.leadID);
//     if (isNaN(leadId)) {
//       return NextResponse.json(
//         { error: "Invalid LeadId" },
//         { status: 400 }
//       );
//     }

//     const pool = await getPool();

//     // 1️⃣ Fetch Lead
//     const leadResult = await pool
//       .request()
//       .input("LeadId", leadId)
//       .query(`
//         SELECT
//           l.LeadId,
//           l.CompanyName,
//           l.CompanyLocation,
//           l.LeadSource,
//           l.LeadDate,
//           l.LeadNotes,
//           at.Name AS AccountTypeName,
//           ls.StatusName
//         FROM Leads l
//         LEFT JOIN AccountTypes at ON l.AccountTypeId = at.AccountTypeId
//         LEFT JOIN LeadStatuses ls ON l.StatusId = ls.StatusId
//         WHERE l.LeadId = @LeadId
//       `);

//     if (!leadResult.recordset.length) {
//       return NextResponse.json(
//         { error: "Lead not found" },
//         { status: 404 }
//       );
//     }

//     // 2️⃣ Fetch Activities
//     const activitiesResult = await pool
//       .request()
//       .input("LeadId", leadId)
//       .query(`
//         SELECT
//           la.ActivityId,
//           la.ActivityDate,
//           la.ActivityType AS Mode,
//           la.Notes,
//           ls.StatusName AS Status
//         FROM LeadActivities la
//         LEFT JOIN LeadStatuses ls ON la.StatusId = ls.StatusId
//         WHERE la.LeadId = @LeadId
//         ORDER BY la.ActivityDate DESC
//       `);

//     // ✅ 3️⃣ MERGE INTO ONE OBJECT (THIS IS THE KEY)
//     const lead = {
//       ...leadResult.recordset[0],
//       Activities: activitiesResult.recordset,
//     };

//     return NextResponse.json(lead);
//   } catch (err) {
//     console.error("Get lead error:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch lead" },
//       { status: 500 }
//     );
//   }
// }