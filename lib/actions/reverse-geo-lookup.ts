interface NominatimReverseResponse {
  name?: string;
  display_name: string;
  address?: {
    road?: string;
    borough?: string;
    city?: string;
    state?: string;
    city_district?: string;
  };
}

export async function reverseLookup(lat: string, lon: string): Promise<string> {
  try {
    console.log(`Reverse lookup for coordinates: lat=${lat}, lon=${lon}`);

    const params = new URLSearchParams({ format: "json", lat, lon });
    const url = `https://nominatim.openstreetmap.org/reverse?${params.toString()}`;

    console.log(`Making request to: ${url}`);

    const response = await fetch(url, {
      headers: { "User-Agent": "ldn-crime-map" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch reverse geocoding data");
    }

    const data = (await response.json()) as NominatimReverseResponse;
    console.log("Received reverse geocoding data:", data);

    if (!data || !data.display_name) {
      throw new Error("No location found for these coordinates");
    }

    return (
      data.name ||
      data.address?.road ||
      data.address?.city_district ||
      data.display_name
    );
  } catch (error) {
    console.error("Error during reverse geocoding:", error);
    throw new Error("An error occurred while performing reverse geocoding");
  }
}
