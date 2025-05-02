import { auth } from "@/lib/auth";
import { db, eq } from "@/lib/db";
import { crime_report } from "@/lib/db/schema";
import { crimeReportVerifySchema } from "@/lib/zod/crimeReportVerify";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * POST /api/crimes/verify
 *
 * Allows am ad,om to verify or unverify a crime report.
 *
 * Flow:
 * 1. Authenticates the user via session from request headers.
 * 2. Parses and validates the request body against a Zod schema to ensure it contains a valid crime `id` and `verified` boolean.
 * 3. If validation fails, returns a 400 error with details about the validation issues.
 * 4. Updates the corresponding crime report in the database with the new `verified` status.
 * 5. Triggers a cache revalidation for the admin page to reflect the updated status.
 * 6. Returns a 201 response with a success message and the updated crime ID.
 *
 * Catches unexpected errors and returns a 500 error response if something goes wrong during processing.
 */

export async function POST(req: Request) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const validatedData = crimeReportVerifySchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    const { id, verified } = validatedData.data;

    // Update the database
    const updatedCrime = await db
      .update(crime_report)
      .set({ verified })
      .where(eq(crime_report.id, id))
      .returning();

    revalidatePath("/admin");
    return NextResponse.json(
      { message: "Crime reported successfully", crimeId: updatedCrime },
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
