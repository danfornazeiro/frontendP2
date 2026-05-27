import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Product } from '../../core/models/product.model';
import { AppStateService } from '../../core/state/app-state.service';

@Component({
  selector: 'app-admin-product-page',
  imports: [AsyncPipe, ReactiveFormsModule],
  templateUrl: './admin-product.page.html',
  styleUrl: './admin-product.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductPage implements OnInit {
  private readonly appState = inject(AppStateService);

  readonly products$ = this.appState.products$;
  readonly message = signal<string | null>(null);
  readonly selectedId = signal<number | null>(null);

  readonly form = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    imageUrl: new FormControl('', { nonNullable: true }),
    descricao: new FormControl('', { nonNullable: true }),
    valor: new FormControl(0, { nonNullable: true }),
    promo: new FormControl(0, { nonNullable: true }),
    quantidade: new FormControl(0, { nonNullable: true }),
  });

  ngOnInit(): void {
    this.appState.loadProducts().subscribe();
  }

  submit(): void {
    if (this.form.invalid) {
      this.message.set('Preencha todos os campos obrigatorios.');
      return;
    }

    const payload = this.form.getRawValue();
    const id = this.selectedId();

    const action$ = id
      ? this.appState.updateProduct({ ...payload, id })
      : this.appState.createProduct(payload);

    action$.subscribe({
      next: () => {
        this.message.set(id ? 'Produto atualizado.' : 'Produto criado.');
        this.resetForm();
      },
      error: () => this.message.set('Nao foi possivel salvar o produto.'),
    });
  }

  edit(product: Product): void {
    this.selectedId.set(this.resolveProductId(product));
    this.form.patchValue({
      nome: product.nome,
      imageUrl: product.imageUrl ?? '',
      descricao: product.descricao ?? '',
      valor: product.valor,
      promo: product.promo,
      quantidade: product.quantidade,
    });
  }

  remove(product: Product): void {
    const id = this.resolveProductId(product);
    if (!id) {
      return;
    }

    this.appState.deleteProduct(id).subscribe({
      next: () => this.message.set('Produto removido.'),
      error: () => this.message.set('Nao foi possivel remover o produto.'),
    });
  }

  resetForm(): void {
    this.form.reset({
      nome: '',
      imageUrl: '',
      descricao: '',
      valor: 0,
      promo: 0,
      quantidade: 0,
    });
    this.selectedId.set(null);
  }

  trackProduct = (_index: number, product: Product): number => this.resolveProductId(product);

  private resolveProductId(product: Product): number {
    return product.id ?? product.codigo ?? 0;
  }
}
