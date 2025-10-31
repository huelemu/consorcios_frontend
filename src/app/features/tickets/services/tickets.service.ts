import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Ticket,
  TicketFilters,
  TicketPriority,
  TicketType
} from '../models/ticket.model';
import { Consorcio } from '../../consorcios/models/consorcio.model';
import { UnidadFuncional } from '../../unidades/models/unidad.model';
import { Proveedor } from '../../proveedores/models/proveedor.model';

export interface TicketConsorcioOption {
  id: number;
  nombre: string;
}

export interface TicketUnidadOption {
  id: number;
  consorcioId: number;
  consorcioNombre: string;
  nombre: string;
  piso?: string;
  unidad?: string;
}

export interface TicketProveedorOption {
  id: number;
  personaId: number;
  razonSocial: string;
  rubro?: string;
  activo: boolean;
}

interface TicketListResponse {
  data: Ticket[];
}

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private readonly apiUrl = `${environment.apiUrl}/tickets`;
  private readonly consorciosUrl = `${environment.apiUrl}/consorcios`;
  private readonly unidadesUrl = `${environment.apiUrl}/unidades`;
  private readonly proveedoresUrl = `${environment.apiUrl}/proveedores`;

  constructor(private readonly http: HttpClient) {}

  /** =============================
   *  OBTENER LISTA DE TICKETS
   * ============================= */
  getTickets(filters: TicketFilters = {}): Observable<Ticket[]> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return;
      }

      const paramKey = this.mapFilterKey(key as keyof TicketFilters);
      params = params.set(paramKey, String(value));
    });

    return this.http.get<Ticket[] | TicketListResponse>(this.apiUrl, { params }).pipe(
      map(response => this.normalizeTicketListResponse(response)),
      catchError(error => {
        console.error('Error al obtener tickets:', error);
        return throwError(() => error);
      })
    );
  }

  /** =============================
   *  OBTENER UN TICKET POR ID
   * ============================= */
  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error al obtener ticket por ID:', error);
        return throwError(() => error);
      })
    );
  }

  /** =============================
   *  🆕 CREAR NUEVO TICKET
   * ============================= */
  createTicket(payload: {
    consorcio_id: number;
    unidad_id?: number | null;
    tipo: TicketType;
    prioridad: TicketPriority;
    titulo?: string;
    descripcion: string;
    creado_por: number;
    asignado_a?: number | null;
  }): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, payload).pipe(
      map(ticket => {
        console.log('✅ Ticket creado:', ticket);
        return ticket;
      }),
      catchError(error => {
        console.error('❌ Error al crear ticket:', error);
        return throwError(() => error);
      })
    );
  }

  /** =============================
   *  OBTENER FILTROS
   * ============================= */
  getConsorcios(limit: number = 200): Observable<TicketConsorcioOption[]> {
    const params = new HttpParams().set('limit', limit.toString()).set('page', '1');

    return this.http.get<Consorcio[] | { data: Consorcio[] }>(this.consorciosUrl, { params }).pipe(
      map(response => {
        const data = Array.isArray(response) ? response : response?.data ?? [];
        return data.map(consorcio => ({
          id: consorcio.id,
          nombre: consorcio.nombre
        }) as TicketConsorcioOption);
      }),
      catchError(error => {
        console.error('Error al obtener consorcios:', error);
        return throwError(() => error);
      })
    );
  }

  getUnidades(limit: number = 500): Observable<TicketUnidadOption[]> {
    const params = new HttpParams().set('limit', limit.toString()).set('page', '1');

    return this.http.get<UnidadFuncional[] | { data: UnidadFuncional[] }>(this.unidadesUrl, { params }).pipe(
      map(response => {
        const data = Array.isArray(response) ? response : response?.data ?? [];
        return data.map(unidad => ({
          id: unidad.id,
          consorcioId: unidad.consorcio_id,
          consorcioNombre: unidad.consorcio?.nombre ?? `Consorcio #${unidad.consorcio_id}`,
          nombre: unidad.codigo,
          piso: unidad.piso,
          unidad: unidad.codigo
        }) as TicketUnidadOption);
      }),
      catchError(error => {
        console.error('Error al obtener unidades:', error);
        return throwError(() => error);
      })
    );
  }

  getProveedores(limit: number = 200): Observable<TicketProveedorOption[]> {
    const params = new HttpParams().set('limit', limit.toString()).set('page', '1');

    return this.http.get<Proveedor[] | { data: Proveedor[] }>(this.proveedoresUrl, { params }).pipe(
      map(response => {
        const data = Array.isArray(response) ? response : response?.data ?? [];
        return data.map(proveedor => ({
          id: proveedor.id,
          personaId: proveedor.persona_id,
          razonSocial: proveedor.razon_social,
          rubro: proveedor.rubro,
          activo: proveedor.activo
        }) as TicketProveedorOption);
      }),
      catchError(error => {
        console.error('Error al obtener proveedores:', error);
        return throwError(() => error);
      })
    );
  }

  /** =============================
   *  OPCIONES FIJAS
   * ============================= */
  getPrioridades(): TicketPriority[] {
    return ['baja', 'media', 'alta', 'critica'];
  }

  getTipos(): TicketType[] {
    return ['mantenimiento', 'reclamo', 'limpieza', 'administrativo', 'mejora', 'otro'];
  }

  /** =============================
   *  MAP Y NORMALIZADORES
   * ============================= */
  private mapFilterKey(key: keyof TicketFilters): string {
    switch (key) {
      case 'consorcioId':
        return 'consorcio_id';
      case 'unidadId':
        return 'unidad_id';
      case 'asignadoRol':
        return 'asignado_rol';
      case 'proveedorId':
        return 'proveedor_id';
      case 'searchTerm':
        return 'search';
      default:
        return key;
    }
  }

  private normalizeTicketListResponse(response: Ticket[] | TicketListResponse): Ticket[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return [];
  }
}
