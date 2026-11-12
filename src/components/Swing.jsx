import { useEffect, useRef } from "react";

export const Hook = () => (
  <svg className="hook" viewBox="0 0 12 30" aria-hidden="true">
    <path d="M6 30V9a4 4 0 1 1 4 4" fill="none" stroke="#8d8d89" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Pendulum jaisa jhoolna: mouse chhoone par, ya rope scroll/drag hone par.
export default function Swing({ children, className = "", speed = 1 }) {
  const el = useRef(null);
  const s = useRef({ a: 0, w: 0 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf, last = performance.now();
    const step = (t) => {
      const dt = Math.min((t - last) / 16.7, 3);
      last = t;
      const p = s.current;
      p.w += (-0.012 * p.a - 0.022 * p.w) * dt * speed;
      p.a += p.w * dt * speed;
      if (el.current) el.current.style.transform = `rotate(${p.a.toFixed(3)}deg)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const kick = (e) => { s.current.w += e.detail * speed; };
    window.addEventListener("rope", kick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("rope", kick); };
  }, [speed]);

  const move = (e) => {
    s.current.w += Math.max(-1.2, Math.min(1.2, e.movementX * 0.04 * speed));
  };

  return (
    <div ref={el} className={`swing ${className}`} onPointerMove={move}>
      {children}
    </div>
  );
}
