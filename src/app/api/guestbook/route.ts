// Fallback: skip DB logic if DATABASE_URL is missing
const isDbAvailable = !!process.env.DATABASE_URL;
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

const MAX_CONTENT_LENGTH = 500;

// ponytail: in-memory per-user rate limiter; best-effort across serverless
// instances and bounded by active users. Upgrade to a shared store (Redis/DB)
// if you deploy multiple instances or abuse becomes an issue.
const RATE_LIMIT = { max: 5, windowMs: 60_000 };
const postTimestamps = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const times = (postTimestamps.get(key) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (times.length) postTimestamps.set(key, times);
  else postTimestamps.delete(key);
  return times.length >= RATE_LIMIT.max;
}


// List all guestbook entries
export async function GET() {
    if (!isDbAvailable) {
        console.warn("DATABASE_URL not found, skipping DB fetch");
        return NextResponse.json({ success: true, data: [], message: "Entries fetched successfully (DB unavailable)" });
    }
    try {
        const entries = await prisma.guestbookEntry.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                        role: true,
                        accounts: {
                            select: {
                                providerId: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });
        return NextResponse.json({ success: true, data: entries, message: "Entries fetched successfully" });
    } catch (err) {
        console.error("Error fetching guestbook:", err);
        return NextResponse.json(
            { success: false, message: "Failed to fetch entries" },
            { status: 500 }
        );
    }
}

// Add a new entry
export async function POST(req: Request) {
    if (!isDbAvailable) {
        return NextResponse.json({ success: false, message: "Database unavailable" }, { status: 503 });
    }
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const { user } = session;
        const { content } = await req.json();
        if (typeof content !== "string" || content.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: "Content is required" },
                { status: 400 }
            );
        }
        const trimmed = content.trim();
        if (trimmed.length > MAX_CONTENT_LENGTH) {
            return NextResponse.json(
                { success: false, message: `Content must be ${MAX_CONTENT_LENGTH} characters or less` },
                { status: 400 }
            );
        }
        if (isRateLimited(user.id)) {
            return NextResponse.json(
                { success: false, message: "Too many posts, try again later" },
                { status: 429 }
            );
        }
        const newEntry = await prisma.guestbookEntry.create({
            data: {
                content: trimmed,
                userId: user.id,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                        role: true,
                        accounts: {
                            select: {
                                providerId: true,
                            },
                        },
                    },
                },
            },
        });
        return NextResponse.json({ success: true, data: newEntry, message: "Guestbook entry created successfully" }, { status: 201 });
    } catch (err: any) {
        console.error("Error creating guestbook entry:", err);
        return NextResponse.json(
            { success: false, message: "Failed to create guestbook entry" },
            { status: 500 }
        );
    }
}

// Remove an entry
export async function DELETE(req: Request) {
    if (!isDbAvailable) {
        return NextResponse.json({ success: false, message: "Database unavailable" }, { status: 503 });
    }
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ success: false, message: "Guestbook ID is required" }, { status: 400 });
        }
        const entry = await prisma.guestbookEntry.findUnique({
            where: { id }
        });
        if (!entry) {
            return NextResponse.json({ success: false, message: "Guestbook Entry not found" }, { status: 404 });
        }
        await prisma.guestbookEntry.delete({ where: { id }, });
        return NextResponse.json({ success: true, message: "Guestbook entry deleted successfully" },);
    } catch (err: any) {
        console.error("Error deleting guestbook entry:", err);
        return NextResponse.json(
            { success: false , message: "Failed to delete guestbook entry"},
            { status: 500 }
        );
    }
}