// Pitch deck EcoQuest IIT Challenge 2026 — Desa Marga Mulya.
// Sedikit kata, banyak data. Palet sama dengan website (Modern Minimalist).
const path = require("path");
const pptxgen = require("pptxgenjs");

const A = (f) => path.join(__dirname, "assets", "build", f);
const DEMO_URL = process.env.DEMO_URL || "https://desa-marga-mulya.vercel.app";
const DEMO_LABEL = DEMO_URL.replace(/^https?:\/\//, "");

const C = "36454F"; // charcoal — dominan
const D = "253037"; // charcoal tua
const S = "708090"; // slate
const M = "5B6875"; // teks sekunder
const L = "D3D3D3"; // light gray
const P = "F4F4F4"; // permukaan
const W = "FFFFFF";
const FONT = "Arial";

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in
pres.title = "Desa Marga Mulya — EcoQuest IIT Challenge 2026";

// ---------- helpers ----------
const text = (slide, t, o) => slide.addText(t, { fontFace: FONT, margin: 0, valign: "top", ...o });

function title(slide, t, color = C) {
  text(slide, t, { x: 0.5, y: 0.38, w: 8.2, h: 0.6, fontSize: 28, bold: true, color });
}

function stat(slide, x, y, w, value, label, o = {}) {
  const vc = o.dark ? W : C;
  const lc = o.dark ? L : M;
  text(slide, value, { x, y, w, h: o.vh ?? 0.62, fontSize: o.size ?? 34, bold: true, color: vc });
  text(slide, label, { x, y: y + (o.vh ?? 0.62), w, h: 0.45, fontSize: o.lsize ?? 11, color: lc });
}

function sources(slide, t, dark = false) {
  text(slide, t, { x: 0.5, y: 5.22, w: 9, h: 0.25, fontSize: 8, color: dark ? L : M });
}

function logoSlot(slide, dark) {
  // Tempat logo resmi IIT Challenge (wajib). Ganti kotak ini dengan file logo dari panitia.
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 8.2, y: 0.32, w: 1.3, h: 0.5,
    fill: { color: dark ? D : P },
    line: { color: dark ? S : L, width: 0.75, dashType: "dash" },
  });
  text(slide, "IIT Challenge logo", { x: 8.2, y: 0.32, w: 1.3, h: 0.5, fontSize: 8, color: dark ? L : M, align: "center", valign: "middle" });
}

// =====================================================================
// 1. Introduction
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: C };
  logoSlot(s, true);
  text(s, "EcoQuest Web Application\nIIT Challenge 2026", { x: 0.5, y: 0.38, w: 5, h: 0.5, fontSize: 11, color: L });
  text(s, "Desa Marga Mulya", { x: 0.5, y: 1.35, w: 9, h: 1.0, fontSize: 54, bold: true, color: W });
  text(s, "Village services, data, and local trade in one website.", { x: 0.5, y: 2.35, w: 8, h: 0.45, fontSize: 18, color: L });

  s.addShape(pres.shapes.LINE, { x: 0.5, y: 3.55, w: 9, h: 0, line: { color: S, width: 0.75 } });
  const items = [["10", "public pages"], ["42", "village data tables"], ["16", "local products"], ["3", "user roles"]];
  items.forEach(([v, l], i) => stat(s, 0.5 + i * 2.25, 3.8, 2, v, l, { dark: true, size: 36, lsize: 12 }));
  sources(s, "Mauk, Tangerang Regency, Banten", true);
  s.addNotes(
    "Good morning. We built the official website for Desa Marga Mulya in Mauk, Tangerang. It brings village services, open data, and a local marketplace together, and every piece of content is managed through a CMS."
  );
}

// =====================================================================
// 2. Village overview
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: W };
  title(s, "A coastal farming village");
  text(s, "North coast of Tangerang, near Tanjung Kait beach", { x: 0.5, y: 0.95, w: 8, h: 0.3, fontSize: 12, color: M });

  // Angka kunci 2x2
  const k = [["7,842", "residents"], ["2,318", "households"], ["412 ha", "total area"], ["24", "neighbourhoods (RT)"]];
  k.forEach(([v, l], i) => stat(s, 0.5 + (i % 2) * 1.55, 1.6 + Math.floor(i / 2) * 1.35, 1.45, v, l, { size: 26, vh: 0.5 }));

  // Penggunaan lahan
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Land use", labels: ["Rice fields", "Housing", "Fish ponds", "Yards", "Other"], values: [142, 98, 86, 36, 50] }], {
    x: 3.55, y: 1.35, w: 2.9, h: 3.55,
    holeSize: 58,
    chartColors: [C, S, "8A96A1", "AAB4BD", L],
    showTitle: true, title: "Land use (ha)", titleFontFace: FONT, titleFontSize: 12, titleColor: C,
    showLegend: true, legendPos: "b", legendFontFace: FONT, legendFontSize: 9, legendColor: M,
    showPercent: true, showValue: false, dataLabelColor: W, dataLabelFontSize: 9, dataLabelFontFace: FONT,
  });

  // Mata pencaharian
  s.addChart(pres.charts.BAR, [{ name: "Workers", labels: ["Traders", "Fishers", "Farm workers", "Farmers", "Private sector"], values: [402, 486, 540, 612, 1105] }], {
    x: 6.6, y: 1.35, w: 2.95, h: 3.55,
    barDir: "bar",
    chartColors: [S],
    showTitle: true, title: "Main livelihoods (people)", titleFontFace: FONT, titleFontSize: 12, titleColor: C,
    showLegend: false,
    showValue: true, dataLabelPosition: "outEnd", dataLabelColor: C, dataLabelFontSize: 9, dataLabelFontFace: FONT,
    catAxisLabelColor: M, catAxisLabelFontSize: 9, catAxisLabelFontFace: FONT, catAxisLineShow: false,
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    barGapWidthPct: 60,
  });

  sources(s, "Sample figures following the EcoQuest data structure (sections A–M); all values are editable in the website CMS.");
  s.addNotes(
    "Marga Mulya is a coastal farming village. Rice fields take the largest share of land, followed by housing and milkfish ponds. Most residents work in the private sector, in farming, or as fishers. These figures follow the competition's data structure and can be replaced with official data through the CMS."
  );
}

// =====================================================================
// 3. Problem identification
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: W };
  title(s, "Connected, but not informed");

  // Angka besar
  text(s, "80.66%", { x: 0.5, y: 1.25, w: 3.1, h: 1.0, fontSize: 54, bold: true, color: C });
  text(s, "of Indonesians are online", { x: 0.5, y: 2.25, w: 3.0, h: 0.35, fontSize: 13, color: M });
  text(s, "0", { x: 0.5, y: 3.05, w: 3.0, h: 0.8, fontSize: 44, bold: true, color: C });
  text(s, "official websites found when searching\n“Desa Marga Mulya Mauk”", { x: 0.5, y: 3.85, w: 3.0, h: 0.6, fontSize: 12, color: M });

  // Desa: online tapi pemakaian kecil
  s.addChart(pres.charts.BAR, [{ name: "Rural", labels: ["Rural residents online", "Rural share of national usage"], values: [74, 30.5] }], {
    x: 3.75, y: 1.2, w: 2.85, h: 3.4,
    barDir: "col",
    chartColors: [C],
    showTitle: true, title: "Rural internet (%)", titleFontFace: FONT, titleFontSize: 12, titleColor: C,
    showLegend: false,
    showValue: true, dataLabelPosition: "outEnd", dataLabelColor: C, dataLabelFontSize: 12, dataLabelFontFace: FONT, dataLabelFormatCode: "0.#",
    catAxisLabelColor: M, catAxisLabelFontSize: 9, catAxisLabelFontFace: FONT,
    valAxisHidden: true, valAxisMaxVal: 100, valAxisMinVal: 0, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    barGapWidthPct: 45,
  });

  // UMKM digital
  s.addChart(pres.charts.DOUGHNUT, [{ name: "MSMEs", labels: ["Digital (27M)", "Not yet (38M)"], values: [27, 38] }], {
    x: 6.75, y: 1.2, w: 2.8, h: 3.4,
    holeSize: 62,
    chartColors: [C, L],
    showTitle: true, title: "MSMEs online (millions)", titleFontFace: FONT, titleFontSize: 12, titleColor: C,
    showLegend: true, legendPos: "b", legendFontFace: FONT, legendFontSize: 10, legendColor: M,
    showPercent: true, dataLabelColor: C, dataLabelFontSize: 11, dataLabelFontFace: FONT,
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 3.75, y: 4.7, w: 5.8, h: 0.42, fill: { color: P }, line: { color: P } });
  text(s, "MSMEs generate ~61% of GDP and ~97% of jobs.", { x: 3.9, y: 4.7, w: 5.6, h: 0.42, fontSize: 11, color: C, valign: "middle" });

  sources(s, "Sources: APJII Internet Survey 2025 & 2024; Kemenkeu via ITEJ (MSME GDP, jobs); Statista (65M MSMEs, 2023); GoodStats (27M digital MSMEs, 2023). Search check by team, Sep 2026.");
  s.addNotes(
    "Connectivity is not the barrier: 80 percent of Indonesians are online and 74 percent of rural residents too. But rural areas generate only 30 percent of internet usage, and when we searched for Desa Marga Mulya we found no official website. For local businesses the gap is similar: MSMEs carry most of the economy, yet about 58 percent are still offline."
  );
}

// =====================================================================
// 4. Proposed solution
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: P };
  title(s, "One platform, four users");

  const cols = [
    { icon: "residents", who: "Residents", need: "Is the office open?\nWhat do I bring?", value: "7", unit: "service checklists + live office status" },
    { icon: "buyers", who: "Visitors & buyers", need: "What can I buy\nor visit?", value: "16", unit: "local products, WhatsApp checkout" },
    { icon: "sellers", who: "Sellers", need: "How do I sell\nwithout a store?", value: "0%", unit: "commission, own seller portal" },
    { icon: "admin", who: "Village admin", need: "How do I update\nthe website?", value: "11", unit: "CMS collections, no coding" },
  ];
  const cw = 2.08, gap = 0.22;
  cols.forEach((c, i) => {
    const x = 0.5 + i * (cw + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.25, w: cw, h: 3.75, fill: { color: W }, line: { color: L, width: 0.75 }, rectRadius: 0.08 });
    s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: 1.5, w: 0.62, h: 0.62, fill: { color: C }, line: { color: C } });
    s.addImage({ path: A(`icon-${c.icon}.png`), x: x + 0.39, y: 1.64, w: 0.34, h: 0.34 });
    text(s, c.who, { x: x + 0.25, y: 2.3, w: cw - 0.4, h: 0.35, fontSize: 14, bold: true, color: C });
    text(s, c.need, { x: x + 0.25, y: 2.68, w: cw - 0.4, h: 0.6, fontSize: 11, color: M, italic: true });
    text(s, c.value, { x: x + 0.25, y: 3.5, w: cw - 0.4, h: 0.62, fontSize: 32, bold: true, color: C });
    text(s, c.unit, { x: x + 0.25, y: 4.12, w: cw - 0.4, h: 0.7, fontSize: 10, color: M });
  });
  sources(s, "Every page and number on the website is stored in the database and edited through the CMS.");
  s.addNotes(
    "We designed for four users. Residents see right away whether the office is open and what documents to bring. Visitors can buy local products and send the order straight to the seller on WhatsApp. Sellers get their own portal with no commission. And the village admin updates everything through the CMS, without writing code."
  );
}

// =====================================================================
// 5. Features & demonstration
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: W };
  title(s, "Built and live");

  s.addImage({ path: A("home.png"), x: 0.5, y: 1.15, w: 4.9, h: 3.06, sizing: { type: "cover", w: 4.9, h: 3.06 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.15, w: 4.9, h: 3.06, fill: { type: "none" }, line: { color: L, width: 0.75 } });
  text(s, "Home: live office status", { x: 0.5, y: 4.25, w: 4.9, h: 0.25, fontSize: 9, color: M });

  const phones = [
    ["cart.png", "Cart, split per seller"],
    ["seller.png", "Seller portal"],
  ];
  phones.forEach(([f, cap], i) => {
    const x = 5.65 + i * 1.65;
    s.addImage({ path: A(f), x, y: 1.15, w: 1.42, h: 3.06, sizing: { type: "cover", w: 1.42, h: 3.06 } });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.15, w: 1.42, h: 3.06, fill: { type: "none" }, line: { color: L, width: 0.75 } });
    text(s, cap, { x, y: 4.25, w: 1.6, h: 0.25, fontSize: 9, color: M });
  });

  const st = [["10", "public pages"], ["42", "data tables, CSV export"], ["109", "automated checks passing"], ["AI", "Tanya Desa assistant"]];
  st.forEach(([v, l], i) => stat(s, 0.5 + i * 2.3, 4.55, 2.2, v, l, { size: 20, vh: 0.36, lsize: 9 }));
  sources(s, `Live demo: ${DEMO_LABEL}`);
  s.addNotes(
    "Here is the live site. On the home page, residents see whether the office is open right now. In the marketplace, one cart can hold products from several sellers and is split into one WhatsApp order per seller. Sellers manage price and stock on their phone, and new products are approved by the admin before they go live. 109 automated checks run on every update."
  );
}

// =====================================================================
// 6. Impact & feasibility
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: W };
  title(s, "Low cost, high reach");

  const big = [["Rp 0", "monthly hosting on free tiers"], ["0%", "commission for village sellers"], ["3", "steps from product to WhatsApp order"]];
  big.forEach(([v, l], i) => {
    const y = 1.2 + i * 1.25;
    text(s, v, { x: 0.5, y, w: 2.6, h: 0.75, fontSize: 40, bold: true, color: C });
    text(s, l, { x: 3.15, y: y + 0.18, w: 2.3, h: 0.55, fontSize: 12, color: M });
  });

  text(s, "SDG targets", { x: 5.9, y: 1.2, w: 3.6, h: 0.3, fontSize: 12, bold: true, color: C });
  const sdg = [["8", "Decent work"], ["9", "Innovation"], ["11", "Sustainable communities"], ["16", "Strong institutions"]];
  sdg.forEach(([n, l], i) => {
    const x = 5.9 + (i % 2) * 1.85;
    const y = 1.6 + Math.floor(i / 2) * 1.62;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 1.7, h: 1.45, fill: { color: i === 0 ? C : P }, line: { color: i === 0 ? C : P }, rectRadius: 0.08 });
    text(s, n, { x: x + 0.18, y: y + 0.15, w: 1.3, h: 0.65, fontSize: 32, bold: true, color: i === 0 ? W : C });
    text(s, l, { x: x + 0.18, y: y + 0.85, w: 1.4, h: 0.5, fontSize: 10, color: i === 0 ? L : M });
  });
  sources(s, "Stack: Next.js on Vercel (Hobby), PostgreSQL on Neon (free), Google Gemini API (free tier). Free-tier limits apply.");
  s.addNotes(
    "The whole platform runs on free tiers, so the village pays nothing per month to start. Sellers keep all of their income, and ordering takes three steps. It supports SDG 8 through local business income, SDG 9 through digital infrastructure, SDG 11 for the community, and SDG 16 through transparent public information."
  );
}

// =====================================================================
// 7. Conclusion
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: C };
  logoSlot(s, true);
  text(s, "Village information,\none tap away.", { x: 0.5, y: 1.2, w: 5.6, h: 1.6, fontSize: 40, bold: true, color: W });

  const r = [["7", "services explained"], ["16", "products online"], ["24/7", "AI answers"]];
  r.forEach(([v, l], i) => stat(s, 0.5 + i * 1.9, 3.35, 1.8, v, l, { dark: true, size: 30, vh: 0.55, lsize: 11 }));

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.85, y: 1.2, w: 2.65, h: 3.2, fill: { color: W }, line: { color: W }, rectRadius: 0.1 });
  s.addImage({ path: A("qr.png"), x: 7.1, y: 1.4, w: 2.15, h: 2.15 });
  text(s, "Try the live demo", { x: 6.85, y: 3.65, w: 2.65, h: 0.3, fontSize: 12, bold: true, color: C, align: "center" });
  text(s, DEMO_LABEL, { x: 6.85, y: 3.95, w: 2.65, h: 0.3, fontSize: 9, color: M, align: "center" });
  sources(s, "Thank you.", true);
  s.addNotes(
    "To sum up: residents get answers without a trip to the office, local businesses get a market with no commission, and the village gets a website its own staff can run. Scan the code to try it. Thank you."
  );
}

const out = path.join(__dirname, "out", "Desa-Marga-Mulya-Pitch-Deck.pptx");
require("fs").mkdirSync(path.dirname(out), { recursive: true });
pres.writeFile({ fileName: out }).then((f) => console.log("wrote", f));
