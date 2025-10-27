import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Proveedor,
  ProveedoresResponse,
  ProveedoresStats,
  CreateProveedorDto,
  UpdateProveedorDto,
  ProveedorFilters,
  AsignarConsorcioDto
} from '../models/proveedor.model';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  private apiUrl = `${environment.apiUrl}/proveedores`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener lista de proveedores con soporte para array simple o estructura paginada
   */
  getProveedores(filters: ProveedorFilters = {}): Observable<ProveedoresResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((res) => {
        // ✅ Caso 1: backend devuelve array plano
        if (Array.isArray(res)) {
          return {
            data: res,
            pagination: {
              total: res.length,
              page: filters.page ?? 1,
              limit: filters.limit ?? res.length,
              totalPages: 1
            }
          } as ProveedoresResponse;
        }

        // ✅ Caso 2: backend devuelve estructura { data, pagination }
        if (res.data && res.pagination) {
          return res as ProveedoresResponse;
        }

        // fallback
        return {
          data: [],
          pagination: { total: 0, page: 1, limit: 0, totalPages: 1 }
        };
      }),
      catchError((err) => {
        console.error('Error en getProveedores:', err);
        return throwError(() => err);
      })
    );
  }

  getProveedorById(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiUrl}/${id}`);
  }

  createProveedor(data: CreateProveedorDto): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiUrl, data);
  }

  updateProveedor(id: number, data: UpdateProveedorDto): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/${id}`, data);
  }

  deleteProveedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<ProveedoresStats> {
    return this.http.get<ProveedoresStats>(`${this.apiUrl}/stats`);
  }

  asignarConsorcio(data: AsignarConsorcioDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/asignar-consorcio`, data);
  }

  getTicketsProveedor(proveedorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${proveedorId}/tickets`);
  }

  toggleEstado(id: number): Observable<Proveedor> {
    return this.http.patch<Proveedor>(`${this.apiUrl}/${id}/toggle-estado`, {});
  }
}
