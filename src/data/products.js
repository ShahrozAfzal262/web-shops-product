import data from "./products.json";

export const config = data.config;
export const products = data.products;

const order = config.order || [];
const all = [...new Set(products.map((p) => p.category))];
export const categories = [...order.filter((c) => all.includes(c)), ...all.filter((c) => !order.includes(c))];
export const isFloat = (cat) => (config.float || []).includes(cat);
