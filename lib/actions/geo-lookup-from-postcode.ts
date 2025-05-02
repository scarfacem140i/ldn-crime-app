interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

export async function geoLookupFromPostcode(postcode: string) {
  if (!postcode.trim()) {
    throw new Error("Postcode is required");
  }

  const params = new URLSearchParams({
    q: postcode,
    format: "json",
    addressdetails: "1",
    limit: "1",
  });
  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

  const response = await fetch(url, {
    headers: { "User-Agent": "ldn-crime-map" },
  });

  if (!response.ok) {
    throw new Error(
      `Geocoding request failed: ${response.status} ${response.statusText}`
    );
  }

  const results = (await response.json()) as NominatimSearchResult[];

  if (!results.length) {
    throw new Error("No location found for this postcode");
  }

  const { lat, lon, display_name } = results[0];

  return { lat, lon, display_name };
}
