import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

import { PRODUCT_CATEGORIES, ProductCategory } from '../../core/models/product-category';
import { Product } from '../../core/models/product.model';
import { AppStateService } from '../../core/state/app-state.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home-page',
  imports: [ReactiveFormsModule, ProductCardComponent],
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
  readonly selectedCategory = signal<ProductCategory | 'Todas'>('Todas');
  readonly categories = PRODUCT_CATEGORIES;

  readonly products = toSignal(this.appState.products$, { initialValue: [] as Product[] });
  readonly searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(startWith(this.searchControl.value), debounceTime(200), distinctUntilChanged()),
    { initialValue: this.searchControl.value }
  );

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();

    return this.products().filter((product) => {
      const matchesCategory = category === 'Todas' || product.categoria === category;
      const matchesTerm =
        !term ||
        product.nome.toLowerCase().includes(term) ||
        (product.descricao?.toLowerCase().includes(term) ?? false);

      return matchesCategory && matchesTerm;
    });
  });

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

  selectCategory(category: ProductCategory | 'Todas'): void {
    this.selectedCategory.set(category);
  }

  categoryButtonClass(category: ProductCategory | 'Todas'): string {
    const base = 'w-full rounded-2xl border px-4 py-3 text-left transition';
    const active = 'border-[#e5c77a] bg-[#1a1714] text-[#f4f1e6] shadow-[0_0_0_1px_rgba(229,199,122,0.2)]';
    const inactive = 'border-[#2a2724] bg-[#121212] text-[#b9b1a4] hover:border-[#4a433a] hover:text-[#f4f1e6]';

    return `${base} ${this.selectedCategory() === category ? active : inactive}`;
  }

  private resolveProductId(product: Product): number {
    return product.id ?? product.codigo ?? 0;
  }
}
