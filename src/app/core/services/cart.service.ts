import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from './api.constants';
import { Cart } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/carrinho`;

  getById(id: string): Observable<Cart> {
    return this.http.get<Cart>(`${this.baseUrl}/${id}`);
  }

  addItems(clienteId: number, carrinhoId: string, produtoId: number[]): Observable<Cart> {
    return this.http.post<Cart>(`${this.baseUrl}/${clienteId}/${carrinhoId}`, { produtoId });
  }
}
