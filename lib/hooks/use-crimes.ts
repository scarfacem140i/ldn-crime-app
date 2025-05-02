"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import {
  CrimeReport,
  CrimeReportWithStatsAndUser,
  type CrimeReportWithStats,
} from "@/lib/db/types";
import { toast } from "sonner";
import { type ReportCrimeFormData } from "@/components/forms/crime-report-form";
import { POSTCODE_STATISTICS_QUERY_KEY } from "./use-postcode-tracker-statistics";

// Simplified query key for all crime-related queries
const CRIMES_QUERY_KEY = ["crimes"] as const;

/**
 * Fetch all crime data
 * @returns Promise with crime data
 */
export const fetchCrimes = async (): Promise<CrimeReportWithStats[]> => {
  const response = await fetch("/api/crimes");
  if (!response.ok) {
    throw new Error("Failed to fetch crime data");
  }
  return response.json();
};

/**
 * Hook for fetching crime data with React Query
 * @param initialData Optional initial data for hydration
 */
export function useCrimes(initialData?: CrimeReportWithStats[]) {
  return useQuery({
    queryKey: CRIMES_QUERY_KEY,
    queryFn: fetchCrimes,
    initialData,
  });
}

const fetchCrimesVicinity = async (
  crime: CrimeReportWithStats
): Promise<CrimeReportWithStats[]> => {
  const { votes, flags, userVote, ...crimeRest } = crime;
  const response = await fetch("/api/crimes/vicinity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...crimeRest }),
  });
  console.log(crimeRest);

  if (!response.ok) {
    throw new Error("Failed to fetch crime data");
  }

  return response.json();
};

export function useCrimeVicinity(
  crime: CrimeReportWithStats,
  initialData?: CrimeReportWithStats[]
) {
  return useQuery({
    queryKey: [...CRIMES_QUERY_KEY, "vicinity", crime.id],
    queryFn: () => fetchCrimesVicinity(crime),
    initialData,
  });
}

export const fetchCrimesWithStatsAndUser = async (): Promise<
  CrimeReportWithStatsAndUser[]
> => {
  const response = await fetch("/api/crimes/all");
  if (!response.ok) {
    throw new Error("Failed to fetch crime data");
  }
  return response.json();
};

export function useCrimeWithStatsAndUser(
  initialData?: CrimeReportWithStatsAndUser[]
) {
  return useQuery({
    queryKey: CRIMES_QUERY_KEY,
    queryFn: fetchCrimesWithStatsAndUser,
    initialData,
  });
}

/**
 * Hook for reporting a new crime
 */
export function useReportCrime() {
  const queryClient = useQueryClient();
  const session = useSession();

  return useMutation({
    mutationFn: async (crimeData: ReportCrimeFormData) => {
      // Check authentication first
      if (!session.data?.user?.id) {
        throw new Error("User must be authenticated to report a crime");
      }

      const response = await fetch("/api/crimes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(crimeData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to report crime");
      }

      return response.json();
    },
    onMutate: async (newCrime) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: CRIMES_QUERY_KEY });

      // Get the current data
      const previousCrimes =
        queryClient.getQueryData<CrimeReportWithStats[]>(CRIMES_QUERY_KEY);

      // Create an optimistic crime report
      const optimisticCrime: CrimeReportWithStats = {
        id: "temp-" + Date.now(),
        ...newCrime,
        created_at: new Date(),
        verified: false,
        votes: { upvotes: 0, downvotes: 0 },
        flags: 0,
        userVote: 0,
        user_id: session.data!.user.id,
      };

      // Update the cache with the new crime
      queryClient.setQueryData<CrimeReportWithStats[]>(
        CRIMES_QUERY_KEY,
        (old) => [optimisticCrime, ...(old || [])]
      );

      return { previousCrimes };
    },
    onError: (err, newCrime, context) => {
      // Revert the cache to its previous state
      if (context?.previousCrimes) {
        queryClient.setQueryData(CRIMES_QUERY_KEY, context.previousCrimes);
      }
      toast.error("Failed to report crime", {
        description: err.message,
      });
    },
    onSuccess: () => {
      // Invalidate crimes query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: CRIMES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: POSTCODE_STATISTICS_QUERY_KEY,
      });
      toast.success("Crime reported successfully");
    },
  });
}

export function useAdminVerifyCrime() {
  const queryClient = useQueryClient();

  type MutationFnProps = {
    crimeId: string;
    verified: boolean;
  };

  return useMutation({
    mutationFn: async ({ crimeId, verified }: MutationFnProps) => {
      const response = await fetch(`/api/crimes/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: crimeId, verified }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify crime");
      }

      return response.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CRIMES_QUERY_KEY });
    },
  });
}

/**
 * Hook for voting on a crime report
 */
export function useVoteCrime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      crimeId,
      vote,
    }: {
      crimeId: string;
      vote: number;
    }) => {
      const response = await fetch(`/api/crimes/${crimeId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vote }),
      });

      if (!response.ok) {
        throw new Error("Failed to vote on crime report");
      }

      return response.json();
    },
    onMutate: async ({ crimeId, vote }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: CRIMES_QUERY_KEY });

      // Snapshot the previous value
      const previousCrimes =
        queryClient.getQueryData<CrimeReportWithStats[]>(CRIMES_QUERY_KEY);

      // Optimistically update the cache
      if (previousCrimes) {
        queryClient.setQueryData<CrimeReportWithStats[]>(
          CRIMES_QUERY_KEY,
          (old) =>
            old?.map((crime) => {
              if (crime.id === crimeId) {
                const oldVote = crime.userVote;
                return {
                  ...crime,
                  userVote: vote,
                  votes: {
                    ...crime.votes,
                    upvotes:
                      crime.votes.upvotes +
                      (vote === 1 ? 1 : oldVote === 1 ? -1 : 0),
                    downvotes:
                      crime.votes.downvotes +
                      (vote === -1 ? 1 : oldVote === -1 ? -1 : 0),
                  },
                };
              }
              return crime;
            })
        );
      }

      return { previousCrimes };
    },
    onError: (err, variables, context) => {
      // Revert the optimistic update on error
      if (context?.previousCrimes) {
        queryClient.setQueryData(CRIMES_QUERY_KEY, context.previousCrimes);
      }
      toast.error("Failed to update vote");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({ queryKey: CRIMES_QUERY_KEY });
    },
  });
}
