import { answer, type ChatMessage } from "@/lib/assistant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const hits = new Map<string, number[]>();

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "lokal").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  if (recent.length >= 15) {
    return Response.json({ error: "Terlalu banyak pertanyaan dalam satu menit. Silakan tunggu sebentar." }, { status: 429 });
  }
  recent.push(now);
  hits.set(ip, recent);

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const messages: ChatMessage[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m): m is ChatMessage => {
      const x = m as Partial<ChatMessage> | null;
      return typeof x === "object" && x !== null && (x.role === "user" || x.role === "assistant") && typeof x.content === "string";
    })
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "Pertanyaan kosong." }, { status: 400 });
  }

  try {
    const result = await answer(messages);
    return Response.json(result);
  } catch (err) {
    console.error("[tanya-desa]", err);
    return Response.json({ error: "Maaf, asisten sedang tidak dapat menjawab. Silakan coba lagi nanti." }, { status: 500 });
  }
}
