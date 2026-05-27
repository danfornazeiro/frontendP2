import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from './api.constants';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/produto`;

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  searchByName(name: string): Observable<Product[]> {
    const encoded = encodeURIComponent(name.trim());
    return this.http.get<Product[]>(`${this.baseUrl}/${encoded}`);
  }

  create(product: Omit<Product, 'id' | 'codigo'>): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }

  update(product: Product): Observable<Product> {
    const id = product.id ?? product.codigo;
    return this.http.patch<Product>(`${this.baseUrl}/${id}`, product);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
