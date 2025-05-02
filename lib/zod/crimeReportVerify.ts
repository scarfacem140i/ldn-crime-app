import { z } from "zod";

export const crimeReportVerifySchema = z.object({
  id: z.string(),
  verified: z.boolean(),
});
