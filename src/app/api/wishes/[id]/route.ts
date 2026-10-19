import type { NextRequest } from "next/server";
import { findWish } from "@/lib/vng22-wishes";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/wishes/[id]">) {
  const { id } = await ctx.params;
  const wish = findWish(Number(id));
  if (!wish) return Response.json({ error: "Không tìm thấy lời chúc." }, { status: 404 });
  return Response.json(wish);
}
