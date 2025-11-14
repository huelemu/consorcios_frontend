import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, User } from '../../auth/auth.service';
import { ToastComponent } from '../toast/toast.component';
import { NotificationsComponent } from '../components/notifications/notifications.component';
import { UsuariosService } from '../../features/usuarios/services/usuarios.service';
import { NotificationsService } from '../services/notifications.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent, NotificationsComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  sidebarOpen = true;
  userMenuOpen = false;
  currentUser: User | null = null;
  isMobileView = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private usuariosService: UsuariosService,
    private notificationsService: NotificationsService
  ) {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;

      // Si es admin, verificar usuarios pendientes
      if (user && this.authService.isAdmin()) {
        this.verificarUsuariosPendientes();
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobileView = window.innerWidth < 1024; // lg breakpoint en Tailwind
    // En móviles, el sidebar comienza cerrado
    if (this.isMobileView) {
      this.sidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebarOnMobile() {
    if (this.isMobileView) {
      this.sidebarOpen = false;
    }
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu() {
    this.userMenuOpen = false;
  }

  goToProfile() {
    this.closeUserMenu();
    this.router.navigate(['/perfil']);
  }

  logout() {
    this.closeUserMenu();
    this.authService.logout();
  }

  // Obtener iniciales del nombre para el avatar
  getInitials(): string {
    if (!this.currentUser?.nombre) return '?';
    const nombre = this.currentUser.nombre;
    const apellido = this.currentUser.apellido || '';
    
    if (apellido) {
      return (nombre[0] + apellido[0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  // Formatear nombre completo
  getFullName(): string {
    if (!this.currentUser) return 'Usuario';
    const nombre = this.currentUser.nombre || '';
    const apellido = this.currentUser.apellido || '';
    return `${nombre} ${apellido}`.trim() || 'Usuario';
  }
  
configMenuOpen = false;

toggleConfigMenu(): void {
  this.configMenuOpen = !this.configMenuOpen;
}

navigateTo(route: string): void {
  this.router.navigate([route]);
  this.closeUserMenu();
}

  /**
   * Verificar si hay usuarios pendientes de aprobación
   * Solo para administradores
   */
  private verificarUsuariosPendientes(): void {
    this.usuariosService.getUsuariosPendientes().subscribe({
      next: (usuarios) => {
        if (usuarios && usuarios.length > 0) {
          // Crear una notificación por cada usuario pendiente (máximo 5)
          const usuariosANotificar = usuarios.slice(0, 5);

          usuariosANotificar.forEach(usuario => {
            const nombre = usuario.persona
              ? `${usuario.persona.nombre} ${usuario.persona.apellido}`.trim()
              : usuario.email;

            this.notificationsService.notifyNewUserPending(
              nombre,
              usuario.email,
              usuario.id
            );
          });

          // Si hay más de 5, agregar una notificación general
          if (usuarios.length > 5) {
            this.notificationsService.add({
              type: 'action',
              priority: 'high',
              title: `${usuarios.length} usuarios pendientes de aprobación`,
              message: 'Hay múltiples usuarios esperando aprobación. Revisa la sección de Gestión de Permisos.',
              actionRequired: true,
              actionText: 'Ver todos',
              actionRoute: '/configuracion/permisos',
              icon: '📋'
            });
          }
        }
      },
      error: (error) => {
        // Si hay error (por ejemplo, endpoint no implementado), silenciosamente ignorar
        console.debug('No se pudieron cargar usuarios pendientes:', error);
      }
    });
  }

  // Obtener rol formateado
  getRoleDisplay(): string {
    if (!this.currentUser?.rol) return 'Usuario';
    
    const roleMap: { [key: string]: string } = {
      'admin_global': 'Administrador Global',
      'tenant_admin': 'Admin de Tenant',
      'admin_consorcio': 'Admin de Consorcio',
      'admin_edificio': 'Admin de Edificio',
      'propietario': 'Propietario',
      'inquilino': 'Inquilino',
      'proveedor': 'Proveedor'
    };

    return roleMap[this.currentUser.rol] || this.currentUser.rol;
  }
}