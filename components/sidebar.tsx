"use client";

import { cn } from "@/lib/utils";
import { Timeline } from "./timeline";
import { CrimeFilters } from "./crime-filters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type CrimeReportWithStats } from "@/lib/db/types";
import { useCrimes } from "@/lib/hooks/use-crimes";

interface SidebarProps {
  className?: string;
  crimes: CrimeReportWithStats[];
}

export function Sidebar({ className, crimes }: SidebarProps) {
  // Use React Query for real-time data updates
  const { data: crimeData } = useCrimes(crimes);

  return (
    <div className={cn("flex flex-col h-dvh", className)}>
      <Tabs defaultValue="timeline" className="w-full">
        <div className="p-2">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="timeline" className="flex-grow p-0 m-0 border-t">
          <Timeline crimes={crimeData || crimes} />
        </TabsContent>
        <TabsContent value="filters" className="flex-grow p-0 m-0 border-t">
          <CrimeFilters />
        </TabsContent>
      </Tabs>
    </div>
  );
}
