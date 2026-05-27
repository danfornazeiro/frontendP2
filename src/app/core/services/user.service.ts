import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from './api.constants';
import { UserProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/cliente`;

  getAll(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(this.baseUrl);
  }

  getById(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/${id}`);
  }

  create(profile: Omit<UserProfile, 'id' | 'codigo'>): Observable<UserProfile> {
    return this.http.post<UserProfile>(this.baseUrl, profile);
  }

  update(profile: Partial<UserProfile> & { id?: number; codigo?: number }): Observable<UserProfile> {
    const id = profile.id ?? profile.codigo;
    return this.http.patch<UserProfile>(`${this.baseUrl}/${id}`, profile);
  }

  changePassword(id: number, payload: { senha: string }): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/alterarSenha/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
