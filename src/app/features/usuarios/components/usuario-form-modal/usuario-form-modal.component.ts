import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario, CreateUsuarioDto, UpdateUsuarioDto, RolGlobal, ROL_LABELS, ROL_ICONS } from '../../models/usuario.model';

/**
 * =========================================
 * USUARIO FORM MODAL COMPONENT
 * =========================================
 * Modal para crear/editar usuarios
 */
@Component({
  selector: 'app-usuario-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-form-modal.component.html',
  styles: [`
    @keyframes modalFadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    .relative.bg-white {
      animation: modalFadeIn 0.2s ease-out;
    }
    @keyframes backdropFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    .fixed.bg-black {
      animation: backdropFadeIn 0.2s ease-out;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    input.border-red-500:focus, select.border-red-500:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    .overflow-y-auto::-webkit-scrollbar {
      width: 8px;
    }
    .overflow-y-auto::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 10px;
    }
    .overflow-y-auto::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }
    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    button {
      transition: all 0.2s ease-in-out;
    }
    button:active:not(:disabled) {
      transform: scale(0.98);
    }
    input[type="checkbox"]:checked {
      background-color: #2563eb;
      border-color: #2563eb;
    }
    input:not(:disabled):hover, select:not(:disabled):hover {
      border-color: #93c5fd;
    }
  `]
})
export class UsuarioFormModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() usuario: Usuario | null = null;
  @Input() personas: any[] = []; // Lista de personas disponibles
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateUsuarioDto | UpdateUsuarioDto>();

  usuarioForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;

  // Exponer helpers para el template
  rolLabels = ROL_LABELS;
  rolIcons = ROL_ICONS;

  // Lista de roles disponibles
  rolesDisponibles: { value: RolGlobal; label: string; icon: string }[] = [
    { value: 'admin_global', label: ROL_LABELS.admin_global, icon: ROL_ICONS.admin_global },
    { value: 'tenant_admin', label: ROL_LABELS.tenant_admin, icon: ROL_ICONS.tenant_admin },
    { value: 'admin_consorcio', label: ROL_LABELS.admin_consorcio, icon: ROL_ICONS.admin_consorcio },
    { value: 'admin_edificio', label: ROL_LABELS.admin_edificio, icon: ROL_ICONS.admin_edificio },
    { value: 'propietario', label: ROL_LABELS.propietario, icon: ROL_ICONS.propietario },
    { value: 'inquilino', label: ROL_LABELS.inquilino, icon: ROL_ICONS.inquilino },
    { value: 'proveedor', label: ROL_LABELS.proveedor, icon: ROL_ICONS.proveedor }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Detectar cambios en el Input usuario
   */
  ngOnChanges(): void {
    if (this.isOpen) {
      this.isEditMode = !!this.usuario;
      this.initForm();
      if (this.usuario) {
        this.loadUsuarioData();
      }
    }
  }

  /**
   * Inicializar el formulario
   */
  private initForm(): void {
    this.usuarioForm = this.fb.group({
      persona_id: [null, this.isEditMode ? [] : [Validators.required]],
      username: ['', [Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', this.isEditMode ? [] : [Validators.required]],
      rol_global: ['inquilino', [Validators.required]],
      activo: [true],
      oauth_provider: ['local']
    }, {
      validators: this.isEditMode ? [] : this.passwordMatchValidator
    });

    // Si es modo edición, persona_id no es requerido
    if (this.isEditMode) {
      this.usuarioForm.get('persona_id')?.clearValidators();
      this.usuarioForm.get('password')?.clearValidators();
      this.usuarioForm.get('confirm_password')?.clearValidators();
    }
  }

  /**
   * Validador personalizado para confirmar contraseña
   */
  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirm_password');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  /**
   * Cargar datos del usuario en el formulario (modo edición)
   */
  private loadUsuarioData(): void {
    if (!this.usuario) return;

    this.usuarioForm.patchValue({
      persona_id: this.usuario.persona_id,
      username: this.usuario.username || '',
      email: this.usuario.email,
      rol_global: this.usuario.rol_global,
      activo: this.usuario.activo,
      oauth_provider: this.usuario.oauth_provider
    });

    // Deshabilitar persona_id en modo edición
    this.usuarioForm.get('persona_id')?.disable();
  }

  /**
   * Cerrar el modal
   */
  onClose(): void {
    this.usuarioForm.reset();
    this.isSubmitting = false;
    this.close.emit();
  }

  /**
   * Enviar el formulario
   */
  onSubmit(): void {
    if (this.usuarioForm.invalid) {
      this.markFormGroupTouched(this.usuarioForm);
      return;
    }

    this.isSubmitting = true;

    const formValue = this.usuarioForm.getRawValue();

    if (this.isEditMode) {
      // Modo edición - solo enviar campos modificados
      const updateData: UpdateUsuarioDto = {
        username: formValue.username || undefined,
        email: formValue.email,
        rol_global: formValue.rol_global,
        activo: formValue.activo
      };

      // Solo incluir password si se ingresó uno nuevo
      if (formValue.password) {
        updateData.password = formValue.password;
      }

      this.save.emit(updateData);
    } else {
      // Modo creación
      const createData: CreateUsuarioDto = {
        persona_id: formValue.persona_id,
        username: formValue.username || undefined,
        email: formValue.email,
        password: formValue.password,
        rol_global: formValue.rol_global,
        activo: formValue.activo,
        oauth_provider: formValue.oauth_provider
      };

      this.save.emit(createData);
    }
  }

  /**
   * Marcar todos los campos del formulario como tocados
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Verificar si un campo tiene error
   */
  hasError(field: string, error?: string): boolean {
    const control = this.usuarioForm.get(field);
    if (!control) return false;

    if (error) {
      return control.hasError(error) && (control.dirty || control.touched);
    }

    return control.invalid && (control.dirty || control.touched);
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getErrorMessage(field: string): string {
    const control = this.usuarioForm.get(field);
    if (!control || !control.errors) return '';

    const errors = control.errors;

    if (errors['required']) return 'Este campo es requerido';
    if (errors['email']) return 'Email inválido';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['passwordMismatch']) return 'Las contraseñas no coinciden';

    return 'Campo inválido';
  }

  /**
   * Obtener nombre completo de una persona
   */
  getPersonaNombre(persona: any): string {
    return `${persona.nombre} ${persona.apellido || ''} - ${persona.documento}`.trim();
  }

  /**
   * Toggle para mostrar/ocultar contraseña
   */
  showPassword = false;
  showConfirmPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}