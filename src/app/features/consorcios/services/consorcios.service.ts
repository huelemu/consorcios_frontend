import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Consorcio,
  CreateConsorcioDto,
  UpdateConsorcioDto,
  ConsorcioFilters,
  ConsorciosResponse,
  ConsorciosGeneralStats
} from '../models/consorcio.model';

/**
 * =========================================
 * CONSORCIOS SERVICE
 * =========================================
 * Servicio para gestionar consorcios/edificios
 */
@Injectable({
  providedIn: 'root'
})
export class ConsorciosService {
  private apiUrl = `${environment.apiUrl}/consorcios`;

  constructor(private http: HttpClient) {}

  // ========================================
  // CRUD BÁSICO
  // ========================================

  /**
   * Obtener lista de consorcios con filtros y paginación
   */
  getConsorcios(filters?: ConsorcioFilters): Observable<ConsorciosResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.codigo_ext) params = params.set('codigo_ext', filters.codigo_ext);
      if (filters.estado) params = params.set('estado', filters.estado);
      if (filters.ciudad) params = params.set('ciudad', filters.ciudad);
      if (filters.provincia) params = params.set('provincia', filters.provincia);
      if (filters.responsable_id) params = params.set('responsable_id', filters.responsable_id.toString());
      // Solo enviar el parámetro si es true
      if (filters.tiene_tickets_pendientes === true) {
        params = params.set('tiene_tickets_pendientes', 'true');
      }
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    }

    return this.http.get<ConsorciosResponse>(this.apiUrl, { params });
  }

  /**
   * Obtener un consorcio por ID
   */
  getConsorcioById(id: number): Observable<Consorcio> {
    return this.http.get<Consorcio>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un nuevo consorcio
   */
  createConsorcio(data: CreateConsorcioDto): Observable<{ message: string; data: Consorcio }> {
    return this.http.post<{ message: string; data: Consorcio }>(this.apiUrl, data);
  }

  /**
   * Actualizar un consorcio existente
   */
  updateConsorcio(id: number, data: UpdateConsorcioDto): Observable<{ message: string; data: Consorcio }> {
    return this.http.put<{ message: string; data: Consorcio }>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Eliminar un consorcio (soft delete por defecto)
   */
  deleteConsorcio(id: number, hard: boolean = false): Observable<{ message: string; deleted?: boolean }> {
    let params = new HttpParams();
    if (hard) {
      params = params.set('hard', 'true');
    }
    return this.http.delete<{ message: string; deleted?: boolean }>(`${this.apiUrl}/${id}`, { params });
  }

  // ========================================
  // ACCIONES ESPECÍFICAS
  // ========================================

  /**
   * Activar un consorcio
   */
  activarConsorcio(id: number): Observable<{ message: string; data: Consorcio }> {
    return this.http.patch<{ message: string; data: Consorcio }>(`${this.apiUrl}/${id}/activar`, {});
  }

  /**
   * Desactivar un consorcio
   */
  desactivarConsorcio(id: number): Observable<{ message: string; data: Consorcio }> {
    return this.http.patch<{ message: string; data: Consorcio }>(`${this.apiUrl}/${id}/desactivar`, {});
  }

  // ========================================
  // ESTADÍSTICAS
  // ========================================

  /**
   * Obtener estadísticas generales de consorcios
   */
  getGeneralStats(): Observable<ConsorciosGeneralStats> {
    return this.http.get<ConsorciosGeneralStats>(`${this.apiUrl}/stats/general`);
  }

  // ========================================
  // UTILIDADES
  // ========================================

  /**
   * Buscar consorcios por nombre (para autocomplete)
   */
  searchByNombre(query: string, limit: number = 10): Observable<ConsorciosResponse> {
    return this.getConsorcios({
      search: query,
      limit,
      page: 1,
      sortBy: 'nombre',
      sortOrder: 'asc'
    });
  }

  /**
   * Obtener consorcios activos solamente
   */
  getConsorciosActivos(filters?: ConsorcioFilters): Observable<ConsorciosResponse> {
    return this.getConsorcios({
      ...filters,
      estado: 'activo'
    });
  }

  /**
   * Obtener consorcios por ciudad
   */
  getConsorciosByCiudad(ciudad: string, filters?: ConsorcioFilters): Observable<ConsorciosResponse> {
    return this.getConsorcios({
      ...filters,
      ciudad
    });
  }

  /**
   * Obtener consorcios por provincia
   */
  getConsorciosByProvincia(provincia: string, filters?: ConsorcioFilters): Observable<ConsorciosResponse> {
    return this.getConsorcios({
      ...filters,
      provincia
    });
  }

  /**
   * Obtener consorcios de un responsable específico
   */
  getConsorciosByResponsable(responsableId: number, filters?: ConsorcioFilters): Observable<ConsorciosResponse> {
    return this.getConsorcios({
      ...filters,
      responsable_id: responsableId
    });
  }

  // ========================================
  // VALIDACIONES
  // ========================================

  /**
   * Verificar si un nombre de consorcio ya existe
   */
  nombreExists(nombre: string): Observable<boolean> {
    return new Observable(observer => {
      this.getConsorcios({ search: nombre, limit: 1 }).subscribe({
        next: (response) => {
          const exists = response.data.some(c => 
            c.nombre.toLowerCase() === nombre.toLowerCase()
          );
          observer.next(exists);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Verificar si un CUIT ya está registrado
   */
  cuitExists(cuit: string, excludeId?: number): Observable<boolean> {
    return new Observable(observer => {
      this.getConsorcios({ search: cuit, limit: 10 }).subscribe({
        next: (response) => {
          const exists = response.data.some(c => 
            c.cuit === cuit && (!excludeId || c.id !== excludeId)
          );
          observer.next(exists);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }
}