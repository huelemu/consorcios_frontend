# Sistema de Módulos y Permisos - Frontend Angular

## 📋 Resumen

Se ha implementado un **sistema completo de módulos y permisos** en el frontend que:

✅ **Carga dinámicamente los módulos** del usuario desde el backend
✅ **Renderiza el menú lateral** automáticamente basado en permisos
✅ **Oculta/muestra elementos** según permisos granulares (ver, crear, editar, eliminar)
✅ **Protege rutas** automáticamente con guards
✅ **Persiste módulos** en localStorage para mejor UX
✅ **Se integra perfectamente** con el backend de módulos y permisos

---

## 🏗️ Arquitectura

### Archivos Creados

```
src/app/
├── core/
│   ├── models/
│   │   └── modulo.interface.ts          ✨ Interfaces TypeScript
│   ├── services/
│   │   └── modulos.service.ts           ✨ Servicio de módulos
│   └── directives/
│       └── has-permission.directive.ts  ✨ Directiva *hasPermission
├── auth/
│   └── module-permission.guard.ts       ✨ Guard de permisos
└── ...
```

### Archivos Modificados

```
src/app/
├── auth/
│   ├── auth.service.ts                  📝 Limpia módulos en logout
│   └── auth.guard.ts                    📝 Carga módulos desde storage
├── core/
│   └── layout/
│       ├── layout.component.ts          📝 Renderiza sidebar dinámico
│       └── layout.component.html        📝 Usa *ngFor para módulos
```

---

## 🚀 Uso del Sistema

### 1. Cargar Módulos del Usuario

Los módulos se cargan automáticamente en el `LayoutComponent` al iniciar sesión:

```typescript
// src/app/core/layout/layout.component.ts

ngOnInit() {
  // Cargar módulos del usuario
  this.cargarModulos();

  // Suscribirse a cambios en los módulos
  this.modulosService.modulos$.subscribe(modulos => {
    this.modulosUsuario = modulos;
  });
}

private cargarModulos(): void {
  // Primero desde storage (persistencia)
  this.modulosService.cargarModulosDesdeStorage();

  // Luego desde backend (actualización)
  this.modulosService.getMisModulos().subscribe({
    next: (response) => {
      console.log('Módulos cargados:', response.count);
    },
    error: (error) => {
      console.error('Error al cargar módulos:', error);
    }
  });
}
```

---

### 2. Renderizar Menú Dinámico

El sidebar ahora es **100% dinámico**:

```html
<!-- src/app/core/layout/layout.component.html -->

<nav class="flex-1 p-3 space-y-1 text-sm overflow-y-auto">
  <!-- Renderizar solo los módulos que el usuario puede ver -->
  <a
    *ngFor="let modulo of modulosUsuario"
    [routerLink]="modulo.ruta"
    routerLinkActive="bg-blue-100 text-blue-700 font-medium"
    class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
  >
    <span class="text-lg">{{ getModuloIcon(modulo.icono) }}</span>
    <span>{{ modulo.nombre }}</span>
  </a>
</nav>
```

**Resultado:**
- Un **propietario** solo verá: Dashboard, Consorcios, Unidades, Expensas, Tickets
- Un **admin_global** verá todos los módulos
- Un **proveedor** solo verá: Tickets

---

### 3. Mostrar/Ocultar Botones según Permisos

Usa la directiva `*hasPermission` para controlar la visibilidad:

```html
<!-- Ejemplo en un componente de Consorcios -->

<div class="page-header">
  <h1>Consorcios</h1>

  <!-- Solo usuarios con permiso "crear" verán este botón -->
  <button *hasPermission="'consorcios:crear'" (click)="crearConsorcio()">
    + Nuevo Consorcio
  </button>
</div>

<table>
  <tr *ngFor="let consorcio of consorcios">
    <td>{{ consorcio.nombre }}</td>
    <td>
      <!-- Solo usuarios con permiso "editar" verán este botón -->
      <button *hasPermission="'consorcios:editar'" (click)="editar(consorcio)">
        Editar
      </button>

      <!-- Solo usuarios con permiso "eliminar" verán este botón -->
      <button *hasPermission="'consorcios:eliminar'" (click)="eliminar(consorcio)">
        Eliminar
      </button>
    </td>
  </tr>
</table>
```

**Formato de permisos:**
```
"modulo:accion"

Ejemplos:
- "dashboard:ver"
- "consorcios:crear"
- "personas:editar"
- "tickets:eliminar"
- "unidades:ver"
```

---

### 4. Usar la Directiva en Cualquier Componente

**Paso 1: Importar la directiva**

```typescript
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';

@Component({
  selector: 'app-personas',
  standalone: true,
  imports: [CommonModule, HasPermissionDirective], // ⬅️ Agregar aquí
  templateUrl: './personas.component.html'
})
export class PersonasComponent { }
```

**Paso 2: Usar en el template**

```html
<button *hasPermission="'personas:crear'">
  + Nueva Persona
</button>

<div *hasPermission="'personas:editar'">
  <form><!-- Formulario de edición --></form>
</div>
```

---

### 5. Proteger Rutas con el Guard

Puedes agregar protección adicional usando `ModulePermissionGuard`:

```typescript
// src/app/app.routes.ts

import { ModulePermissionGuard } from './auth/module-permission.guard';

export const appRoutes: Routes = [
  {
    path: 'consorcios',
    component: ConsorciosComponent,
    canActivate: [AuthGuard, ModulePermissionGuard],
    data: {
      module: 'consorcios',  // ⬅️ Clave del módulo
      action: 'ver'          // ⬅️ Acción requerida (ver, crear, editar, eliminar)
    }
  },
  {
    path: 'consorcios/nuevo',
    component: ConsorcioFormComponent,
    canActivate: [AuthGuard, ModulePermissionGuard],
    data: {
      module: 'consorcios',
      action: 'crear'  // ⬅️ Requiere permiso de crear
    }
  }
];
```

**Nota:** En la mayoría de casos no es necesario, ya que el `RoleGuard` existente ya maneja permisos por rol. Este guard es opcional para mayor granularidad.

---

## 🔧 API del ModulosService

### Métodos Principales

```typescript
import { ModulosService } from './core/services/modulos.service';

// Cargar módulos desde el backend
modulosService.getMisModulos().subscribe(response => {
  console.log('Módulos:', response.data);
});

// Verificar si el usuario tiene un módulo
if (modulosService.tieneModulo('consorcios')) {
  // Usuario tiene acceso al módulo de consorcios
}

// Verificar permisos específicos
if (modulosService.puedeCrear('consorcios')) {
  // Usuario puede crear consorcios
}

if (modulosService.puedeEditar('personas')) {
  // Usuario puede editar personas
}

if (modulosService.puedeEliminar('tickets')) {
  // Usuario puede eliminar tickets
}

// Obtener todos los permisos de un módulo
const permisos = modulosService.getPermisosModulo('consorcios');
// Retorna: { ver: true, crear: true, editar: true, eliminar: false }

// Limpiar módulos (al hacer logout)
modulosService.limpiarModulos();
```

---

## 📊 Flujo de Datos

```
1. Usuario hace login
   ↓
2. AuthService guarda token y usuario en localStorage
   ↓
3. Usuario es redirigido al dashboard
   ↓
4. AuthGuard carga módulos desde localStorage (si existen)
   ↓
5. LayoutComponent se inicializa
   ↓
6. LayoutComponent carga módulos desde storage (rápido)
   ↓
7. LayoutComponent llama a /modulos/mis-modulos (actualización)
   ↓
8. Backend retorna módulos con permisos
   ↓
9. ModulosService transforma y guarda módulos
   ↓
10. Sidebar se renderiza dinámicamente
   ↓
11. Componentes usan *hasPermission para mostrar/ocultar elementos
```

---

## 🎨 Ejemplos de Uso por Componente

### Ejemplo 1: Lista de Consorcios

```typescript
// consorcios-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { ModulosService } from '../../core/services/modulos.service';

@Component({
  selector: 'app-consorcios-list',
  standalone: true,
  imports: [CommonModule, HasPermissionDirective],
  templateUrl: './consorcios-list.component.html'
})
export class ConsorciosListComponent implements OnInit {
  consorcios: any[] = [];
  permisos: any;

  constructor(private modulosService: ModulosService) {}

  ngOnInit() {
    // Obtener permisos del módulo
    this.permisos = this.modulosService.getPermisosModulo('consorcios');
    this.cargarConsorcios();
  }

  crearConsorcio() {
    if (this.permisos?.crear) {
      // Crear consorcio
    }
  }
}
```

```html
<!-- consorcios-list.component.html -->
<div class="page-container">
  <div class="page-header">
    <h1>Consorcios</h1>
    <button *hasPermission="'consorcios:crear'" (click)="crearConsorcio()" class="btn-primary">
      + Nuevo Consorcio
    </button>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Dirección</th>
        <th *hasPermission="'consorcios:editar'">Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let consorcio of consorcios">
        <td>{{ consorcio.nombre }}</td>
        <td>{{ consorcio.direccion }}</td>
        <td *hasPermission="'consorcios:editar'">
          <button *hasPermission="'consorcios:editar'" (click)="editar(consorcio)">
            Editar
          </button>
          <button *hasPermission="'consorcios:eliminar'" (click)="eliminar(consorcio)">
            Eliminar
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

### Ejemplo 2: Detalle de Unidad

```typescript
// unidad-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { ModulosService } from '../../core/services/modulos.service';

@Component({
  selector: 'app-unidad-detail',
  standalone: true,
  imports: [CommonModule, HasPermissionDirective],
  templateUrl: './unidad-detail.component.html'
})
export class UnidadDetailComponent implements OnInit {
  unidad: any;
  puedeEditar = false;

  constructor(private modulosService: ModulosService) {}

  ngOnInit() {
    // Verificar permisos programáticamente
    this.puedeEditar = this.modulosService.puedeEditar('unidades');
    this.cargarUnidad();
  }

  guardarCambios() {
    if (!this.puedeEditar) {
      alert('No tienes permiso para editar');
      return;
    }
    // Guardar cambios
  }
}
```

```html
<!-- unidad-detail.component.html -->
<div class="detail-container">
  <h1>Unidad {{ unidad?.numero }}</h1>

  <!-- Mostrar formulario solo si puede editar -->
  <form *hasPermission="'unidades:editar'" (submit)="guardarCambios()">
    <input [(ngModel)]="unidad.numero" />
    <button type="submit">Guardar Cambios</button>
  </form>

  <!-- Vista de solo lectura si no puede editar -->
  <div *ngIf="!puedeEditar">
    <p><strong>Número:</strong> {{ unidad?.numero }}</p>
    <p><strong>Piso:</strong> {{ unidad?.piso }}</p>
    <p class="text-gray-500">No tienes permisos para editar esta unidad</p>
  </div>
</div>
```

---

### Ejemplo 3: Dashboard con Widgets Condicionales

```html
<!-- dashboard.component.html -->
<div class="dashboard-grid">
  <!-- Widget de estadísticas de consorcios (solo si puede ver) -->
  <div *hasPermission="'consorcios:ver'" class="dashboard-card">
    <h3>Consorcios</h3>
    <p class="stat">{{ totalConsorcios }}</p>
  </div>

  <!-- Widget de usuarios pendientes (solo admin) -->
  <div *hasPermission="'usuarios:ver'" class="dashboard-card">
    <h3>Usuarios Pendientes</h3>
    <p class="stat">{{ usuariosPendientes }}</p>
  </div>

  <!-- Widget de tickets (todos pueden ver) -->
  <div *hasPermission="'tickets:ver'" class="dashboard-card">
    <h3>Mis Tickets</h3>
    <p class="stat">{{ misTickets }}</p>
  </div>

  <!-- Widget de expensas (propietarios e inquilinos) -->
  <div *hasPermission="'expensas:ver'" class="dashboard-card">
    <h3>Expensas Pendientes</h3>
    <p class="stat">${{ expensasPendientes }}</p>
  </div>
</div>
```

---

## 🧪 Testing

### Probar con diferentes roles

1. **Login como Admin Global**
   ```
   Email: admin@ejemplo.com
   Password: ***
   ```
   **Resultado esperado:**
   - Todos los módulos visibles en el sidebar
   - Todos los botones de crear/editar/eliminar visibles

2. **Login como Propietario**
   ```
   Email: propietario@ejemplo.com
   Password: ***
   ```
   **Resultado esperado:**
   - Módulos visibles: Dashboard, Consorcios, Unidades, Expensas, Tickets
   - NO ver botones de crear/editar/eliminar
   - Solo botón "Crear Ticket" visible

3. **Login como Proveedor**
   ```
   Email: proveedor@ejemplo.com
   Password: ***
   ```
   **Resultado esperado:**
   - Solo módulo visible: Tickets
   - Puede editar tickets asignados a él

---

## 🔒 Seguridad

### Protección en Múltiples Capas

1. **Backend** - El backend filtra módulos según el rol
2. **Frontend - AuthGuard** - Verifica autenticación
3. **Frontend - RoleGuard** - Verifica roles permitidos
4. **Frontend - ModulePermissionGuard** - Verifica permisos de módulos (opcional)
5. **Frontend - Directiva** - Oculta elementos según permisos
6. **Frontend - Servicio** - Métodos para verificar permisos programáticamente

**IMPORTANTE:** La seguridad real está en el backend. El frontend solo mejora la UX ocultando elementos que el usuario no puede usar.

---

## 📌 Notas Importantes

### LocalStorage

Los módulos se guardan en `localStorage` con la clave `user_modules`:

```typescript
// Al hacer login
localStorage.setItem('user_modules', JSON.stringify(modulos));

// Al hacer logout
localStorage.removeItem('user_modules');
```

Esto permite:
- ✅ Persistencia entre recargas de página
- ✅ Mejor UX (sidebar se renderiza inmediatamente)
- ✅ Menos llamadas al backend

---

### Sincronización

Los módulos se sincronizan automáticamente:

1. **Al iniciar sesión** - Se cargan desde el backend
2. **Al recargar la página** - Se cargan desde localStorage primero, luego se actualizan desde el backend
3. **Al cerrar sesión** - Se limpian del localStorage

---

### Agregar Nuevos Módulos

Para agregar un nuevo módulo al sistema:

1. **Backend**: Agregar a la tabla `modulos`
2. **Backend**: Asignar permisos en `roles_modulos`
3. **Frontend**: El módulo aparecerá automáticamente en el sidebar
4. **Frontend**: Usar `*hasPermission="'nuevo_modulo:accion'"` en componentes

**No se requiere modificar código del frontend** - Todo es dinámico.

---

## 🎉 Beneficios

✅ **Mantenibilidad** - Un solo lugar para definir módulos (backend)
✅ **Escalabilidad** - Agregar módulos sin modificar código
✅ **Seguridad** - Control granular de permisos
✅ **UX** - Solo se muestran opciones permitidas
✅ **Performance** - Módulos en localStorage para carga rápida
✅ **Flexibilidad** - Cambiar permisos sin redeployar frontend

---

## 📚 Referencias

- **Backend**: Ver `BACKEND_IMPLEMENTATION.md` para detalles del backend
- **Módulos**: Tabla `modulos` en la base de datos
- **Permisos**: Tabla `roles_modulos` en la base de datos
- **Endpoint principal**: `GET /modulos/mis-modulos`

---

## 🆘 Troubleshooting

### El sidebar no muestra módulos

1. Verificar que el usuario esté autenticado
2. Verificar que `localStorage.getItem('user_modules')` tenga datos
3. Verificar que el backend retorne módulos en `/modulos/mis-modulos`
4. Verificar la consola del navegador para errores

### Los botones no se ocultan

1. Verificar que la directiva `HasPermissionDirective` esté importada en el componente
2. Verificar el formato del permiso: `"modulo:accion"`
3. Verificar que el módulo exista en `localStorage`

### Error al cargar módulos

1. Verificar que el token JWT sea válido
2. Verificar que el backend esté corriendo
3. Verificar que el endpoint `/modulos/mis-modulos` esté disponible
4. Verificar la configuración de CORS

---

¡El sistema está listo para usar! 🚀
