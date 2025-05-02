import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq, InferSelectModel } from "drizzle-orm";
import { api_crime_report, api_report_count } from "@/lib/db/schema";

type ApiCrime = InferSelectModel<typeof api_crime_report>;

const API_KEY = process.env.POLICE_API_KEY;

const GRID_BOUNDS = {
  north: 51.691874,
  south: 51.28676,
  west: -0.510375,
  east: 0.334015,
};

const GRID_DIVISIONS = 10;
const API_RATE_LIMIT_DELAY = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { yearMonth } = body;

    // Default to 2 months ago if not provided
    if (!yearMonth || !body) {
      const now = new Date();
      now.setMonth(now.getMonth() - 2);
      const year = now.getFullYear();
      const month = String(now.getMonth()).padStart(2, "0");
      yearMonth = `${year}-${month}`;
      console.log(`No yearMonth provided. Defaulting to: ${yearMonth}`);
    }

    console.log(`Received request to sync crimes for: ${yearMonth}`);

    const apiKey = req.headers.get("Authorization");
    if (!apiKey || apiKey !== `Bearer ${API_KEY}`) {
      console.error("Invalid or missing API key.");
      return NextResponse.json(
        { error: "Invalid or missing API key" },
        { status: 401 }
      );
    }

    const monthTimestamp = new Date(`${yearMonth}-01`);

    // Check if this month has already been synced
    const existing = await db.query.api_report_count.findFirst({
      where: eq(api_report_count.month, monthTimestamp),
    });

    if (existing) {
      console.log("This month has already been synced.");
      return NextResponse.json(
        { message: "Already synced this month" },
        { status: 200 }
      );
    }

    const crimesToInsert: ApiCrime[] = [];
    let totalFetched = 0;

    const latStep = (GRID_BOUNDS.north - GRID_BOUNDS.south) / GRID_DIVISIONS;
    const lonStep = (GRID_BOUNDS.east - GRID_BOUNDS.west) / GRID_DIVISIONS;

    console.log("Starting to fetch crime data...");

    for (let i = 0; i < GRID_DIVISIONS; i++) {
      for (let j = 0; j < GRID_DIVISIONS; j++) {
        const topLeft = [
          GRID_BOUNDS.north - i * latStep,
          GRID_BOUNDS.west + j * lonStep,
        ];
        const topRight = [topLeft[0], topLeft[1] + lonStep];
        const bottomRight = [topLeft[0] - latStep, topLeft[1] + lonStep];
        const bottomLeft = [topLeft[0] - latStep, topLeft[1]];

        const polygon = [topLeft, topRight, bottomRight, bottomLeft]
          .map(([lat, lon]) => `${lat},${lon}`)
          .join(":");

        const url = `https://data.police.uk/api/crimes-street/all-crime?date=${yearMonth}&poly=${polygon}`;

        try {
          console.log(`Fetching data for polygon: ${polygon}`);
          const res = await fetch(url);
          if (!res.ok) {
            console.error(
              `Failed to fetch data from: ${url}, Status: ${res.status}`
            );
            continue;
          }

          const crimes = await res.json();
          console.log(
            `Fetched ${crimes.length} crimes for polygon: ${polygon}`
          );

          const existingCrimeIds = new Set();

          crimes.forEach((crime: any) => {
            if (
              !crime.location ||
              !crime.location.latitude ||
              !crime.location.longitude
            ) {
              console.warn(`Invalid crime data: ${JSON.stringify(crime)}`);
              return;
            }

            if (existingCrimeIds.has(crime.id)) {
              return;
            }

            existingCrimeIds.add(crime.id);

            crimesToInsert.push({
              id: `api-${crime.id}`,
              category: crime.category,
              description: "Imported from Police API",
              latitude: crime.location.latitude,
              longitude: crime.location.longitude,
              street_name: crime.location.street?.name || "Unknown",
              month: monthTimestamp,
              outcome_status: crime.outcome_status?.category ?? null,
              context: crime.context ?? null,
              verified: false,
              created_at: new Date(),
            });
          });

          totalFetched += crimes.length;

          console.log(
            `Adding delay of ${API_RATE_LIMIT_DELAY}ms to avoid hitting API rate limit...`
          );
          await sleep(API_RATE_LIMIT_DELAY);
        } catch (err) {
          console.error(`Fetch error at polygon ${polygon}:`, err);
        }
      }
    }

    console.log(`Total crimes fetched: ${totalFetched}`);

    if (crimesToInsert.length === 0) {
      console.warn("No valid crimes to insert.");
    }

    const chunkSize = 500;
    let insertCount = 0;
    for (let i = 0; i < crimesToInsert.length; i += chunkSize) {
      try {
        console.log(`Inserting chunk ${Math.floor(i / chunkSize) + 1}`);
        await db
          .insert(api_crime_report)
          .values(crimesToInsert.slice(i, i + chunkSize));
        insertCount += crimesToInsert.slice(i, i + chunkSize).length;
      } catch (err) {
        console.error(
          `Error inserting chunk ${Math.floor(i / chunkSize) + 1}:`,
          err
        );
      }
    }

    console.log(`Successfully inserted ${insertCount} crimes.`);

    // Insert into api_report_count if not already present
    const existingReportCount = await db.query.api_report_count.findFirst({
      where: eq(api_report_count.month, monthTimestamp),
    });

    if (!existingReportCount && totalFetched !== 0) {
      console.log("Inserting report count into api_report_count...");
      await db.insert(api_report_count).values({
        id: crypto.randomUUID(),
        month: monthTimestamp,
        count: totalFetched,
      });
      console.log("Report count inserted successfully.");
    } else {
      console.log(
        "Report count for this month already exists, skipping insert."
      );
    }

    return NextResponse.json({
      message: `Inserted ${insertCount} crimes from Police API`,
    });
  } catch (err) {
    console.error("Unexpected error in POST handler:", err);
    return NextResponse.json(
      { error: "Unexpected error occurred" },
      { status: 500 }
    );
  }
}
