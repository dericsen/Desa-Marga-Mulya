// Audit tata letak (dijalankan di CI setelah e2e): memotret halaman publik & CMS pada
// ukuran HP, tablet, dan laptop, lalu mendeteksi elemen yang meluber keluar layar,
// teks yang terpotong, dan tombol yang terlalu kecil untuk disentuh.
// Hasil: screenshots/audit/*.png + screenshots/audit/report.json. Tidak menggagalkan CI.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = "screenshots/audit";
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  ["hp", 360, 780],
  ["hp390", 390, 844],
  ["tab", 768, 1024],
  ["tabL", 1024, 768],
  ["laptop", 1366, 800],
  ["wide", 1920, 1080],
];
const PUBLIC = [
  ["beranda", "/"],
  ["profil", "/profil"],
  ["informasi", "/informasi"],
  ["potensi", "/potensi"],
  ["pasar", "/pasar"],
  ["pasar-detail", "/pasar?produk=bandeng-presto-mulya"],
  ["pasar-penjual", "/pasar?penjual=dapur-bu-enah"],
  ["berita", "/berita"],
  ["berita-detail", "/berita/musrenbangdes-2027"],
  ["galeri", "/galeri"],
  ["kontak", "/kontak"],
  ["cari", "/cari?q=bandeng"],
  ["404", "/halaman-tidak-ada"],
];
const ADMIN = [
  ["adm-dasbor", "/admin"],
  ["adm-berita", "/admin/berita"],
  ["adm-berita-baru", "/admin/berita/baru"],
  ["adm-statistik", "/admin/statistik"],
  ["adm-produk", "/admin/produk"],
  ["adm-pesanan", "/admin/pesanan"],
  ["adm-penjual", "/admin/penjual"],
  ["adm-pengaturan", "/admin/pengaturan"],
  ["adm-akun", "/admin/akun"],
];
const SELLER = [
  ["toko", "/admin/toko"],
  ["toko-produk", "/admin/toko/produk"],
  ["toko-produk-baru", "/admin/toko/produk/baru"],
  ["toko-pesanan", "/admin/toko/pesanan"],
  ["toko-profil", "/admin/toko/profil"],
];

const report = [];

async function inspect(page, vw) {
  return page.evaluate((vw) => {
    const sel = (el) => {
      let s = el.tagName.toLowerCase();
      if (el.id) s += "#" + el.id;
      const c = (el.getAttribute("class") || "").trim().split(/\s+/).slice(0, 4).join(".");
      if (c) s += "." + c;
      const txt = (el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 40).replace(/\s+/g, " ");
      return txt ? `${s} «${txt}»` : s;
    };
    const hiddenByAncestor = (el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (/(hidden|auto|scroll|clip)/.test(cs.overflowX)) return true;
      }
      return false;
    };
    const out = { pageOverflow: document.documentElement.scrollWidth - vw, overflow: [], clipped: [], tiny: [] };
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || cs.position === "fixed") continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if ((r.right > vw + 1 || r.left < -1) && !hiddenByAncestor(el)) out.overflow.push(`${sel(el)} [${Math.round(r.left)}→${Math.round(r.right)}]`);
      // Teks terpotong tanpa sengaja (bukan truncate/line-clamp)
      const cls = el.getAttribute("class") || "";
      if (el.children.length === 0 && el.innerText && !/truncate|line-clamp|sr-only/.test(cls) && cs.overflow !== "visible" && (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 4))
        out.clipped.push(sel(el));
      if (vw < 800 && /^(A|BUTTON)$/.test(el.tagName) && (r.height < 30 || r.width < 30) && el.innerText.trim().length < 3) out.tiny.push(`${sel(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
    // Pembungkus baris teks yang sangat panjang di layar lebar
    out.overflow = [...new Set(out.overflow)].slice(0, 25);
    out.clipped = [...new Set(out.clipped)].slice(0, 25);
    out.tiny = [...new Set(out.tiny)].slice(0, 25);
    return out;
  }, vw);
}

async function run(group, pages, login) {
  for (const [vname, w, h] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: "id-ID" });
    const page = await ctx.newPage();
    if (login) {
      await page.goto(BASE + "/admin/login", { waitUntil: "networkidle" });
      await page.fill("#email", login[0]);
      await page.fill("#password", login[1]);
      await page.getByRole("button", { name: "Masuk" }).click();
      await page.waitForURL((u) => !u.pathname.endsWith("/login"), { timeout: 15000 });
    }
    for (const [slug, path] of pages) {
      try {
        await page.goto(BASE + path, { waitUntil: "networkidle" });
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 600) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 40));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(300);
        const res = await inspect(page, w);
        report.push({ group, page: slug, viewport: `${vname} ${w}`, ...res });
        const bad = res.pageOverflow > 0 || res.overflow.length || res.clipped.length;
        console.log(`${bad ? "!" : "·"} ${vname.padEnd(6)} ${slug.padEnd(18)} overflow=${res.pageOverflow} el=${res.overflow.length} clip=${res.clipped.length} tiny=${res.tiny.length}`);
        await page.screenshot({ path: `${OUT}/${vname}-${slug}.png`, fullPage: true });
      } catch (e) {
        console.log(`x ${vname} ${slug}: ${e.message}`);
      }
    }
    // Menu HP terbuka + laci keranjang
    if (group === "publik" && w < 1024) {
      await page.goto(BASE + "/", { waitUntil: "networkidle" });
      const btn = page.getByRole("button", { name: /menu/i }).first();
      if (await btn.count()) {
        await btn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: `${OUT}/${vname}-menu-terbuka.png` });
      }
    }
    await ctx.close();
  }
}

const browser = await chromium.launch();
await run("publik", PUBLIC);
await run("admin", ADMIN, [process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD]);
await run("penjual", SELLER, ["0812-0000-0001", process.env.SELLER_DEMO_PASSWORD]);
await browser.close();
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
console.log(`\nAudit selesai: ${report.length} tangkapan.`);
