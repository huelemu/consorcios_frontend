import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  UnidadFuncional,
  UnidadInput,
  UnidadesResponse,
  UnidadFilters,
  UnidadesStats
} from '../models/unidad.model';

@Injectable({
  providedIn: 'root'
})
export class UnidadesService {
  private apiUrl = `${environment.apiUrl}/unidades`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las unidades con filtros y paginación
   */
  getUnidades(filters: UnidadFilters = {}): Observable<UnidadesResponse> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.consorcio_id) params = params.set('consorcio_id', filters.consorcio_id.toString());
    if (filters.estado) params = params.set('estado', filters.estado);
    if (filters.tiene_tickets_pendientes !== undefined) {
      params = params.set('tiene_tickets_pendientes', filters.tiene_tickets_pendientes.toString());
    }
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this.http.get<UnidadesResponse>(this.apiUrl, { params });
  }

  /**
   * Obtener una unidad por ID
   */
  getUnidadById(id: number): Observable<UnidadFuncional> {
    return this.http.get<UnidadFuncional>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear una nueva unidad
   */
  createUnidad(unidad: UnidadInput): Observable<{ message: string; data: UnidadFuncional }> {
    return this.http.post<{ message: string; data: UnidadFuncional }>(this.apiUrl, unidad);
  }

  /**
   * Actualizar una unidad existente
   */
  updateUnidad(id: number, unidad: Partial<UnidadInput>): Observable<{ message: string; data: UnidadFuncional }> {
    return this.http.put<{ message: string; data: UnidadFuncional }>(`${this.apiUrl}/${id}`, unidad);
  }

  /**
   * Eliminar una unidad
   */
  deleteUnidad(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener unidades de un consorcio específico
   */
  getUnidadesByConsorcio(consorcioId: number): Observable<UnidadFuncional[]> {
    return this.http.get<UnidadFuncional[]>(`${this.apiUrl}/consorcio/${consorcioId}`);
  }

  /**
   * ⭐ NUEVA: Creación masiva de unidades
   */
  bulkCreate(data: {
    consorcio_id: number;
    cantidad: number;
    prefijo: string;
    tipo: string;
    estado: string;
  }): Observable<{ success: boolean; creadas: number }> {
    return this.http.post<{ success: boolean; creadas: number }>(
      `${this.apiUrl}/bulk-create`,
      data
    );
  }
}