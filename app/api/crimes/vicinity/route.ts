import { getCrimesInSimilarVicinity } from "@/lib/actions/find-crimes-in-similar-vicinity";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * POST /api/crimes/vicinity
 *
 * Retrieves crime reports located in a similar geographic area based on user-provided data.
 *
 * Flow:
 * 1. Authenticates the user using session data from request headers.
 * 2. Parses the request body, which likely includes location data (e.g. coordinates or an address).
 * 3. Calls `getCrimesInSimilarVicinity` with the parsed body to retrieve nearby or related crime reports.
 * 4. Returns the resulting list of crimes as JSON.
 *
 * If the user is not authenticated, responds with a 401 Unauthorized.
 * Any unexpected server errors are caught and returned as a 500 Internal Server Error.
 */

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

    return NextResponse.json(await getCrimesInSimilarVicinity(body));
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
