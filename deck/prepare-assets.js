// Siapkan gambar untuk deck: latar, hiasan, peta lokasi, mockup, ikon, dan kode QR.
// Dijalankan di CI (butuh internet untuk ubin peta OpenStreetMap).
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const QRCode = require("qrcode");
const fa = require("react-icons/fa");
const si = require("react-icons/si");
const { THEMES } = require("./themes");

const RAW = path.join(__dirname, "assets", "raw");
const OUT = path.join(__dirname, "assets", "build");
fs.mkdirSync(OUT, { recursive: true });
const DEMO_URL = process.env.DEMO_URL || "https://desa-marga-mulya.vercel.app";
const LAT = -6.0355;
const LNG = 106.5185;
const W = 1920;
const H = 1080;

const svgPng = (svg, file, w, h) => sharp(Buffer.from(svg)).resize(w, h).png().toFile(file);

// ---------- Latar: garis gelombang + gradasi bawah ----------
function waves(color, opacity) {
  let d = "";
  for (let i = 0; i < 34; i++) {
    const y0 = 430 + i * 8;
    const y1 = 250 + i * 13;
    d += `<path d="M -60 ${y0} C 520 ${y0 + 140}, 860 ${800 - i * 3}, 1180 ${720 - i * 7} S 1700 ${y1 + 90}, 1990 ${y1}" stroke="#${color}" stroke-opacity="${opacity}" stroke-width="1.3" fill="none"/>`;
  }
  for (let i = 0; i < 22; i++) {
    const y = 180 + i * 10;
    d += `<path d="M 1300 ${y + 420} C 1520 ${y + 260}, 1640 ${y + 40}, 1990 ${y - 30}" stroke="#${color}" stroke-opacity="${opacity * 0.8}" stroke-width="1.1" fill="none"/>`;
  }
  return d;
}
function base(t) {
  return `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFFFFF"/><stop offset="0.62" stop-color="#FFFFFF"/><stop offset="1" stop-color="#${t.tint}"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>${waves(t.wave, 0.35)}`;
}
function titleDecor(t) {
  // Pita bersudut di kiri atas dan kanan atas
  let s = `<polygon points="0,0 1130,0 800,235 0,235" fill="#${t.primaryDark}"/>
    <polygon points="0,0 1000,0 760,195 0,195" fill="#${t.primary}"/>
    <polyline points="0,205 740,205 830,150" stroke="#FFFFFF" stroke-opacity="0.8" stroke-width="2" fill="none"/>
    <circle cx="830" cy="150" r="5" fill="#FFFFFF"/>
    <rect x="1050" y="0" width="870" height="175" fill="#${t.gray}"/>
    <rect x="1050" y="175" width="870" height="16" fill="#${t.primaryDark}"/>
    <polygon points="1050,0 1120,0 900,191 830,191" fill="#${t.primary}"/>`;
  // Kotak piksel di kanan bawah (makin rapat ke sudut)
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let gx = 0; gx < 11; gx++) {
    for (let gy = 0; gy < 9; gy++) {
      const x = W - 50 - gx * 62;
      const y = H - 45 - gy * 62;
      const p = 1 - (gx + gy) / 13;
      if (gx + gy < 3) {
        s += `<rect x="${x - 40}" y="${y - 40}" width="92" height="92" fill="#${t.dark}"/>`;
        continue;
      }
      if (rnd() < p) {
        const size = 18 + rnd() * 30;
        const fill = rnd() < 0.08 ? t.primary : t.dark;
        s += `<rect x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" rx="3" fill="#${fill}"/>`;
      }
    }
  }
  return s;
}
function endDecor(t) {
  return `<polygon points="0,0 1060,0 740,150 0,150" fill="#${t.primaryDark}"/>
    <polygon points="0,0 940,0 700,120 0,120" fill="#${t.primary}"/>
    <polyline points="0,130 690,130 780,90" stroke="#FFFFFF" stroke-opacity="0.8" stroke-width="2" fill="none"/>
    <rect x="1010" y="0" width="910" height="110" fill="#${t.gray}"/>
    <rect x="1010" y="110" width="910" height="14" fill="#${t.primaryDark}"/>
    <polygon points="1320,${H} 1920,${H} 1920,${H - 40}" fill="#${t.primaryDark}"/>`;
}

// ---------- Gumpalan organik di belakang mockup ----------
function blob(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><path fill="#${t.dark}" d="M120 520 C 30 430, 60 300, 170 260 C 260 225, 250 120, 360 95 C 470 70, 560 140, 600 230 C 640 320, 760 330, 770 440 C 780 540, 700 600, 600 600 L 160 600 C 140 580, 130 540, 120 520 Z"/></svg>`;
}

// ---------- Peta lokasi dari OpenStreetMap ----------
async function map(t, file) {
  const z = 13;
  const n = 2 ** z;
  const fx = ((LNG + 180) / 360) * n;
  const latR = (LAT * Math.PI) / 180;
  const fy = ((1 - Math.log(Math.tan(latR) + 1 / Math.cos(latR)) / Math.PI) / 2) * n;
  const cx = Math.floor(fx);
  const cy = Math.floor(fy);
  const cols = [-2, -1, 0, 1, 2];
  const rows = [-1, 0, 1];
  const tiles = [];
  for (const dy of rows) {
    for (const dx of cols) {
      const url = `https://tile.openstreetmap.org/${z}/${cx + dx}/${cy + dy}.png`;
      const res = await fetch(url, { headers: { "User-Agent": "DesaMargaMulyaPitchDeck/1.0 (+https://github.com/dericsen/Desa-Marga-Mulya)" } });
      if (!res.ok) throw new Error(`tile ${res.status}`);
      tiles.push({ input: Buffer.from(await res.arrayBuffer()), left: (dx + 2) * 256, top: (dy + 1) * 256 });
    }
  }
  const mosaic = await sharp({ create: { width: 1280, height: 768, channels: 4, background: "#ffffff" } }).composite(tiles).png().toBuffer();
  const px = (fx - (cx - 2)) * 256;
  const py = (fy - (cy - 1)) * 256;
  const Wm = 1200;
  const Hm = 470;
  const left = Math.round(Math.max(0, Math.min(1280 - Wm, px - Wm / 2)));
  const top = Math.round(Math.max(0, Math.min(768 - Hm, py - Hm / 2)));
  const mx = px - left;
  const my = py - top;
  const gray = await sharp(mosaic).extract({ left, top, width: Wm, height: Hm }).grayscale().modulate({ brightness: 1.05 }).png().toBuffer();
  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${Wm}" height="${Hm}">
    <circle cx="${mx}" cy="${my}" r="46" fill="#${t.primary}" fill-opacity="0.22"/>
    <circle cx="${mx}" cy="${my}" r="15" fill="#${t.primary}" stroke="#FFFFFF" stroke-width="5"/>
    <rect x="${mx + 26}" y="${my - 62}" rx="10" width="300" height="52" fill="#${t.dark}"/>
    <text x="${mx + 44}" y="${my - 28}" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#FFFFFF">Desa Marga Mulya</text>
    <rect x="${Wm - 330}" y="${Hm - 34}" width="330" height="34" fill="#FFFFFF" fill-opacity="0.85"/>
    <text x="${Wm - 12}" y="${Hm - 11}" text-anchor="end" font-family="Arial, sans-serif" font-size="17" fill="#333">© OpenStreetMap contributors</text>
  </svg>`;
  const mask = `<svg xmlns="http://www.w3.org/2000/svg" width="${Wm}" height="${Hm}"><rect width="${Wm}" height="${Hm}" rx="36" fill="#fff"/></svg>`;
  const withPin = await sharp(gray).composite([{ input: Buffer.from(overlay) }]).png().toBuffer();
  await sharp(withPin).composite([{ input: Buffer.from(mask), blend: "dest-in" }]).png().toFile(file);
}

// ---------- Ikon ----------
async function icon(Comp, color, file, size = 256) {
  if (!Comp) return false;
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: `#${color}`, size }));
  await svgPng(svg, file, size, size);
  return true;
}

async function roundedCrop(file, out, ratio, radius) {
  const img = sharp(path.join(RAW, file));
  const m = await img.metadata();
  const w = m.width;
  const h = Math.min(m.height, Math.round(w * ratio));
  const cropped = await sharp(path.join(RAW, file)).extract({ left: 0, top: 0, width: w, height: h }).png().toBuffer();
  const mask = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${radius}" fill="#fff"/></svg>`;
  await sharp(cropped).composite([{ input: Buffer.from(mask), blend: "dest-in" }]).png().toFile(path.join(OUT, out));
}

(async () => {
  // Screenshot website (bersama untuk semua tema)
  await roundedCrop("desktop-beranda.png", "shot-home.png", 1 / 1.6, 6);
  await roundedCrop("pasar-keranjang.png", "shot-cart.png", 2.1, 34);
  await roundedCrop("penjual-produk.png", "shot-seller.png", 2.1, 34);
  await sharp(path.join(__dirname, "..", "public", "logo-desa.svg")).resize(512, 512).png().toFile(path.join(OUT, "logo.png"));
  await QRCode.toFile(path.join(OUT, "qr.png"), DEMO_URL, { width: 700, margin: 1, color: { dark: "#0B3B38FF", light: "#FFFFFFFF" } });

  const TECH = [
    ["SiNextdotjs", "Next.js"], ["SiReact", "React"], ["SiTypescript", "TypeScript"], ["SiTailwindcss", "Tailwind"],
    ["SiPostgresql", "PostgreSQL"], ["SiVercel", "Vercel"], ["SiGooglegemini", "Gemini AI"], ["SiLeaflet", "Leaflet"], ["SiGithubactions", "CI tests"],
  ];
  const techOk = [];

  for (const [key, t] of Object.entries(THEMES)) {
    const dir = path.join(OUT, key);
    fs.mkdirSync(dir, { recursive: true });
    const wrap = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${inner}</svg>`;
    await svgPng(wrap(base(t)), path.join(dir, "bg-content.png"), W, H);
    await svgPng(wrap(base(t) + titleDecor(t)), path.join(dir, "bg-title.png"), W, H);
    await svgPng(wrap(base(t) + endDecor(t)), path.join(dir, "bg-end.png"), W, H);
    await svgPng(blob(t), path.join(dir, "blob.png"), 800, 600);

    try {
      await map(t, path.join(dir, "map.png"));
    } catch (e) {
      console.warn("map fallback:", e.message);
      const ph = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="470"><rect width="1200" height="470" rx="36" fill="#E5E5E5"/><text x="600" y="245" text-anchor="middle" font-family="Arial" font-size="34" fill="#555">Mauk, Tangerang Regency, Banten</text></svg>`;
      await svgPng(ph, path.join(dir, "map.png"), 1200, 470);
    }

    const icons = { FaClock: "services", FaChartBar: "data", FaStore: "market", FaRobot: "ai", FaSearch: "search" };
    for (const [c, name] of Object.entries(icons)) {
      await icon(fa[c], "FFFFFF", path.join(dir, `icon-${name}-w.png`));
      await icon(fa[c], t.dark, path.join(dir, `icon-${name}-d.png`));
    }
    await icon(fa.FaStore, t.dark, path.join(dir, "store-on.png"));
    await icon(fa.FaStore, t.soft, path.join(dir, "store-off.png"));

    for (const [c, label] of TECH) {
      const ok = await icon(si[c], t.dark, path.join(dir, `tech-${c}.png`), 200);
      if (ok && key === Object.keys(THEMES)[0]) techOk.push({ file: `tech-${c}.png`, label });
    }
  }
  fs.writeFileSync(path.join(OUT, "tech.json"), JSON.stringify(techOk));
  console.log("assets ready; tech icons:", techOk.map((x) => x.label).join(", "));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
