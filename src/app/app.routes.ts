import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';
import { LayoutComponent } from './core/layout/layout.component';
import { PersonasPageComponent } from './features/personas/pages/personas-page/personas-page.component';
import { NotDevelopedComponent } from './core/not-developed/not-developed.component';
import { UsuariosPageComponent } from './features/usuarios/pages/usuarios-page/usuarios-page.component';
import { ConsorciosListComponent } from './features/consorcios/pages/consorcios-list/consorcios-list.component';
import { ConsorcioFormComponent } from './features/consorcios/components/consorcio-form/consorcio-form.component';
import { ConsorcioDetailComponent } from './features/consorcios/pages/consorcio-detail/consorcio-detail.component';

export const appRoutes: Routes = [
  // Rutas públicas (sin autenticación)
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent }, 
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'privacy', loadComponent: () => import('./legal/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)},
  { path: 'terms', loadComponent: () => import('./legal/terms-of-service/terms-of-service.component').then(m => m.TermsOfServiceComponent)},


 
  // Rutas protegidas (requieren autenticación)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'personas', component: PersonasPageComponent, canActivate: [RoleGuard], data: { roles: ['admin_global', 'tenant_admin', 'admin_consorcio']}},
      { path: 'consorcios/nuevo', component: ConsorcioFormComponent, canActivate: [RoleGuard], 
        data: { roles: ['admin_global', 'tenant_admin', 'admin_consorcio', 'admin_edificio', 'propietario', 'inquilino']}},
      { path: 'consorcios/:id/editar', component: ConsorcioFormComponent, canActivate: [RoleGuard], 
        data: { roles: ['admin_global', 'tenant_admin', 'admin_consorcio', 'admin_edificio', 'propietario', 'inquilino']}},
      { path: 'consorcios/:id', component: ConsorcioDetailComponent, canActivate: [RoleGuard], 
        data: { roles: ['admin_global', 'tenant_admin', 'admin_consorcio', 'admin_edificio', 'propietario', 'inquilino']}},
      { path: 'consorcios', component: ConsorciosListComponent, canActivate: [RoleGuard], 
        data: { roles: ['admin_global', 'tenant_admin', 'admin_consorcio', 'admin_edificio', 'propietario', 'inquilino']}},
      { path: 'usuarios', component: UsuariosPageComponent, canActivate: [RoleGuard], data: { roles: ['admin_global', 'tenant_admin', 'admin_consorcio']}},
      { path: 'unidades', component: NotDevelopedComponent },
      { path: 'proveedores', component: NotDevelopedComponent },
      { path: 'expensas', component: NotDevelopedComponent },
      { path: 'tickets', component: NotDevelopedComponent },
      { path: 'perfil', component: NotDevelopedComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // Redirect por defecto
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];