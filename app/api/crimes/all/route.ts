import { getCrimeDataWithUser } from "@/lib/actions/get-crime-data";
import { NextResponse } from "next/server";

/**
 * GET /crimes/all
 *
 * Fetches a list of crime reports including user-specific data (e.g. votes or reports tied to the current user).
 *
 * Flow:
 * 1. Calls `getCrimeDataWithUser()` to retrieve enriched crime data, potentially including user-specific fields.
 * 2. Validates that the returned data is a valid array.
 * 3. If data is invalid, logs an error and returns a 500 response.
 * 4. If successful, returns the list of crime records as JSON.
 *
 * Catches and handles any unexpected server errors, returning a 500 error with a descriptive message.
 */

export async function GET() {
  try {
    const crimes = await getCrimeDataWithUser();
    if (!crimes || !Array.isArray(crimes)) {
      console.error("Invalid crime data format");
      return NextResponse.json(
        { error: "Invalid crime data format" },
        { status: 500 }
      );
    }
    return NextResponse.json(crimes);
  } catch (error) {
    console.error("Error fetching crime data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch crime data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
