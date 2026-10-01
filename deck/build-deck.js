// Pitch deck EcoQuest IIT Challenge 2026 — Desa Marga Mulya (New Revisition).
// Framing: fragmentasi informasi → digital gateway untuk 3 audiens, 4 pilar.
// Gaya: latar gelombang + gradasi, tab navigasi, judul tebal di tengah, kartu putus-putus & kartu gelap.
// Warna tosca selaras website. Maksimal 7 slide sesuai aturan lomba.
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { THEMES } = require("./themes");

const DEMO_URL = process.env.DEMO_URL || "https://desa-marga-mulya.vercel.app";
const DEMO_LABEL = DEMO_URL.replace(/^https?:\/\//, "");
const FONT = "Montserrat";
const BUILD = path.join(__dirname, "assets", "build");
const TECH = JSON.parse(fs.readFileSync(path.join(BUILD, "tech.json"), "utf8"));
const TABS = ["Problem", "Gateway", "Solution", "Demo", "Impact"];

function build(key, t) {
  const A = (f) => path.join(BUILD, key, f);
  const S = (f) => path.join(BUILD, f);
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in
  pres.title = "Desa Marga Mulya — Digital Gateway (EcoQuest IIT Challenge 2026)";

  const text = (slide, v, o) => slide.addText(v, { fontFace: FONT, margin: 0, valign: "top", color: t.text, ...o });
  const shadow = () => ({ type: "outer", color: "0B3B38", opacity: 0.18, blur: 10, offset: 3, angle: 90 });

  function nav(slide, active) {
    const w = 1.8;
    TABS.forEach((tab, i) => {
      const x = 0.5 + i * w;
      const on = i === active;
      if (on) slide.addShape(pres.shapes.RECTANGLE, { x: x + 0.3, y: 0.1, w: w - 0.6, h: 0.035, fill: { color: t.primary }, line: { color: t.primary } });
      text(slide, tab, { x, y: 0.16, w, h: 0.25, fontSize: 9, bold: on, color: on ? t.text : "9AA7A4", align: "center" });
    });
  }
  function heading(slide, title, sub) {
    text(slide, title, { x: 0.5, y: 0.5, w: 9, h: 0.55, fontSize: 26, bold: true, align: "center" });
    if (sub) text(slide, sub, { x: 0.5, y: 1.04, w: 9, h: 0.3, fontSize: 12, bold: true, align: "center", color: t.muted });
  }
  function logoSlot(slide, x, y, w, h, light) {
    // Tempat logo resmi IIT Challenge — ganti dengan logo dari panitia.
    slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: light ? "FFFFFF" : t.dark }, line: { color: light ? t.dark : "FFFFFF", width: 0.75, dashType: "dash" } });
    text(slide, "IIT Challenge logo", { x, y, w, h, fontSize: 8, color: light ? t.muted : "FFFFFF", align: "center", valign: "middle" });
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
        { text: "Marga Mulya", options: { color: t.primary } },
      ],
      { x: 2.3, y: 1.45, w: 6.6, h: 0.95, fontFace: FONT, fontSize: 40, bold: true, margin: 0, valign: "middle", fit: "shrink" }
    );
    text(s, "The Digital Gateway for a Village", { x: 1.0, y: 2.62, w: 8, h: 0.4, fontSize: 18, bold: true, align: "center" });
    text(s, "Kenali desanya. Akses layanannya. Dukung ekonominya.", { x: 1.0, y: 3.06, w: 8, h: 0.32, fontSize: 12, align: "center", color: t.primary, italic: true });
    text(s, "EcoQuest Web Application  |  IIT Challenge 2026", { x: 1.0, y: 3.42, w: 8, h: 0.3, fontSize: 10, align: "center", color: t.muted });

    // Kotak tim — ganti lingkaran dengan foto anggota
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 4.15, w: 3.9, h: 1.25, fill: { color: "FFFFFF", transparency: 25 }, line: { color: t.primary, width: 0.75 }, rectRadius: 0.12 });
    ["Member 1", "Member 2", "Member 3"].forEach((n, i) => {
      const x = 0.85 + i * 1.25;
      s.addShape(pres.shapes.OVAL, { x: x + 0.15, y: 4.28, w: 0.68, h: 0.68, fill: { color: t.soft }, line: { color: t.primary, width: 0.75 } });
      text(s, n, { x, y: 5.02, w: 1.0, h: 0.25, fontSize: 9, bold: true, align: "center" });
    });
    s.addNotes("Good morning. We built a digital gateway for Desa Marga Mulya in Mauk, Tangerang. It connects three groups to the village: residents, local businesses, and people outside the village. Our tagline: know the village, reach its services, support its economy.");
  }

  // =====================================================================
  // 2. Problem — fragmentation
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-content.png") };
    nav(s, 0);
    heading(s, "Scattered, Not Missing", "The village has information and potential — but it is hard to find and use");

    // Tiga audiens dengan pertanyaan yang belum terjawab
    const cols = [
      { who: "A resident", q: "“Who do I even ask about this?”", pts: ["Services & requirements", "Announcements & events", "Village data"] },
      { who: "A buyer outside", q: "“What can I buy from this village?”", pts: ["Local products", "Who sells them", "How to order"] },
      { who: "A partner or researcher", q: "“Where is the data, and can I trust it?”", pts: ["Demographics", "Farming & fishery potential", "Facilities & location"] },
    ];
    cols.forEach((c, i) => {
      const x = 0.55 + i * 3.02, y = 1.55, w = 2.78, h = 2.35;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: "FFFFFF", transparency: 15 }, line: { color: t.primary, width: 1.25, dashType: "sysDot" }, rectRadius: 0.1 });
      text(s, c.who, { x: x + 0.2, y: y + 0.18, w: w - 0.4, h: 0.3, fontSize: 13, bold: true, color: t.primary });
      text(s, c.q, { x: x + 0.2, y: y + 0.5, w: w - 0.4, h: 0.55, fontSize: 12, italic: true, bold: true });
      s.addText(
        c.pts.map((p, j) => ({ text: p, options: { bullet: { code: "2022", indent: 12 }, breakLine: j < c.pts.length - 1, color: t.muted, fontSize: 10, paraSpaceAfter: 4 } })),
        { x: x + 0.2, y: y + 1.2, w: w - 0.4, h: 1.0, fontFace: FONT, margin: 0, valign: "top" }
      );
    });

    // Satu kalimat inti + angka pendukung
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.55, y: 4.1, w: 8.9, h: 1.1, fill: { color: t.dark }, line: { color: t.dark }, rectRadius: 0.14, shadow: shadow() });
    text(s, "The problem is fragmentation, not absence.", { x: 0.85, y: 4.24, w: 5.0, h: 0.4, fontSize: 15, bold: true, color: "FFFFFF" });
    text(s, "Services, data, and products exist — but they are scattered across offices, chats, and word of mouth.", { x: 0.85, y: 4.62, w: 5.0, h: 0.5, fontSize: 10, color: "E6F2F0" });
    [["74%", "rural residents online"], ["6 / 10", "MSMEs still offline"], ["0", "official village site found"]].forEach(([v, l], i) => {
      const x = 6.0 + i * 1.17;
      text(s, v, { x, y: 4.28, w: 1.1, h: 0.42, fontSize: 18, bold: true, color: t.highlight, align: "center" });
      text(s, l, { x, y: 4.72, w: 1.1, h: 0.4, fontSize: 7.5, color: "E6F2F0", align: "center" });
    });
    text(s, "source: APJII Internet Survey, 2024; team web search, Sep 2026", { x: 0.55, y: 5.26, w: 9, h: 0.2, fontSize: 7, italic: true, color: t.muted });
    s.addNotes("The village is not short on information or potential — it is scattered. A resident does not know who to ask. A buyer outside the village does not know what it sells. A partner cannot find trustworthy data. Connectivity is not the barrier: 74 percent of rural residents are online, yet six in ten small businesses are still offline, and there is no official village website.");
  }

  // =====================================================================
  // 3. Gateway — three audiences
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-content.png") };
    nav(s, 1);
    heading(s, "One Gateway, Three Audiences", "Not a village website — a digital gateway");

    s.addImage({ path: A("map.png"), x: 2.1, y: 1.45, w: 5.8, h: 2.27 });
    text(s, "Desa Marga Mulya", { x: 2.1, y: 3.75, w: 5.8, h: 0.25, fontSize: 10, bold: true, align: "center", color: t.muted });

    const cols = [
      { who: "Residents", need: "I need something from the village.", gets: "Services, status, announcements, AI help" },
      { who: "Local businesses", need: "I want more customers.", gets: "Pasar Desa, seller portal, WhatsApp orders" },
      { who: "People outside", need: "I want to know and support the village.", gets: "Explore, village data, local products" },
    ];
    cols.forEach((c, i) => {
      const x = 0.6 + i * 3.0, y = 4.1, w = 2.8, h = 1.25;
      const dark = i === 1;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: dark ? t.dark : "FFFFFF" }, line: { color: dark ? t.dark : t.primary, width: dark ? 0 : 1 }, rectRadius: 0.14, shadow: shadow() });
      text(s, c.who, { x: x + 0.2, y: y + 0.14, w: w - 0.4, h: 0.3, fontSize: 13, bold: true, color: dark ? "FFFFFF" : t.primary });
      text(s, c.need, { x: x + 0.2, y: y + 0.46, w: w - 0.4, h: 0.35, fontSize: 9.5, italic: true, color: dark ? "E6F2F0" : t.text });
      text(s, c.gets, { x: x + 0.2, y: y + 0.84, w: w - 0.4, h: 0.35, fontSize: 9, bold: true, color: dark ? t.highlight : t.muted });
    });
    s.addNotes("So we did not build a village website. We built a gateway with three audiences. Residents who need something from the village. Local businesses who want customers beyond the village. And people outside — buyers, visitors, partners — who want to know and support the village. One platform serves all three.");
  }

  // =====================================================================
  // 4. Solution — four pillars
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-content.png") };
    nav(s, 2);
    heading(s, "Four Pillars", "Kenali · Akses · Dukung");

    const pillars = [
      { icon: "services", kanji: "SERVE", id: "“I need something.”", pts: ["Service checklists", "Live office status", "AI assistant"], tag: "Live" },
      { icon: "search", kanji: "DISCOVER", id: "“I want to know it.”", pts: ["Interactive map", "Explore by category", "Village potential"], tag: "Live + Next" },
      { icon: "market", kanji: "BUY", id: "“I want to support it.”", pts: ["Pasar Desa", "Seller portal", "WhatsApp orders"], tag: "Live" },
      { icon: "data", kanji: "UNDERSTAND", id: "“I want the data.”", pts: ["42 data tables", "Village dashboard", "CSV export"], tag: "Live" },
    ];
    const cw = 2.14, gap = 0.19;
    pillars.forEach((p, i) => {
      const x = 0.55 + i * (cw + gap), y = 1.5, h = 3.65;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h, fill: { color: "FFFFFF" }, line: { color: t.primary, width: 1 }, rectRadius: 0.12, shadow: shadow() });
      s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: y + 0.25, w: 0.72, h: 0.72, fill: { color: t.primary }, line: { color: t.primary } });
      s.addImage({ path: A(`icon-${p.icon}-w.png`), x: x + 0.42, y: y + 0.42, w: 0.38, h: 0.38 });
      text(s, p.kanji, { x: x + 0.18, y: y + 1.12, w: cw - 0.3, h: 0.32, fontSize: 14, bold: true, color: t.text, fit: "shrink" });
      text(s, p.id, { x: x + 0.2, y: y + 1.46, w: cw - 0.4, h: 0.3, fontSize: 9.5, italic: true, color: t.muted });
      s.addText(
        p.pts.map((pt, j) => ({ text: pt, options: { bullet: { code: "2022", indent: 12 }, breakLine: j < p.pts.length - 1, fontSize: 9.5, color: t.text, paraSpaceAfter: 5 } })),
        { x: x + 0.2, y: y + 1.9, w: cw - 0.4, h: 1.1, fontFace: FONT, margin: 0, valign: "top" }
      );
      const live = p.tag === "Live";
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.2, y: y + 3.1, w: cw - 0.4, h: 0.32, fill: { color: live ? t.primary : "FFFFFF" }, line: { color: t.primary, width: 0.75 }, rectRadius: 0.16 });
      text(s, live ? "Live now" : p.tag, { x: x + 0.2, y: y + 3.1, w: cw - 0.4, h: 0.32, fontSize: 8.5, bold: true, align: "center", valign: "middle", color: live ? "FFFFFF" : t.primary });
    });
    s.addNotes("The gateway rests on four pillars. Serve: service checklists, live office status, and an AI assistant — live now. Discover: the interactive map and explore-by-category — the map is live and category discovery is our next step. Buy: the Pasar Desa marketplace with a seller portal — live now. Understand: 42 data tables and CSV export — live now.");
  }

  // =====================================================================
  // 5. Demo
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-content.png") };
    nav(s, 3);
    heading(s, "Built and Live", `Live demo: ${DEMO_LABEL}`);

    s.addImage({ path: A("blob.png"), x: -0.35, y: 2.55, w: 2.3, h: 1.75 });
    s.addImage({ path: A("blob.png"), x: 7.7, y: 2.1, w: 2.7, h: 2.1, flipH: true });

    const lx = 0.9, ly = 1.5, lw = 4.6, lh = 2.72;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: lx, y: ly, w: lw, h: lh, fill: { color: "0B3B38" }, line: { color: "0B3B38" }, rectRadius: 0.1, shadow: shadow() });
    s.addImage({ path: S("shot-home.png"), x: lx + 0.1, y: ly + 0.1, w: lw - 0.2, h: lh - 0.2, sizing: { type: "cover", w: lw - 0.2, h: lh - 0.2 } });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: lx - 0.25, y: ly + lh, w: lw + 0.5, h: 0.12, fill: { color: "BFCFCD" }, line: { color: "BFCFCD" }, rectRadius: 0.05 });
    text(s, "Home: live office status", { x: lx, y: ly + lh + 0.18, w: lw, h: 0.22, fontSize: 9, bold: true, align: "center" });

    [["shot-cart.png", "Cart split per seller"], ["shot-seller.png", "Seller portal"]].forEach(([f, cap], i) => {
      const px = 5.95 + i * 1.75, py = 1.45, pw = 1.45, ph = 2.95;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px, y: py, w: pw, h: ph, fill: { color: "0B3B38" }, line: { color: "0B3B38" }, rectRadius: 0.18, shadow: shadow() });
      s.addImage({ path: S(f), x: px + 0.07, y: py + 0.07, w: pw - 0.14, h: ph - 0.14, sizing: { type: "cover", w: pw - 0.14, h: ph - 0.14 } });
      text(s, cap, { x: px - 0.15, y: py + ph + 0.08, w: pw + 0.3, h: 0.22, fontSize: 9, bold: true, align: "center" });
    });

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.55, y: 4.75, w: 8.9, h: 0.72, fill: { color: "FFFFFF" }, line: { color: t.primary, width: 1 }, rectRadius: 0.14 });
    text(s, "Tech Stack", { x: 0.75, y: 4.75, w: 1.2, h: 0.72, fontSize: 11, bold: true, valign: "middle", color: t.primary });
    const step = 7.2 / Math.max(TECH.length, 1);
    TECH.forEach((tc, i) => {
      const x = 2.05 + i * step;
      s.addImage({ path: A(tc.file), x: x + step / 2 - 0.15, y: 4.83, w: 0.3, h: 0.3 });
      text(s, tc.label, { x, y: 5.15, w: step, h: 0.2, fontSize: 7, align: "center", color: t.muted });
    });
    s.addNotes("This is the live site. On the home page, residents see whether the office is open right now. In the Pasar Desa, one cart can hold products from several sellers and becomes one WhatsApp order per seller. Sellers manage price and stock from their phone, and new products are reviewed by the admin first.");
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
      { who: "Businesses", dark: true, rows: [["0%", "commission"], ["3", "steps to WhatsApp order"], ["16", "products online"]] },
    ];
    cols.forEach((c, i) => {
      const x = 0.75 + i * 2.95, y = 1.5, w = 2.55, h = 3.15;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: c.dark ? t.dark : "FFFFFF" }, line: { color: c.dark ? t.dark : t.primary, width: c.dark ? 0 : 1 }, rectRadius: 0.2, shadow: shadow() });
      text(s, c.who, { x, y: y + 0.22, w, h: 0.4, fontSize: 17, bold: true, align: "center", color: c.dark ? "FFFFFF" : t.text });
      c.rows.forEach(([v, l], r) => {
        const ry = y + 0.85 + r * 0.73;
        text(s, v, { x: x + 0.25, y: ry, w: 1.05, h: 0.5, fontSize: 22, bold: true, color: c.dark ? t.highlight : t.primary, valign: "middle" });
        text(s, l, { x: x + 1.3, y: ry, w: w - 1.45, h: 0.5, fontSize: 9, bold: true, color: c.dark ? "FFFFFF" : t.text, valign: "middle" });
      });
    });

    const sdg = ["SDG 8  Decent work", "SDG 9  Innovation", "SDG 11  Communities", "SDG 16  Institutions"];
    sdg.forEach((v, i) => {
      const x = 0.95 + i * 2.1;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.88, w: 1.95, h: 0.4, fill: { color: "FFFFFF" }, line: { color: t.primary, width: 0.75 }, rectRadius: 0.2 });
      text(s, v, { x, y: 4.88, w: 1.95, h: 0.4, fontSize: 9, bold: true, align: "center", valign: "middle" });
    });
    s.addNotes("Residents get answers without a trip to the office. The village office pays nothing per month on free tiers and updates everything through the CMS, backed by 109 automated checks. Businesses keep all their income and take orders in three steps. This supports SDGs 8, 9, 11, and 16.");
  }

  // =====================================================================
  // 7. Conclusion
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-end.png") };
    logoSlot(s, 0.13, 0.1, 1.2, 0.42);
    text(s, "THANK YOU", { x: 0.7, y: 1.25, w: 5.6, h: 0.8, fontSize: 42, bold: true });
    text(s, "Kenali desanya. Akses layanannya. Dukung ekonominya.", { x: 0.7, y: 2.05, w: 5.5, h: 0.6, fontSize: 15, bold: true, color: t.primary, italic: true });
    [["10", "public pages"], ["42", "data tables"], ["16", "local products"]].forEach(([v, l], i) => {
      const x = 0.7 + i * 1.8;
      text(s, v, { x, y: 3.1, w: 1.6, h: 0.6, fontSize: 32, bold: true });
      text(s, l, { x, y: 3.7, w: 1.6, h: 0.25, fontSize: 10, bold: true, color: t.muted });
    });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.75, y: 1.2, w: 2.6, h: 3.3, fill: { color: "FFFFFF" }, line: { color: "FFFFFF" }, rectRadius: 0.2, shadow: shadow() });
    s.addImage({ path: S("qr.png"), x: 7.05, y: 1.45, w: 2.0, h: 2.0 });
    text(s, "Scan to try the live demo", { x: 6.75, y: 3.6, w: 2.6, h: 0.3, fontSize: 11, bold: true, align: "center" });
    text(s, DEMO_LABEL, { x: 6.75, y: 3.9, w: 2.6, h: 0.3, fontSize: 8, align: "center", color: t.muted });
    s.addNotes("To sum up: residents reach services without a trip, local businesses reach customers beyond the village, and anyone outside can discover and support Marga Mulya — one gateway for the whole village. Scan the code to try it. Thank you.");
  }

  const out = path.join(__dirname, "out", `Desa-Marga-Mulya-Pitch-Deck-${t.label}.pptx`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  return pres.writeFile({ fileName: out });
}

(async () => {
  for (const [key, t] of Object.entries(THEMES)) console.log("wrote", await build(key, t));
})();
