import { usePostcodeTrackerStatistics } from "@/lib/hooks/use-postcode-tracker-statistics";
import * as turf from "@turf/turf";
import { Layer, Source } from "@vis.gl/react-maplibre";

export function RadarPing({
  lat,
  lon,
  kmRadius,
}: {
  lat: number;
  lon: number;
  kmRadius: number;
}) {
  const circle = turf.circle([lon, lat], kmRadius, {
    steps: 64,
    units: "kilometers",
  });
  const postcodeTrackerStatistics = usePostcodeTrackerStatistics({
    lat,
    lon,
    radiusKm: kmRadius,
  });

  const stats = postcodeTrackerStatistics.data;
  const difference =
    (stats?.overall.current ?? 0) - (stats?.overall.previous ?? 0);

  const getColorForDifference = (difference: number) => {
    if (difference > 0 && difference < 10) {
      return "#51a2ff";
    } else if (difference >= 10 && difference < 50) {
      return "#ffb900";
    } else if (difference >= 50) {
      return "#ff6467";
    } else {
      return "#51a2ff";
    }
  };

  const radarPingId = "radar-ping-" + lat + "-" + lon;
  const radarPingLayerId = "radar-ping-layer-" + lat + "-" + lon;
  return (
    <Source id={radarPingId} type="geojson" data={circle}>
      <Layer
        id={radarPingLayerId}
        type="fill"
        paint={{
          "fill-color": getColorForDifference(difference),
          "fill-opacity": 0.2,
        }}
      />
    </Source>
  );
}
