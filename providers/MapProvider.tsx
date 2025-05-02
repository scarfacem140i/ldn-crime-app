"use client";

import React, { createContext, useContext, useRef, useEffect } from "react";
import { MapRef } from "@vis.gl/react-maplibre";

interface MapContextType {
  mapRef: React.RefObject<MapRef>;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const mapRef = useRef<MapRef>(null!);

  useEffect(() => {
    if (mapRef.current) {
      console.log("Map reference initialized", mapRef.current);
    }
  }, [mapRef.current]);

  return (
    <MapContext.Provider value={{ mapRef }}>{children}</MapContext.Provider>
  );
};

export const useMapContext = (): MapContextType => {
  const context = useContext(MapContext);

  if (!context) {
    throw new Error("useMapContext must be used within a MapProvider");
  }

  return context;
};
