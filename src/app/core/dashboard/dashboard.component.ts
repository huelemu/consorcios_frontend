import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';

interface Consorcio {
  id: number;
  nombre: string;
  direccion: string;
  ciudad?: string;
  provincia?: string;
  unidadesFuncionales: number;
  cantidadPersonas: number;
  ticketsTotal: number;
  ticketsPendientes: number;
  estado: string;
}

interface ResumenGeneral {
  totalConsorcios: number;
  totalUnidades: number;
  totalPersonas: number;
  totalTicketsPendientes: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  consorcios: Consorcio[] = [];
  resumen: ResumenGeneral = {
    totalConsorcios: 0,
    totalUnidades: 0,
    totalPersonas: 0,
    totalTicketsPendientes: 0
  };
  loading = true;

  constructor(private router: Router, private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.dashboardService.getDatosDashboard().subscribe({
      next: ({ consorcios, resumen }) => {
        this.consorcios = this.ordenarConsorcios(consorcios);
        this.resumen = resumen;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando dashboard:', err);
        this.loading = false;
      }
    });
  }

  ordenarConsorcios(consorcios: Consorcio[]): Consorcio[] {
    return consorcios.sort((a, b) => {
      if (a.ticketsPendientes > 0 && b.ticketsPendientes === 0) return -1;
      if (a.ticketsPendientes === 0 && b.ticketsPendientes > 0) return 1;
      if (a.ticketsPendientes > 0 && b.ticketsPendientes > 0)
        return b.ticketsPendientes - a.ticketsPendientes;
      return a.nombre.localeCompare(b.nombre);
    });
  }

  tienePendientes(consorcio: Consorcio): boolean {
    return consorcio.ticketsPendientes > 0;
  }

  verDetalle(consorcioId: number): void {
    this.router.navigate(['/consorcios', consorcioId]);
  }

  getDireccionCompleta(consorcio: Consorcio): string {
    const partes = [consorcio.direccion];
    if (consorcio.ciudad) partes.push(consorcio.ciudad);
    return partes.join(', ');
  }

  getTextoAlerta(cantidad: number): string {
    return cantidad === 1 
      ? '¡1 ticket pendiente!' 
      : `¡${cantidad} tickets pendientes!`;
  }
}
