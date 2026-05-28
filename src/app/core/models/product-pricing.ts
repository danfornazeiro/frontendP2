export interface PricedProduct {
  valor: number;
  promo: number;
}

export interface ProductPricing {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  hasDiscount: boolean;
}

export function getProductPricing(product: PricedProduct): ProductPricing {
  const originalPrice = Number(product.valor ?? 0);
  const discountAmount = Number(product.promo ?? 0);
  const hasDiscount = discountAmount > 0;
  const finalPrice = hasDiscount ? Math.max(originalPrice - discountAmount, 0) : originalPrice;

  return {
    originalPrice,
    discountAmount: hasDiscount ? Math.min(discountAmount, originalPrice) : 0,
    finalPrice,
    hasDiscount,
  };
}