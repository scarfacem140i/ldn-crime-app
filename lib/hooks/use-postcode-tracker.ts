import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { toast } from "sonner";
import { tracked_postcode } from "../db/schema";

type InsertTrackedPostcode = Omit<
  InferInsertModel<typeof tracked_postcode>,
  "id"
>;
type TrackedPostcode = InferSelectModel<typeof tracked_postcode>;

const queryKey = ["postcode"];

async function fetchPostcodes(): Promise<TrackedPostcode[]> {
  const resp = await fetch(`/api/postcode`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!resp.ok) {
    throw new Error("Failed to fetch postcodes");
  }
  return await resp.json();
}

async function addPostcode(postcode: InsertTrackedPostcode): Promise<void> {
  const resp = await fetch(`/api/postcode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postcode),
  });
  if (!resp.ok) {
    const { error } = await resp.json();
    throw new Error(error ?? "Failed to add postcode");
  }
}

async function removePostcode(postcodeId: string): Promise<void> {
  const resp = await fetch(`/api/postcode`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: postcodeId }),
  });
  if (!resp.ok) {
    const { error } = await resp.json();
    throw new Error(error ?? "Failed to remove postcode");
  }
}

export function usePostcodeTracker() {
  const queryClient = useQueryClient();

  const getQuery = useQuery<TrackedPostcode[]>({
    queryKey,
    queryFn: fetchPostcodes,
  });

  const addMutation = useMutation({
    mutationFn: addPostcode,
    onSuccess: () => {
      toast.success("Postcode now being tracked");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      toast.error(error.message ?? "Failed to track postcode");
    },
  });

  const removeMutation = useMutation({
    mutationFn: removePostcode,
    onSuccess: () => {
      toast.success("Postcode no longer being tracked");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      toast.error(error.message ?? "Failed to untrack postcode");
    },
  });

  return { getQuery, addMutation, removeMutation };
}
