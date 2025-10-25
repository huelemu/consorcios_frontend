import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';  // ← NUEVO
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';      // ← NUEVO
import { AuthGuard } from './auth/auth.guard';
import { LayoutComponent } from './core/layout/layout.component';

export const appRoutes: Routes = [
  // Rutas públicas (sin autenticación)

  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },  // ← NUEVO
  { path: 'reset-password', component: ResetPasswordComponent },    // ← NUEVO

  { 
    path: 'register', 
    loadComponent: () => import('./auth/register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./legal/privacy-policy/privacy-policy.component')
      .then(m => m.PrivacyPolicyComponent)
  },
  {
    path: 'terms',
    loadComponent: () => import('./legal/terms-of-service/terms-of-service.component')
      .then(m => m.TermsOfServiceComponent)
  },
 
  // Rutas protegidas (requieren autenticación)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { 
        path: 'dashboard', 
        component: DashboardComponent 
      },
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      },
    ],
  },

  // Redirect por defecto
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];