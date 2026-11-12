import { useEffect, useState } from "react";
import { products, categories, config, isFloat } from "./data/products";
import Header from "./components/Header";
import Home from "./components/Home";
import Gallery from "./components/Gallery";
import Detail from "./components/Detail";
import BagDrawer from "./components/BagDrawer";

// #/            -> pehli category
// #/c/<cat>     -> category
// #/p/<id>/<v>  -> product (v = rang number, optional)
const parse = () => {
  const [a, b, c] = window.location.hash.slice(2).split("/");
  if (a === "p") return { view: "p", id: Number(b), v: Number(c) || 0 };
  return { view: "c", cat: a === "c" ? decodeURIComponent(b || "") : null };
};
const loadBag = () => {
  try { return JSON.parse(localStorage.getItem("bag")) || []; } catch { return []; }
};

export default function App() {
  const [route, setRoute] = useState(parse);
  const [bag, setBag] = useState(loadBag);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setRoute(parse());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  useEffect(() => {
    try { localStorage.setItem("bag", JSON.stringify(bag)); } catch {}
  }, [bag]);

  const product = route.view === "p" ? products.find((p) => p.id === route.id) : null;
  const cat = product ? product.category : categories.includes(route.cat) ? route.cat : categories[0];
  const items = products.filter((p) => p.category === cat);

  const add = (p, size) => {
    setBag((b) => [...b, { key: `${p.id}-${size}-${Date.now()}`, name: p.name, price: p.price, image: p.image, size }]);
    setOpen(true);
  };

  let page;
  if (product) {
    page = (
      <Detail key={`${product.id}-${isFloat(cat) ? "" : "h"}`} product={product} v={route.v} floating={isFloat(cat)}
              siblings={items} back={`#/c/${cat}`} onAdd={add} />
    );
  } else if (isFloat(cat)) {
    page = <Gallery key={cat} items={items} />;
  } else {
    page = <Home key={cat} items={items} blurb={config.blurb?.[cat] || "Shop the collection."} />;
  }

  return (
    <>
      <Header categories={categories} cat={cat} count={bag.length} onBag={() => setOpen(true)} />
      {page}
      <BagDrawer open={open} items={bag} onClose={() => setOpen(false)}
                 onRemove={(key) => setBag((b) => b.filter((i) => i.key !== key))} />
    </>
  );
}
