import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface TicketConsorcioOption {
  id: number;
  nombre: string;
}

export interface TicketUnidadOption {
  id: number;
  codigo?: string;
  nombre?: string;
  piso?: string | number;
  consorcioId?: number;
}

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private readonly baseUrl = environment.apiUrl;
  private readonly ticketsUrl = `${this.baseUrl}/tickets`;
  private readonly consorciosUrl = `${this.baseUrl}/consorcios`;
  private readonly unidadesUrl = `${this.baseUrl}/unidades`;
  private readonly proveedoresUrl = `${this.baseUrl}/proveedores`;

  constructor(private http: HttpClient) {}

  getTickets(params?: any): Observable<any[]> {
    return this.http.get<any>(this.ticketsUrl, { params }).pipe(
      map((res) => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.data)) return res.data;
        return [];
      }),
      catchError((err) => {
        console.error('Error al cargar tickets:', err);
        return of([]);
      })
    );
  }

  getTicketById(id: number): Observable<any> {
    return this.http.get<any>(`${this.ticketsUrl}/${id}`);
  }

  createTicket(data: any): Observable<any> {
    return this.http.post<any>(this.ticketsUrl, data);
  }

  updateTicket(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.ticketsUrl}/${id}`, data);
  }

  updateTicketEstado(id: number, estado: string, userId?: number): Observable<any> {
    const body: any = { estado };
    if (userId) body.userId = userId;
    return this.http.patch<any>(`${this.ticketsUrl}/${id}/estado`, body);
  }

  updateTicketAsignacion(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.ticketsUrl}/${id}/asignacion`, data);
  }

  updateTicketCostos(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.ticketsUrl}/${id}/costos`, data);
  }

  addComentario(ticketIdOrData: any, comentario?: any): Observable<any> {
    if (comentario === undefined) {
      const data = ticketIdOrData;
      return this.http.post<any>(`${this.ticketsUrl}/${data.ticketId}/comentarios`, data);
    }
    return this.http.post<any>(`${this.ticketsUrl}/${ticketIdOrData}/comentarios`, comentario);
  }

  getComentarios(ticketId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.ticketsUrl}/${ticketId}/comentarios`);
  }

  getTicketHistorial(ticketId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.ticketsUrl}/${ticketId}/historial`);
  }

  uploadAdjunto(ticketId: number, file: File, userId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());
    return this.http.post<any>(`${this.ticketsUrl}/${ticketId}/adjuntos`, formData);
  }

  getAdjuntos(ticketId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.ticketsUrl}/${ticketId}/adjuntos`);
  }

  getConsorcios(): Observable<TicketConsorcioOption[]> {
    return this.http.get<any>(this.consorciosUrl).pipe(
      map((res) => {
        const list = Array.isArray(res) ? res : res.data || [];
        return list.map((item: any) => ({
          id: item.id,
          nombre: item.nombre,
        }));
      }),
      catchError((err) => {
        console.error('Error al cargar consorcios:', err);
        return of([]);
      })
    );
  }

  getUnidades(): Observable<TicketUnidadOption[]> {
    return this.http.get<any>(this.unidadesUrl).pipe(
      map((res) => Array.isArray(res) ? res : res.data || []),
      catchError(() => of([]))
    );
  }

  getProveedores(): Observable<any[]> {
    return this.http.get<any>(this.proveedoresUrl).pipe(
      map((res) => Array.isArray(res) ? res : res.data || []),
      catchError(() => of([]))
    );
  }
}