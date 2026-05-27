import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs/operators';

import { Product } from '../../core/models/product.model';
import { AppStateService } from '../../core/state/app-state.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home-page',
  imports: [AsyncPipe, ReactiveFormsModule, ProductCardComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  private readonly appState = inject(AppStateService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly message = signal<string | null>(null);
  readonly searchControl = new FormControl('', { nonNullable: true });

  readonly products$ = this.searchControl.valueChanges.pipe(
    startWith(''),
    debounceTime(250),
    distinctUntilChanged(),
    switchMap((term) => this.appState.searchProducts(term))
  );

  ngOnInit(): void {
    this.appState.loadProducts().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.message.set('Nao foi possivel carregar os produtos.');
      },
    });
  }

  onView(product: Product): void {
    const id = this.resolveProductId(product);
    if (id) {
      this.router.navigate(['/product', id]);
    }
  }

  onAdd(product: Product): void {
    const clientId = this.appState.getClientId();
    if (!clientId) {
      this.message.set('Faca login para adicionar produtos ao carrinho.');
      return;
    }

    const productId = this.resolveProductId(product);
    if (!productId) {
      return;
    }

    this.appState.ensureCartId$().subscribe((cartId) => {
      if (!cartId) {
        this.message.set('Carrinho nao encontrado.');
        return;
      }

      this.appState.addToCart(clientId, cartId, [productId]).subscribe({
        next: () => this.message.set('Produto adicionado ao carrinho.'),
        error: () => this.message.set('Nao foi possivel atualizar o carrinho.'),
      });
    });
  }

  trackProduct = (_index: number, product: Product): number => this.resolveProductId(product);

  private resolveProductId(product: Product): number {
    return product.id ?? product.codigo ?? 0;
  }
}
