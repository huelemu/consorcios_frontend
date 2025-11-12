import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalHeaderComponent } from '../../../../core/modal-header/modal-header.component';
import { Usuario, UsuarioRol, ROL_LABELS } from '../../models/usuario.model';
import { UsuariosService } from '../../services/usuarios.service';
import { ConfirmModalService } from '../../../../core/confirm-modal/confirm-modal.service';
import { ToastService } from '../../../../core/toast/toast.service';

@Component({
  selector: 'app-usuario-roles-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalHeaderComponent],
  templateUrl: './usuario-roles-modal.component.html',
  styleUrls: ['./usuario-roles-modal.component.scss']
})
export class UsuarioRolesModalComponent implements OnInit {
  @Input() usuario!: Usuario;
  @Output() close = new EventEmitter<void>();
  @Output() rolesUpdated = new EventEmitter<void>();

  roles: UsuarioRol[] = [];
  loading = false;
  showAddForm = false;
  addRoleForm: FormGroup;
  consorcios: any[] = [];
  unidades: any[] = [];
  rolesDisponibles: any[] = [];

  constructor(
    private usuariosService: UsuariosService,
    private confirmService: ConfirmModalService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.addRoleForm = this.fb.group({
      rol_id: ['', Validators.required],
      consorcio_id: [''],
      unidad_id: ['']
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.usuariosService.getRolesByUsuario(this.usuario.id).subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.toastService.error('No se pudieron cargar los roles del usuario');
        this.loading = false;
      }
    });
  }

  async removeRole(rolId: number): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: '¿Remover rol?',
      message: '¿Está seguro de que desea remover este rol del usuario?',
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      type: 'danger',
      icon: 'trash'
    });

    if (!confirmed) return;

    this.usuariosService.removerRol(rolId).subscribe({
      next: () => {
        this.toastService.success('Rol removido exitosamente');
        this.loadRoles();
        this.rolesUpdated.emit();
      },
      error: (error) => {
        console.error('Error al remover rol:', error);
        this.toastService.error('No se pudo remover el rol');
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.addRoleForm.reset();
    }
  }

  onAddRole(): void {
    if (this.addRoleForm.invalid) {
      this.toastService.warning('Por favor complete todos los campos requeridos');
      return;
    }

    const formValue = this.addRoleForm.value;
    const dto = {
      usuario_id: this.usuario.id,
      rol_id: parseInt(formValue.rol_id),
      consorcio_id: formValue.consorcio_id ? parseInt(formValue.consorcio_id) : undefined,
      unidad_id: formValue.unidad_id ? parseInt(formValue.unidad_id) : undefined,
      activo: true
    };

    this.usuariosService.asignarRol(dto).subscribe({
      next: () => {
        this.toastService.success('Rol asignado exitosamente');
        this.loadRoles();
        this.rolesUpdated.emit();
        this.toggleAddForm();
      },
      error: (error) => {
        console.error('Error al asignar rol:', error);
        this.toastService.error('No se pudo asignar el rol');
      }
    });
  }

  getRolLabel(nombreRol: string): string {
    return ROL_LABELS[nombreRol as keyof typeof ROL_LABELS] || nombreRol;
  }

  getContextText(rol: UsuarioRol): string {
    if (rol.consorcio) {
      return `Consorcio: ${rol.consorcio.nombre}`;
    }
    if (rol.unidad) {
      return `Unidad: ${rol.unidad.codigo}`;
    }
    return 'Sin contexto específico';
  }

  cerrarModal(): void {
    this.close.emit();
  }
}
