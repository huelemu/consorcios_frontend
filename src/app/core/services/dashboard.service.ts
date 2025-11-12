import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Estadisticas {
  totalConsorcios: number;
  totalUnidades: number;
  totalUsuarios: number;
  totalPersonas: number;
  totalProveedores: number;
  totalTicketsPendientes: number;
}

export interface ConsorcioConTickets {
  id: number;
  nombre: string;
  descripcion: string;
  ticketsPendientes: number;
  ticketsAbiertos: number;
  ticketsEnProceso: number;
  unidadesAfectadas: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene las estadísticas generales del sistema
   */
  getEstadisticas(): Observable<Estadisticas> {
    return this.http.get<Estadisticas>(`${this.apiUrl}/stats`);
  }

  /**
   * Obtiene la lista de consorcios con tickets pendientes
   * ordenados por cantidad (mayor a menor)
   */
  getTicketsPendientes(): Observable<ConsorcioConTickets[]> {
    return this.http.get<ConsorcioConTickets[]>(`${this.apiUrl}/tickets-pendientes`);
  }
}