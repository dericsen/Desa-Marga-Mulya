"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";

type Msg = { role: "user" | "assistant"; content: string };

const SARAN = [
  "Jam berapa kantor desa buka?",
  "Apa saja produk UMKM di desa ini?",
  "Syarat membuat surat domisili?",
  "Berapa jumlah penduduk desa?",
];

function renderText(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      /^\*\*[^*]+\*\*$/.test(p) ? <strong key={j} className="font-bold">{p.slice(2, -2)}</strong> : <span key={j}>{p}</span>
    );
    return (
      <span key={i} className="block min-h-[0.6em]">
        {parts}
      </span>
    );
  });
}

export function ChatWidget({ namaDesa }: { namaDesa: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `Saya menjawab pertanyaan seputar Desa ${namaDesa} berdasarkan data di website ini: layanan kantor desa, data penduduk, potensi, dan kegiatan warga.`,
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-10) }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      setMessages((m) => [...m, { role: "assistant", content: data.reply || data.error || "Maaf, terjadi kesalahan." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Koneksi terputus. Periksa internet Anda lalu coba lagi." }]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-controls="tanya-desa"
          className="fixed right-4 bottom-4 z-50 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-bold text-white shadow-[0_6px_20px_-8px_rgb(54_69_79/0.7)] transition-colors hover:bg-brand-900 sm:right-6 sm:bottom-6"
        >
          <Icon name="chat" className="h-[18px] w-[18px]" />
          Tanya Desa
        </button>
      ) : null}

      {open ? (
        <section
          id="tanya-desa"
          role="dialog"
          aria-label="Asisten Tanya Desa"
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col border-t border-line-strong bg-white shadow-[0_-8px_30px_-12px_rgb(12_27_21/0.3)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-h-[70vh] sm:w-[23rem] sm:rounded-xl sm:border sm:shadow-[0_24px_48px_-20px_rgb(54_69_79/0.45)] rounded-t-xl"
        >
          <header className="flex items-start justify-between gap-3 bg-ink px-4 py-3 text-white">
            <div>
              <p className="font-bold">Tanya Desa</p>
              <p className="text-xs text-white/70">Asisten AI yang menjawab dari data website desa</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="-mr-1 rounded-md p-1.5 text-white/60 hover:bg-paper/10 hover:text-white" aria-label="Tutup asisten">
              <Icon name="close" className="h-5 w-5" />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-paper/60 px-4 py-4" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} data-role={m.role} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-lg px-3.5 py-2.5 text-[0.9375rem] leading-relaxed ${
                    m.role === "user" ? "bg-ink text-white" : "border border-line bg-white text-ink"
                  }`}
                >
                  {renderText(m.content)}
                </div>
              </div>
            ))}
            {loading ? (
              <p className="text-sm text-muted" data-loading="true">Mencari di data desa…</p>
            ) : null}
            {messages.length <= 1 ? (
              <div className="pt-1">
                <p className="mb-2 text-xs text-muted">Contoh pertanyaan</p>
                <ul className="space-y-1.5">
                  {SARAN.map((s) => (
                    <li key={s}>
                      <button type="button" onClick={() => send(s)} className="w-full rounded-md border border-line bg-white px-3 py-2 text-left text-sm text-ink hover:border-ink">
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-line p-3">
            <label htmlFor="tanya-input" className="sr-only">Tulis pertanyaan</label>
            <input
              id="tanya-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder="Tulis pertanyaan"
              className="input py-2"
              autoComplete="off"
            />
            <button type="submit" className="btn-primary px-3" disabled={loading || !input.trim()} aria-label="Kirim pertanyaan">
              <Icon name="send" className="h-4 w-4" />
            </button>
          </form>
          <p className="px-4 pb-3 text-[0.6875rem] leading-snug text-muted">Jawaban dapat keliru. Untuk urusan resmi, konfirmasi ke kantor desa.</p>
        </section>
      ) : null}
    </>
  );
}
