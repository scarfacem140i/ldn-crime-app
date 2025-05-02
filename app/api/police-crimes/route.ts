import { db } from "@/lib/db";
import { api_crime_report, api_report_count } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/police-crimes
 *
 * This route retrieves a list of crime reports based on a specified date or the most recent available data.
 *
 * Flow:
 * 1. Extracts `date` and `limit` from the query string parameters. If `limit` is not provided, defaults to 100 (with a maximum of 1000).
 * 2. If a `date` is provided, validates it to ensure it follows the `YYYY-MM` format.
 *    - If the date is invalid, returns a 400 Bad Request response with an error message.
 * 3. If no `date` is provided, fetches the most recent report date from the `api_report_count` table.
 * 4. If no reports are found, returns a 404 Not Found response.
 * 5. Uses the valid date (either provided or the most recent) to filter crime reports and retrieves matching records.
 * 6. Orders the results by the creation date of the reports.
 * 7. Returns the crime reports as a JSON response.
 *
 * Handles errors such as invalid date format, missing reports, and unexpected server issues, returning appropriate error responses.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const limitParam = parseInt(searchParams.get("limit") || "100", 10);
    const limit = Math.min(limitParam || 100, 1000);

    let whereClause = undefined;

    if (dateParam) {
      const parsedDate = new Date(`${dateParam}-01`);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid date format, expected YYYY-MM" },
          { status: 400 }
        );
      }
      whereClause = eq(api_crime_report.month, parsedDate);
    } else {
      // If no date is provided, fetch the latest date from api_report_count
      const latestReport = await db
        .select({ month: api_report_count.month })
        .from(api_report_count)
        .orderBy(desc(api_report_count.month))
        .limit(1);

      console.log("latestReport", latestReport);
      if (latestReport.length === 0) {
        return NextResponse.json(
          { error: "No crime report data found" },
          { status: 404 }
        );
      }

      // Use the latest date for the query
      whereClause = eq(api_crime_report.month, latestReport[0].month);
      console.log("whereClause", api_crime_report.month, latestReport[0].month);
    }

    const crimes = await db
      .select()
      .from(api_crime_report)
      .where(whereClause)
      .orderBy(desc(api_crime_report.created_at));

    return NextResponse.json(crimes);
  } catch (error) {
    console.error("Failed to fetch crimes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
