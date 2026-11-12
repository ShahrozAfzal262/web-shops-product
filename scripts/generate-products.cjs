// public/images ko scan karke src/data/products.json banata hai.
//   images/<category>/<file>.png            -> ek product
//   images/<category>/<model>/<color>.png   -> ek product, rang (variants) alag alag
// Qeemat: scripts/prices.json (file/model ka naam > category > _default)
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "public", "images");
const exts = /\.(png|jpe?g|webp|avif|svg)$/i;
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8"));
const prices = JSON.parse(fs.readFileSync(path.join(__dirname, "prices.json"), "utf8"));
const nice = (s) => s.replace(exts, "").replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const url = (...p) => "/images/" + p.map(encodeURIComponent).join("/");
const imgs = (dir) => {
  const files = fs.readdirSync(dir).filter((f) => exts.test(f));
  const preferred = new Map();
  for (const file of files) {
    const stem = path.parse(file).name.toLowerCase();
    const current = preferred.get(stem);
    if (!current || path.extname(file).toLowerCase() === ".png")
      preferred.set(stem, file);
  }
  return [...preferred.values()].sort();
};

let id = 1;
const products = [];
const add = (cat, key, name, variants) =>
  products.push({
    id: id++,
    category: cat,
    name,
    price: prices[key] ?? prices[cat] ?? prices._default ?? 50,
    sizes: cfg.sizes?.[cat] || ["One size"],
    variants,
  });

for (const c of fs.readdirSync(root, { withFileTypes: true })) {
  if (!c.isDirectory()) continue;
  const cdir = path.join(root, c.name);
  for (const e of fs.readdirSync(cdir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.isDirectory()) {
      const files = imgs(path.join(cdir, e.name));
      if (files.length)
        add(c.name, e.name, nice(e.name), files.map((f) => ({ label: nice(f), image: url(c.name, e.name, f) })));
    } else if (exts.test(e.name)) {
      add(c.name, e.name, nice(e.name), [{ label: nice(e.name), image: url(c.name, e.name) }]);
    }
  }
}
fs.writeFileSync(path.join(__dirname, "..", "src", "data", "products.json"), JSON.stringify({ config: cfg, products }, null, 2));
console.log(`${products.length} products bane`);
