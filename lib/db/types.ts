import { type InferSelectModel } from "drizzle-orm";
import { crime_report, crime_vote, crime_flag } from "./schema";
import { user } from "./auth-schema";

export type CrimeReport = InferSelectModel<typeof crime_report>;
export type CrimeVote = InferSelectModel<typeof crime_vote>;
export type CrimeFlag = InferSelectModel<typeof crime_flag>;

// Extended type for crime reports with aggregated votes and flags
export interface CrimeReportWithStats extends CrimeReport {
  votes: {
    upvotes: number;
    downvotes: number;
  };
  userVote?: number;
  flags: number;
}

export interface CrimeReportWithStatsAndUser extends CrimeReportWithStats {
  user: InferSelectModel<typeof user>;
}
