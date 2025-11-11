import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, User } from '../../auth/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  sidebarOpen = true;
  userMenuOpen = false;
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
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