import { db, eq } from "../db";
import { crime_report } from "../db/schema";
import { CrimeReport } from "../db/types";
import { haversineDistance } from "../utils";

export async function getCrimesInSimilarVicinity(crime: CrimeReport) {
  const { latitude, longitude, id } = crime;
  const vicinityRadiusKm = 0.5;

  // Fetch all the crimes from the database
  const allCrimes = await db
    .select()
    .from(crime_report)
    .where(eq(crime_report.verified, true));

  // Filter the crimes that are within the vicinity radius
  const similarCrimes = allCrimes.filter((otherCrime) => {
    // Skip the current crime
    if (otherCrime.id === id) return false;

    // Calculate the distance between the two crimes
    const distance = haversineDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(otherCrime.latitude),
      parseFloat(otherCrime.longitude)
    );

    // Include the crime if it's within the vicinity radius
    return distance <= vicinityRadiusKm;
  });

  return similarCrimes;
}
