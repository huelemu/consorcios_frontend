import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService, Estadisticas, ConsorcioConTickets } from '../services/dashboard.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  estadisticas: Estadisticas = {
    totalConsorcios: 0,
    totalUnidades: 0,
    totalUsuarios: 0,
    totalPersonas: 0,
    totalProveedores: 0,
    totalTicketsPendientes: 0
  };
  
  consorciosConTickets: ConsorcioConTickets[] = [];
  loading = true;
  error = false;

  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Carga las estadísticas y tickets pendientes desde el backend
   */
  cargarDatos(): void {
    this.loading = true;
    this.error = false;
    
    forkJoin({
      estadisticas: this.dashboardService.getEstadisticas(),
      tickets: this.dashboardService.getTicketsPendientes()
    }).subscribe({
      next: (data) => {
        this.estadisticas = data.estadisticas;
        this.consorciosConTickets = data.tickets;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando datos del dashboard:', error);
        this.loading = false;
        this.error = true;
      }
    });
  }

  /**
   * Navega al detalle del consorcio
   */
  verDetalle(consorcioId: number): void {
    console.log('Navegar a consorcio:', consorcioId);
    this.router.navigate(['/consorcios', consorcioId]);
  }

  /**
   * Navega a la vista de tickets filtrada por el consorcio
   */
  verTickets(consorcioId: number, event: Event): void {
    event.stopPropagation();
    console.log('Ver tickets del consorcio:', consorcioId);
    this.router.navigate(['/tickets'], { queryParams: { consorcio: consorcioId } });
  }

  /**
   * Obtiene el color del badge según cantidad de tickets
   */
  getBadgeColor(cantidad: number): string {
    if (cantidad >= 5) return 'bg-red-100 text-red-800 border-red-300';
    if (cantidad >= 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  }
}