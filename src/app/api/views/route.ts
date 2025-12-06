import env from "@/config/env";
import axios from "axios";
import { NextResponse } from "next/server";

export const cache = "no-cache"
export const revalidate = 0

export async function GET() {
    const startAt = 1759820400000;
    const endAt = Date.now();

    try {
        if (!env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || !env.UMAMI_API_KEY) {
            // Graceful fallback when Umami isn't configured
            const data = {
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
            };
            return NextResponse.json({ success: true, data });
        }
        const res = await axios.get(
            `https://api.umami.is/v1/websites/${env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}/stats?startAt=${startAt}&endAt=${endAt}`,
            {
                headers: {
                    "x-umami-api-key": env.UMAMI_API_KEY,
                    "Accept": "application/json",

                },

            }
        );



        const data = res.data;
        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.log("Error fetching website stats:", err);
        // Graceful fallback on runtime errors
        const data = {
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
        };
        return NextResponse.json({ success: true, data });
    }
}
