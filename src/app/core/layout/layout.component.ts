import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, User } from '../../auth/auth.service';
import { ToastComponent } from '../toast/toast.component';
import { NotificationsComponent } from '../components/notifications/notifications.component';

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
    private router: Router
  ) {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
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