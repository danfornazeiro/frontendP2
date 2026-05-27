import { Product } from './product.model';

export interface Cart {
  id: string;
  clienteId: number;
  produtoId?: number[];
  produtos?: Array<Product | number>;
  valorTotal?: number;
}
