import { db } from "@/lib/db";
import {
  crime_report,
  api_crime_report,
  api_report_count,
} from "@/lib/db/schema";
import { haversineDistance } from "@/lib/utils";
import { asc, between, eq } from "drizzle-orm";

const POSTCODE_STATISTICS_FREQUENCY_IN_MINUTES = 60;
const RADIUS_KM = 1;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const radiusKm = Number(searchParams.get("radius") ?? RADIUS_KM);
  const minutes = Number(
    searchParams.get("minutes") ?? POSTCODE_STATISTICS_FREQUENCY_IN_MINUTES
  );

  if (isNaN(lat) || isNaN(lon)) {
    return new Response(
      JSON.stringify({ error: "Missing or invalid lat/lon" }),
      { status: 400 }
    );
  }

  const now = new Date();
  const currentWindowStart = new Date(now.getTime() - minutes * 60 * 1000);
  const previousWindowStart = new Date(
    currentWindowStart.getTime() - minutes * 60 * 1000
  );

  // Fetch user-submitted crimes
  const userCrimes = await fetchUserCrimes(previousWindowStart, now);

  const nearbyUserCrimes = filterCrimesByRadius(userCrimes, lat, lon, radiusKm);

  const userCurrentCrimes = nearbyUserCrimes.filter(
    (c) => c.created_at >= currentWindowStart
  );
  const userPreviousCrimes = nearbyUserCrimes.filter(
    (c) =>
      c.created_at >= previousWindowStart && c.created_at < currentWindowStart
  );

  // Fetch the earliest two available police months from api_report_count
  const policeMonths = await fetchPoliceMonths();

  if (policeMonths.length < 2) {
    return new Response(
      JSON.stringify({ error: "Not enough police report data available" }),
      { status: 400 }
    );
  }

  const previousPoliceMonth = policeMonths[0].month;
  const currentPoliceMonth = policeMonths[1].month;

  // Fetch police crimes for the two earliest months
  const policePreviousMonthCrimes = await fetchPoliceCrimes(
    previousPoliceMonth
  );
  const policeCurrentMonthCrimes = await fetchPoliceCrimes(currentPoliceMonth);

  // Filter police crimes by radius
  const filteredPolicePreviousMonthCrimes = filterCrimesByRadius(
    policePreviousMonthCrimes,
    lat,
    lon,
    radiusKm
  );

  const filteredPoliceCurrentMonthCrimes = filterCrimesByRadius(
    policeCurrentMonthCrimes,
    lat,
    lon,
    radiusKm
  );

  // === Final Output Sections ===

  const overallCurrentCrimes = [
    ...userCurrentCrimes,
    ...filteredPoliceCurrentMonthCrimes,
  ];

  const overallPreviousCrimes = [
    ...userPreviousCrimes,
    ...filteredPolicePreviousMonthCrimes,
  ];

  const overall = {
    current: overallCurrentCrimes.length,
    previous: overallPreviousCrimes.length,
    percentageChange: calculatePercentageChange(
      overallPreviousCrimes.length,
      overallCurrentCrimes.length
    ),
    mostCommonCategory: getMostCommonOverallCategory(overallCurrentCrimes),
  };

  const userCategoryStats = calculateCategoryStats(
    userCurrentCrimes,
    userPreviousCrimes
  );
  const mostCommonUserCategory = getMostCommonCategory(userCategoryStats);

  const policeCategoryStats = calculateCategoryStats(
    filteredPoliceCurrentMonthCrimes,
    filteredPolicePreviousMonthCrimes
  );
  const mostCommonPoliceCategory = getMostCommonCategory(policeCategoryStats);

  return new Response(
    JSON.stringify({
      user: {
        mostCommonCategory: mostCommonUserCategory,
        current: userCurrentCrimes.length,
        previous: userPreviousCrimes.length,
        categories: userCategoryStats,
      },
      police: {
        mostCommonCategory: mostCommonPoliceCategory,
        current: filteredPoliceCurrentMonthCrimes.length,
        previous: filteredPolicePreviousMonthCrimes.length,
        categories: policeCategoryStats,
      },
      overall,
    }),
    { status: 200 }
  );
}

function calculatePercentageChange(previous: number, current: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// === Helper Functions ===

async function fetchUserCrimes(previousWindowStart: Date, now: Date) {
  return db
    .select()
    .from(crime_report)
    .where(between(crime_report.created_at, previousWindowStart, now));
}

function filterCrimesByRadius(
  crimes: any[],
  lat: number,
  lon: number,
  radiusKm: number
) {
  return crimes.filter(
    (crime) =>
      haversineDistance(
        Number(crime.latitude),
        Number(crime.longitude),
        lat,
        lon
      ) <= radiusKm
  );
}

async function fetchPoliceMonths() {
  return db
    .select()
    .from(api_report_count)
    .orderBy(asc(api_report_count.month));
}

async function fetchPoliceCrimes(month: Date) {
  return db
    .select()
    .from(api_crime_report)
    .where(eq(api_crime_report.month, month));
}

function calculateCategoryStats(currentCrimes: any[], previousCrimes: any[]) {
  const categoryStats: Record<
    string,
    { current: number; previous: number; percentageChange: number }
  > = {};

  for (const crime of currentCrimes) {
    const category = crime.category || "unknown";
    categoryStats[category] ||= {
      current: 0,
      previous: 0,
      percentageChange: 0,
    };
    categoryStats[category].current += 1;
  }

  for (const crime of previousCrimes) {
    const category = crime.category || "unknown";
    categoryStats[category] ||= {
      current: 0,
      previous: 0,
      percentageChange: 0,
    };
    categoryStats[category].previous += 1;
  }

  // Calculate percentage change for each category
  for (const category in categoryStats) {
    const { previous, current } = categoryStats[category];
    categoryStats[category].percentageChange = calculatePercentageChange(
      previous,
      current
    );
  }

  return categoryStats;
}

function getMostCommonCategory(
  categoryStats: Record<string, { current: number }>
) {
  let mostCommonCategory: string | null = null;
  let mostCommonCount = 0;
  for (const category in categoryStats) {
    if (categoryStats[category].current > mostCommonCount) {
      mostCommonCategory = category;
      mostCommonCount = categoryStats[category].current;
    }
  }
  return mostCommonCategory;
}

function getMostCommonOverallCategory(...crimeLists: any[][]): string | null {
  const categoryCounts: Record<string, number> = {};

  for (const crimes of crimeLists) {
    for (const crime of crimes) {
      const category = crime.category || "unknown";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
  }

  let mostCommonCategory: string | null = null;
  let mostCommonCount = 0;
  for (const category in categoryCounts) {
    if (categoryCounts[category] > mostCommonCount) {
      mostCommonCategory = category;
      mostCommonCount = categoryCounts[category];
    }
  }

  return mostCommonCategory;
}
