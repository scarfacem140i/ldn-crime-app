import { z } from "zod";
import { crimeCategories } from "../types/filters";

export const crimeReportInsertSchema = z.object({
    category: z.string().refine((val) => crimeCategories.includes(val), {
      message: "Invalid category",
    }),
    description: z.string().min(10, "Description must be at least 10 characters"),
    latitude: z.string(),
    longitude: z.string(),
    street_name: z.string(),
  });