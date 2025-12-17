import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { leadID: string } }
) {
  try {
    const leadId = Number(params.leadID);
    if (isNaN(leadId)) {
      return NextResponse.json(
        { error: "Invalid LeadId" },
        { status: 400 }
      );
    }

    const pool = await getPool();

    /* 1️⃣ Fetch Lead basic details */
    const leadResult = await pool
      .request()
      .input("LeadId", leadId)
      .query(`
        SELECT
          l.LeadId,
          l.CompanyName,
          l.CompanyLocation,
          l.LeadSource,
          l.LeadDate,
          l.LeadNotes,
          at.Name AS AccountTypeName,
          ls.StatusName
        FROM Leads l
        LEFT JOIN AccountTypes at ON l.AccountTypeId = at.AccountTypeId
        LEFT JOIN LeadStatuses ls ON l.StatusId = ls.StatusId
        WHERE l.LeadId = @LeadId
      `);

    if (!leadResult.recordset.length) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    /* 2️⃣ Fetch Lead Activities */
    const activitiesResult = await pool
      .request()
      .input("LeadId", leadId)
      .query(`
        SELECT
          la.ActivityId,
            CONVERT(VARCHAR, la.ActivityDate, 23) AS ActivityDate,
          la.ActivityType AS Mode,
          la.Notes,
          ls.StatusName AS Status
        FROM LeadActivities la
        LEFT JOIN LeadStatuses ls
          ON la.StatusId = ls.StatusId
        WHERE la.LeadId = @LeadId
        ORDER BY la.ActivityDate DESC
      `);

    /* 3️⃣ Merge exactly as UI expects */
    return NextResponse.json({
      ...leadResult.recordset[0],
      Activities: activitiesResult.recordset
    });

  } catch (error) {
    console.error("Get lead error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead details" },
      { status: 500 }
    );
  }
}
