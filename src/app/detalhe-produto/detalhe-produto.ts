import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { getProductPricing } from '../core/models/product-pricing';

@Component({
  selector: 'app-detalhe-produto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalhe-produto.html',
})
export class DetalheProduto {
  @Input() produto: any;
  @Output() fechar = new EventEmitter<void>();
  @Output() comprar = new EventEmitter<void>();

  get pricing() {
    return this.produto ? getProductPricing(this.produto) : null;
  }
}
