import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ConsorciosService } from '../../services/consorcios.service';
import { UsuariosService } from '../../../usuarios/services/usuarios.service';
import { AuthService } from '../../../../auth/auth.service';
import {
  CreateConsorcioDto,
  UpdateConsorcioDto,
  PROVINCIAS_ARGENTINA,
  validarCUIT,
  formatearCUIT
} from '../../models/consorcio.model';
import { Usuario } from '../../../usuarios/models/usuario.model';

/**
 * =========================================
 * CONSORCIO FORM COMPONENT
 * =========================================
 * Formulario para crear y editar consorcios
 */
@Component({
  selector: 'app-consorcio-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consorcio-form.component.html',
  styleUrls: ['./consorcio-form.component.scss']
})
export class ConsorcioFormComponent implements OnInit {
  consorcioForm!: FormGroup;
  loading: boolean = false;
  submitting: boolean = false;
  error: string = '';
  successMessage: string = '';
  
  // Modo edición o creación
  isEditMode: boolean = false;
  consorcioId: number | null = null;

  // Opciones para selects
  readonly PROVINCIAS = PROVINCIAS_ARGENTINA;
  responsables: Usuario[] = [];
  loadingResponsables: boolean = false;

  // Permisos
  canCreate: boolean = false;
  canEdit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private consorciosService: ConsorciosService,
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.initializeForm();
    this.loadResponsables();
    this.checkEditMode();
  }

  /**
   * Verificar permisos del usuario
   */
  checkPermissions(): void {
    this.canCreate = this.authService.hasAnyRole(['admin_global', 'tenant_admin']);
    this.canEdit = this.authService.hasAnyRole(['admin_global', 'tenant_admin', 'admin_consorcio']);

    // Si está intentando crear y no tiene permisos, redirigir
    if (!this.canCreate && !this.route.snapshot.params['id']) {
      this.router.navigate(['/consorcios']);
    }
  }

  /**
   * Inicializar el formulario reactivo
   */
  initializeForm(): void {
    this.consorcioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      direccion: ['', [Validators.maxLength(150)]],
      ciudad: ['', [Validators.maxLength(100)]],
      provincia: ['', []],
      pais: ['Argentina', [Validators.maxLength(50)]],
      cuit: ['', [this.cuitValidator.bind(this)]],
      telefono_contacto: ['', [Validators.maxLength(50)]],
      email_contacto: ['', [Validators.email, Validators.maxLength(100)]],
      responsable_id: [null, []]
    });
  }

  /**
   * Validador personalizado de CUIT
   */
  cuitValidator(control: any): { [key: string]: boolean } | null {
    if (!control.value) {
      return null; // CUIT es opcional
    }

    const cuitFormateado = formatearCUIT(control.value);
    if (!validarCUIT(cuitFormateado)) {
      return { cuitInvalido: true };
    }

    return null;
  }

  /**
   * Verificar si estamos en modo edición
   */
  checkEditMode(): void {
    const id = this.route.snapshot.params['id'];
    
    if (id) {
      this.isEditMode = true;
      this.consorcioId = parseInt(id);
      this.loadConsorcioData();
    }
  }

  /**
   * Cargar datos del consorcio para editar
   */
  loadConsorcioData(): void {
    if (!this.consorcioId) return;

    this.loading = true;
    this.consorciosService.getConsorcioById(this.consorcioId).subscribe({
      next: (consorcio) => {
        this.consorcioForm.patchValue({
          nombre: consorcio.nombre,
          direccion: consorcio.direccion,
          ciudad: consorcio.ciudad,
          provincia: consorcio.provincia,
          pais: consorcio.pais || 'Argentina',
          cuit: consorcio.cuit,
          telefono_contacto: consorcio.telefono_contacto,
          email_contacto: consorcio.email_contacto,
          responsable_id: consorcio.responsable_id
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar consorcio:', error);
        this.error = 'Error al cargar los datos del consorcio';
        this.loading = false;
      }
    });
  }

  /**
   * Cargar lista de usuarios que pueden ser responsables
   */
  loadResponsables(): void {
    this.loadingResponsables = true;
    
    // Filtrar solo usuarios con roles de administrador
    this.usuariosService.getUsuarios({
      activo: true,
      limit: 100,
      page: 1
    }).subscribe({
      next: (response) => {
        // Filtrar solo admins
        this.responsables = response.usuarios.filter(u => 
          ['admin_global', 'tenant_admin', 'admin_consorcio'].includes(u.rol_global)
        );
        this.loadingResponsables = false;
      },
      error: (error) => {
        console.error('Error al cargar responsables:', error);
        this.loadingResponsables = false;
      }
    });
  }

  /**
   * Formatear CUIT mientras el usuario escribe
   */
  onCuitInput(event: any): void {
    const input = event.target;
    const value = input.value.replace(/\D/g, ''); // Quitar todo lo que no sea número
    
    if (value.length >= 11) {
      const formatted = formatearCUIT(value);
      this.consorcioForm.patchValue({ cuit: formatted });
    }
  }

  /**
   * Obtener nombre completo del responsable
   */
  getResponsableNombre(usuario: Usuario): string {
    if (!usuario.persona) {
      return usuario.email;
    }
    return `${usuario.persona.nombre} ${usuario.persona.apellido} (${usuario.rol_global})`;
  }

  /**
   * Verificar si un campo tiene error
   */
  hasError(field: string): boolean {
    const control = this.consorcioForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Obtener mensaje de error de un campo
   */
  getErrorMessage(field: string): string {
    const control = this.consorcioForm.get(field);
    
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    if (control.errors['email']) {
      return 'Email inválido';
    }
    if (control.errors['cuitInvalido']) {
      return 'CUIT inválido (formato: XX-XXXXXXXX-X)';
    }

    return 'Campo inválido';
  }

  /**
   * Enviar formulario
   */
  onSubmit(): void {
    // Marcar todos los campos como tocados para mostrar errores
    Object.keys(this.consorcioForm.controls).forEach(key => {
      this.consorcioForm.get(key)?.markAsTouched();
    });

    // Validar formulario
    if (this.consorcioForm.invalid) {
      this.error = 'Por favor, corrige los errores en el formulario';
      return;
    }

    this.submitting = true;
    this.error = '';
    this.successMessage = '';

    const formData = this.consorcioForm.value;

    // Formatear CUIT si existe
    if (formData.cuit) {
      formData.cuit = formatearCUIT(formData.cuit);
    }

    // Convertir responsable_id a null si está vacío
    if (!formData.responsable_id) {
      formData.responsable_id = null;
    }

    if (this.isEditMode && this.consorcioId) {
      this.updateConsorcio(formData);
    } else {
      this.createConsorcio(formData);
    }
  }

  /**
   * Crear nuevo consorcio
   */
  createConsorcio(data: CreateConsorcioDto): void {
    this.consorciosService.createConsorcio(data).subscribe({
      next: (response) => {
        console.log('Consorcio creado:', response);
        this.successMessage = 'Consorcio creado correctamente';
        this.submitting = false;
        
        // Redirigir a la lista después de 1.5 segundos
        setTimeout(() => {
          this.router.navigate(['/consorcios']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error al crear consorcio:', error);
        this.error = error.error?.message || 'Error al crear el consorcio';
        this.submitting = false;
      }
    });
  }

  /**
   * Actualizar consorcio existente
   */
  updateConsorcio(data: UpdateConsorcioDto): void {
    if (!this.consorcioId) return;

    this.consorciosService.updateConsorcio(this.consorcioId, data).subscribe({
      next: (response) => {
        console.log('Consorcio actualizado:', response);
        this.successMessage = 'Consorcio actualizado correctamente';
        this.submitting = false;
        
        // Redirigir a la lista después de 1.5 segundos
        setTimeout(() => {
          this.router.navigate(['/consorcios']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error al actualizar consorcio:', error);
        this.error = error.error?.message || 'Error al actualizar el consorcio';
        this.submitting = false;
      }
    });
  }

  /**
   * Cancelar y volver a la lista
   */
  cancelar(): void {
    if (this.consorcioForm.dirty) {
      if (confirm('¿Descartar los cambios?')) {
        this.router.navigate(['/consorcios']);
      }
    } else {
      this.router.navigate(['/consorcios']);
    }
  }

  /**
   * Limpiar formulario
   */
  limpiarFormulario(): void {
    this.consorcioForm.reset({
      pais: 'Argentina'
    });
    this.error = '';
    this.successMessage = '';
  }
}