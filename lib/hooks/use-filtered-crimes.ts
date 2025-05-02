"use client";

import { CrimeReportWithStats } from "@/lib/db/types";
import { crimeCategories } from "@/lib/types/filters";
import { isAfter, isBefore } from "date-fns";
import {
  parseAsArrayOf,
  parseAsFloat,
  parseAsIsoDate,
  parseAsString,
  useQueryState
} from "nuqs";
import { useMemo } from "react";

/**
 * Custom hook to filter crime data based on URL parameters
 * This hook centralizes filtering logic for reuse across components
 */
export function useFilteredCrimes(crimeData: CrimeReportWithStats[]) {
  // Get filter parameters from URL query state
  const [categories] = useQueryState(
    "categories",
    parseAsArrayOf(parseAsString).withDefault(crimeCategories)
  );
  const [startDate] = useQueryState("startDate", parseAsIsoDate);
  const [endDate] = useQueryState("endDate", parseAsIsoDate);
  const [distance] = useQueryState("distance", parseAsFloat.withDefault(5));

  // Filter crime data based on URL parameters
  const filteredCrimeData = useMemo(() => {
    return crimeData.filter((crime) => {
      // Filter by category
      if (categories.length > 0 && !categories.includes(crime.category)) {
        return false;
      }

      // Filter by date range
      if (startDate && crime.created_at) {
        const crimeDate = new Date(crime.created_at);
        const filterStartDate = new Date(startDate);
        if (isBefore(crimeDate, filterStartDate)) {
          return false;
        }
      }

      if (endDate && crime.created_at) {
        const crimeDate = new Date(crime.created_at);
        const filterEndDate = new Date(endDate);
        if (isAfter(crimeDate, filterEndDate)) {
          return false;
        }
      }

      return true;
    });
  }, [crimeData, categories, startDate, endDate]);

  return {
    filteredCrimeData,
    filterParams: {
      categories,
      startDate,
      endDate,
      distance,
    },
  };
}
