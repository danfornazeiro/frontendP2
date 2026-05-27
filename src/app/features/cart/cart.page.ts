import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { combineLatest, map } from 'rxjs';

import { Cart } from '../../core/models/cart.model';
import { Product } from '../../core/models/product.model';
import { AppStateService } from '../../core/state/app-state.service';

interface CartItemView {
  product: Product;
  quantity: number;
  lineTotal: number;
}

interface CartView {
  items: CartItemView[];
  total: number;
  count: number;
}

@Component({
  selector: 'app-cart-page',
  imports: [AsyncPipe, CurrencyPipe],
  templateUrl: './cart.page.html',
  styleUrl: './cart.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage implements OnInit {
  private readonly appState = inject(AppStateService);

  readonly message = signal<string | null>(null);

  readonly cartView$ = combineLatest([this.appState.cart$, this.appState.products$]).pipe(
    map(([cart, products]) => this.buildCartView(cart, products))
  );

  ngOnInit(): void {
    this.appState.loadProducts().subscribe();

    this.appState.ensureCartId$().subscribe((cartId) => {
      if (!cartId) {
        this.message.set('Carrinho nao encontrado.');
        return;
      }

      this.appState.loadCart(cartId).subscribe({
        error: () => this.message.set('Nao foi possivel carregar o carrinho.'),
      });
    });
  }

  remove(product: Product): void {
    const id = this.resolveProductId(product);
    if (!id) {
      return;
    }

    this.appState.removeFromCartLocal(id);
  }

  checkout(): void {
    this.appState.ensureCartId$().subscribe((cartId) => {
      if (!cartId) {
        this.message.set('Carrinho nao encontrado.');
        return;
      }

      this.appState.createOrder(cartId).subscribe({
        next: () => this.message.set('Pedido criado com sucesso.'),
        error: () => this.message.set('Nao foi possivel finalizar o pedido.'),
      });
    });
  }

  private buildCartView(cart: Cart | null, products: Product[]): CartView | null {
    if (!cart) {
      return null;
    }

    const itemsMap = new Map<number, CartItemView>();
    const ids = cart.produtoId ?? [];

    ids.forEach((id) => {
      const product = products.find((item) => this.resolveProductId(item) === id);
      if (!product) {
        return;
      }

      const price = this.resolvePrice(product);
      const current = itemsMap.get(id);
      if (current) {
        current.quantity += 1;
        current.lineTotal = current.quantity * price;
      } else {
        itemsMap.set(id, { product, quantity: 1, lineTotal: price });
      }
    });

    if (itemsMap.size === 0 && cart.produtos && cart.produtos.length > 0) {
      cart.produtos.forEach((entry) => {
        if (typeof entry === 'number') {
          return;
        }

        const id = this.resolveProductId(entry);
        if (!id) {
          return;
        }

        const price = this.resolvePrice(entry);
        const current = itemsMap.get(id);
        if (current) {
          current.quantity += 1;
          current.lineTotal = current.quantity * price;
        } else {
          itemsMap.set(id, { product: entry, quantity: 1, lineTotal: price });
        }
      });
    }

    const items = Array.from(itemsMap.values());
    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, total, count };
  }

  private resolvePrice(product: Product): number {
    return product.promo > 0 && product.promo < product.valor ? product.promo : product.valor;
  }

  private resolveProductId(product: Product): number {
    return product.id ?? product.codigo ?? 0;
  }
}
