# Web Shops Product

React + Vite store: rope par latke products, hanging product page, shoes ki floating gallery.

## Chalana
```
npm install
npm run dev
```

## Apni pictures lagana (public/images/)
```
public/images/
  shirts/hoodie-grey.png          -> rope par latka product (hoodie, shirt...)
  bags/red-bag.png                -> rope par latka product
  shoes/luka-5/black.png          -> shoes: model ka folder, andar har rang ki picture
  shoes/luka-5/white.png
  shoes/tatum-5-orbit/grey.png
```
- Latke hue products ki picture ka **upar ka beech wala hissa** wo jagah hai jahan se wo latkta hai (hook/hanger/strap), us ke upar khali jagah na chhorein.
- Background hata hua (PNG/WebP, transparent) hona chahiye.
- Folder ka naam category hai, `npm run dev` par products khud ban jate hain.

## Settings
- `scripts/config.json`: categories ka order, kaunsi category floating gallery hai (`float`), har category ka tagline, sizes.
- `scripts/prices.json`: qeematein (file/model ka naam, ya category, ya `_default`).
- Purani sample SVG pictures delete kar dein.
