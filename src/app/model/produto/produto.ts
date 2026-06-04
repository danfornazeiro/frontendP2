import { ProductCategory } from '../../core/models/product-category';

export class Produto {
  codigo: number = 0;
  nome: string = '';
  categoria: ProductCategory = 'Camiseta';
  descricao?: string = '';
  valor: number = 0;
  promo: number = 0;
  quantidade: number = 0;
}
