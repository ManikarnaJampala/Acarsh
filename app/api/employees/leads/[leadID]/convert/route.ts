import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
 
export async function POST(
  req: Request,
  { params }: { params: { leadID: string } }
) {
  const leadId = Number(params.leadID);
 
  if (!leadId) {
    return NextResponse.json(
      { error: "Invalid LeadId" },
      { status: 400 }
    );
  }
 
  const pool = await getPool();
  const tx = pool.transaction();
 
  try {
    await tx.begin();
 
    // 1️⃣ Get current account type
    const currentTypeResult = await tx
      .request()
      .input("LeadId", leadId)
      .query(`
        SELECT at.Name
        FROM Leads l
        LEFT JOIN AccountTypes at
          ON l.AccountTypeId = at.AccountTypeId
        WHERE l.LeadId = @LeadId
      `);
 
    const currentType = currentTypeResult.recordset[0]?.Name ?? "Lead";
 
    // 2️⃣ Determine next stage
    const NEXT_STAGE: Record<string, string> = {
      Lead: "Prospect",
      Prospect: "Account",
      Account: "MasterAccount",
    };
 
    const targetType = NEXT_STAGE[currentType];
 
    if (!targetType) {
      await tx.rollback();
      return NextResponse.json(
        { error: "No further conversion possible" },
        { status: 400 }
      );
    }
 
    // 3️⃣ Get AccountTypeId
    const typeResult = await tx
      .request()
      .input("Name", targetType)
      .query(`
        SELECT AccountTypeId
        FROM AccountTypes
        WHERE Name = @Name
      `);
 
    if (!typeResult.recordset.length) {
      throw new Error("Target AccountType not found");
    }
 
    const accountTypeId = typeResult.recordset[0].AccountTypeId;
 
    // 4️⃣ Update lead
    await tx
      .request()
      .input("LeadId", leadId)
      .input("AccountTypeId", accountTypeId)
      .query(`
        UPDATE Leads
        SET AccountTypeId = @AccountTypeId
        WHERE LeadId = @LeadId
      `);
 
    await tx.commit();
 
    return NextResponse.json({
      message: "Converted successfully",
      from: currentType,
      to: targetType,
    });
  } catch (err: any) {
    await tx.rollback();
    console.error("Convert error:", err);
 
    return NextResponse.json(
      { error: err.message || "Conversion failed" },
      { status: 500 }
    );
  }
}
 
 