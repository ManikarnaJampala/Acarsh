import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET() {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        c.CategoryId,
        c.CategoryName,
        sc.SubCategoryId,
        sc.SubCategoryName
      FROM Category c
      JOIN SubCategory sc ON sc.CategoryId = c.CategoryId
      ORDER BY c.CategoryName, sc.SubCategoryName
    `);

    // Group into required shape
    const map = new Map<number, any>();

    for (const row of result.recordset) {
      if (!map.has(row.CategoryId)) {
        map.set(row.CategoryId, {
          CategoryId: row.CategoryId,
          CategoryName: row.CategoryName,
          SubCategories: [],
        });
      }

      map.get(row.CategoryId).SubCategories.push({
        SubCategoryId: row.SubCategoryId,
        SubCategoryName: row.SubCategoryName,
      });
    }

    return NextResponse.json(Array.from(map.values()));
  } catch (err) {
    console.error("Category fetch error:", err);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}
