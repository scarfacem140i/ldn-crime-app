export const dynamic = "force-dynamic";
import { geoLookupFromPostcode } from "@/lib/actions/geo-lookup-from-postcode";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/geoLookup
 *
 * This route performs a geolocation lookup based on a postcode provided in the query string.
 *
 * Flow:
 * 1. Extracts `postcode` from the query string parameters in the GET request.
 * 2. Logs the received postcode for debugging purposes.
 * 3. If the postcode is missing, returns a 400 Bad Request response with an error message.
 * 4. Calls the `geoLookupFromPostcode` function to get location details for the provided postcode.
 * 5. Returns the location data as a JSON response.
 * 6. If an error occurs during the lookup, it is caught and logged. The error message is returned with a 500 Internal Server Error status.
 *
 * Ensures that a valid postcode is provided before attempting the geolocation lookup.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postcode = searchParams.get("postcode");

    console.log(`Received GET request with lat=${postcode}`);

    if (!postcode) {
      console.error("Missing postcode in request");
      return NextResponse.json(
        { error: "Postcode is required" },
        { status: 400 }
      );
    }

    const location = await geoLookupFromPostcode(postcode);
    console.log("Location found:", location);
    return NextResponse.json({ location });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error in GET handler:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
