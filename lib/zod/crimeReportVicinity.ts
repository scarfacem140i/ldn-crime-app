import { z } from "zod";
import { createUpdateSchema } from "drizzle-zod";
import { crime_flag, crime_report, crime_vote } from "../db/schema";

const crimeReportFlags = createUpdateSchema(crime_flag);
const crimeReportVotes = createUpdateSchema(crime_vote);

export const crimeReportVicinitySchema = createUpdateSchema(crime_report, {
  id: z.string(),
  longitude: z.string(),
  latitude: z.string(),
  flags: crimeReportFlags,
  votes: crimeReportVotes,
});

export type CrimeReportVicinity = z.infer<typeof crimeReportVicinitySchema>;
