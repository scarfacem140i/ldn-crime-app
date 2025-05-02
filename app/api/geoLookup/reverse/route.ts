export const dynamic = "force-dynamic";
import { reverseLookup } from "@/lib/actions/reverse-geo-lookup";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/geoLookup/reverse
 *
 * This route performs a reverse geolocation lookup based on latitude and longitude provided in the query string.
 *
 * Flow:
 * 1. Extracts `lat` and `lon` from the query string parameters in the GET request.
 * 2. Logs the received latitude and longitude values for debugging purposes.
 * 3. If either latitude or longitude is missing, returns a 400 Bad Request response with an error message.
 * 4. Calls the `reverseLookup` function to get location details for the provided coordinates.
 * 5. Returns the location data as a JSON response.
 * 6. If an error occurs during the lookup, it is caught and logged. The error message is returned with a 500 Internal Server Error status.
 *
 * Ensures that both latitude and longitude are provided before attempting the reverse lookup.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    console.log(`Received GET request with lat=${lat}, lon=${lon}`);

    if (!lat || !lon) {
      console.error("Missing latitude or longitude in request");
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const location = await reverseLookup(lat, lon);
    console.log("Location found:", location);
    return NextResponse.json({ location });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error in GET handler:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
