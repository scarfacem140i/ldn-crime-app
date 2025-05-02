"use client";

import { CrimeFilters } from "@/components/crime-filters";
import { Timeline } from "@/components/timeline";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "@/lib/auth-client";
import { CrimeReportWithStats } from "@/lib/db/types";
import { useCrimeReport } from "@/lib/hooks/use-crime-report";
import { useCrimes } from "@/lib/hooks/use-crimes";
import { cn } from "@/lib/utils";
import { Filter, List, Map, Plus, Search, X } from "lucide-react";
import CrimeReportDialog from "./report/crime-report-dialog";

interface MobileNavigationProps {
  className?: string;
  crimes: CrimeReportWithStats[];
}

export function MobileNavigation({ className, crimes }: MobileNavigationProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const {
    isDroppingPin,
    pinDrop,
    isDialogOpen,
    handlePinDrop,
    handleOpenDialog,
    handleCloseDialog,
  } = useCrimeReport();

  // Use React Query for real-time data updates
  const { data: crimeData } = useCrimes(crimes);

  return (
    <div className={cn("border-t py-2 px-4", className)}>
      <div className="flex gap-6 items-center">
        <div className="flex gap-6 mr-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <List className="h-5 w-5" />
                <span className="sr-only">Timeline</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] sm:w-[350px] p-0">
              <Timeline crimes={crimeData || crimes} />
            </SheetContent>
          </Sheet>

          <div className="flex gap-6 relative mx-auto">
            <Button variant="ghost" size="icon">
              <Map className="h-5 w-5" />
              <span className="sr-only">Map</span>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Filter className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full"></span>
                  <span className="sr-only">Filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80%] rounded-t-xl">
                <div className="h-1.5 w-12 bg-muted rounded-full mx-auto mb-6 mt-2"></div>
                <CrimeFilters />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-2 -mx-3">
            {isDroppingPin && pinDrop && (
              <Button variant="outline" onClick={handleOpenDialog}>
                Report
              </Button>
            )}
            <Button
              size="icon"
              className={`rounded-full ${"bg-primary"}`}
              onClick={handlePinDrop}
            >
              {isDroppingPin ? (
                <X className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
              <span className="sr-only">
                {isDroppingPin ? "Report Crime" : "Pin a Crime"}
              </span>
            </Button>
          </div>
        )}

        <CrimeReportDialog open={isDialogOpen} onClose={handleCloseDialog} />
      </div>
    </div>
  );
}
