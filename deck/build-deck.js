// Pitch deck EcoQuest IIT Challenge 2026 — Desa Marga Mulya.
// Gaya: latar gelombang + gradasi, tab navigasi, judul tebal di tengah, kartu putus-putus & kartu gelap.
// Menghasilkan dua varian warna (lihat themes.js). Maksimal 7 slide sesuai aturan lomba.
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { THEMES } = require("./themes");

const DEMO_URL = process.env.DEMO_URL || "https://desa-marga-mulya.vercel.app";
const DEMO_LABEL = DEMO_URL.replace(/^https?:\/\//, "");
const FONT = "Montserrat";
const BUILD = path.join(__dirname, "assets", "build");
const TECH = JSON.parse(fs.readFileSync(path.join(BUILD, "tech.json"), "utf8"));
const TABS = ["Village", "Problem", "Solution", "Demo", "Impact"];

function build(key, t) {
  const A = (f) => path.join(BUILD, key, f);
  const S = (f) => path.join(BUILD, f);
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in
  pres.title = "Desa Marga Mulya — EcoQuest IIT Challenge 2026";

  const text = (slide, v, o) => slide.addText(v, { fontFace: FONT, margin: 0, valign: "top", color: t.text, ...o });
  const shadow = () => ({ type: "outer", color: "000000", opacity: 0.16, blur: 10, offset: 3, angle: 90 });

  function nav(slide, active) {
    const w = 1.8;
    TABS.forEach((tab, i) => {
      const x = 0.5 + i * w;
      const on = i === active;
      if (on) slide.addShape(pres.shapes.RECTANGLE, { x: x + 0.3, y: 0.1, w: w - 0.6, h: 0.035, fill: { color: t.dark }, line: { color: t.dark } });
      text(slide, tab, { x, y: 0.16, w, h: 0.25, fontSize: 9, bold: on, color: on ? t.text : "8C8C8C", align: "center" });
    });
  }
  function heading(slide, title, sub) {
    text(slide, title, { x: 0.5, y: 0.5, w: 9, h: 0.55, fontSize: 26, bold: true, align: "center" });
    if (sub) text(slide, sub, { x: 0.5, y: 1.04, w: 9, h: 0.3, fontSize: 12, bold: true, align: "center", color: t.muted });
  }
  function logoSlot(slide, x, y, w, h) {
    // Tempat logo resmi IIT Challenge — ganti dengan logo dari panitia.
    slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: "000000" }, line: { color: "FFFFFF", width: 0.75, dashType: "dash" } });
    text(slide, "IIT Challenge logo", { x, y, w, h, fontSize: 8, color: "FFFFFF", align: "center", valign: "middle" });
  }

  // =====================================================================
  // 1. Introduction
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-title.png") };
    logoSlot(s, 0.13, 0.15, 1.35, 0.55);
    s.addImage({ path: S("logo.png"), x: 1.3, y: 1.5, w: 0.85, h: 0.85 });
    s.addText(
      [
        { text: "Desa ", options: { color: t.text } },
        { text: "Marga Mulya", options: { color: t.gray } },
      ],
      { x: 2.3, y: 1.45, w: 6.6, h: 0.95, fontFace: FONT, fontSize: 40, bold: true, margin: 0, valign: "middle", fit: "shrink" }
    );
    text(s, "Village Services, Open Data & Local Trade in One Website", { x: 1.0, y: 2.62, w: 8, h: 0.4, fontSize: 18, bold: true, align: "center" });
    text(s, "EcoQuest Web Application  |  IIT Challenge 2026", { x: 1.0, y: 3.08, w: 8, h: 0.3, fontSize: 11, align: "center", color: t.muted });

    // Kotak tim — ganti lingkaran dengan foto anggota
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 4.05, w: 3.9, h: 1.3, fill: { color: "FFFFFF", transparency: 30 }, line: { color: t.dark, width: 0.75 }, rectRadius: 0.12 });
    ["Member 1", "Member 2", "Member 3"].forEach((n, i) => {
      const x = 0.85 + i * 1.25;
      s.addShape(pres.shapes.OVAL, { x: x + 0.15, y: 4.18, w: 0.7, h: 0.7, fill: { color: t.soft }, line: { color: t.dark, width: 0.75 } });
      text(s, n, { x, y: 4.95, w: 1.0, h: 0.25, fontSize: 9, bold: true, align: "center" });
    });
    s.addNotes("Good morning. We are presenting the official website for Desa Marga Mulya in Mauk, Tangerang: village services, open data, and a local marketplace in one place, all managed through a CMS.");
  }

  // =====================================================================
  // 2. Village overview
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-content.png") };
    nav(s, 0);
    heading(s, "A COASTAL FARMING VILLAGE", "“Rice fields, milkfish ponds, and the Java Sea”");
    s.addImage({ path: A("map.png"), x: 1.35, y: 1.45, w: 7.3, h: 2.86 });

    const cards = [
      ["RESIDENTS", "7,842", "2,318 households"],
      ["RICE FIELDS & FISH PONDS", "55%", "228 of 412 ha of land"],
      ["FARMING & FISHING JOBS", "41%", "1,638 of 4,035 workers"],
    ];
    cards.forEach(([label, value, note], i) => {
      const x = 0.75 + i * 2.95;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.45, w: 2.6, h: 1.0, fill: { color: "FFFFFF" }, line: { color: "FFFFFF" }, rectRadius: 0.12, shadow: shadow() });
      text(s, label, { x, y: 4.52, w: 2.6, h: 0.22, fontSize: 8, bold: true, align: "center" });
      text(s, value, { x, y: 4.72, w: 2.6, h: 0.45, fontSize: 24, bold: true, align: "center" });
      text(s, note, { x, y: 5.17, w: 2.6, h: 0.2, fontSize: 7, italic: true, align: "center", color: t.muted });
    });
    s.addNotes("Marga Mulya sits on the north coast of Tangerang. More than half of its land is rice fields and fish ponds, and about four in ten workers farm or fish. Village figures follow the competition's data structure and can be replaced with official data in the CMS.");
  }

  // =====================================================================
  // 3. Problem identification
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-content.png") };
    nav(s, 1);
    heading(s, "Connected, But Not Informed", "Search “Desa Marga Mulya Mauk”: 0 official websites found");

    const cw = 2.85;
    const xs = [0.55, 3.575, 6.6];
    const top = 1.5;
    const ch = 3.05;
    const dashed = (x) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: top, w: cw, h: ch, fill: { color: "FFFFFF", transparency: 20 }, line: { color: t.dark, width: 1.25, dashType: "sysDot" }, rectRadius: 0.1 });

    // Kartu 1: jangkauan desa
    dashed(xs[0]);
    text(s, "Rural Reach", { x: xs[0], y: top + 0.15, w: cw, h: 0.3, fontSize: 14, bold: true, align: "center" });
    text(s, "74%", { x: xs[0] + 0.2, y: top + 0.5, w: 1.35, h: 0.55, fontSize: 32, bold: true });
    text(s, "of rural residents are online", { x: xs[0] + 1.55, y: top + 0.55, w: 1.15, h: 0.5, fontSize: 9, bold: true });
    s.addChart(pres.charts.PIE, [{ name: "Rural", labels: ["Online", "Offline"], values: [74, 26] }], {
      x: xs[0] + 0.72, y: top + 1.08, w: 1.4, h: 1.4, chartColors: [t.dark, t.soft], showLegend: false, showValue: false, showPercent: false, dataBorder: { pt: 1, color: "FFFFFF" },
    });
    text(s, "yet rural areas make up only 30.5% of national internet use", { x: xs[0] + 0.2, y: top + 2.5, w: cw - 0.4, h: 0.45, fontSize: 9, align: "center" });

    // Kartu 2: UMKM offline
    dashed(xs[1]);
    text(s, "The Analog Trap", { x: xs[1], y: top + 0.15, w: cw, h: 0.3, fontSize: 14, bold: true, align: "center" });
    text(s, "6 of 10 MSMEs are still offline", { x: xs[1] + 0.2, y: top + 0.55, w: cw - 0.4, h: 0.5, fontSize: 12, bold: true, align: "center" });
    for (let i = 0; i < 10; i++) {
      const col = i % 5;
      const row = Math.floor(i / 5);
      s.addImage({ path: A(i < 6 ? "store-on.png" : "store-off.png"), x: xs[1] + 0.3 + col * 0.46, y: top + 1.2 + row * 0.55, w: 0.38, h: 0.38 });
    }
    text(s, "27M of ~65M MSMEs are digital", { x: xs[1] + 0.2, y: top + 2.5, w: cw - 0.4, h: 0.45, fontSize: 9, align: "center" });

    // Kartu 3: mesin ekonomi
    dashed(xs[2]);
    text(s, "The Nation’s Engine", { x: xs[2], y: top + 0.15, w: cw, h: 0.3, fontSize: 14, bold: true, align: "center" });
    [["61%", "of GDP"], ["97%", "of jobs"]].forEach(([v, l], i) => {
      const bx = xs[2] + 0.22 + i * 1.25;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y: top + 0.6, w: 1.15, h: 1.55, fill: { color: "FFFFFF" }, line: { color: t.dark, width: 1 }, rectRadius: 0.12 });
      text(s, v, { x: bx, y: top + 0.95, w: 1.15, h: 0.5, fontSize: 24, bold: true, align: "center" });
      text(s, l, { x: bx, y: top + 1.55, w: 1.15, h: 0.3, fontSize: 9, bold: true, align: "center" });
    });
    text(s, "MSMEs carry the economy, but most still sell offline", { x: xs[2] + 0.2, y: top + 2.5, w: cw - 0.4, h: 0.45, fontSize: 9, align: "center" });

    const src = ["source: APJII Internet Survey, 2024", "source: Statista 2023; GoodStats 2023", "source: Kemenkeu, via ITEJ journal"];
    src.forEach((v, i) => text(s, v, { x: xs[i] + 0.1, y: top + ch + 0.08, w: cw, h: 0.2, fontSize: 7, italic: true, color: t.muted }));
    s.addNotes("80 percent of Indonesians are online, and 74 percent of rural residents too, yet rural areas generate only 30 percent of internet use. When we searched for Desa Marga Mulya we found no official website. Six in ten small businesses are still offline, even though they generate 61 percent of GDP and 97 percent of jobs.");
  }

  // =====================================================================
  // 4. Proposed solution
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-content.png") };
    nav(s, 2);
    heading(s, "Our Unfair Advantage", "Village information and local trade, in one place");

    // Kuadran posisi (indikatif)
    const ox = 2.55;
    const oy = 3.3;
    s.addShape(pres.shapes.LINE, { x: 0.75, y: oy, w: 3.6, h: 0, line: { color: t.dark, width: 2, beginArrowType: "triangle", endArrowType: "triangle" } });
    s.addShape(pres.shapes.LINE, { x: ox, y: 1.55, w: 0, h: 3.5, line: { color: t.dark, width: 2, beginArrowType: "triangle", endArrowType: "triangle" } });
    text(s, "Rich village info", { x: ox - 1, y: 1.36, w: 2, h: 0.2, fontSize: 9, align: "center" });
    text(s, "Little village info", { x: ox - 1, y: 5.08, w: 2, h: 0.2, fontSize: 9, align: "center" });
    text(s, "No local trade", { x: 0.75, y: oy + 0.08, w: 1.4, h: 0.2, fontSize: 8 });
    text(s, "Local trade built in", { x: 2.95, y: oy + 0.08, w: 1.4, h: 0.2, fontSize: 8, align: "right" });
    const chip = (label, x, y, dark = false) => {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 1.45, h: 0.38, fill: { color: dark ? t.dark : "FFFFFF" }, line: { color: t.dark, width: 0.75 }, rectRadius: 0.19, shadow: dark ? shadow() : undefined });
      text(s, label, { x, y, w: 1.45, h: 0.38, fontSize: 8, bold: true, align: "center", valign: "middle", color: dark ? "FFFFFF" : t.text });
    };
    chip("Desa Marga Mulya", 2.8, 1.85, true);
    chip("Village info systems", 0.85, 2.3);
    chip("Village social media", 0.85, 4.2);
    chip("Big marketplaces", 2.8, 4.2);
    text(s, "Indicative positioning by team", { x: 0.75, y: 5.3, w: 3.6, h: 0.18, fontSize: 7, italic: true, color: t.muted });

    // Empat keunggulan dengan angka
    const rows = [
      ["services", "LIVE OFFICE STATUS", "7", "service checklists"],
      ["data", "OPEN VILLAGE DATA", "42", "tables, CSV export"],
      ["market", "PASAR DESA", "0%", "seller commission"],
      ["ai", "TANYA DESA AI", "24/7", "answers from CMS data"],
    ];
    rows.forEach(([ic, label, value, note], i) => {
      const y = 1.5 + i * 0.93;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.0, y, w: 4.5, h: 0.78, fill: { color: t.dark }, line: { color: t.dark }, rectRadius: 0.14, shadow: shadow() });
      s.addShape(pres.shapes.OVAL, { x: 5.15, y: y + 0.14, w: 0.5, h: 0.5, fill: { color: t.primary }, line: { color: t.primary } });
      s.addImage({ path: A(`icon-${ic}-w.png`), x: 5.27, y: y + 0.26, w: 0.26, h: 0.26 });
      text(s, label, { x: 5.85, y: y + 0.12, w: 2.2, h: 0.28, fontSize: 11, bold: true, color: "FFFFFF" });
      text(s, note, { x: 5.85, y: y + 0.42, w: 2.2, h: 0.24, fontSize: 8, color: "D0D0D0" });
      text(s, value, { x: 7.9, y: y + 0.1, w: 1.45, h: 0.58, fontSize: 24, bold: true, color: t.highlight, align: "right", valign: "middle" });
    });
    s.addNotes("Village information systems give data but no trade. Marketplaces give trade but take fees and know nothing about the village. Our website does both: live office status with service checklists, 42 open data tables, a commission-free village market, and an AI assistant that answers from the village's own data.");
  }

  // =====================================================================
  // 5. Features & demonstration
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-content.png") };
    nav(s, 3);
    heading(s, "Built and Live", `Live demo: ${DEMO_LABEL}`);

    s.addImage({ path: A("blob.png"), x: -0.35, y: 2.55, w: 2.3, h: 1.75 });
    s.addImage({ path: A("blob.png"), x: 7.7, y: 2.1, w: 2.7, h: 2.1, flipH: true });

    // Laptop
    const lx = 0.9, ly = 1.5, lw = 4.6, lh = 2.72;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: lx, y: ly, w: lw, h: lh, fill: { color: "1A1A1A" }, line: { color: "1A1A1A" }, rectRadius: 0.1, shadow: shadow() });
    s.addImage({ path: S("shot-home.png"), x: lx + 0.1, y: ly + 0.1, w: lw - 0.2, h: lh - 0.2, sizing: { type: "cover", w: lw - 0.2, h: lh - 0.2 } });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: lx - 0.25, y: ly + lh, w: lw + 0.5, h: 0.12, fill: { color: "BFBFBF" }, line: { color: "BFBFBF" }, rectRadius: 0.05 });
    text(s, "Home: live office status", { x: lx, y: ly + lh + 0.18, w: lw, h: 0.22, fontSize: 9, bold: true, align: "center" });

    // Dua ponsel
    [["shot-cart.png", "Cart split per seller"], ["shot-seller.png", "Seller portal"]].forEach(([f, cap], i) => {
      const px = 5.95 + i * 1.75, py = 1.45, pw = 1.45, ph = 2.95;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px, y: py, w: pw, h: ph, fill: { color: "1A1A1A" }, line: { color: "1A1A1A" }, rectRadius: 0.18, shadow: shadow() });
      s.addImage({ path: S(f), x: px + 0.07, y: py + 0.07, w: pw - 0.14, h: ph - 0.14, sizing: { type: "cover", w: pw - 0.14, h: ph - 0.14 } });
      text(s, cap, { x: px - 0.15, y: py + ph + 0.08, w: pw + 0.3, h: 0.22, fontSize: 9, bold: true, align: "center" });
    });

    // Tech stack
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.55, y: 4.75, w: 8.9, h: 0.72, fill: { color: "FFFFFF" }, line: { color: t.dark, width: 1 }, rectRadius: 0.14 });
    text(s, "Tech Stack", { x: 0.75, y: 4.75, w: 1.2, h: 0.72, fontSize: 11, bold: true, valign: "middle" });
    const step = 7.2 / Math.max(TECH.length, 1);
    TECH.forEach((tc, i) => {
      const x = 2.05 + i * step;
      s.addImage({ path: A(tc.file), x: x + step / 2 - 0.15, y: 4.83, w: 0.3, h: 0.3 });
      text(s, tc.label, { x, y: 5.15, w: step, h: 0.2, fontSize: 7, align: "center", color: t.muted });
    });
    s.addNotes("This is the live site. Residents see whether the office is open right now. In the Pasar Desa, one cart can hold products from several sellers and becomes one WhatsApp order per seller. Sellers manage price and stock from their phone, and new products are reviewed by the admin first.");
  }

  // =====================================================================
  // 6. Impact & feasibility
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-content.png") };
    nav(s, 4);
    heading(s, "A True Win-Win-Win", "Impact & feasibility");

    const cols = [
      { who: "Residents", dark: true, rows: [["7", "services with checklists"], ["24/7", "AI answers"], ["0", "trips just to ask"]] },
      { who: "Village Office", dark: false, rows: [["Rp 0", "monthly hosting"], ["11", "CMS collections"], ["109", "automated checks"]] },
      { who: "Sellers", dark: true, rows: [["0%", "commission"], ["3", "steps to WhatsApp order"], ["16", "products online"]] },
    ];
    cols.forEach((c, i) => {
      const x = 0.75 + i * 2.95, y = 1.5, w = 2.55, h = 3.15;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: c.dark ? t.dark : "FFFFFF" }, line: { color: c.dark ? t.dark : "FFFFFF" }, rectRadius: 0.2, shadow: shadow() });
      text(s, c.who, { x, y: y + 0.22, w, h: 0.4, fontSize: 18, bold: true, align: "center", color: c.dark ? "FFFFFF" : t.text });
      c.rows.forEach(([v, l], r) => {
        const ry = y + 0.85 + r * 0.73;
        text(s, v, { x: x + 0.25, y: ry, w: 1.05, h: 0.5, fontSize: 22, bold: true, color: c.dark ? t.highlight : t.primary, valign: "middle" });
        text(s, l, { x: x + 1.3, y: ry, w: w - 1.45, h: 0.5, fontSize: 9, bold: true, color: c.dark ? "FFFFFF" : t.text, valign: "middle" });
      });
    });

    const sdg = ["SDG 8  Decent work", "SDG 9  Innovation", "SDG 11  Communities", "SDG 16  Institutions"];
    sdg.forEach((v, i) => {
      const x = 0.95 + i * 2.1;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.88, w: 1.95, h: 0.4, fill: { color: "FFFFFF" }, line: { color: t.dark, width: 0.75 }, rectRadius: 0.2 });
      text(s, v, { x, y: 4.88, w: 1.95, h: 0.4, fontSize: 9, bold: true, align: "center", valign: "middle" });
    });
    s.addNotes("Residents get answers without a trip to the office. The village office pays nothing per month on free tiers and updates everything through the CMS, backed by 109 automated checks. Sellers keep all their income and take orders in three steps. This supports SDGs 8, 9, 11, and 16.");
  }

  // =====================================================================
  // 7. Conclusion
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-end.png") };
    logoSlot(s, 0.13, 0.1, 1.2, 0.42);
    text(s, "THANK YOU", { x: 0.7, y: 1.3, w: 5.4, h: 0.8, fontSize: 44, bold: true });
    text(s, "Village information, one tap away.", { x: 0.7, y: 2.1, w: 5.4, h: 0.4, fontSize: 16, bold: true, color: t.muted });
    [["10", "public pages"], ["42", "data tables"], ["16", "local products"]].forEach(([v, l], i) => {
      const x = 0.7 + i * 1.8;
      text(s, v, { x, y: 3.0, w: 1.6, h: 0.6, fontSize: 32, bold: true });
      text(s, l, { x, y: 3.6, w: 1.6, h: 0.25, fontSize: 10, bold: true, color: t.muted });
    });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.75, y: 1.2, w: 2.6, h: 3.3, fill: { color: "FFFFFF" }, line: { color: "FFFFFF" }, rectRadius: 0.2, shadow: shadow() });
    s.addImage({ path: S("qr.png"), x: 7.05, y: 1.45, w: 2.0, h: 2.0 });
    text(s, "Scan to try the live demo", { x: 6.75, y: 3.6, w: 2.6, h: 0.3, fontSize: 11, bold: true, align: "center" });
    text(s, DEMO_LABEL, { x: 6.75, y: 3.9, w: 2.6, h: 0.3, fontSize: 8, align: "center", color: t.muted });
    s.addNotes("To sum up: residents get answers without a trip, local businesses get a commission-free market, and the village gets a website its own staff can run. Scan the code to try it. Thank you.");
  }

  const out = path.join(__dirname, "out", `Desa-Marga-Mulya-Pitch-Deck-${t.label}.pptx`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  return pres.writeFile({ fileName: out });
}

(async () => {
  for (const [key, t] of Object.entries(THEMES)) console.log("wrote", await build(key, t));
})();
