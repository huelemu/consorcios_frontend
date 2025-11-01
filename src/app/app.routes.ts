import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './core/dashboard/dashboard.component';
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
import { UnidadesListComponent } from './features/unidades/components/unidades-list/unidades-list.component';
import { UnidadFormComponent } from './features/unidades/components/unidad-form/unidad-form.component';
import { UnidadesPageComponent } from './features/unidades/pages/unidades-page/unidades-page.component';
import { UnidadDetailComponent } from './features/unidades/components/uinidad-detail/unidad-detail.component';
import { TicketsPageComponent } from './features/tickets/pages/tickets-page/tickets-page.component';
import { ProveedoresPageComponent } from './features/proveedores/pages/proveedores-page/proveedores-page.component';
import { ProveedorDetalleComponent } from './features/proveedores/pages/proveedor-detalle/proveedor-detalle.component';
import { ConsorciosUploadComponent } from './features/consorcios/components/consorcios-upload/consorcios-upload.component';


export const appRoutes: Routes = [
  // ========================================
  // RUTAS PÚBLICAS (sin autenticación)
  // ========================================
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'forgot-password', 
    component: ForgotPasswordComponent 
  }, 
  { 
    path: 'reset-password', 
    component: ResetPasswordComponent 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) 
  },
  { 
    path: 'privacy', 
    loadComponent: () => import('./legal/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
  },
  { 
    path: 'terms', 
    loadComponent: () => import('./legal/terms-of-service/terms-of-service.component').then(m => m.TermsOfServiceComponent)
  },
  


  // ========================================
  // RUTAS PROTEGIDAS (requieren autenticación)
  // ========================================
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Dashboard
      { 
        path: 'dashboard', 
        component: DashboardComponent 
      },

      // ========================================
      // PERSONAS
      // ========================================
      { 
        path: 'personas', 
        component: PersonasPageComponent, 
        canActivate: [RoleGuard], 
        data: { roles: ['admin_global', 'tenant_admin', 'admin_consorcio'] }
      },

      // ========================================
      // CONSORCIOS
      // ========================================

      {
  path: 'consorcios/import',
  loadComponent: () =>
    import('./features/consorcios/components/consorcios-upload/consorcios-upload.component')
      .then(m => m.ConsorciosUploadComponent),
  canActivate: [RoleGuard],
  data: { roles: ['admin_global', 'tenant_admin', 'admin_consorcio'] }
},

      { 
        path: 'consorcios/nuevo', 
        component: ConsorcioFormComponent, 
        canActivate: [RoleGuard], 
        data: { roles: ['admin_global', 'tenant_admin', 'admin_consorcio'] }
      },
      { 
        path: 'consorcios/:id/editar', 
        component: ConsorcioFormComponent, 
        canActivate: [RoleGuard], 
        data: { roles: ['admin_global', 'tenant_admin', 'admin_consorcio'] }
      },
      { 
        path: 'consorcios/:id', 
        component: ConsorcioDetailComponent, 
        canActivate: [RoleGuard], 
        data: { roles: ['admin_global', 'tenant_admin', 'admin_consorcio', 'admin_edificio', 'propietario', 'inquilino'] }
      },
      { 
        path: 'consorcios', 
        component: ConsorciosListComponent, 
        canActivate: [RoleGuard], 
        data: { roles: ['admin_global', 'tenant_admin', 'admin_consorcio', 'admin_edificio', 'propietario', 'inquilino'] }
      },




      // ========================================
      // UNIDADES FUNCIONALES ⬅️ NUEVO
      // ========================================
      
      { 
        path: 'unidades/nuevo', 
        component: UnidadFormComponent, 
        canActivate: [RoleGuard], 
        data: { 
          roles: ['admin_global', 'tenant_admin', 'admin_consorcio', 'admin_edificio'],
          title: 'Nueva Unidad Funcional'
        }
      },
      { 
        path: 'unidades/:id/editar', 
        component: UnidadFormComponent, 
        canActivate: [RoleGuard], 
        data: { 
          roles: ['admin_global', 'tenant_admin', 'admin_consorcio', 'admin_edificio'],
          title: 'Editar Unidad Funcional'
        }
      },
      { 
        path: 'unidades/:id', 
        component: UnidadDetailComponent,
        canActivate: [RoleGuard], 
        data: { 
          roles: ['admin_global', 'tenant_admin', 'admin_consorcio', 'admin_edificio', 'propietario', 'inquilino'],
          title: 'Detalle de Unidad'
        }
      },
      { 
        path: 'unidades', 
        component: UnidadesPageComponent, 
        canActivate: [RoleGuard], 
        data: { 
          roles: ['admin_global', 'tenant_admin', 'admin_consorcio', 'admin_edificio', 'propietario', 'inquilino'],
          title: 'Unidades Funcionales'
        }
      },

      // ========================================
      // TICKETS
      // ========================================
      {
        path: 'tickets',
        component: TicketsPageComponent,
        canActivate: [RoleGuard],
        data: {
          roles: ['admin_global', 'tenant_admin', 'admin_consorcio', 'admin_edificio', 'propietario', 'inquilino'],
          title: 'Gestión de Tickets'
        }
      },



      
      // ========================================
      // USUARIOS
      // ========================================
      { 
        path: 'usuarios', 
        component: UsuariosPageComponent, 
        canActivate: [RoleGuard], 
        data: { roles: ['admin_global', 'tenant_admin', 'admin_consorcio'] }
      },
      
      // ========================================
      // PROVEEDORES
      // ========================================

      { 
        path: 'proveedores', 
        component: ProveedoresPageComponent, 
        canActivate: [RoleGuard], 
        data: { 
          roles: ['admin_global', 'tenant_admin', 'admin_consorcio', 'proveedor'],
          title: 'Proveedores'
        }
      },
      { 
        path: 'proveedores/:id', 
        component: ProveedorDetalleComponent, 
        canActivate: [RoleGuard], 
        data: { 
          roles: ['admin_global', 'tenant_admin', 'admin_consorcio', 'proveedor'],
          title: 'Detalle de Proveedor'
        }
      },
      // ========================================
      // MÓDULOS EN DESARROLLO
      // ========================================
  
      { 
        path: 'expensas', 
        component: NotDevelopedComponent,
        data: { title: 'Expensas' }
      },
 
      { 
        path: 'perfil', 
        component: NotDevelopedComponent,
        data: { title: 'Perfil' }
      },

      // Redirect por defecto dentro del layout
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      },
    ],
  },

  // ========================================
  // REDIRECT POR DEFECTO
  // ========================================
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];