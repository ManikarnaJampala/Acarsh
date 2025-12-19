import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { leadID: string } }
) {
  try {
    const leadId = Number(params.leadID);

    if (isNaN(leadId)) {
      return NextResponse.json({ error: "Invalid LeadId" }, { status: 400 });
    }

    const pool = await getPool();


    //  Lead Basic Details

    const leadResult = await pool
      .request()
      .input("LeadId", leadId)
      .query(`
        SELECT
          l.LeadId,
          l.CompanyName,
          l.CompanyLocation,
          l.LeadSource,
          CONVERT(VARCHAR, l.LeadDate, 23) AS LeadDate,
          l.LeadNotes,
          ls.StatusName,
          u.UserName AS OwnerName
        FROM Leads l
        LEFT JOIN LeadStatuses ls ON l.StatusId = ls.StatusId
        LEFT JOIN dbo.Users u ON l.OwnerId = u.UserId
        WHERE l.LeadId = @LeadId
      `);

    if (!leadResult.recordset.length) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    /* =====================================================
       2️⃣ Contacts
    ===================================================== */
    const contactsResult = await pool
      .request()
      .input("LeadId", leadId)
      .query(`
        SELECT
          lc.ContactName,
          lc.ContactTitle,
          lc.ContactEmail,
          cr.Role AS ContactRoleName
        FROM LeadContacts lc
        LEFT JOIN ContactRoles cr ON lc.ContactRoleId = cr.RoleId
        WHERE lc.LeadId = @LeadId
      `);

    /* =====================================================
       3️⃣ Activities
    ===================================================== */
    const activitiesResult = await pool
      .request()
      .input("LeadId", leadId)
      .query(`
        SELECT
          CONVERT(VARCHAR, la.ActivityDate, 23) AS ActivityDate,
          la.ActivityType AS Mode,
          la.Notes,
          ls.StatusName AS Status
        FROM LeadActivities la
        LEFT JOIN LeadStatuses ls ON la.StatusId = ls.StatusId
        WHERE la.LeadId = @LeadId
        ORDER BY la.ActivityDate DESC
      `);

    /* =====================================================
       4️⃣ Reminders
    ===================================================== */
    const remindersResult = await pool
      .request()
      .input("LeadId", leadId)
      .query(`
        SELECT
          CONVERT(VARCHAR, lr.ReminderDate, 23) AS ReminderDate,
          lr.ReminderNote AS Notes,
          lr.Status,
          lr.NotificationChannels AS Notification
        FROM LeadReminders lr
        WHERE lr.LeadId = @LeadId
        ORDER BY lr.ReminderDate DESC
      `);

    /* =====================================================
       5️⃣ Opportunities (FULLY MAPPED)
    ===================================================== */
    const opportunitiesResult = await pool
      .request()
      .input("LeadId", leadId)
      .query(`SELECT
    o.OpportunityId,
    CONVERT(VARCHAR, o.CreatedOn, 23) AS CreatedDate,

    s.ServiceName AS Service,
    pm.ProbabilityRange AS Probability,
    os.Opportunities_StatusName AS Status,
    em.Engagement_ModelName AS EngagementModel,

    STRING_AGG(sc.SubCategoryName, ', ') AS Technology

FROM Opportunities o

LEFT JOIN Services s
    ON o.ServiceId = s.ServiceId

LEFT JOIN Opportunities_Status os
    ON o.Opportunity_StatusId = os.Opportunity_StatusId

LEFT JOIN Probability pm
    ON o.ProbabilityId = pm.ProbabilityId

LEFT JOIN Engagement_Models em
    ON o.EngagementId = em.EngagementId

-- 🔥 IMPORTANT FIX
LEFT JOIN opportunity_categories oc
    ON o.OpportunityId = oc.OpportunityId

LEFT JOIN SubCategory sc
    ON oc.SubCategoryId = sc.SubCategoryId

WHERE o.LeadId = @LeadId
  AND o.IsDeleted = 0

GROUP BY
    o.OpportunityId,
    o.CreatedOn,
    s.ServiceName,
    pm.ProbabilityRange,
    os.Opportunities_StatusName,
    em.Engagement_ModelName

ORDER BY o.CreatedOn DESC;


      `);

    /* =====================================================
       6️⃣ FINAL RESPONSE (UI READY)
    ===================================================== */
    return NextResponse.json({
      ...leadResult.recordset[0],
      Contacts: contactsResult.recordset,
      Activities: activitiesResult.recordset,
      Reminders: remindersResult.recordset,
      Opportunities: opportunitiesResult.recordset
    });

  } catch (error) {
    console.error("Get lead error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead details" },
      { status: 500 }
    );
  }
}
