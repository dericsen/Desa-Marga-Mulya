"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "@/components/Icon";

type Msg = { role: "user" | "assistant"; content: string };

const SARAN = [
  "Jam berapa kantor desa buka?",
  "Syarat membuat surat domisili?",
  "Berapa jumlah penduduk desa?",
  "Berapa harga bandeng presto?",
  "Bagaimana cuaca hari ini?",
  "Wisata apa saja di sekitar desa?",
];

/** Nama halaman yang disebut asisten → tautan yang bisa diketuk. */
const HALAMAN: Record<string, string> = {
  Beranda: "/",
  "Profil Desa": "/profil",
  Profil: "/profil",
  "Informasi Desa": "/informasi",
  "Pasar Desa": "/pasar",
  "Wisata & Budaya": "/potensi",
  Berita: "/berita",
  "Berita & Kegiatan": "/berita",
  Galeri: "/galeri",
  Kontak: "/kontak",
};
const STORAGE = "tanya-desa-percakapan";

function inline(text: string, key: string, onNav: () => void): ReactNode[] {
  // **tebal** (nama halaman jadi tautan) dan URL http(s)
  return text.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s)]+)/g).map((p, j) => {
    const k = `${key}-${j}`;
    if (/^\*\*[^*]+\*\*$/.test(p)) {
      const isi = p.slice(2, -2);
      const href = HALAMAN[isi];
      return href ? (
        <Link key={k} href={href} onClick={onNav} className="font-semibold text-brand-700 underline decoration-brand-300 underline-offset-2">
          {isi}
        </Link>
      ) : (
        <strong key={k} className="font-semibold text-ink">{isi}</strong>
      );
    }
    if (/^https?:\/\//.test(p)) {
      const label = /google\.com\/maps/.test(p) ? "Buka di Google Maps" : p.replace(/^https?:\/\//, "").slice(0, 32) + "…";
      return (
        <a key={k} href={p} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 underline underline-offset-2">
          {label}
        </a>
      );
    }
    return <span key={k}>{p}</span>;
  });
}

/** Paragraf + daftar berpoin ("• " / "- ") dirender rapi, bukan teks mentah. */
function RenderText({ text, onNav }: { text: string; onNav: () => void }) {
  const blok: ReactNode[] = [];
  let poin: string[] = [];
  const flush = (i: number) => {
    if (!poin.length) return;
    blok.push(
      <ul key={`ul-${i}`} className="space-y-1.5">
        {poin.map((p, j) => (
          <li key={j} className="flex gap-2">
            <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden="true" />
            <span className="min-w-0">{inline(p, `li-${i}-${j}`, onNav)}</span>
          </li>
        ))}
      </ul>
    );
    poin = [];
  };
  text.split("\n").forEach((line, i) => {
    const t = line.trim();
    const m = t.match(/^(?:[•\-*]|\d+[.)])\s+(.*)$/);
    if (m) return void poin.push(m[1]);
    flush(i);
    if (t) blok.push(<p key={`p-${i}`}>{inline(t, `p-${i}`, onNav)}</p>);
  });
  flush(-1);
  return <div className="space-y-2.5 break-words">{blok}</div>;
}

function Avatar() {
  return (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-sun-400" aria-hidden="true">
      <Icon name="sparkles" className="h-3.5 w-3.5" />
    </span>
  );
}

export function ChatWidget({ namaDesa }: { namaDesa: string }) {
  const sapaan: Msg = {
    role: "assistant",
    content: `Halo! Saya **Tanya Desa**. Tanyakan apa saja tentang Desa ${namaDesa} — layanan kantor desa, data penduduk, produk Pasar Desa, wisata, berita, atau cuaca. Saya menjawab dari seluruh isi website ini.`,
  };
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([sapaan]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Percakapan tetap ada saat pindah halaman (hanya di tab ini).
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE) || "null");
      if (Array.isArray(saved) && saved.length) setMessages(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE, JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    // HP: kunci gulir halaman di belakang layar penuh
    const hp = window.matchMedia("(max-width: 639px)").matches;
    const prev = document.body.style.overflow;
    if (hp) document.body.style.overflow = "hidden";
    else inputRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Tinggi kolom tulis mengikuti isi (maks. ±4 baris)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input, open]);

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
      setMessages((m) => [...m, { role: "assistant", content: data.reply || data.error || "Maaf, terjadi kesalahan. Silakan coba lagi." }]);
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

  const awal = messages.length <= 1;
  const tutup = () => setOpen(false);

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-controls="tanya-desa"
          className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 inline-flex h-12 items-center gap-2 rounded-full bg-ink pr-4 pl-2 text-sm font-medium text-white shadow-[0_12px_30px_-10px_rgb(11_19_16/0.65)] ring-1 ring-white/10 transition-transform hover:bg-brand-900 active:scale-95 sm:right-6 sm:bottom-6"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-sun-400 text-ink" aria-hidden="true">
            <Icon name="chat" className="h-4 w-4" />
          </span>
          Tanya Desa
        </button>
      ) : null}

      {open ? (
        <>
          {/* Latar redup (desktop) */}
          <button type="button" aria-label="Tutup asisten" onClick={tutup} className="fixed inset-0 z-40 hidden cursor-default bg-ink/10 sm:block" />
          <section
            id="tanya-desa"
            role="dialog"
            aria-modal="true"
            aria-label="Asisten Tanya Desa"
            className="fixed inset-0 z-50 flex h-[100dvh] flex-col bg-paper sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[min(40rem,calc(100dvh-3rem))] sm:w-[25rem] sm:overflow-hidden sm:rounded-[1.75rem] sm:shadow-[0_30px_70px_-20px_rgb(11_19_16/0.5)] sm:ring-1 sm:ring-ink/5"
          >
            <header className="flex shrink-0 items-center gap-3 bg-ink px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 text-white">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sun-400 text-ink" aria-hidden="true">
                <Icon name="sparkles" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">Tanya Desa</p>
                <p className="truncate text-xs text-white/60">Asisten AI · Desa {namaDesa}</p>
              </div>
              {!awal ? (
                <button
                  type="button"
                  onClick={() => setMessages([sapaan])}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-white/75 ring-1 ring-white/20 hover:bg-white/10 hover:text-white"
                >
                  Mulai ulang
                </button>
              ) : null}
              <button type="button" onClick={tutup} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white/75 hover:bg-white/10 hover:text-white" aria-label="Tutup asisten">
                <Icon name="close" className="h-5 w-5" />
              </button>
            </header>

            <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5" aria-live="polite">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} data-role="user" className="flex justify-end">
                    <div className="max-w-[85%] rounded-[1.25rem] rounded-br-md bg-ink px-4 py-2.5 text-[0.9375rem] leading-relaxed whitespace-pre-wrap text-white">{m.content}</div>
                  </div>
                ) : (
                  <div key={i} data-role="assistant" className="flex items-end gap-2">
                    <Avatar />
                    <div className="max-w-[85%] min-w-0 rounded-[1.25rem] rounded-bl-md bg-white px-4 py-3 text-[0.9375rem] leading-relaxed text-ink/90 shadow-[0_1px_2px_rgb(11_19_16/0.06)]">
                      <RenderText text={m.content} onNav={tutup} />
                    </div>
                  </div>
                )
              )}
              {loading ? (
                <div className="flex items-end gap-2" data-loading="true">
                  <Avatar />
                  <div className="flex items-center gap-1.5 rounded-[1.25rem] rounded-bl-md bg-white px-4 py-3.5" aria-label="Sedang mencari jawaban">
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-muted/60" style={{ animationDelay: `${d * 150}ms` }} />
                    ))}
                  </div>
                </div>
              ) : null}
              {awal ? (
                <div className="pl-9">
                  <p className="mb-2 text-xs font-semibold text-muted">Coba tanyakan</p>
                  <div className="flex flex-wrap gap-2">
                    {SARAN.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="rounded-full bg-white px-3.5 py-2 text-left text-sm text-ink shadow-[0_0_0_1px_rgb(11_19_16/0.08)] transition-colors hover:bg-ink hover:text-white active:scale-[0.98]"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <form onSubmit={onSubmit} className="shrink-0 border-t border-line bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="flex items-end gap-2 rounded-[1.5rem] bg-paper p-1.5 pl-4 ring-1 ring-line focus-within:ring-2 focus-within:ring-ink">
                <label htmlFor="tanya-input" className="sr-only">Tulis pertanyaan</label>
                <textarea
                  id="tanya-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  maxLength={500}
                  placeholder="Tulis pertanyaan…"
                  enterKeyHint="send"
                  // 16px agar Safari iOS tidak memperbesar layar saat mengetik
                  className="max-h-[120px] min-h-[2.5rem] flex-1 resize-none bg-transparent py-2 text-base leading-6 text-ink placeholder:text-muted/70 focus:outline-none"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-white transition-opacity disabled:opacity-30"
                  disabled={loading || !input.trim()}
                  aria-label="Kirim pertanyaan"
                >
                  <Icon name="send" className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 px-1 text-center text-[0.6875rem] leading-snug text-muted">Jawaban berdasarkan data website. Untuk urusan resmi, konfirmasi ke kantor desa.</p>
            </form>
          </section>
        </>
      ) : null}
    </>
  );
}
