import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:3001';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${BASE}${path}`);
  }

  getBlob(path: string, params?: Record<string, string>): Observable<Blob> {
    let url = `${BASE}${path}`;
    if (params && Object.keys(params).length) {
      url += `?${new URLSearchParams(params).toString()}`;
    }
    return this.http.get(url, { responseType: 'blob' });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${BASE}${path}`, body);
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${BASE}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${BASE}${path}`);
  }

  postForm<T>(path: string, form: FormData): Observable<T> {
    return this.http.post<T>(`${BASE}${path}`, form);
  }
}
