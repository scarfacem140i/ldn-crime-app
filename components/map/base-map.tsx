"use client";

import { CrimeReportWithStats } from "@/lib/db/types";
import { useCrimes } from "@/lib/hooks/use-crimes";
import { useFilteredCrimes } from "@/lib/hooks/use-filtered-crimes";
import { usePostcodeTracker } from "@/lib/hooks/use-postcode-tracker";
import { cn } from "@/lib/utils";
import { useMapContext } from "@/providers/MapProvider";
import {
  Map,
  MapLayerMouseEvent,
  Marker,
  MarkerEvent,
} from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  parseAsBoolean,
  parseAsJson,
  parseAsString,
  useQueryState,
} from "nuqs";
import { BaseMapPopover } from "./base-map-popover";
import { CrimeIcon } from "../crime-icon";
import PoliceCrimeMarkers from "../police-crime-markers";
import { PostcodeTracker } from "../postcode-tracker/postcode-tracker";
import { RadarPing } from "./radar-ping";
import { Button } from "../ui/button";
import { HeatmapLayer } from "./heatmap-layer";
import PinDrop, { pinDropSchema } from "../report/pindrop";

export const LONDON_CENTER = { longitude: -0.1278, latitude: 51.5074 };
export const DEFAULT_ZOOM = 12;
export const ZOOMED_IN_ZOOM = 16;
export const MAP_BOUNDS = {
  north: 51.691874,
  south: 51.28676,
  west: -0.510375,
  east: 0.334015,
};

export function BaseMap({ crimeData }: { crimeData: CrimeReportWithStats[] }) {
  const [reportId, setReportId] = useQueryState("reportId", parseAsString);
  const [showPoliceData] = useQueryState(
    "showPoliceData",
    parseAsBoolean.withDefault(true)
  );
  const [showHeatmap] = useQueryState(
    "showHeatmap",
    parseAsBoolean.withDefault(true)
  );
  const [showPostcodeTrackerRings] = useQueryState(
    "showPostcodeTrackerRings",
    parseAsBoolean.withDefault(true)
  );
  const [showUserReports] = useQueryState(
    "showUserReports",
    parseAsBoolean.withDefault(true)
  );
  const [, setPinDrop] = useQueryState(
    "pinDrop",
    parseAsJson(pinDropSchema.parse)
  );
  const [isDroppingPin, setIsDroppingPin] = useQueryState(
    "droppingPin",
    parseAsBoolean
  );
  const { mapRef } = useMapContext();

  const { data: crimes } = useCrimes(crimeData);
  const { filteredCrimeData } = useFilteredCrimes(crimes || []);
  const currentReport = filteredCrimeData.find(
    (report) => report.id === reportId
  );

  const onMarkerClick = (e: MarkerEvent<MouseEvent>, id: string) => {
    e.originalEvent.stopPropagation();
    setReportId(id);
    const targetReport = filteredCrimeData.find((report) => report.id === id);
    if (mapRef.current && targetReport) {
      mapRef.current.flyTo({
        center: [Number(targetReport.longitude), Number(targetReport.latitude)],
        zoom: ZOOMED_IN_ZOOM,
      });
    }
  };

  const handlePinDrop = (e: MapLayerMouseEvent) => {
    if (!isDroppingPin) return;
    const { lngLat } = e;
    setPinDrop({ longitude: String(lngLat.lng), latitude: String(lngLat.lat) });
    if (e.originalEvent.target === e.originalEvent.currentTarget)
      setIsDroppingPin(null);
  };

  const { getQuery: postcodeTrackersPings } = usePostcodeTracker();

  return (
    <Map
      initialViewState={{
        ...LONDON_CENTER,
        zoom: DEFAULT_ZOOM,
      }}
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        cursor: isDroppingPin ? "crosshair" : "",
        position: "relative",
      }}
      maxBounds={[
        [MAP_BOUNDS.west, MAP_BOUNDS.south],
        [MAP_BOUNDS.east, MAP_BOUNDS.north],
      ]}
      mapStyle="https://tiles.openfreemap.org/styles/positron"
      onClick={(e) => handlePinDrop(e)}
    >
      {showHeatmap && <HeatmapLayer />}
      {showPostcodeTrackerRings && <PostcodeTracker />}
      {showPostcodeTrackerRings &&
        postcodeTrackersPings.data?.map((ping) => {
          return (
            <RadarPing
              key={ping.id}
              lat={Number(ping.latitude)}
              lon={Number(ping.longitude)}
              kmRadius={1}
            />
          );
        })}
      {showUserReports && (
        <CrimeMarkers
          filteredCrimeData={filteredCrimeData}
          onMarkerClick={onMarkerClick}
          reportId={reportId}
        />
      )}
      {showPoliceData && <PoliceCrimeMarkers />}

      <PinDrop />
      {currentReport && (
        <BaseMapPopover crime={currentReport} center={LONDON_CENTER} />
      )}
    </Map>
  );
}

function CrimeMarkers({
  filteredCrimeData,
  onMarkerClick,
  reportId,
}: {
  filteredCrimeData: CrimeReportWithStats[];
  onMarkerClick: (e: MarkerEvent<MouseEvent>, id: string) => void;
  reportId: string | null;
}) {
  return (
    <>
      {filteredCrimeData.map((crime) => (
        <Marker
          key={crime.id}
          longitude={Number(crime.longitude)}
          latitude={Number(crime.latitude)}
          onClick={(e) => onMarkerClick(e, crime.id)}
        >
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "rounded-full",
              crime.id === reportId && "border-primary shadow-lg"
            )}
          >
            <CrimeIcon
              className={cn("h-8 w-8", crime.id === reportId && "text-primary")}
              category={crime.category}
            />
          </Button>
        </Marker>
      ))}
    </>
  );
}
