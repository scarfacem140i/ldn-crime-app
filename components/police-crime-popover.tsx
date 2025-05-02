"use client";
import { api_crime_report } from "@/lib/db/schema";
import { Popup, useMap } from "@vis.gl/react-maplibre";
import { InferSelectModel } from "drizzle-orm";
import { parseAsString, useQueryState } from "nuqs";
import React from "react";
import { DEFAULT_ZOOM } from "./map/base-map";
import { CrimeCard } from "./police-crime-card";

type ApiCrimeReport = InferSelectModel<typeof api_crime_report>;

export const PoliceCrimePopover: React.FC<{
  crime: ApiCrimeReport;
  center: { longitude: number; latitude: number };
}> = ({ crime, center }) => {
  const [, setReportId] = useQueryState("policeReportId", parseAsString);
  const { current: map } = useMap();

  const handleClose = () => {
    setReportId(null);
    map?.flyTo({
      center: [center.longitude, center.latitude],
      zoom: DEFAULT_ZOOM,
    });
  };

  return (
    <Popup
      longitude={Number(crime?.longitude)}
      latitude={Number(crime?.latitude)}
      onClose={handleClose}
      closeButton={false}
      style={{ maxWidth: "280px", padding: "0" }}
      className="relative bg-none"
    >
      <CrimeCard crime={crime} />
    </Popup>
  );
};
