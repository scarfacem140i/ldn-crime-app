import { type CrimeReportWithStats } from "@/lib/db/types";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { useVoteCrime } from "@/lib/hooks/use-crimes";
import { useQueryClient } from "@tanstack/react-query";

// Import the query key constant
const CRIMES_QUERY_KEY = ["crimes"] as const;

type VoteDirection = "up" | "down";

interface UseVoteReturn {
  crime: CrimeReportWithStats;
  handleVote: (e: React.MouseEvent, direction: VoteDirection) => Promise<void>;
}

/**
 * Custom hook for handling voting on crime reports with optimistic updates using React Query
 * @param initialCrime The initial crime report with stats
 * @returns Object containing the current crime state and vote handler function
 */
export function useVote(initialCrime: CrimeReportWithStats): UseVoteReturn {
  const session = useSession();
  const queryClient = useQueryClient();
  const voteMutation = useVoteCrime();

  const handleVote = async (e: React.MouseEvent, direction: VoteDirection) => {
    e.stopPropagation();

    // Check if user is authenticated
    if (!session.data?.user) {
      toast.error("Please log in to vote on crime reports");
      return;
    }

    if (!initialCrime.id) return;

    const existingVote = initialCrime.userVote;
    const newVote =
      existingVote === (direction === "up" ? 1 : -1)
        ? 0 // Toggle off if clicking the same direction
        : direction === "up"
        ? 1 // Upvote
        : -1; // Downvote

    try {
      await voteMutation.mutateAsync({
        crimeId: initialCrime.id,
        vote: newVote,
      });
      // Immediately refetch to get the latest data
      await queryClient.invalidateQueries({ queryKey: CRIMES_QUERY_KEY });
    } catch (error) {
      console.error("❌ Vote request failed:", error);
      toast.error("Failed to update vote");
    }
  };

  // Get the latest crime data from the cache
  const currentCrime =
    queryClient
      .getQueryData<CrimeReportWithStats[]>(CRIMES_QUERY_KEY)
      ?.find((c) => c.id === initialCrime.id) ?? initialCrime;

  return { crime: currentCrime, handleVote };
}
