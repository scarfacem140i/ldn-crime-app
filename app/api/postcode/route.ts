import { auth } from "@/lib/auth";
import { db, eq } from "@/lib/db";
import { tracked_postcode } from "@/lib/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;

    const postcodes = await db
      .select()
      .from(tracked_postcode)
      .where(eq(tracked_postcode.user_id, user.id));

    return NextResponse.json(postcodes);
  } catch (error) {
    console.error("Error fetching crime data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch crime data: ${errorMessage}` },
      { status: 500 }
    );
  }
}

const insertPostcodeSchema = createInsertSchema(tracked_postcode, {
  latitude: z.string({ message: "Invalid latitude" }),
  longitude: z.string({ message: "Invalid longitude" }),
  user_id: z.string({ message: "Invalid user ID" }),
  postcode: z.string({ message: "Invalid postcode" }),
}).omit({ id: true });

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = insertPostcodeSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    const { latitude, longitude, postcode } = validatedData.data;

    await db.insert(tracked_postcode).values({
      id: crypto.randomUUID(),
      latitude,
      postcode,
      longitude,
      user_id: session.user.id,
    });

    return NextResponse.json({ message: "Postcode added successfully" });
  } catch (error) {
    console.error("Error fetching crime data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch crime data: ${errorMessage}` },
      { status: 500 }
    );
  }
}

const removePostcodeSchema = z.object({
  id: z.string({ message: "Invalid id" }),
});

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = removePostcodeSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    const { id } = validatedData.data;

    await db.delete(tracked_postcode).where(eq(tracked_postcode.id, id));

    return NextResponse.json({ message: "Postcode removed successfully" });
  } catch (error) {
    console.error("Error fetching crime data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch crime data: ${errorMessage}` },
      { status: 500 }
    );
  }
}
