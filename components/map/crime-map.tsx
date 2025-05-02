"use client";

import { Card } from "@/components/ui/card";
import { useCrimes } from "@/lib/hooks/use-crimes";
import { type CrimeReportWithStats } from "@/lib/db/types";
import { Suspense } from "react";
import { BaseMap } from "./base-map";

interface CrimeMapProps {
  crimes: CrimeReportWithStats[];
}

export function CrimeMap({ crimes }: CrimeMapProps) {
  // Use React Query for real-time data updates
  const { data: crimeData } = useCrimes(crimes);

  return (
    <div className="relative h-full w-full">
      <Card className="bg-secondary h-full w-full flex items-center justify-center overflow-hidden">
        <Suspense>
          <BaseMap crimeData={crimeData || crimes} />
        </Suspense>
      </Card>
    </div>
  );
}
