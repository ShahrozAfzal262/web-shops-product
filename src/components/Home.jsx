import { useEffect, useRef } from "react";
import Swing, { Hook } from "./Swing";

// Rope par latke hue products. Drag/scroll karne par sab jhoolte hain.
export default function Home({ items, blurb }) {
  const sc = useRef(null);
  const drag = useRef(null);

  useEffect(() => {
    const el = sc.current;
    let last = el.scrollLeft, raf;
    const loop = () => {
      const v = el.scrollLeft - last;
      last = el.scrollLeft;
      if (Math.abs(v) > 0.5)
        window.dispatchEvent(new CustomEvent("rope", { detail: Math.max(-2.5, Math.min(2.5, v * 0.05)) }));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const down = (e) => { drag.current = { x: e.clientX, s: sc.current.scrollLeft, moved: false }; };
  const move = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 5) d.moved = true;
    if (d.moved) sc.current.scrollLeft = d.s - dx;
  };
  const up = () => { setTimeout(() => (drag.current = null), 0); };
  const click = (e) => { if (drag.current?.moved) e.preventDefault(); };
  const wheel = (e) => { sc.current.scrollLeft += e.deltaY + e.deltaX; };

  return (
    <main className="home">
      <div className="scroller" ref={sc} onPointerDown={down} onPointerMove={move} onPointerUp={up}
           onPointerLeave={up} onClickCapture={click} onWheel={wheel}>
        <ul className="track">
          {items.map((p, i) => (
            <li
              key={p.id}
              className={
                p.category === "bags"
                  ? "bag-product"
                  : p.category === "shirts"
                    ? "shirt-product"
                    : ""
              }
              style={{ "--i": i }}
            >
              <a href={`#/p/${p.id}`} draggable="false">
                <Swing speed={p.category === "shirts" ? 0.4 : 1}>
                  <Hook />
                  <img src={p.variants[0].image} alt={p.name} draggable="false" />
                </Swing>
                <span className="cap">{p.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="blurb">
        <p>{blurb}</p>
        {items[0] && <a className="pill" href={`#/p/${items[0].id}`}>Shop the Collection</a>}
      </div>
    </main>
  );
}
