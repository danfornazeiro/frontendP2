export const PRODUCT_CATEGORIES = ['Camiseta', 'Camisa', 'Conjunto'] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];