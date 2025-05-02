"use client";

import { Marker } from "@vis.gl/react-maplibre";
import { Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseAsJson, useQueryState } from "nuqs";
import { z } from "zod";
import { MarkerEvent } from "@vis.gl/react-maplibre";
import { Button } from "../ui/button";

export const pinDropSchema = z.object({
  latitude: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= -90 && Number(val) <= 90,
      {
        message: "Latitude must be a number between -90 and 90",
      }
    ),
  longitude: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= -180 && Number(val) <= 180,
      {
        message: "Longitude must be a number between -180 and 180",
      }
    ),
});

export default function PinDrop() {
  const [pinDrop, setPinDrop] = useQueryState(
    "pinDrop",
    parseAsJson(pinDropSchema.parse)
  );

  if (!pinDrop) {
    return null;
  }

  const handleMarkerClick = (e: MarkerEvent<MouseEvent>) => {
    e.originalEvent.stopPropagation();
    setPinDrop(null);
  };

  return (
    <Marker
      longitude={Number(pinDrop.longitude)}
      latitude={Number(pinDrop.latitude)}
      onClick={(e) => handleMarkerClick(e)}
    >
      <Button variant="outline" size="icon" className={cn("rounded-full")}>
        <Pin className="animate-pulse" />
      </Button>
    </Marker>
  );
}
