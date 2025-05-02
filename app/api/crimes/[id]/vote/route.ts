import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { crime_vote, crime_report } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/crimes/[id]/vote
 *
 * Handles voting (upvote, downvote, or vote removal) on a crime report.
 *
 * Flow:
 * 1. Authenticates the user using session data from the request headers.
 * 2. Validates the crime report exists using the ID from the route parameters.
 * 3. Validates the `vote` value to ensure it's either 1 (upvote), -1 (downvote), or 0 (remove vote).
 * 4. If the vote is `0`, deletes the user's existing vote for the crime and returns the updated vote count.
 * 5. If the vote is 1 or -1, performs an upsert (insert or update) for the user's vote on that crime.
 * 6. Fetches the latest counts of upvotes and downvotes for the specified crime.
 * 7. Revalidates the homepage cache (presumably to reflect vote count changes).
 * 8. Returns the updated vote counts and the user's current vote.
 *
 * Returns appropriate status codes and messages for unauthenticated access,
 * invalid votes, crime not found, or unexpected server errors.
 */

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;
    const { vote } = await req.json();

    // Check if the crime exists in the crime_report table
    const crimeExists = await db.query.crime_report.findFirst({
      where: eq(crime_report.id, params.id),
    });

    if (!crimeExists) {
      return NextResponse.json({ error: "Crime not found" }, { status: 404 });
    }

    // Validate vote value
    if (![1, -1, 0].includes(vote)) {
      return NextResponse.json(
        { error: "Invalid vote value" },
        { status: 400 }
      );
    }

    // If vote is 0, remove the existing vote
    if (vote === 0) {
      await db
        .delete(crime_vote)
        .where(
          and(
            eq(crime_vote.crime_id, params.id),
            eq(crime_vote.user_id, userId)
          )
        );

      // Fetch updated vote counts after removal
      const [{ upvotes, downvotes }] = await db
        .select({
          upvotes: sql<number>`COUNT(*) FILTER (WHERE ${crime_vote.vote} = 1)`,
          downvotes: sql<number>`COUNT(*) FILTER (WHERE ${crime_vote.vote} = -1)`,
        })
        .from(crime_vote)
        .where(eq(crime_vote.crime_id, params.id));

      revalidatePath("/");

      return NextResponse.json({
        upvotes,
        downvotes,
        userVote: 0, // since vote is removed
      });
    }

    // Upsert vote (Insert if new, update if exists)
    await db
      .insert(crime_vote)
      .values({ crime_id: params.id, user_id: userId, vote })
      .onConflictDoUpdate({
        target: [crime_vote.crime_id, crime_vote.user_id],
        set: { vote },
      });

    // Fetch updated vote counts
    const [{ upvotes, downvotes }] = await db
      .select({
        upvotes: sql<number>`COUNT(*) FILTER (WHERE ${crime_vote.vote} = 1)`,
        downvotes: sql<number>`COUNT(*) FILTER (WHERE ${crime_vote.vote} = -1)`,
      })
      .from(crime_vote)
      .where(eq(crime_vote.crime_id, params.id));

    revalidatePath("/");

    return NextResponse.json({
      upvotes,
      downvotes,
      userVote: vote,
    });
  } catch (error) {
    console.error("Error processing vote:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to process vote: ${errorMessage}` },
      { status: 500 }
    );
  }
}
