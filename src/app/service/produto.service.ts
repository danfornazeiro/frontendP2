import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from './api.constants';
import { Produto } from '../model/produto/produto';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/produto`;

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.baseUrl);
  }

  criar(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(this.baseUrl, produto);
  }

  atualizar(produto: Produto): Observable<Produto> {
    return this.http.patch<Produto>(`${this.baseUrl}/${produto.codigo}`, produto);
  }

  excluir(codigo: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${codigo}`);
  }
}
