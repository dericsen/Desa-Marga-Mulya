// Pitch deck EcoQuest IIT Challenge 2026 — Desa Marga Mulya ("New Revisition", revisi final).
// Alur: WHO → PROBLEM → WHAT WE BUILT → HOW IT WORKS → IMPACT → WHY IT MATTERS.
// Identitas tetap: latar gelombang tosca, tab navigasi, Montserrat, kartu putus-putus & kartu gelap.
// Aturan kejujuran: fitur yang belum dibangun selalu ditandai "next" (titik kosong), bukan "live".
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { THEMES } = require("./themes");

const DEMO_URL = process.env.DEMO_URL || "https://desa-marga-mulya.vercel.app";
const DEMO_LABEL = DEMO_URL.replace(/^https?:\/\//, "");
const FONT = "Montserrat";
const BUILD = path.join(__dirname, "assets", "build");
const TECH = JSON.parse(fs.readFileSync(path.join(BUILD, "tech.json"), "utf8"));
const TABS = ["Overview", "Problem", "Solution", "Demo", "Impact"];

function build(key, t) {
  const A = (f) => path.join(BUILD, key, f);
  const S = (f) => path.join(BUILD, f);
  const pin = JSON.parse(fs.readFileSync(A("map-square.json"), "utf8"));
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in
  pres.title = "Desa Marga Mulya — The Digital Gateway for a Village (EcoQuest IIT Challenge 2026)";

  const WHITE = "FFFFFF";
  const ON_DARK = "E6F2F0";
  const text = (slide, v, o) => slide.addText(v, { fontFace: FONT, margin: 0, valign: "top", color: t.text, ...o });
  const shadow = () => ({ type: "outer", color: "0B3B38", opacity: 0.16, blur: 8, offset: 2, angle: 90 });
  const rrect = (slide, o) => slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { rectRadius: 0.1, ...o });
  const iconDisc = (slide, name, x, y, d, dark) => {
    slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: dark ? t.highlight : t.primary }, line: { color: dark ? t.highlight : t.primary } });
    const p = d * 0.27;
    slide.addImage({ path: A(`icon-${name}-${dark ? "d" : "w"}.png`), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
  };
  // Penanda status: titik penuh = live, titik kosong = next
  const dot = (slide, x, y, live, dark) => {
    const c = dark ? t.highlight : t.primary;
    slide.addShape(pres.shapes.OVAL, { x, y, w: 0.11, h: 0.11, fill: { color: live ? c : dark ? t.dark : WHITE }, line: { color: c, width: 1 } });
  };

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
  function logoSlot(slide, x, y, w, h) {
    // Tempat logo resmi IIT Challenge — ganti dengan logo dari panitia.
    slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: t.dark }, line: { color: WHITE, width: 0.75, dashType: "dash" } });
    text(slide, "IIT Challenge logo", { x, y, w, h, fontSize: 8, color: WHITE, align: "center", valign: "middle" });
  }
  function source(slide, v) {
    text(slide, v, { x: 0.55, y: 5.3, w: 8.9, h: 0.2, fontSize: 7, italic: true, color: t.muted });
  }

  // =====================================================================
  // 1. Introduction
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-hero.png") };
    logoSlot(s, 0.13, 0.15, 1.35, 0.55);

    s.addImage({ path: S("logo.png"), x: 0.6, y: 1.45, w: 0.65, h: 0.65 });
    text(s, "EcoQuest Web Application  |  IIT Challenge 2026", { x: 1.4, y: 1.6, w: 4.2, h: 0.35, fontSize: 9, bold: true, color: t.muted, valign: "middle" });
    s.addText(
      [
        { text: "Desa ", options: { color: t.text } },
        { text: "Marga Mulya", options: { color: t.primary } },
      ],
      { x: 0.6, y: 2.2, w: 5.0, h: 0.65, fontFace: FONT, fontSize: 34, bold: true, margin: 0, valign: "middle", fit: "shrink" }
    );
    text(s, "The Digital Gateway for a Village", { x: 0.6, y: 2.9, w: 5.0, h: 0.38, fontSize: 17, bold: true });
    text(s, "Kenali desanya. Akses layanannya. Dukung ekonominya.", { x: 0.6, y: 3.3, w: 5.0, h: 0.3, fontSize: 11.5, bold: true, italic: true, color: t.primary });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 3.75, w: 0.05, h: 0.5, fill: { color: t.primary }, line: { color: t.primary } });
    text(s, "Connect residents, local businesses, and people outside the village through one digital gateway.", { x: 0.78, y: 3.75, w: 4.6, h: 0.5, fontSize: 10, color: t.muted, valign: "middle" });

    // Tim — ganti lingkaran dengan foto & nama anggota
    ["Member 1", "Member 2", "Member 3"].forEach((n, i) => {
      const x = 0.6 + i * 1.45;
      s.addShape(pres.shapes.OVAL, { x, y: 4.6, w: 0.5, h: 0.5, fill: { color: t.soft }, line: { color: t.primary, width: 0.75 } });
      text(s, n, { x: x + 0.58, y: 4.6, w: 0.85, h: 0.5, fontSize: 8.5, bold: true, valign: "middle" });
    });

    // Hero: peta desa + tiga audiens yang terhubung ke satu titik
    const mx = 5.95, my = 1.42, md = 3.45;
    s.addImage({ path: A("map-square.png"), x: mx, y: my, w: md, h: md, shadow: shadow() });
    const px = mx + pin.cx * md, py = my + pin.cy * md;
    const nodes = [
      { name: "home", label: "Residents", cx: mx + 0.35, cy: my + 0.5 },
      { name: "market", label: "Local businesses", cx: mx + md - 0.2, cy: my + 1.15 },
      { name: "globe", label: "People outside", cx: mx + 0.75, cy: my + md - 0.55 },
    ];
    const d = 0.62;
    nodes.forEach((n) => {
      const x1 = Math.min(px, n.cx), y1 = Math.min(py, n.cy);
      s.addShape(pres.shapes.LINE, {
        x: x1, y: y1, w: Math.max(Math.abs(n.cx - px), 0.01), h: Math.max(Math.abs(n.cy - py), 0.01),
        flipH: (n.cx < px) !== (n.cy < py), line: { color: t.dark, width: 1.75, dashType: "dash" },
      });
    });
    nodes.forEach((n) => {
      s.addShape(pres.shapes.OVAL, { x: n.cx - d / 2 - 0.04, y: n.cy - d / 2 - 0.04, w: d + 0.08, h: d + 0.08, fill: { color: WHITE }, line: { color: WHITE } });
      iconDisc(s, n.name, n.cx - d / 2, n.cy - d / 2, d);
      const lw = 1.35;
      const lx = Math.min(Math.max(n.cx - lw / 2, mx - 0.2), 9.85 - lw);
      rrect(s, { x: lx, y: n.cy + d / 2 + 0.06, w: lw, h: 0.26, fill: { color: t.dark }, line: { color: t.dark }, rectRadius: 0.13 });
      text(s, n.label, { x: lx, y: n.cy + d / 2 + 0.06, w: lw, h: 0.26, fontSize: 8.5, bold: true, color: WHITE, align: "center", valign: "middle" });
    });
    s.addNotes(
      "Good morning. We are presenting Desa Marga Mulya — the digital gateway for a village. Marga Mulya is in Mauk, Tangerang. Our goal is simple: connect three groups through one digital gateway — the residents who live there, the local businesses who sell there, and the people outside the village who want to know it and support it. Our tagline says it in Indonesian: Kenali desanya, akses layanannya, dukung ekonominya — know the village, access its services, support its economy."
    );
  }

  // =====================================================================
  // 2. Village Overview
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-content.png") };
    nav(s, 0);
    heading(s, "A Coastal Farming Village", "Marga Mulya, Mauk, Tangerang");

    s.addImage({ path: A("map.png"), x: 0.55, y: 1.5, w: 4.45, h: 1.74, shadow: shadow() });
    text(s, "Marga Mulya is a coastal village shaped by agriculture, fisheries, community, and a growing local economy.", {
      x: 0.55, y: 3.42, w: 4.45, h: 0.7, fontSize: 12, bold: true, valign: "middle",
    });

    // Angka besar
    [["7,842", "residents"], ["2,318", "households"], ["412 ha", "village land"]].forEach(([v, l], i) => {
      const x = 5.4 + i * 1.38;
      text(s, v, { x, y: 1.48, w: 1.36, h: 0.5, fontSize: 23, bold: true, color: t.primary, fit: "shrink" });
      text(s, l, { x, y: 1.98, w: 1.36, h: 0.22, fontSize: 9, bold: true, color: t.muted });
    });
    s.addShape(pres.shapes.LINE, { x: 5.4, y: 2.4, w: 4.05, h: 0, line: { color: t.soft, width: 1 } });
    // Dua persentase sebagai batang
    [[55, "of land is rice fields & fish ponds"], [41, "of workers are in farming & fisheries"]].forEach(([v, l], i) => {
      const y = 2.6 + i * 0.78;
      text(s, `${v}%`, { x: 5.4, y, w: 1.05, h: 0.55, fontSize: 23, bold: true, color: t.text, valign: "middle" });
      text(s, l, { x: 6.5, y, w: 2.95, h: 0.25, fontSize: 9, bold: true, color: t.muted });
      rrect(s, { x: 6.5, y: y + 0.32, w: 2.95, h: 0.15, fill: { color: t.tint }, line: { color: t.tint }, rectRadius: 0.07 });
      rrect(s, { x: 6.5, y: y + 0.32, w: (2.95 * v) / 100, h: 0.15, fill: { color: t.primary }, line: { color: t.primary }, rectRadius: 0.07 });
    });

    // Empat ciri desa
    [["seedling", "Agriculture"], ["fish", "Fisheries"], ["users", "Community"], ["market", "Local economy"]].forEach(([ic, l], i) => {
      const x = 0.55 + i * 2.26, y = 4.4, w = 2.1, h = 0.6;
      rrect(s, { x, y, w, h, fill: { color: WHITE }, line: { color: t.primary, width: 1, dashType: "sysDot" }, rectRadius: 0.3 });
      iconDisc(s, ic, x + 0.1, y + 0.08, 0.44);
      text(s, l, { x: x + 0.65, y, w: w - 0.7, h, fontSize: 11, bold: true, valign: "middle" });
    });
    source(s, "Village figures as currently entered in the website CMS — to be replaced with official BPS / village office figures. Map © OpenStreetMap contributors.");
    s.addNotes(
      "First, who we are building for. Marga Mulya is a coastal farming village in Mauk, Tangerang — about seven thousand eight hundred residents in two thousand three hundred households, on four hundred twelve hectares. More than half of the land is rice fields and fish ponds, and four in ten workers are in farming and fisheries. So this is a village shaped by agriculture, fisheries, a close community, and a growing local economy."
    );
  }

  // =====================================================================
  // 3. Problem Identification
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-content.png") };
    nav(s, 1);
    heading(s, "Scattered, Not Missing", "The village has information and potential — but it is hard to find, access, and use.");

    const cols = [
      { n: "1", icon: "home", who: "RESIDENT", q: "“Who do I even ask about this?”", pts: ["Services & requirements", "Announcements & events", "Village information"] },
      { n: "2", icon: "basket", who: "BUYER OUTSIDE THE VILLAGE", q: "“What can I buy from this village?”", pts: ["Local products", "Who sells them", "How to order"] },
      { n: "3", icon: "data", who: "PARTNER / RESEARCHER", q: "“Where is the data, and can I trust it?”", pts: ["Demographics", "Farming & fishery potential", "Facilities & location"] },
    ];
    cols.forEach((c, i) => {
      const x = 0.55 + i * 3.02, y = 1.5, w = 2.84, h = 2.42;
      rrect(s, { x, y, w, h, fill: { color: WHITE, transparency: 10 }, line: { color: t.primary, width: 1.25, dashType: "sysDot" } });
      iconDisc(s, c.icon, x + 0.2, y + 0.2, 0.46);
      text(s, c.n, { x: x + w - 0.6, y: y + 0.12, w: 0.45, h: 0.5, fontSize: 24, bold: true, color: t.soft, align: "right" });
      text(s, c.who, { x: x + 0.78, y: y + 0.2, w: w - 1.35, h: 0.46, fontSize: 8.5, bold: true, color: t.primary, valign: "middle" });
      text(s, c.q, { x: x + 0.2, y: y + 0.8, w: w - 0.4, h: 0.6, fontSize: 12.5, bold: true, italic: true });
      s.addText(
        c.pts.map((p, j) => ({ text: p, options: { bullet: { code: "2022", indent: 12 }, breakLine: j < c.pts.length - 1, color: t.muted, fontSize: 10, paraSpaceAfter: 3 } })),
        { x: x + 0.2, y: y + 1.5, w: w - 0.4, h: 0.82, fontFace: FONT, margin: 0, valign: "top" }
      );
    });

    rrect(s, { x: 0.55, y: 4.1, w: 8.9, h: 1.08, fill: { color: t.dark }, line: { color: t.dark }, rectRadius: 0.14, shadow: shadow() });
    text(s, "The problem is fragmentation, not absence.", { x: 0.85, y: 4.24, w: 5.1, h: 0.42, fontSize: 16, bold: true, color: WHITE });
    text(s, "It lives in offices, chat groups, social media, and word of mouth — not in one place.", { x: 0.85, y: 4.66, w: 5.0, h: 0.42, fontSize: 9.5, color: ON_DARK });
    s.addShape(pres.shapes.LINE, { x: 6.05, y: 4.3, w: 0, h: 0.7, line: { color: t.primaryDark, width: 1 } });
    [["74%", "rural residents online"], ["6 / 10", "MSMEs still offline"], ["None", "official village website found*"]].forEach(([v, l], i) => {
      const x = 6.15 + i * 1.1;
      text(s, v, { x, y: 4.3, w: 1.05, h: 0.34, fontSize: 14, bold: true, color: t.highlight, align: "center" });
      text(s, l, { x, y: 4.66, w: 1.05, h: 0.4, fontSize: 7, color: ON_DARK, align: "center" });
    });
    source(s, "Sources: APJII Internet Survey 2024 (rural internet use); GoodStats 2023 & Statista (27M of ~65M MSMEs digital). *Team web search, September 2026.");
    s.addNotes(
      "The problem is not that the village has no information. It has services, products, and data — but they are scattered across the office, chat groups, social media, and word of mouth. A resident asks: who do I even ask? A buyer outside asks: what can I buy here, and how? A partner or researcher asks: where is the data, and can I trust it? Connectivity is not the barrier — 74 percent of rural Indonesians are online — yet six in ten small businesses are still offline, and we found no official village website. The problem is fragmentation, not absence."
    );
  }

  // =====================================================================
  // 4. Proposed Website Solution
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-content.png") };
    nav(s, 2);
    heading(s, "One Gateway, Three Audiences", "Not just a village website — a digital gateway.");

    const cols = [
      { icon: "home", who: "RESIDENTS", need: "“I need something from the village.”", f: [["Services & checklists", 1], ["Live office status", 1], ["Announcements", 1], ["AI assistant", 1]] },
      { icon: "market", who: "LOCAL BUSINESSES", need: "“I want more customers.”", f: [["Pasar Desa marketplace", 1], ["Seller portal", 1], ["WhatsApp orders", 1]], dark: true },
      { icon: "globe", who: "PEOPLE OUTSIDE", need: "“I want to know and support the village.”", f: [["Interactive map", 1], ["Explore by category", 0], ["Open village data", 1], ["Local products", 1]] },
    ];
    cols.forEach((c, i) => {
      const x = 0.55 + i * 3.02, y = 1.5, w = 2.84, h = 2.3;
      const dk = !!c.dark;
      rrect(s, { x, y, w, h, fill: { color: dk ? t.dark : WHITE }, line: { color: dk ? t.dark : t.primary, width: dk ? 0 : 1 }, shadow: shadow() });
      iconDisc(s, c.icon, x + 0.2, y + 0.18, 0.42, dk);
      text(s, c.who, { x: x + 0.72, y: y + 0.18, w: w - 0.85, h: 0.42, fontSize: 11, bold: true, color: dk ? WHITE : t.primary, valign: "middle" });
      text(s, c.need, { x: x + 0.2, y: y + 0.7, w: w - 0.4, h: 0.42, fontSize: 9.5, italic: true, bold: true, color: dk ? ON_DARK : t.text });
      c.f.forEach(([label, live], j) => {
        const fy = y + 1.2 + j * 0.25;
        dot(s, x + 0.22, fy + 0.06, !!live, dk);
        text(s, label + (live ? "" : "  (next)"), { x: x + 0.42, y: fy, w: w - 0.6, h: 0.23, fontSize: 9.5, color: dk ? WHITE : t.text, valign: "middle", bold: !!live });
      });
    });

    text(s, "FOUR PILLARS", { x: 0.55, y: 3.95, w: 3, h: 0.2, fontSize: 8, bold: true, color: t.primary });
    const pillars = [
      { icon: "services", name: "SERVE", st: "Live" },
      { icon: "search", name: "DISCOVER", st: "Partly live" },
      { icon: "market", name: "BUY", st: "Live" },
      { icon: "data", name: "UNDERSTAND", st: "Live" },
    ];
    const pw = 2.12, gap = 0.14;
    pillars.forEach((p, i) => {
      const x = 0.55 + i * (pw + gap), y = 4.2, h = 0.78;
      const full = p.st === "Live";
      rrect(s, { x, y, w: pw, h, fill: { color: WHITE }, line: { color: t.primary, width: 1 } });
      iconDisc(s, p.icon, x + 0.14, y + 0.17, 0.44);
      text(s, p.name, { x: x + 0.68, y: y + 0.12, w: pw - 0.75, h: 0.28, fontSize: 12, bold: true, fit: "shrink" });
      const lines = full ? [["Live", true]] : [["Map live", true], ["Categories next", false]];
      lines.forEach(([l, on], k) => {
        const ly = full ? y + 0.44 : y + 0.38 + k * 0.18;
        dot(s, x + 0.68, ly + 0.04, on, false);
        text(s, l, { x: x + 0.84, y: ly, w: pw - 0.92, h: 0.18, fontSize: 8, bold: true, color: t.muted, valign: "middle" });
      });
    });
    dot(s, 6.55, 5.3, true, false);
    text(s, "Live now", { x: 6.72, y: 5.25, w: 0.9, h: 0.2, fontSize: 7.5, bold: true, color: t.muted, valign: "middle" });
    dot(s, 7.75, 5.3, false, false);
    text(s, "Planned next (not yet built)", { x: 7.92, y: 5.25, w: 1.6, h: 0.2, fontSize: 7.5, bold: true, color: t.muted, valign: "middle" });
    s.addNotes(
      "Our answer is not just a village website — it is a digital gateway with three audiences. Residents get services with requirement checklists, live office status, announcements, and an AI assistant. Local businesses get the Pasar Desa marketplace, a seller portal, and WhatsApp orders. People outside get an interactive map, open village data, and local products. It rests on four pillars: Serve, Discover, Buy, and Understand. To be clear: everything with a filled dot is live today; explore-by-category is our next step."
    );
  }

  // =====================================================================
  // 5. Website Features & Demonstration
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-content.png") };
    nav(s, 3);
    heading(s, "Built and Live", `Live demo: ${DEMO_LABEL}`);

    // Alur demo
    const steps = ["Home", "Service", "Pasar Desa", "Product", "Cart", "WhatsApp Order", "Seller Portal"];
    const sw = 1.12, sg = 0.18;
    steps.forEach((st, i) => {
      const x = 0.55 + i * (sw + sg), y = 1.42;
      const end = i === 0 || i === steps.length - 1;
      rrect(s, { x, y, w: sw, h: 0.34, fill: { color: end ? t.primary : WHITE }, line: { color: t.primary, width: 1 }, rectRadius: 0.17 });
      text(s, st, { x, y, w: sw, h: 0.34, fontSize: 8, bold: true, align: "center", valign: "middle", color: end ? WHITE : t.text, fit: "shrink" });
      if (i < steps.length - 1) text(s, "›", { x: x + sw, y: y - 0.02, w: sg, h: 0.34, fontSize: 13, bold: true, align: "center", valign: "middle", color: t.primary });
    });

    // Laptop: beranda
    const lx = 0.55, ly = 1.98, lw = 4.4, lh = 2.5;
    rrect(s, { x: lx, y: ly, w: lw, h: lh, fill: { color: t.dark }, line: { color: t.dark }, rectRadius: 0.08, shadow: shadow() });
    s.addImage({ path: S("shot-home.png"), x: lx + 0.08, y: ly + 0.08, w: lw - 0.16, h: lh - 0.16, sizing: { type: "cover", w: lw - 0.16, h: lh - 0.16 } });
    rrect(s, { x: lx - 0.15, y: ly + lh, w: lw + 0.3, h: 0.1, fill: { color: "BFCFCD" }, line: { color: "BFCFCD" }, rectRadius: 0.05 });
    text(s, "Home — live office status & services", { x: lx, y: 4.66, w: lw, h: 0.22, fontSize: 9, bold: true, align: "center" });

    // Tiga ponsel: keranjang, pesanan WhatsApp, portal penjual
    [["shot-cart.png", "Multi-seller cart"], ["shot-order.png", "WhatsApp order"], ["shot-seller.png", "Seller portal"]].forEach(([f, cap], i) => {
      const pw = 1.24, ph = 2.6, px = 5.3 + i * 1.42, py = 1.95;
      rrect(s, { x: px, y: py, w: pw, h: ph, fill: { color: t.dark }, line: { color: t.dark }, rectRadius: 0.16, shadow: shadow() });
      s.addImage({ path: S(f), x: px + 0.06, y: py + 0.06, w: pw - 0.12, h: ph - 0.12, sizing: { type: "cover", w: pw - 0.12, h: ph - 0.12 } });
      text(s, cap, { x: px - 0.1, y: 4.66, w: pw + 0.2, h: 0.22, fontSize: 9, bold: true, align: "center" });
    });

    s.addText(
      [
        { text: "Also live:  ", options: { bold: true, color: t.primary } },
        { text: "service checklists  ·  Tanya Desa AI assistant  ·  42 open data tables with CSV  ·  interactive map  ·  CMS for village staff", options: { color: t.text } },
      ],
      { x: 0.55, y: 4.95, w: 8.9, h: 0.22, fontFace: FONT, fontSize: 8.5, margin: 0, align: "center", valign: "middle" }
    );
    const tw = 8.9 / Math.max(TECH.length, 1);
    TECH.forEach((tc, i) => {
      const x = 0.55 + i * tw;
      s.addImage({ path: A(tc.file), x: x + 0.08, y: 5.27, w: 0.16, h: 0.16 });
      text(s, tc.label, { x: x + 0.28, y: 5.25, w: tw - 0.3, h: 0.2, fontSize: 7, color: t.muted, valign: "middle" });
    });
    s.addNotes(
      "This is all built and live. A resident opens the home page and sees right away whether the village office is open, then picks a service and gets its requirement checklist. A buyer opens Pasar Desa, picks a product, and adds it to the cart — one cart can hold products from several sellers. At checkout it becomes one WhatsApp order per seller, each with its own order code. Sellers manage price and stock from their phone in the seller portal, and new products are reviewed by the admin first. The AI assistant and 42 open data tables are live too."
    );
  }

  // =====================================================================
  // 6. Impact & Implementation Feasibility
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-content.png") };
    nav(s, 4);
    heading(s, "A Practical Win-Win-Win", "Impact & implementation feasibility");

    const cols = [
      { icon: "home", who: "RESIDENTS", big: "24/7", cap: "information access", pts: ["Easier access to services", "Fewer unnecessary trips", "24/7 information access"] },
      { icon: "market", who: "BUSINESSES", big: "0%", cap: "platform commission", pts: ["0% platform commission", "Digital visibility", "Simple WhatsApp ordering"], dark: true },
      { icon: "users", who: "VILLAGE", big: "1", cap: "hub for village information", pts: ["Centralized information", "CMS-managed content", "Open village data"] },
    ];
    cols.forEach((c, i) => {
      const x = 0.55 + i * 3.02, y = 1.5, w = 2.84, h = 2.42;
      const dk = !!c.dark;
      rrect(s, { x, y, w, h, fill: { color: dk ? t.dark : WHITE }, line: { color: dk ? t.dark : t.primary, width: dk ? 0 : 1 }, shadow: shadow() });
      iconDisc(s, c.icon, x + 0.2, y + 0.18, 0.42, dk);
      text(s, c.who, { x: x + 0.72, y: y + 0.18, w: w - 0.85, h: 0.42, fontSize: 11, bold: true, color: dk ? WHITE : t.primary, valign: "middle" });
      const bw = { "24/7": 1.15, "0%": 0.72, "1": 0.32 }[c.big] || 1.15;
      text(s, c.big, { x: x + 0.2, y: y + 0.68, w: bw, h: 0.55, fontSize: 28, bold: true, color: dk ? t.highlight : t.primary, valign: "middle" });
      text(s, c.cap, { x: x + 0.35 + bw, y: y + 0.68, w: w - 0.5 - bw, h: 0.55, fontSize: 9, bold: true, color: dk ? ON_DARK : t.muted, valign: "middle" });
      c.pts.forEach((p, j) => {
        const py = y + 1.42 + j * 0.3;
        s.addImage({ path: A(`icon-check-${dk ? "h" : "p"}.png`), x: x + 0.22, y: py + 0.04, w: 0.16, h: 0.16 });
        text(s, p, { x: x + 0.48, y: py, w: w - 0.65, h: 0.24, fontSize: 10, bold: true, color: dk ? WHITE : t.text, valign: "middle" });
      });
    });

    // Kelayakan implementasi
    rrect(s, { x: 0.55, y: 4.1, w: 8.9, h: 1.0, fill: { color: WHITE }, line: { color: t.primary, width: 1, dashType: "sysDot" }, rectRadius: 0.14 });
    text(s, "Feasible\ntoday", { x: 0.75, y: 4.1, w: 1.1, h: 1.0, fontSize: 13, bold: true, color: t.primary, valign: "middle" });
    const feas = [
      ["server", "Rp 0", "monthly hosting on the current free-tier setup"],
      ["db", "PostgreSQL", "reliable, managed database"],
      ["cms", "CMS", "11 content collections, no coding needed"],
      ["shield", "109", "automated checks, all passing"],
    ];
    feas.forEach(([ic, v, l], i) => {
      const x = 1.95 + i * 1.88;
      s.addImage({ path: A(`icon-${ic}-p.png`), x, y: 4.3, w: 0.26, h: 0.26 });
      text(s, v, { x: x + 0.34, y: 4.26, w: 1.45, h: 0.34, fontSize: 14, bold: true, valign: "middle", fit: "shrink" });
      text(s, l, { x, y: 4.64, w: 1.75, h: 0.4, fontSize: 8, color: t.muted });
    });
    source(s, "Hosting cost reflects the current free-tier setup; it may change as usage grows.");
    s.addNotes(
      "The impact is a practical win for everyone. Residents get easier access to services, fewer unnecessary trips, and information any time of day. Businesses pay zero platform commission, gain digital visibility, and take orders through the WhatsApp they already use. The village gets one central place for its information, managed through a CMS, with open data. And it is feasible today: Rp 0 monthly hosting on our current free-tier setup, a PostgreSQL database, a CMS with eleven content collections that staff can use without coding, and 109 automated checks."
    );
  }

  // =====================================================================
  // 7. Conclusion
  // =====================================================================
  {
    const s = pres.addSlide();
    s.background = { path: A("bg-end.png") };
    logoSlot(s, 0.13, 0.1, 1.2, 0.42);
    text(s, "One Gateway for the Whole Village", { x: 0.7, y: 1.05, w: 5.7, h: 1.0, fontSize: 28, bold: true, valign: "middle" });
    [["home", "Residents access services."], ["market", "Businesses reach customers."], ["globe", "People outside discover and support Marga Mulya."]].forEach(([ic, l], i) => {
      const y = 2.2 + i * 0.42;
      iconDisc(s, ic, 0.7, y, 0.32);
      text(s, l, { x: 1.15, y, w: 5.3, h: 0.32, fontSize: 12, bold: true, valign: "middle" });
    });
    rrect(s, { x: 0.7, y: 3.6, w: 5.7, h: 0.6, fill: { color: t.dark }, line: { color: t.dark }, rectRadius: 0.14, shadow: shadow() });
    text(s, "Kenali desanya. Akses layanannya. Dukung ekonominya.", { x: 0.7, y: 3.6, w: 5.7, h: 0.6, fontSize: 13, bold: true, italic: true, color: t.highlight, align: "center", valign: "middle", fit: "shrink" });
    [["10", "public pages"], ["42", "data tables"], ["16", "local products"]].forEach(([v, l], i) => {
      const x = 0.7 + i * 1.9;
      text(s, v, { x, y: 4.42, w: 1.7, h: 0.5, fontSize: 26, bold: true, color: t.primary });
      text(s, l, { x, y: 4.92, w: 1.7, h: 0.22, fontSize: 9, bold: true, color: t.muted });
    });

    rrect(s, { x: 6.85, y: 1.1, w: 2.5, h: 3.2, fill: { color: WHITE }, line: { color: WHITE }, rectRadius: 0.2, shadow: shadow() });
    s.addImage({ path: S("qr.png"), x: 7.15, y: 1.35, w: 1.9, h: 1.9 });
    text(s, "Scan to try the live demo", { x: 6.85, y: 3.38, w: 2.5, h: 0.3, fontSize: 10.5, bold: true, align: "center" });
    text(s, DEMO_LABEL, { x: 6.85, y: 3.7, w: 2.5, h: 0.3, fontSize: 8, align: "center", color: t.muted, fit: "shrink" });
    text(s, "Thank you", { x: 6.85, y: 4.5, w: 2.5, h: 0.45, fontSize: 20, bold: true, align: "center", color: t.text });
    s.addNotes(
      "To close: one gateway for the whole village. Residents access services. Businesses reach customers. People outside discover and support Marga Mulya. Ten public pages, forty-two data tables, and sixteen local products are already live — scan the code to try it yourself. Kenali desanya, akses layanannya, dukung ekonominya. Thank you."
    );
  }

  const out = path.join(__dirname, "out", `Desa-Marga-Mulya-Pitch-Deck-${t.label}.pptx`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  return pres.writeFile({ fileName: out });
}

(async () => {
  for (const [key, t] of Object.entries(THEMES)) console.log("wrote", await build(key, t));
})();
