import { useQuery } from "@tanstack/react-query";
import { InferSelectModel } from "drizzle-orm";
import { api_crime_report } from "../db/schema";
import { parseAsIsoDate, useQueryState } from "nuqs";

type PoliceCrime = InferSelectModel<typeof api_crime_report>;

interface UsePoliceCrimesOptions {
  date?: string;
  limit?: number;
}

export function usePoliceCrimes(options?: UsePoliceCrimesOptions) {
  const { date, limit } = options || {};

  // Ensure startDate is valid and parsed correctly
  const [startDate] = useQueryState("startDate", parseAsIsoDate);

  // Check if startDate is valid before trying to use it
  const isValidStartDate = startDate && !isNaN(startDate.getTime());
  const monthYearString = isValidStartDate
    ? `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(
        2,
        "0"
      )}`
    : "";

  // Validate date and limit before using them
  const validDate = date && /^\d{4}-\d{2}$/.test(date); // Ensure date is in YYYY-MM format
  const validLimit =
    limit && Number.isInteger(limit) && limit > 0 && limit <= 1000;

  // Construct the query string
  const queryString = new URLSearchParams({
    ...(validDate ? { date } : monthYearString ? { monthYearString } : {}),
    ...(validLimit ? { limit: limit.toString() } : {}),
  }).toString();

  return useQuery<PoliceCrime[]>({
    queryKey: ["police-crimes", date, limit],
    queryFn: async () => {
      const res = await fetch(`/api/police-crimes?${queryString}`);
      if (!res.ok) {
        throw new Error("Failed to fetch police crimes");
      }
      return res.json();
    },
  });
}
