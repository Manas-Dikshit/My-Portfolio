import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 0

const EMPTY_STATS = {
  pageviews: 0,
  visitors: 0,
  visits: 0,
  bounces: 0,
  totaltime: 0,
  comparison: {
    pageviews: 0,
    visitors: 0,
    visits: 0,
    bounces: 0,
    totaltime: 0,
  },
}

// every portfolio open bumps the single counter row and returns the current count
export async function GET() {
  let lastError: unknown;
  // retry once: Accelerate occasionally drops its query engine connection, and a dropped hit is lost forever
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const view = await prisma.pageView.upsert({
        where: { id: "site" },
        create: { id: "site", count: 1 },
        update: { count: { increment: 1 } },
      });
      return NextResponse.json({ success: true, data: { ...EMPTY_STATS, pageviews: view.count } });
    } catch (err) {
      lastError = err;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  console.error("Failed to count portfolio view:", (lastError as Error)?.message);
  return NextResponse.json({ success: true, data: EMPTY_STATS });
}
