import { api_crime_report } from "@/lib/db/schema";
import { CrimeReportWithStats } from "@/lib/db/types";
import { useCrimes } from "@/lib/hooks/use-crimes";
import { usePoliceCrimes } from "@/lib/hooks/use-police-crimes";
import { UseQueryResult } from "@tanstack/react-query";
import { Layer, Source } from "@vis.gl/react-maplibre";
import { InferSelectModel } from "drizzle-orm";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

type ApiCrimeReport = InferSelectModel<typeof api_crime_report>;

function generateFeaturePoints(
  crimeReportsQueryResult: UseQueryResult<CrimeReportWithStats[], Error>,
  policeCrimesQueryResult: UseQueryResult<ApiCrimeReport[], Error>
) {
  const { data, error } = crimeReportsQueryResult;
  const crimeReports = data && !error ? data : [];

  const { data: policeData, error: policeError } = policeCrimesQueryResult;
  const policeCrimes = policeData && !policeError ? policeData : [];

  // Normalise crime reports and police crimes
  const crimeReportsFiltered = crimeReports.map((report) => ({
    longitude: Number(report.longitude),
    latitude: Number(report.latitude),
  }));

  const policeCrimesFiltered = policeCrimes.map((report) => ({
    longitude: Number(report.longitude),
    latitude: Number(report.latitude),
  }));

  const joinedCrimeReports = [...crimeReportsFiltered, ...policeCrimesFiltered];

  const locationMap = new Map<
    string,
    { count: number; longitude: number; latitude: number }
  >();

  for (const report of joinedCrimeReports) {
    if (report.longitude == null || report.latitude == null) continue;

    const lon = report.longitude;
    const lat = report.latitude;
    const key = `${lon},${lat}`;

    if (!locationMap.has(key)) {
      locationMap.set(key, {
        count: 1,
        longitude: Number(lon),
        latitude: Number(lat),
      });
    } else {
      locationMap.get(key)!.count += 1;
    }
  }

  return Array.from(locationMap.values()).map((loc) => ({
    type: "Feature",
    properties: { count: loc.count },
    geometry: {
      type: "Point",
      coordinates: [loc.longitude, loc.latitude],
    },
  }));
}

export function HeatmapLayer() {
  const crimeReportsQueryResult = useCrimes();
  const policeCrimesQueryResult = usePoliceCrimes();
  const [geoJson, setGeoJson] = useState<any>(null);

  useEffect(() => {
    if (crimeReportsQueryResult.data || policeCrimesQueryResult.data) {
      const resp = generateFeaturePoints(
        crimeReportsQueryResult,
        policeCrimesQueryResult
      );
      setGeoJson({
        type: "FeatureCollection",
        features: resp,
      });
    }
  }, [crimeReportsQueryResult.data, policeCrimesQueryResult.data]);

  if (!geoJson) return null;
  return (
    <Source id={"overall-heatmap-layer"} type="geojson" data={geoJson}>
      <Layer
        id="overall-heatmap-layer-id"
        type="heatmap"
        paint={{
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "count"],
            0,
            0,
            100,
            0.4,
            200,
            0.6,
            300,
            0.8,
            400,
            1,
          ],
          // Increase the heatmap color weight weight by zoom level
          // heatmap-intensity is a multiplier on top of heatmap-weight
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            1,
            9,
            3,
            16,
            10,
          ],
          // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
          // Begin color ramp at 0-stop with a 0-transparency color
          // to create a blur-like effect.
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(33,102,172,0)",
            0.2,
            "rgb(103,169,207)",
            0.4,
            "rgb(209,229,240)",
            0.6,
            "rgb(253,219,199)",
            0.8,
            "rgb(239,138,98)",
            1,
            "rgb(178,24,43)",
          ],
          // Adjust the heatmap radius by zoom level
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 22],
          // Transition from heatmap to circle layer by zoom level
          "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 1, 1, 20, 0],
        }}
      />
    </Source>
  );
}
