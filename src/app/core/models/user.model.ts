export interface UserProfile {
  id?: number;
  codigo?: number;
  nome: string;
  email: string;
  senha?: string;
  telefone: string;
  logradouro: string;
  cesta?: {
    id: string;
    produtos?: unknown[];
  };
}
