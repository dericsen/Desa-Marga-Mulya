import type { ReactNode } from "react";

// Penampil Markdown sederhana dan aman (tanpa HTML mentah):
// ## / ### judul, paragraf, > kutipan, - daftar, 1. daftar bernomor, **tebal**, *miring*, [tautan](url).

function safeHref(url: string): string | null {
  if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(url)) return url;
  return null;
}

function inline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)\s]+\))/g);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={key}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const href = safeHref(link[2]);
      if (!href) return link[1];
      const external = href.startsWith("http");
      return (
        <a key={key} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

export function Markdown({ text, className = "" }: { text: string | null | undefined; className?: string }) {
  if (!text) return null;
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={`prose-desa ${className}`}>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const k = `b${bi}`;
        if (block.startsWith("### ")) return <h3 key={k}>{inline(block.slice(4), k)}</h3>;
        if (block.startsWith("## ")) return <h2 key={k}>{inline(block.slice(3), k)}</h2>;
        if (block.startsWith("# ")) return <h2 key={k}>{inline(block.slice(2), k)}</h2>;
        if (lines.every((l) => l.startsWith(">"))) {
          return <blockquote key={k}>{inline(lines.map((l) => l.replace(/^>\s?/, "")).join(" "), k)}</blockquote>;
        }
        if (lines.every((l) => /^[-*]\s+/.test(l))) {
          return (
            <ul key={k}>
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^[-*]\s+/, ""), `${k}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\d+[.)]\s+/.test(l))) {
          return (
            <ol key={k}>
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^\d+[.)]\s+/, ""), `${k}-${li}`)}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={k}>
            {lines.map((l, li) => (
              <span key={li}>
                {li > 0 ? <br /> : null}
                {inline(l, `${k}-${li}`)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
