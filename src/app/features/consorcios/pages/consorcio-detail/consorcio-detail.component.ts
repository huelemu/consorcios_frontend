import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConsorciosService } from '../../services/consorcios.service';
import { AuthService } from '../../../../auth/auth.service';
import { 
  Consorcio,
  ESTADO_LABELS,
  ESTADO_COLORS,
  ESTADO_ICONS
} from '../../models/consorcio.model';
import { 
  ESTADO_UNIDAD_LABELS,
  ESTADO_UNIDAD_COLORS 
} from '../../../unidades/models/unidad.model';
import { TicketFormComponent } from '../../../tickets/components/ticket-form/ticket-form.component';
import { UnidadesBulkCreateComponent } from '../../../unidades/components/unidades-bulk-create/unidades-bulk-create.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consorcio-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UnidadesBulkCreateComponent
  ],
  templateUrl: './consorcio-detail.component.html',
  styleUrls: ['./consorcio-detail.component.scss']
})
export class ConsorcioDetailComponent implements OnInit {
  consorcioId!: number;
  consorcio: Consorcio | null = null;
  loading = true;
  error: string | null = null;
  
  mostrarBulkCreate = false;
  showDeleteModal = false;

  // Permisos
  canEdit = false;
  canDelete = false;

  // Constantes para template
  readonly ESTADO_LABELS = ESTADO_LABELS;
  readonly ESTADO_COLORS = ESTADO_COLORS;
  readonly ESTADO_ICONS = ESTADO_ICONS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private consorciosService: ConsorciosService,
    private authService: AuthService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.route.params.subscribe(params => {
      this.consorcioId = +params['id'];
      if (this.consorcioId) {
        this.loadConsorcio();
      }
    });
  }

  checkPermissions(): void {
    this.canEdit = this.authService.hasAnyRole([
      'admin_global', 
      'tenant_admin', 
      'admin_consorcio'
    ]);

    this.canDelete = this.authService.hasAnyRole([
      'admin_global', 
      'tenant_admin'
    ]);
  }

  loadConsorcio(): void {
    this.loading = true;
    this.error = null;

    this.consorciosService.getConsorcioById(this.consorcioId).subscribe({
      next: (data) => {
        this.consorcio = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando consorcio:', err);
        this.error = 'Error al cargar el consorcio';
        this.loading = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/consorcios']);
  }

  editarConsorcio(): void {
    this.router.navigate(['/consorcios', this.consorcioId, 'editar']);
  }

  verUnidad(unidadId: number): void {
    this.router.navigate(['/unidades', unidadId]);
  }

  getDireccion(): string {
    if (!this.consorcio) return '';
    const partes = [this.consorcio.direccion, this.consorcio.ciudad, this.consorcio.provincia]
      .filter(Boolean);
    return partes.join(', ');
  }

  getPorcentajeOcupacion(): number {
    if (!this.consorcio?.stats) return 0;
    const total = this.consorcio.stats.totalUnidades;
    const ocupadas = this.consorcio.stats.unidadesOcupadas;
    return total > 0 ? Math.round((ocupadas / total) * 100) : 0;
  }

  hasDatosContacto(): boolean {
    return !!(this.consorcio?.telefono_contacto || this.consorcio?.email_contacto);
  }

  hasContactInfo(): boolean {
    return !!(this.consorcio?.telefono_contacto || this.consorcio?.email_contacto);
  }

  hasResponsable(): boolean {
    return !!(this.consorcio?.responsable);
  }

  hasUnidades(): boolean {
    return !!(this.consorcio?.unidades && this.consorcio.unidades.length > 0);
  }

  getResponsable(): string {
    if (!this.consorcio?.responsable?.persona) return 'Sin asignar';
    const p = this.consorcio.responsable.persona;
    return `${p.nombre} ${p.apellido}`;
  }

  getResponsableEmail(): string {
    return this.consorcio?.responsable?.email || '';
  }

  getResponsableTelefono(): string {
    return this.consorcio?.responsable?.persona?.telefono || '';
  }

  getUnidadEstadoClass(estado: string): string {
    return ESTADO_UNIDAD_COLORS[estado as keyof typeof ESTADO_UNIDAD_COLORS] || '';
  }

  getUnidadEstadoLabel(estado: string): string {
    return ESTADO_UNIDAD_LABELS[estado as keyof typeof ESTADO_UNIDAD_LABELS] || estado;
  }

  crearUnidad(): void {
    this.router.navigate(['/unidades/nuevo'], {
      queryParams: { consorcio_id: this.consorcioId }
    });
  }

  gestionarUnidades(): void {
    this.router.navigate(['/unidades'], {
      queryParams: { consorcio_id: this.consorcioId }
    });
  }

  abrirCreacionMasiva(): void {
    this.mostrarBulkCreate = true;
  }

  cerrarBulkCreate(recarga: boolean): void {
    this.mostrarBulkCreate = false;
    if (recarga) {
      this.loadConsorcio();
    }
  }

  toggleEstado(): void {
    if (!this.consorcio) return;
    
    const nuevoEstado = this.consorcio.estado === 'activo' ? 'inactivo' : 'activo';
    
    Swal.fire({
      title: '¿Cambiar estado?',
      text: `El consorcio pasará a estado ${nuevoEstado}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && this.consorcio) {
        this.consorciosService.updateConsorcio(this.consorcio.id, { estado: nuevoEstado }).subscribe({
          next: () => {
            Swal.fire('Éxito', 'Estado actualizado', 'success');
            this.loadConsorcio();
          },
          error: (err) => {
            console.error('Error:', err);
            Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
          }
        });
      }
    });
  }

  confirmarEliminar(): void {
    this.showDeleteModal = true;
  }

  cancelarEliminar(): void {
    this.showDeleteModal = false;
  }

  eliminarConsorcio(): void {
    if (!this.consorcio) return;

    this.consorciosService.deleteConsorcio(this.consorcio.id).subscribe({
      next: () => {
        Swal.fire('Eliminado', 'Consorcio eliminado correctamente', 'success');
        this.router.navigate(['/consorcios']);
      },
      error: (err) => {
        console.error('Error:', err);
        Swal.fire('Error', 'No se pudo eliminar el consorcio', 'error');
        this.showDeleteModal = false;
      }
    });
  }

  crearTicket(): void {
    if (!this.consorcio) {
      console.error('No hay consorcio cargado');
      return;
    }
    
    const dialogRef = this.dialog.open(TicketFormComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: false,
      data: {
        consorcioId: this.consorcio.id,
        consorcioNombre: this.consorcio.nombre,
        unidadId: null,
        unidadNombre: null
      }
    });

    dialogRef.afterClosed().subscribe((ticket) => {
      if (ticket) {
        console.log('✅ Ticket creado:', ticket);
        this.loadConsorcio();
      }
    });
  }
}