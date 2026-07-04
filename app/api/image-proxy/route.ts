import { NextRequest, NextResponse } from "next/server";

/**
 * Image proxy API route.
 * Fetches an external image server-side and returns it with CORS headers,
 * so that html-to-image can draw it onto a canvas without browser CORS errors.
 *
 * Usage: /api/image-proxy?url=https://example.com/image.jpg
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing 'url' query parameter", { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      // Ensure we don't cache tainted/stale resources
      cache: "no-store",
    });

    if (!response.ok) {
      return new NextResponse(`Upstream image fetch failed: ${response.status}`, {
        status: response.status,
      });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("[image-proxy] Error fetching image:", error);
    return new NextResponse("Failed to fetch image", { status: 500 });
  }
}
