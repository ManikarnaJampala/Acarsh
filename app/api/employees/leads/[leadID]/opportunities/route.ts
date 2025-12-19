import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getPool } from "@/lib/db";

/* =====================================================
   POST → CREATE OPPORTUNITY (FIRST TIME ONLY)
===================================================== */
export async function POST(
  req: NextRequest,
  { params }: { params: { leadID: string } }
) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    const leadId = Number(params.leadID);
    if (isNaN(leadId)) {
      return NextResponse.json({ error: "Invalid Lead ID" }, { status: 400 });
    }

    const {
      serviceId,
      statusId,
      probabilityId,
      engagementId,
      technologies
    } = await req.json();

    if (
      !serviceId ||
      !statusId ||
      !probabilityId ||
      !engagementId ||
      !Array.isArray(technologies) ||
      technologies.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    await transaction.begin();

    // ❗ Prevent duplicate opportunity per lead
    const existing = await transaction.request()
      .input("LeadId", sql.Int, leadId)
      .query(`
        SELECT OpportunityId
        FROM Opportunities
        WHERE LeadId = @LeadId AND IsDeleted = 0
      `);

    if (existing.recordset.length > 0) {
      await transaction.rollback();
      return NextResponse.json(
        { error: "Opportunity already exists for this lead" },
        { status: 409 }
      );
    }

    // INSERT opportunity
    const oppResult = await transaction.request()
      .input("LeadId", sql.Int, leadId)
      .input("ServiceId", sql.Int, serviceId)
      .input("ProbabilityId", sql.Int, probabilityId)
      .input("EngagementId", sql.Int, engagementId)
      .input("StatusId", sql.Int, statusId)
      .query(`
        INSERT INTO Opportunities
        (
          LeadId,
          ServiceId,
          ProbabilityId,
          EngagementId,
          Opportunity_StatusId,
          CreatedOn,
          IsDeleted
        )
        VALUES
        (
          @LeadId,
          @ServiceId,
          @ProbabilityId,
          @EngagementId,
          @StatusId,
          GETDATE(),
          0
        );

        SELECT SCOPE_IDENTITY() AS OpportunityId;
      `);

    const opportunityId = oppResult.recordset[0].OpportunityId;

    // INSERT technologies
    for (const subCategoryId of technologies) {
      await transaction.request()
        .input("OpportunityId", sql.Int, opportunityId)
        .input("SubCategoryId", sql.Int, subCategoryId)
        .query(`
          INSERT INTO opportunity_categories
          (OpportunityId, SubCategoryId)
          VALUES (@OpportunityId, @SubCategoryId)
        `);
    }

    await transaction.commit();

    return NextResponse.json({ success: true, opportunityId });

  } catch (error: any) {
    await transaction.rollback();
    console.error("POST opportunity error:", error);
    return NextResponse.json(
      { error: "Failed to save opportunity" },
      { status: 500 }
    );
  }
}

/* =====================================================
   GET → RETURN existing opportunity (if any) with IDs
===================================================== */
export async function GET(
  req: NextRequest,
  { params }: { params: { leadID: string } }
) {
  const pool = await getPool();

  try {
    const leadId = Number(params.leadID);
    if (isNaN(leadId)) {
      return NextResponse.json({ error: "Invalid Lead ID" }, { status: 400 });
    }

    // Get the latest non-deleted opportunity for this lead
    const oppResult = await pool.request()
      .input("LeadId", sql.Int, leadId)
      .query(`
        SELECT TOP 1
          OpportunityId,
          ServiceId,
          ProbabilityId,
          Opportunity_StatusId AS StatusId,
          EngagementId
        FROM Opportunities
        WHERE LeadId = @LeadId AND IsDeleted = 0
        ORDER BY CreatedOn DESC
      `);

    if (!oppResult.recordset.length) {
      return NextResponse.json({ opportunity: null });
    }

    const opp = oppResult.recordset[0];

    // fetch associated technologies
    const techRes = await pool.request()
      .input("OpportunityId", sql.Int, opp.OpportunityId)
      .query(`
        SELECT SubCategoryId
        FROM opportunity_categories
        WHERE OpportunityId = @OpportunityId
      `);

    const technologies = techRes.recordset.map((r: any) => r.SubCategoryId);

    return NextResponse.json({ opportunity: { ...opp, technologies } });
  } catch (error) {
    console.error("GET opportunity error:", error);
    return NextResponse.json({ error: "Failed to fetch opportunity" }, { status: 500 });
  }
}

/* =====================================================
   PUT → UPDATE EXISTING OPPORTUNITY (EDIT)
===================================================== */
export async function PUT(
  req: NextRequest,
  { params }: { params: { leadID: string } }
) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    const leadId = Number(params.leadID);
    if (isNaN(leadId)) {
      return NextResponse.json({ error: "Invalid Lead ID" }, { status: 400 });
    }

    const {
      opportunityId,
      serviceId,
      statusId,
      probabilityId,
      engagementId,
      technologies
    } = await req.json();

    if (
      !opportunityId ||
      !serviceId ||
      !statusId ||
      !probabilityId ||
      !engagementId ||
      !Array.isArray(technologies)
    ) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    await transaction.begin();

    // UPDATE opportunity
    await transaction.request()
      .input("OpportunityId", sql.Int, opportunityId)
      .input("ServiceId", sql.Int, serviceId)
      .input("ProbabilityId", sql.Int, probabilityId)
      .input("EngagementId", sql.Int, engagementId)
      .input("StatusId", sql.Int, statusId)
      .query(`
        UPDATE Opportunities
        SET
          ServiceId = @ServiceId,
          ProbabilityId = @ProbabilityId,
          EngagementId = @EngagementId,
          Opportunity_StatusId = @StatusId
        WHERE OpportunityId = @OpportunityId
      `);

    // REMOVE old technologies
    await transaction.request()
      .input("OpportunityId", sql.Int, opportunityId)
      .query(`
        DELETE FROM opportunity_categories
        WHERE OpportunityId = @OpportunityId
      `);

    // INSERT updated technologies
    for (const subCategoryId of technologies) {
      await transaction.request()
        .input("OpportunityId", sql.Int, opportunityId)
        .input("SubCategoryId", sql.Int, subCategoryId)
        .query(`
          INSERT INTO opportunity_categories
          (OpportunityId, SubCategoryId)
          VALUES (@OpportunityId, @SubCategoryId)
        `);
    }

    await transaction.commit();

    return NextResponse.json({ success: true });

  } catch (error) {
    await transaction.rollback();
    console.error("PUT opportunity error:", error);
    return NextResponse.json(
      { error: "Failed to update opportunity" },
      { status: 500 }
    );
  }
}
