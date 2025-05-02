import "dotenv/config";
import { db } from "@/lib/db";
import { user } from "@/lib/db/auth-schema";
import { crime_report, crime_vote, crime_flag } from "@/lib/db/schema";

async function seed() {
  await db.delete(crime_vote);
  await db.delete(crime_flag);
  await db.delete(crime_report);

  console.log("🌱 Starting database seeding...\n");

  const USER_ID: string = "testuser";

  // Create crime reports
  const crimes = [
    {
      id: "crime1",
      category: "criminal-damage-arson",
      description: "Smartphone stolen from pedestrian by individual on bicycle",
      latitude: "51.5151",
      longitude: "-0.1415",
      street_name: "Oxford Street",
      user_id: USER_ID,
      verified: true,
      created_at: new Date("2024-03-04T14:30:00Z"),
    },
    {
      id: "crime2",
      category: "criminal-damage-arson",
      description:
        "Shop window broken during the night. CCTV footage being reviewed",
      latitude: "51.5388",
      longitude: "-0.1424",
      street_name: "Camden High Street",
      user_id: USER_ID,
      verified: true,
      created_at: new Date("2024-03-03T03:15:00Z"),
    },
    {
      id: "crime3",
      category: "violent-crime",
      description:
        "Verbal altercation escalated to physical confrontation outside pub",
      latitude: "51.4651",
      longitude: "-0.1146",
      street_name: "Brixton Road",
      user_id: USER_ID,
      verified: false,
      created_at: new Date("2024-03-03T23:45:00Z"),
    },
  ];

  console.log("🗺️ Inserting crime reports...");
  await db.insert(crime_report).values(crimes);

  // Create votes
  const votes = [
    { crime_id: "crime1", user_id: USER_ID, vote: 1 },
    { crime_id: "crime2", user_id: USER_ID, vote: 1 },
    { crime_id: "crime3", user_id: USER_ID, vote: -1 },
  ];

  console.log("👍 Inserting votes...");
  await db.insert(crime_vote).values(votes);

  // Create flags
  const flags = [
    {
      crime_id: "crime3",
      user_id: USER_ID,
      reason: "Insufficient details provided",
      created_at: new Date(),
    },
  ];

  console.log("🚩 Inserting flags...");
  await db.insert(crime_flag).values(flags);

  console.log("\n✅ Seeding completed successfully!");
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
