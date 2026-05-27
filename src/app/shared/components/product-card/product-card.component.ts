import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';

import { Product } from '../../../core/models/product.model';

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

  price = computed(() => {
    const current = this.product();
    return current.promo > 0 && current.promo < current.valor ? current.promo : current.valor;
  });

  onView(): void {
    this.view.emit(this.product());
  }

  onAdd(): void {
    this.addToCart.emit(this.product());
  }
}
