import type { NextRequest } from "next/server";
import { listWishes, submitWish } from "@/lib/vng22-wishes";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const limit = Math.min(100, Math.max(1, Number.parseInt(params.get("limit") ?? "60", 10) || 60));
  return Response.json(
    listWishes({ limit, cursor: params.get("cursor"), q: params.get("q") ?? "", seed: params.get("seed") }),
  );
}

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const { name, text, image_url } = (body ?? {}) as { name?: unknown; text?: unknown; image_url?: unknown };
  if (typeof name !== "string" || typeof text !== "string" || !name.trim() || !text.trim()) {
    return Response.json({ error: "Vui lòng điền đầy đủ tên và lời chúc." }, { status: 400 });
  }
  const wish = submitWish({ name, text, image_url: typeof image_url === "string" ? image_url : undefined });
  return Response.json(wish, { status: 201 });
}
