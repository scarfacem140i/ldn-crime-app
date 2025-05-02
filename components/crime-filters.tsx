"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  crimeCategories,
  type CrimeFilterChangeParams,
} from "@/lib/types/filters";
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsFloat,
  parseAsIsoDate,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "nuqs";
import { useCallback } from "react";
import { DatePicker } from "./ui/date-picker";

interface CrimeFiltersProps {
  onFiltersChange?: (filters: CrimeFilterChangeParams) => void;
}

export function CrimeFilters({ onFiltersChange }: CrimeFiltersProps) {
  const [categories, setCategories] = useQueryState(
    "categories",
    parseAsArrayOf(parseAsString).withDefault(crimeCategories)
  );
  const [startDate, setStartDate] = useQueryState("startDate", parseAsIsoDate);
  const [endDate, setEndDate] = useQueryState("endDate", parseAsIsoDate);
  const [distance, setDistance] = useQueryState(
    "distance",
    parseAsFloat.withDefault(5)
  );
  const [showPoliceData, setShowPoliceData] = useQueryState(
    "showPoliceData",
    parseAsBoolean.withDefault(true)
  );
  const [showUserReports, setShowUserReports] = useQueryState(
    "showUserReports",
    parseAsBoolean.withDefault(true)
  );
  const [showHeatmap, setShowHeatmap] = useQueryState(
    "showHeatmap",
    parseAsBoolean.withDefault(true)
  );
  const [showPostcodeTrackerRings, setShowPostcodeTrackerRings] = useQueryState(
    "showPostcodeTrackerRings",
    parseAsBoolean.withDefault(true)
  );

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...categories, category]
      : categories.filter((c) => c !== category);
    setCategories(newCategories);
    notifyFiltersChange({
      categories: newCategories,
      startDate,
      endDate,
      distance,
      showPoliceData,
    });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date || null);
    notifyFiltersChange({
      categories,
      startDate: date || null,
      endDate,
      distance,
      showPoliceData,
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date || null);
    notifyFiltersChange({
      categories,
      startDate,
      endDate: date || null,
      distance,
      showPoliceData,
    });
  };

  const handleShowHeatmap = (checked: boolean) => {
    setShowHeatmap(checked);
    notifyFiltersChange({
      categories,
      startDate,
      endDate,
      distance,
      showPoliceData,
    });
  };

  const handleShowPoliceData = (checked: boolean) => {
    setShowPoliceData(checked);
    notifyFiltersChange({
      categories,
      startDate,
      endDate,
      distance,
      showPoliceData: checked,
    });
  };

  const handleShowPostcodeTrackerRings = (checked: boolean) => {
    setShowPostcodeTrackerRings(checked);
    notifyFiltersChange({
      categories,
      startDate,
      endDate,
      distance,
      showPoliceData,
    });
  };

  const handleUserReports = (checked: boolean) => {
    setShowUserReports(checked);
    notifyFiltersChange({
      categories,
      startDate,
      endDate,
      distance,
      showPoliceData: checked,
    });
  };

  const notifyFiltersChange = useCallback(
    (filters: CrimeFilterChangeParams) => {
      onFiltersChange?.(filters);
    },
    [onFiltersChange]
  );

  const handleReset = () => {
    setCategories(crimeCategories);
    setStartDate(null);
    setEndDate(null);
    setDistance(5);
    setShowPoliceData(true);
    setShowUserReports(true);
    setShowHeatmap(true);
    setShowPostcodeTrackerRings(true);

    notifyFiltersChange({
      categories: crimeCategories,
      startDate: null,
      endDate: null,
      distance: 5,
      showPoliceData: null,
    });
  };

  return (
    <ScrollArea className="h-[calc(100dvh-8rem-40px)]">
      <div className="p-4 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Crime Filters</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Filter crime data by category, date, and verification status
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Crime Categories</h4>
          <div className="grid grid-cols-2 gap-2">
            {crimeCategories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={categories.includes(category)}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category, checked as boolean)
                  }
                />
                <Label htmlFor={`category-${category}`}>{category}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Date Range</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="start-date">Start Date</Label>
              <DatePicker
                selected={startDate ?? undefined}
                onChange={handleStartDateChange}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="end-date">End Date</Label>
              <DatePicker
                selected={endDate ?? undefined}
                onChange={handleEndDateChange}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            The latest police crime data available is always two months behind
            the current date.{" "}
            <span className="text-primary hover:text-primary/60 underline">
              <a href="https://data.police.uk/docs/" target="_blank">
                Learn more
              </a>
            </span>
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Display Filters</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-heatmap"
                checked={showHeatmap}
                onCheckedChange={handleShowHeatmap}
              />
              <Label htmlFor="show-heatmap">Heatmap</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-police-data"
                checked={showPoliceData}
                onCheckedChange={handleShowPoliceData}
              />
              <Label htmlFor="show-police-data">Police Reports</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-postcode-tracker-rings"
                checked={showPostcodeTrackerRings}
                onCheckedChange={handleShowPostcodeTrackerRings}
              />
              <Label htmlFor="show-postcode-tracker-rings">
                Postcode Tracker Rings
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-user-reports"
                checked={showUserReports}
                onCheckedChange={handleUserReports}
              />
              <Label htmlFor="show-user-reports">User Reports</Label>
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-2">
          <Button
            className="flex-1"
            onClick={() =>
              notifyFiltersChange({
                categories,
                startDate,
                endDate,
                distance,
                showPoliceData,
              })
            }
          >
            Apply Filters
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
