export default function Header({ categories, cat, count, onBag }) {
  return (
    <header className="header">
      <a className="logo" href="#/" aria-label="Home">Webshop</a>
      <nav>
        {categories.map((c) => (
          <a key={c} href={`#/c/${c}`} className={c === cat ? "on" : ""}>{c}</a>
        ))}
      </nav>
      <button className="cart" onClick={onBag}>Cart ({count})</button>
    </header>
  );
}
