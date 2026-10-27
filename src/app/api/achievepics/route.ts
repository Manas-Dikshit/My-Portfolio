import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import { extname, join } from "path";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

// list everything in public/achievepics so the gallery never needs manual entries
export async function GET() {
  try {
    const files = readdirSync(join(process.cwd(), "public", "achievepics"))
      .filter((file) => IMAGE_EXTENSIONS.includes(extname(file).toLowerCase()))
      .sort()
      .map((file) => `/achievepics/${encodeURIComponent(file)}`);
    return NextResponse.json({ success: true, data: files });
  } catch {
    return NextResponse.json(
      { success: false, message: "achievepics folder not found" },
      { status: 404 },
    );
  }
}
