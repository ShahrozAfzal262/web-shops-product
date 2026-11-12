import { useState } from "react";
import Swing, { Hook } from "./Swing";

const shirtPrices = {
  S: 99,
  M: 105,
  L: 110,
  XL: 115,
};

export default function Detail({
  product,
  v,
  floating,
  siblings,
  back,
  onAdd,
}) {
  const [size, setSize] = useState(product.sizes[0]);

  const variant = product.variants[v] || product.variants[0];

  const label =
    product.variants.length > 1
      ? `${product.name} (${variant.label})`
      : product.name;

  const currentPrice =
    product.category === "shirts"
      ? shirtPrices[size] || product.price
      : product.price;

  const thumbs = floating
    ? product.variants.map((x, k) => ({
        key: x.image,
        href: `#/p/${product.id}/${k}`,
        image: x.image,
        on: k === v,
        label: x.label,
      }))
    : siblings.map((s) => ({
        key: s.id,
        href: `#/p/${s.id}`,
        image: s.variants[0].image,
        on: s.id === product.id,
        label: s.name,
      }));

  return (
    <main className={`pdp ${floating ? "flt" : "hng"}`}>
      <a className="back" href={back} aria-label="Back">
        ←
      </a>

      <div className="pdp-stage">
        {floating ? (
          <img
            key={variant.image}
            className="pic"
            src={variant.image}
            alt={label}
          />
        ) : (
          <Swing className="big">
            <Hook />
            <img
              className="pic"
              src={variant.image}
              alt={label}
              draggable="false"
            />
          </Swing>
        )}
      </div>

      <section className="side">
        {floating ? <h1>{product.name}</h1> : <h2>{product.name}</h2>}

        <p className="price">
          ${currentPrice}.00
          {product.category === "shirts" && (
            <span className="price-note"> · Price by size</span>
          )}
        </p>

        <div className="sizes" role="radiogroup" aria-label="Size">
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={s === size}
              className={s === size ? "on" : ""}
              onClick={() => setSize(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          className="add"
          onClick={() =>
            onAdd(
              {
                ...product,
                name: label,
                image: variant.image,
                price: currentPrice,
              },
              size
            )
          }
        >
          Add to bag — ${currentPrice}.00
        </button>
      </section>

      {thumbs.length > 1 && (
        <ul className="thumbs">
          {thumbs.map((t) => (
            <li key={t.key}>
              <a
                href={t.href}
                className={t.on ? "on" : ""}
                aria-label={t.label}
              >
                <img src={t.image} alt="" draggable="false" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}