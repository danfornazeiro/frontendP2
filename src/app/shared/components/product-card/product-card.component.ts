import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';

import { Product } from '../../../core/models/product.model';
import { getProductPricing } from '../../../core/models/product-pricing';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, NgOptimizedImage],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  product = input.required<Product>();
  view = output<Product>();
  addToCart = output<Product>();

  priceInfo = computed(() => getProductPricing(this.product()));

  onView(): void {
    this.view.emit(this.product());
  }

  onAdd(): void {
    this.addToCart.emit(this.product());
  }
}
