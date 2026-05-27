import { AsyncPipe, CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';

import { Product } from '../../core/models/product.model';
import { AppStateService } from '../../core/state/app-state.service';

@Component({
  selector: 'app-product-page',
  imports: [AsyncPipe, CurrencyPipe, NgOptimizedImage],
  templateUrl: './product.page.html',
  styleUrl: './product.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPage implements OnInit {
  private readonly appState = inject(AppStateService);
  private readonly route = inject(ActivatedRoute);

  readonly message = signal<string | null>(null);

  readonly product$ = this.route.paramMap.pipe(
    map((params) => Number(params.get('id'))),
    switchMap((id) =>
      this.appState.loadProducts().pipe(
        map((products) => products.find((product) => this.resolveProductId(product) === id) ?? null)
      )
    )
  );

  ngOnInit(): void {
    this.appState.loadProducts().subscribe();
  }

  onAdd(product: Product): void {
    const clientId = this.appState.getClientId();
    if (!clientId) {
      this.message.set('Faca login para adicionar ao carrinho.');
      return;
    }

    const productId = this.resolveProductId(product);
    this.appState.ensureCartId$().subscribe((cartId) => {
      if (!cartId) {
        this.message.set('Carrinho nao encontrado.');
        return;
      }

      this.appState.addToCart(clientId, cartId, [productId]).subscribe({
        next: () => this.message.set('Produto adicionado ao carrinho.'),
        error: () => this.message.set('Falha ao atualizar carrinho.'),
      });
    });
  }

  private resolveProductId(product: Product): number {
    return product.id ?? product.codigo ?? 0;
  }
}
