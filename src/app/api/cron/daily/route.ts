import { NextResponse } from "next/server";
import { runDailyPipeline } from "@/lib/pipeline/runDailyPipeline";

export const dynamic = "force-dynamic";

function unauthorized(): NextResponse {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");

  if (bearerToken !== expectedSecret && querySecret !== expectedSecret) {
    return unauthorized();
  }

  try {
    const result = await runDailyPipeline();
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown pipeline error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
