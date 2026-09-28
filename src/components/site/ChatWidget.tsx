"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";

type Msg = { role: "user" | "assistant"; content: string };

const SARAN = [
  "Berapa jumlah penduduk desa?",
  "Apa saja produk UMKM di desa ini?",
  "Bagaimana cara mengurus surat domisili?",
  "Wisata apa yang bisa dikunjungi?",
];

function renderText(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      /^\*\*[^*]+\*\*$/.test(p) ? <strong key={j}>{p.slice(2, -2)}</strong> : <span key={j}>{p}</span>
    );
    return (
      <span key={i} className="block min-h-[0.5em]">
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
      content: `Halo! Saya **Tanya Desa**, asisten virtual Desa ${namaDesa}. Silakan tanyakan informasi tentang profil desa, data kependudukan, layanan, potensi wisata, atau UMKM.`,
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
      setMessages((m) => [...m, { role: "assistant", content: "Maaf, koneksi sedang bermasalah. Silakan coba lagi." }]);
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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="tanya-desa"
        className="fixed right-4 bottom-4 z-50 inline-flex items-center gap-2 rounded-full bg-brand-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-900/30 transition hover:bg-brand-800 sm:right-6 sm:bottom-6"
      >
        <Icon name={open ? "close" : "sparkles"} />
        <span>{open ? "Tutup" : "Tanya Desa"}</span>
      </button>

      {open ? (
        <section
          id="tanya-desa"
          role="dialog"
          aria-label="Asisten AI Tanya Desa"
          className="fixed inset-x-3 bottom-20 z-50 flex max-h-[75vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-stone-200 sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-[400px]"
        >
          <header className="flex items-center gap-3 bg-gradient-to-r from-brand-800 to-brand-600 px-4 py-3 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15">
              <Icon name="sparkles" />
            </span>
            <div>
              <p className="font-bold">Tanya Desa</p>
              <p className="text-xs text-brand-100">Asisten AI berbasis data resmi website desa</p>
            </div>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-stone-50 p-4" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user" ? "rounded-br-sm bg-brand-700 text-white" : "rounded-bl-sm bg-white text-stone-800 ring-1 ring-stone-200"
                  }`}
                >
                  {renderText(m.content)}
                </div>
              </div>
            ))}
            {loading ? (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm text-stone-500 ring-1 ring-stone-200">Sedang mencari jawaban…</div>
              </div>
            ) : null}
            {messages.length <= 1 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {SARAN.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 ring-1 ring-brand-200 hover:bg-brand-50">
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-stone-200 bg-white p-3">
            <label htmlFor="tanya-input" className="sr-only">Tulis pertanyaan</label>
            <input
              id="tanya-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder="Tulis pertanyaan Anda…"
              className="input"
              autoComplete="off"
            />
            <button type="submit" className="btn-primary px-3" disabled={loading || !input.trim()} aria-label="Kirim pertanyaan">
              <Icon name="send" />
            </button>
          </form>
          <p className="bg-white px-4 pb-3 text-[11px] text-stone-400">Jawaban AI dapat keliru. Untuk keperluan resmi, hubungi kantor desa.</p>
        </section>
      ) : null}
    </>
  );
}
