import { getCrimeData } from "@/lib/actions/get-crime-data";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { crime_report } from "@/lib/db/schema";
import { crimeReportInsertSchema } from "@/lib/zod/crimeReport";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET & POST /api/crimes
 *
 * GET:
 * - Retrieves all reported crimes from the database.
 * - Calls `getCrimeData()` to fetch the list of crime reports.
 * - Validates that the returned data is an array before responding with JSON.
 * - If data is invalid or an error occurs, returns a 500 Internal Server Error.
 *
 * POST:
 * - Allows an authenticated user to submit a new crime report.
 * - Authenticates the user from session headers; returns 401 if unauthenticated.
 * - Validates the request body against a Zod schema to ensure all required fields (e.g. location, description) are provided.
 * - Inserts a new crime report into the database.
 *   - Automatically assigns a UUID.
 *   - Sets the `verified` field to `true` if the submitting user is an admin.
 * - Revalidates the homepage cache to reflect the new report.
 * - Returns a 201 Created response with a success message and report ID.
 *
 * Handles input validation errors (400) and server-side issues (500) with appropriate messaging.
 */

export async function GET() {
  try {
    const crimes = await getCrimeData();
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

// Zod schema for validation
const crimeReportSchema = crimeReportInsertSchema;

export async function POST(req: Request) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user_id = session.user.id;

    // Parse request body
    const body = await req.json();
    const validatedData = crimeReportSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    const { category, description, latitude, longitude, street_name } =
      validatedData.data;

    // Insert into database
    const newCrimeReport = await db.insert(crime_report).values({
      id: crypto.randomUUID(),
      user_id,
      category,
      description,
      latitude,
      longitude,
      street_name,
      verified: session.user.role === "admin" ? true : false,
    });

    revalidatePath("/");
    return NextResponse.json(
      { message: "Crime reported successfully", crimeId: newCrimeReport },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error reporting crime:", error);
    return NextResponse.json(
      { error: "Failed to report crime" },
      { status: 500 }
    );
  }
}
