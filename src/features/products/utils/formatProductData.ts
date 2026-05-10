export const parseMoney = (value: unknown) => (
  value ? parseFloat(String(value).replace(",", ".")) : null
);

export const parseStock = (value: unknown) => parseInt(String(value), 10) || 0;
