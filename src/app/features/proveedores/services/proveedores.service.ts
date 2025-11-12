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
  AsignarConsorcioDto,
  ProveedorPersona,
  CreateProveedorPersonaDto,
  UpdateProveedorPersonaDto,
  ProveedorCuentaBancaria,
  CreateProveedorCuentaBancariaDto,
  UpdateProveedorCuentaBancariaDto
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

  // ========================================
  // Métodos para Personas Vinculadas
  // ========================================

  /**
   * Obtener todas las personas vinculadas a un proveedor
   */
  getPersonasVinculadas(proveedorId: number): Observable<ProveedorPersona[]> {
    return this.http.get<ProveedorPersona[]>(`${this.apiUrl}/${proveedorId}/personas`);
  }

  /**
   * Vincular una persona a un proveedor con un rol
   */
  vincularPersona(data: CreateProveedorPersonaDto): Observable<ProveedorPersona> {
    return this.http.post<ProveedorPersona>(
      `${this.apiUrl}/${data.proveedor_id}/personas`,
      data
    );
  }

  /**
   * Actualizar la vinculación de una persona (cambiar rol, fechas, etc.)
   */
  updatePersonaVinculada(
    proveedorId: number,
    personaVinculadaId: number,
    data: UpdateProveedorPersonaDto
  ): Observable<ProveedorPersona> {
    return this.http.put<ProveedorPersona>(
      `${this.apiUrl}/${proveedorId}/personas/${personaVinculadaId}`,
      data
    );
  }

  /**
   * Desvincular una persona de un proveedor
   */
  desvincularPersona(proveedorId: number, personaVinculadaId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${proveedorId}/personas/${personaVinculadaId}`
    );
  }

  /**
   * Marcar una persona como principal
   */
  marcarPersonaPrincipal(proveedorId: number, personaVinculadaId: number): Observable<ProveedorPersona> {
    return this.http.patch<ProveedorPersona>(
      `${this.apiUrl}/${proveedorId}/personas/${personaVinculadaId}/principal`,
      {}
    );
  }

  // ========================================
  // Métodos para Cuentas Bancarias
  // ========================================

  /**
   * Obtener todas las cuentas bancarias de un proveedor
   */
  getCuentasBancarias(proveedorId: number): Observable<ProveedorCuentaBancaria[]> {
    return this.http.get<ProveedorCuentaBancaria[]>(`${this.apiUrl}/${proveedorId}/cuentas`);
  }

  /**
   * Agregar una cuenta bancaria a un proveedor
   */
  agregarCuentaBancaria(data: CreateProveedorCuentaBancariaDto): Observable<ProveedorCuentaBancaria> {
    return this.http.post<ProveedorCuentaBancaria>(
      `${this.apiUrl}/${data.proveedor_id}/cuentas`,
      data
    );
  }

  /**
   * Actualizar una cuenta bancaria
   */
  updateCuentaBancaria(
    proveedorId: number,
    cuentaId: number,
    data: UpdateProveedorCuentaBancariaDto
  ): Observable<ProveedorCuentaBancaria> {
    return this.http.put<ProveedorCuentaBancaria>(
      `${this.apiUrl}/${proveedorId}/cuentas/${cuentaId}`,
      data
    );
  }

  /**
   * Eliminar una cuenta bancaria
   */
  deleteCuentaBancaria(proveedorId: number, cuentaId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${proveedorId}/cuentas/${cuentaId}`);
  }

  /**
   * Marcar una cuenta bancaria como predeterminada
   */
  marcarCuentaPredeterminada(proveedorId: number, cuentaId: number): Observable<ProveedorCuentaBancaria> {
    return this.http.patch<ProveedorCuentaBancaria>(
      `${this.apiUrl}/${proveedorId}/cuentas/${cuentaId}/predeterminada`,
      {}
    );
  }

  /**
   * Activar/Desactivar una cuenta bancaria
   */
  toggleCuentaActiva(proveedorId: number, cuentaId: number): Observable<ProveedorCuentaBancaria> {
    return this.http.patch<ProveedorCuentaBancaria>(
      `${this.apiUrl}/${proveedorId}/cuentas/${cuentaId}/toggle-activa`,
      {}
    );
  }
}
