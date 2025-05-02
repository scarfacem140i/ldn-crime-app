import { useQuery } from "@tanstack/react-query";

export interface PostcodeStatisticsSection {
  current: number;
  previous: number;
  percentageChange: number;
  mostCommonCategory: string | null;
  categories: Record<
    string,
    {
      current: number;
      previous: number;
      percentageChange: number;
    }
  >;
}

export interface PostcodeStatistics {
  user: PostcodeStatisticsSection;
  police: PostcodeStatisticsSection;
  overall: {
    current: number;
    previous: number;
    percentageChange: number;
    mostCommonCategory: string | null;
  };
}

export const POSTCODE_STATISTICS_QUERY_KEY = ["postcodeStatistics"] as const;

const POSTCODE_STATISTICS_FREQUENCY_IN_MINUTES = 60;

export async function fetchPostcodeStatistics(params: {
  lat: number;
  lon: number;
  radiusKm?: number;
  minutesAgo?: number;
}): Promise<PostcodeStatistics> {
  const {
    lat,
    lon,
    radiusKm = 5,
    minutesAgo = POSTCODE_STATISTICS_FREQUENCY_IN_MINUTES,
  } = params;

  const searchParams = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    radius: radiusKm.toString(),
    minutes: minutesAgo.toString(),
  });

  const res = await fetch(
    `/api/postcode/statistics?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error ?? "Failed to fetch postcode statistics");
  }

  return res.json();
}

export function usePostcodeTrackerStatistics(params: {
  lat: number;
  lon: number;
  radiusKm?: number;
  minutesAgo?: number;
}) {
  const {
    lat,
    lon,
    radiusKm = 1,
    minutesAgo = POSTCODE_STATISTICS_FREQUENCY_IN_MINUTES,
  } = params;

  return useQuery<PostcodeStatistics>({
    queryKey: [POSTCODE_STATISTICS_QUERY_KEY, lat, lon, radiusKm, minutesAgo],
    queryFn: () =>
      fetchPostcodeStatistics({
        lat,
        lon,
        radiusKm,
        minutesAgo,
      }),
    enabled: !!lat && !!lon,
    staleTime: 1 * 60 * 1000,
    refetchInterval: 1 * 60 * 1000,
  });
}
