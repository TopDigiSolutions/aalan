import catalog from "../../shared/catalog.json";
export const products = catalog;
export type Product = (typeof products)[number];
export const money = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    amount / 100,
  );
