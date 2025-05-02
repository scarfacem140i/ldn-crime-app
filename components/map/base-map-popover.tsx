"use client";
import { CrimeReportWithStats } from "@/lib/db/types";
import { Popup, useMap } from "@vis.gl/react-maplibre";
import { parseAsString, useQueryState } from "nuqs";
import React from "react";
import { DEFAULT_ZOOM } from "./base-map";
import { CrimeCard } from "../crime-card";

export const BaseMapPopover: React.FC<{
  crime: CrimeReportWithStats;
  center: { longitude: number; latitude: number };
}> = ({ crime, center }) => {
  const [, setReportId] = useQueryState("reportId", parseAsString);
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
