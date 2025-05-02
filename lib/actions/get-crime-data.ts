import { headers } from "next/headers";
import { auth } from "../auth";
import { db } from "../db";

export const getCrimeData = async () => {
  const session = await auth.api.getSession({ headers: headers() });
  const crimes = await db.query.crime_report.findMany({
    with: {
      votes: true,
      flags: true,
    },
    where: (crime_report, { eq }) => eq(crime_report.verified, true),
    orderBy: (crime_report, { desc }) => [desc(crime_report.created_at)],
  });

  return crimes.map((crime) => {
    // Calculate vote statistics
    const voteStats = crime.votes.reduce(
      (acc, vote) => {
        if (vote.vote === 1) acc.upvotes++;
        if (vote.vote === -1) acc.downvotes++;
        return acc;
      },
      { upvotes: 0, downvotes: 0 }
    );

    // If the user is logged in, get their vote. If not, set to 0 (no vote)
    const userVote = session?.user
      ? crime.votes.find((vote) => vote.user_id === session.user.id)?.vote || 0
      : 0; // Default to 0 (no vote) if not logged in

    return {
      id: crime.id,
      user_id: crime.user_id,
      category: crime.category,
      description: crime.description,
      latitude: crime.latitude,
      longitude: crime.longitude,
      street_name: crime.street_name,
      created_at: crime.created_at,
      verified: crime.verified,
      votes: voteStats,
      flags: crime.flags.length,
      userVote,
    };
  });
};

export const getCrimeDataWithUser = async () => {
  const session = await auth.api.getSession({ headers: headers() });
  const crimes = await db.query.crime_report.findMany({
    with: {
      votes: true,
      flags: true,
      user: true,
    },
    orderBy: (crime_report, { desc }) => [desc(crime_report.created_at)],
  });

  return crimes.map((crime) => {
    // Calculate vote statistics
    const voteStats = crime.votes.reduce(
      (acc, vote) => {
        if (vote.vote === 1) acc.upvotes++;
        if (vote.vote === -1) acc.downvotes++;
        return acc;
      },
      { upvotes: 0, downvotes: 0 }
    );

    const userVote = session?.user
      ? crime.votes.find((vote) => vote.user_id === session.user.id)?.vote || 0
      : 0; // Default to 0 (no vote) if not logged in

    return {
      id: crime.id,
      user_id: crime.user_id,
      category: crime.category,
      description: crime.description,
      latitude: crime.latitude,
      longitude: crime.longitude,
      street_name: crime.street_name,
      created_at: crime.created_at,
      verified: crime.verified,
      votes: voteStats,
      flags: crime.flags.length,
      user: crime.user,
      userVote,
    };
  });
};

export const getCrimeDataUnverified = async () => {
  const session = await auth.api.getSession({ headers: headers() });
  const crimes = await db.query.crime_report.findMany({
    with: {
      votes: true,
      flags: true,
      user: true,
    },
    where: (crime_report, { eq }) => eq(crime_report.verified, false),
    orderBy: (crime_report, { desc }) => [desc(crime_report.created_at)],
  });

  return crimes.map((crime) => {
    // Calculate vote statistics
    const voteStats = crime.votes.reduce(
      (acc, vote) => {
        if (vote.vote === 1) acc.upvotes++;
        if (vote.vote === -1) acc.downvotes++;
        return acc;
      },
      { upvotes: 0, downvotes: 0 }
    );

    const userVote = session?.user
      ? crime.votes.find((vote) => vote.user_id === session.user.id)?.vote || 0
      : 0; // Default to 0 (no vote) if not logged in

    return {
      id: crime.id,
      user_id: crime.user_id,
      category: crime.category,
      description: crime.description,
      latitude: crime.latitude,
      longitude: crime.longitude,
      street_name: crime.street_name,
      created_at: crime.created_at,
      verified: crime.verified,
      votes: voteStats,
      flags: crime.flags.length,
      user: crime.user,
      userVote,
    };
  });
};
