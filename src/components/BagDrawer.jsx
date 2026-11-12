import { useState } from "react";

export default function BagDrawer({ open, items, onClose, onRemove }) {
  const [note, setNote] = useState(false);
  const total = items.reduce((s, i) => s + i.price, 0);

  return (
    <>
      <div className={`scrim ${open ? "show" : ""}`} onClick={onClose} />
      <aside className={`drawer ${open ? "show" : ""}`} aria-hidden={!open}>
        <div className="drawer-head">
          <h2>Bag</h2>
          <button onClick={onClose}>Close</button>
        </div>
        {items.length === 0 ? (
          <p className="empty">Bag khali hai. Koi product chun kar Add to bag dabayein.</p>
        ) : (
          <ul className="lines">
            {items.map((i) => (
              <li key={i.key}>
                <img src={i.image} alt="" />
                <div>
                  <strong>{i.name}</strong>
                  <span>Size {i.size}</span>
                  <span>${i.price}</span>
                </div>
                <button onClick={() => onRemove(i.key)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
        <div className="drawer-foot">
          <p><span>Total</span><strong>${total}</strong></p>
          <button className="add" disabled={!items.length} onClick={() => setNote(true)}>Checkout</button>
          {note && <small>Ye demo store hai, payment abhi connect nahi hai.</small>}
        </div>
      </aside>
    </>
  );
}
