export interface Order {
  id?: number;
  carrinhoId?: string | number;
  carrinho?: {
    id: string;
    produtos?: unknown[];
  };
  data?: string;
}
