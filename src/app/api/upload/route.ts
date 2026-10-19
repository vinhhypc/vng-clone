import type { NextRequest } from "next/server";

const MAX_BYTES = 20 * 1024 * 1024;

/**
 * The source uploads wish photos to blob storage. This clone has none, so the (already resized)
 * image is returned inline as a data URL and travels with the pending wish.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return Response.json({ error: "Vui lòng chọn một tệp ảnh." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Dung lượng ảnh tối đa là 20MB." }, { status: 413 });
  }
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  return Response.json({ url: `data:${file.type};base64,${base64}` });
}
