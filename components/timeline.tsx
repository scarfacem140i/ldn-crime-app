"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { type CrimeReportWithStats } from "@/lib/db/types";
import { useMapContext } from "@/providers/MapProvider";
import { parseAsString, useQueryState } from "nuqs";
import { DEFAULT_ZOOM, LONDON_CENTER, ZOOMED_IN_ZOOM } from "./map/base-map";
import { CrimeCard } from "./crime-card";
import { useFilteredCrimes } from "@/lib/hooks/use-filtered-crimes";
import { useCrimes } from "@/lib/hooks/use-crimes";

interface TimelineProps {
  crimes: CrimeReportWithStats[];
}

export function Timeline({ crimes }: TimelineProps) {
  const [reportId, setReportId] = useQueryState("reportId", parseAsString);
  const { mapRef } = useMapContext();

  // Use React Query for data fetching with initial data
  const { data: crimeData } = useCrimes(crimes);
  const { filteredCrimeData } = useFilteredCrimes(crimeData || []);

  const handleOnSelect = (id: string) => {
    setReportId(id);
    const currentReport = filteredCrimeData.find((report) => report.id === id);
    if (currentReport && mapRef.current) {
      if (reportId === id) {
        setReportId(null);
        mapRef.current.flyTo({
          center: [LONDON_CENTER.longitude, LONDON_CENTER.latitude],
          zoom: DEFAULT_ZOOM,
        });
        return;
      }
      mapRef.current.flyTo({
        center: [
          Number(currentReport.longitude),
          Number(currentReport.latitude),
        ],
        zoom: ZOOMED_IN_ZOOM,
      });
    }
  };

  return (
    <ScrollArea className="h-[calc(100dvh)] md:h-[calc(100dvh-8rem)]">
      <div className="h-full">
        <div className="px-4 py-3 bg-background sticky top-0 z-10">
          <h2 className="text-lg font-semibold">Recent Crime Reports</h2>
          <p className="text-sm text-muted-foreground">
            User submitted crime reports verified by our team.
          </p>
        </div>

        <div className="flex flex-col gap-4 h-full px-4 mt-1">
          {filteredCrimeData.map((crime) => (
            <CrimeCard
              crime={crime}
              key={crime.id}
              isSelected={reportId === crime.id}
              onSelect={handleOnSelect}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
