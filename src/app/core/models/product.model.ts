import { ProductCategory } from './product-category';

export interface Product {
  id?: number;
  codigo?: number;
  nome: string;
  categoria?: ProductCategory;
  imageUrl?: string;
  descricao?: string;
  valor: number;
  promo: number;
  quantidade: number;
}
