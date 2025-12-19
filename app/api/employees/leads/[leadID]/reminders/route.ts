import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import sql from "mssql";

export async function POST(
  req: NextRequest,
  { params }: { params: { leadID: string } }
) {
  try {
    const { ReminderDate, Notes, Status, Notification } = await req.json();

    // ✅ Validation
    if (!ReminderDate || !Notes?.trim()) {
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

    // ✅ Insert into LeadReminders (REAL INSERT)
    const insertResult = await pool
      .request()
      .input("LeadId", sql.Int, leadId)
      .input("ReminderDate", sql.DateTime, new Date(ReminderDate))
      .input("ReminderNote", sql.VarChar, Notes)
      .input("Status", sql.VarChar, Status || "Pending")
      .input("NotificationChannels", sql.VarChar, Notification || "Email")
      .query(`
        INSERT INTO LeadReminders
        (
          LeadId,
          ReminderDate,
          ReminderNote,
          Status,
          NotificationChannels,
          CreatedAt
        )
        OUTPUT
          INSERTED.ReminderId,
          INSERTED.ReminderDate,
          INSERTED.ReminderNote,
          INSERTED.Status,
          INSERTED.NotificationChannels
        VALUES
        (
          @LeadId,
          @ReminderDate,
          @ReminderNote,
          @Status,
          @NotificationChannels,
          GETDATE()
        )
      `);

    // ✅ Send clean response to UI
    return NextResponse.json({
      ReminderId: insertResult.recordset[0].ReminderId,
      ReminderDate: insertResult.recordset[0].ReminderDate,
      Notes: insertResult.recordset[0].ReminderNote,
      Status: insertResult.recordset[0].Status,
      Notification: insertResult.recordset[0].NotificationChannels
    });

  } catch (error) {
    console.error("Reminder API error:", error);
    return NextResponse.json(
      { error: "Reminder save failed" },
      { status: 500 }
    );
  }
}
