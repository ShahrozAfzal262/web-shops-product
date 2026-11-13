
import { useCallback, useEffect, useRef, useState } from "react";

export default function Gallery({ items = [] }) {
  const scroller = useRef(null);
  const drag = useRef(null);
  const wasDragged = useRef(false);
  const activePhysical = useRef(0);
  const momentum = useRef({ raf: 0, velocity: 0 });

  const [active, setActive] = useState(0);

  const shoes = items.flatMap((product) =>
    (product.variants || []).map((variant, index) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: variant.image,
      label: variant.label,
      variantIndex: index,
    }))
  );

  const total = shoes.length;
  const loopedShoes = [...shoes, ...shoes, ...shoes];

  // Center an item inside the gallery
  const centerItem = (el, item) => {
    if (!el || !item) return;

    const container = el.getBoundingClientRect();
    const target = item.getBoundingClientRect();

    el.scrollLeft +=
      target.left +
      target.width / 2 -
      (container.left + container.width / 2);
  };

  // Initial position
  useEffect(() => {
    const el = scroller.current;
    if (!el || !total) return;

    const raf = requestAnimationFrame(() => {
      const children = el.firstElementChild?.children;
      if (!children?.length) return;

      const initialIndex = total + Math.min(1, total - 1);
      const initial = children[initialIndex];

      if (!initial) return;

      activePhysical.current = initialIndex;
      centerItem(el, initial);
    });

    return () => cancelAnimationFrame(raf);
  }, [total]);

  // Continuous circular animation
  useEffect(() => {
    const el = scroller.current;
    if (!el || !total) return;

    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        const children = el.firstElementChild?.children;

        if (!children?.length || children.length < 2) return;

        // Infinite scrolling
        const first = children[0];
        const secondCopy = children[total];

        if (secondCopy) {
          const period =
            secondCopy.getBoundingClientRect().left -
            first.getBoundingClientRect().left;

          if (period > 0) {
            if (el.scrollLeft < period * 0.5) {
              el.scrollLeft += period;
            } else if (el.scrollLeft >= period * 1.5) {
              el.scrollLeft -= period;
            }
          }
        }

        const container = el.getBoundingClientRect();
        const centerX = container.left + container.width / 2;

        const step =
          children[1].getBoundingClientRect().left -
          children[0].getBoundingClientRect().left;

        if (!step) return;

        let nearest = 0;
        let nearestDistance = Infinity;

        // Update every shoe continuously
        Array.from(children).forEach((child, index) => {
          const rect = child.getBoundingClientRect();
          const childCenter = rect.left + rect.width / 2;

          const offset = (childCenter - centerX) / step;
          const distance = Math.abs(offset);

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearest = index;
          }

          const curve = Math.min(distance, 3);

          const vertical = curve * curve * 13;
          const tilt = Math.max(-14, Math.min(14, offset * -4));
          const scale = 1.03 - Math.min(distance, 4) * 0.025;

          child.style.setProperty("--curve", `${vertical}px`);
          child.style.setProperty("--tilt", `${tilt}deg`);
          child.style.setProperty("--scale", scale);
        });

        activePhysical.current = nearest;

        setActive((previous) => {
          const next = nearest % total;
          return previous === next ? previous : next;
        });
      });
    };

    el.addEventListener("scroll", update, { passive: true });

    update();

    return () => {
      el.removeEventListener("scroll", update);
      cancelAnimationFrame(raf);
    };
  }, [total]);

  // Previous / Next
  const go = (direction) => {
    const el = scroller.current;
    if (!el) return;

    cancelAnimationFrame(momentum.current.raf);
    momentum.current.velocity = 0;

    const children = el.firstElementChild?.children;
    if (!children?.length) return;

    const next = Math.max(
      0,
      Math.min(
        children.length - 1,
        activePhysical.current + direction
      )
    );

    const target = children[next];

    centerItem(el, target);
  };

  // Touch and mouse start
  const down = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    const el = scroller.current;
    if (!el) return;

    cancelAnimationFrame(momentum.current.raf);

    momentum.current.velocity = 0;
    wasDragged.current = false;

    drag.current = {
      x: e.clientX,
      scroll: el.scrollLeft,
      lastX: e.clientX,
      lastTime: performance.now(),
      velocity: 0,
      moved: false,
    };

    el.setPointerCapture(e.pointerId);
  };

  // Smooth dragging
  const move = (e) => {
    const d = drag.current;
    const el = scroller.current;

    if (!d || !el) return;

    const dx = e.clientX - d.x;

    if (Math.abs(dx) > 5) {
      d.moved = true;
      wasDragged.current = true;
    }

    if (!d.moved) return;

    const now = performance.now();
    const dt = Math.max((now - d.lastTime) / 1000, 0.001);

    d.velocity = Math.max(
      -1800,
      Math.min(1800, -(e.clientX - d.lastX) / dt)
    );

    d.lastX = e.clientX;
    d.lastTime = now;

    el.scrollLeft = d.scroll - dx;
  };

  // Release with natural momentum
  const up = () => {
    const d = drag.current;
    if (!d) return;

    drag.current = null;

    setTimeout(() => {
      wasDragged.current = false;
    }, 150);

    if (
      !d.moved ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const el = scroller.current;
    if (!el) return;

    const state = momentum.current;
    state.velocity = d.velocity;

    let last = performance.now();

    const glide = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      el.scrollLeft += state.velocity * dt;

      state.velocity *= Math.exp(-4.5 * dt);

      if (Math.abs(state.velocity) > 8) {
        state.raf = requestAnimationFrame(glide);
      } else {
        state.velocity = 0;
      }
    };

    state.raf = requestAnimationFrame(glide);
  };

  // Prevent accidental product opening after drag
  const preventClick = (e) => {
  if (wasDragged.current) {
    e.stopPropagation();
    e.preventDefault();
  }
};
  // Mouse wheel
 const wheel = useCallback((e) => {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault();
    scroller.current.scrollLeft += e.deltaY;
  }
}, []);

  const current = shoes[active] || shoes[0];

  if (!current) return null;

  return (
    <main className="gal shoe-gallery">

      <div className="shoe-heading">
        <span>THE COLLECTION</span>
        <h1>SHOES IN MOTION</h1>
        <p>Swipe or drag to explore the collection.</p>
      </div>

      <div className="shoe-pager">

        <button
          onClick={() => go(-1)}
          aria-label="Previous shoe"
        >
          ←
        </button>

        <span>
          {String(active + 1).padStart(2, "0")}
          <i>/</i>
          {String(total).padStart(2, "0")}
        </span>

        <button
          onClick={() => go(1)}
          aria-label="Next shoe"
        >
          →
        </button>

      </div>

      <div
        className="shoe-scroller"
        ref={scroller}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onClickCapture={preventClick}
        onWheel={wheel}
      >

        <ul className="shoe-track">

          {loopedShoes.map((shoe, index) => {
            const baseIndex = index % total;
            const isOuterCopy = Math.floor(index / total) !== 1;

            return (
              <li
                key={`${Math.floor(index / total)}-${shoe.id}-${shoe.variantIndex}`}
                aria-hidden={isOuterCopy}
              >

                <a
                  href={`#/p/${shoe.id}/${shoe.variantIndex}`}
                  draggable="false"
                  tabIndex={isOuterCopy ? -1 : undefined}
                  className={baseIndex === active ? "active-shoe" : ""}
                >

                  <div className="shoe-image-wrap">

                    <img
                      src={shoe.image}
                      alt={`${shoe.name} ${shoe.label}`}
                      draggable="false"
                      loading={index < total * 2 ? "eager" : "lazy"}
                      decoding="async"
                    />

                  </div>

                  <span className="shoe-name">
                    {shoe.name}
                  </span>

                  <span className="shoe-color">
                    {shoe.label}
                  </span>

                </a>

              </li>
            );
          })}

        </ul>

      </div>

      <div className="shoe-bottom">

        <div>
          <span>SELECTED MODEL</span>
          <h2>{current.name}</h2>
          <p>${current.price}.00</p>
        </div>

        <a href={`#/p/${current.id}/${current.variantIndex}`}>
          SHOP THIS PAIR <span>↗</span>
        </a>

      </div>

    </main>
  );
}
