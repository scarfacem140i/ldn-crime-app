"use client";

import { isAfter, isBefore } from "date-fns";
import {
  parseAsArrayOf,
  parseAsFloat,
  parseAsIsoDate,
  parseAsString,
  useQueryState,
} from "nuqs";
import { useMemo } from "react";
import { crimeCategories } from "@/lib/types/filters";
import { api_crime_report } from "@/lib/db/schema"; // Adjust path as needed
import { InferSelectModel } from "drizzle-orm";

// Define type matching your schema
type ApiCrimeReport = InferSelectModel<typeof api_crime_report>;

/**
 * Custom hook to filter crime data based on URL parameters
 */
export function useFilteredPoliceCrimes(crimeData: ApiCrimeReport[]) {
  // Get filter parameters from URL query state
  const [categories] = useQueryState(
    "categories",
    parseAsArrayOf(parseAsString).withDefault(crimeCategories)
  );
  const [startDate] = useQueryState("startDate", parseAsIsoDate);
  const [endDate] = useQueryState("endDate", parseAsIsoDate);
  const [distance] = useQueryState("distance", parseAsFloat.withDefault(5));

  const filteredCrimeData = useMemo(() => {
    return crimeData.filter((crime) => {
      // Filter by category
      if (categories.length > 0 && !categories.includes(crime.category)) {
        return false;
      }

      // Use the actual crime occurrence time (month)
      const crimeMonth = new Date(crime.month);

      // Filter by start date
      if (startDate && isBefore(crimeMonth, new Date(startDate))) {
        return false;
      }

      // Filter by end date
      if (endDate && isAfter(crimeMonth, new Date(endDate))) {
        return false;
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
