// Siapkan gambar untuk deck: potong screenshot, buat ikon, dan kode QR.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const QRCode = require("qrcode");
const { FaUsers, FaShoppingBasket, FaStore, FaUserShield } = require("react-icons/fa");

const RAW = path.join(__dirname, "assets", "raw");
const OUT = path.join(__dirname, "assets", "build");
fs.mkdirSync(OUT, { recursive: true });

const DEMO_URL = process.env.DEMO_URL || "https://desa-marga-mulya.vercel.app";

async function crop(file, width, height, out) {
  await sharp(path.join(RAW, file))
    .extract({ left: 0, top: 0, width, height })
    .png()
    .toFile(path.join(OUT, out));
}

async function icon(Component, name) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Component, { color: "#FFFFFF", size: 256 }));
  await sharp(Buffer.from(svg)).resize(256, 256).png().toFile(path.join(OUT, `icon-${name}.png`));
}

(async () => {
  const meta = async (f) => sharp(path.join(RAW, f)).metadata();
  const home = await meta("desktop-beranda.png");
  await crop("desktop-beranda.png", home.width, Math.min(home.height, Math.round(home.width / 1.6)), "home.png");
  const cart = await meta("pasar-keranjang.png");
  await crop("pasar-keranjang.png", cart.width, Math.min(cart.height, Math.round(cart.width * 2.16)), "cart.png");
  const seller = await meta("penjual-produk.png");
  await crop("penjual-produk.png", seller.width, Math.min(seller.height, Math.round(seller.width * 2.16)), "seller.png");

  await icon(FaUsers, "residents");
  await icon(FaShoppingBasket, "buyers");
  await icon(FaStore, "sellers");
  await icon(FaUserShield, "admin");

  await QRCode.toFile(path.join(OUT, "qr.png"), DEMO_URL, {
    width: 600,
    margin: 1,
    color: { dark: "#36454FFF", light: "#FFFFFFFF" },
  });
  console.log("assets ready for", DEMO_URL);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
