# Guía de Mejores Prácticas para UX Móvil

Esta guía documenta las mejoras implementadas y las mejores prácticas para mantener una experiencia móvil óptima en el proyecto.

## 📱 Mejoras Implementadas

### 1. Layout Principal con Sidebar Responsive

**Cambios realizados:**
- Sidebar se oculta completamente en móviles (< 1024px)
- Aparece como overlay con backdrop oscuro
- Animación suave de entrada/salida
- Se cierra automáticamente al hacer clic en un enlace
- Detección automática de tamaño de pantalla

**Archivos modificados:**
- `src/app/core/layout/layout.component.html`
- `src/app/core/layout/layout.component.ts`

### 2. Dashboard Optimizado

**Cambios realizados:**
- Tarjetas de estadísticas en layout de 1 columna en móvil
- Grid adaptativo: 1 col → 2 cols → 3 cols → 6 cols
- Tamaños de texto escalables (text-2xl sm:text-3xl)
- Padding responsive (p-3 sm:p-4 md:p-6)
- Sección de tickets con layout vertical en móvil

**Archivos modificados:**
- `src/app/core/dashboard/dashboard.component.html`

### 3. Componentes de Tarjetas Mejorados

**Cambios realizados:**
- Headers responsive con flex-col en móvil
- Botones optimizados para táctil (min-h-touch-sm)
- Iconos ocultan texto en pantallas muy pequeñas
- Efecto visual al presionar (active:scale-95)

**Archivos modificados:**
- `src/app/features/unidades/components/unidad-card/unidad-card.component.html`

### 4. Configuración Tailwind Mejorada

**Nuevas utilidades agregadas:**
- Breakpoint `xs` (475px) para dispositivos extra pequeños
- Clases de spacing táctil (`touch`, `touch-sm`)
- Utilidades de áreas seguras (`.pb-safe`, `.pt-safe`, etc.)
- Clases para mejor rendimiento táctil (`.tap-transparent`, `.scroll-touch`)

**Archivo modificado:**
- `tailwind.config.js`

---

## 🎨 Breakpoints y Sistema de Grid

### Breakpoints Estándar de Tailwind

```javascript
xs:   475px   // Extra pequeño (agregado)
sm:   640px   // Móviles grandes
md:   768px   // Tablets
lg:   1024px  // Laptops
xl:   1280px  // Desktops
2xl:  1536px  // Pantallas grandes
```

### Patrones de Grid Responsive

```html
<!-- De 1 a 6 columnas según pantalla -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">

<!-- De 1 a 4 columnas -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

<!-- Stack en móvil, horizontal en desktop -->
<div class="flex flex-col lg:flex-row gap-4">
```

---

## 📏 Guía de Espaciado Responsive

### Padding Responsive
```html
<!-- Padding adaptativo -->
<div class="p-3 sm:p-4 md:p-6">
<div class="px-4 sm:px-6 lg:px-8">

<!-- Margin adaptativo -->
<div class="mb-4 sm:mb-6 md:mb-8">
<div class="space-y-4 sm:space-y-6 md:space-y-8">
```

### Gap Responsive
```html
<div class="gap-3 sm:gap-4 md:gap-6">
<div class="flex gap-2 sm:gap-3 lg:gap-4">
```

---

## 🔤 Tipografía Responsive

### Tamaños de Texto
```html
<!-- Títulos -->
<h1 class="text-2xl sm:text-3xl lg:text-4xl">
<h2 class="text-lg sm:text-xl lg:text-2xl">
<h3 class="text-base sm:text-lg">

<!-- Párrafos y cuerpo -->
<p class="text-sm sm:text-base">
<span class="text-xs sm:text-sm">
```

### Ocultar/Mostrar Texto
```html
<!-- Mostrar texto solo en pantallas grandes -->
<span class="hidden xs:inline">Ver detalles</span>
<span class="hidden lg:block">Información completa</span>

<!-- Mostrar solo en móvil -->
<span class="lg:hidden">☰</span>
```

---

## 👆 Elementos Táctiles

### Tamaños Mínimos Recomendados

**Apple y Android recomiendan mínimo 44×44px para elementos táctiles**

```html
<!-- Botones táctiles -->
<button class="min-h-touch min-w-touch px-4 py-2">
<button class="min-h-touch-sm px-3 py-2">

<!-- Con clases custom de Tailwind -->
<button class="h-touch w-touch">
```

### Feedback Táctil
```html
<!-- Escala al presionar -->
<button class="active:scale-95 transition-transform">

<!-- Cambio de color al presionar -->
<button class="active:bg-blue-600">

<!-- Sin highlight táctil -->
<button class="tap-transparent">
```

---

## 🖼️ Componentes Comunes Responsive

### Cards/Tarjetas
```html
<div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow
            p-3 sm:p-4 md:p-6">
  <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
    <!-- Contenido -->
  </div>
</div>
```

### Botones de Acción
```html
<div class="flex flex-wrap sm:flex-nowrap gap-2">
  <button class="inline-flex items-center justify-center gap-1
                 px-3 py-2 text-xs sm:text-sm
                 min-h-touch-sm active:scale-95
                 rounded-lg transition-all">
    <svg class="w-4 h-4">...</svg>
    <span class="hidden xs:inline">Texto</span>
  </button>
</div>
```

### Listas/Tablas
```html
<!-- En móvil: cards apiladas, en desktop: tabla -->
<div class="block lg:hidden">
  <!-- Vista de cards para móvil -->
</div>

<div class="hidden lg:block">
  <!-- Vista de tabla para desktop -->
</div>
```

---

## 🎯 Mejores Prácticas

### 1. Mobile-First Design
✅ **Hacer:**
```html
<div class="text-sm sm:text-base lg:text-lg">
<div class="flex-col md:flex-row">
```

❌ **Evitar:**
```html
<div class="lg:text-sm text-lg">  <!-- Desktop first -->
```

### 2. Touch Targets
✅ **Hacer:**
```html
<!-- Mínimo 44px de altura para botones -->
<button class="min-h-touch px-4 py-2">
<a class="inline-block p-3 min-h-touch">
```

❌ **Evitar:**
```html
<button class="py-1 px-2">  <!-- Muy pequeño -->
```

### 3. Contenido Horizontal
✅ **Hacer:**
```html
<!-- Stack en móvil -->
<div class="flex flex-col md:flex-row gap-4">
```

❌ **Evitar:**
```html
<!-- Mucho contenido horizontal en móvil -->
<div class="flex flex-row">
  <div>...</div>
  <div>...</div>
  <div>...</div>
  <div>...</div>
</div>
```

### 4. Imágenes e Iconos
```html
<!-- Iconos escalables -->
<svg class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6">

<!-- Imágenes responsive -->
<img class="w-full h-auto max-w-md mx-auto">
```

### 5. Formularios
```html
<!-- Inputs táctiles -->
<input class="w-full px-4 py-3 text-base rounded-lg
              focus:ring-2 focus:outline-none">

<!-- Labels legibles -->
<label class="text-sm sm:text-base font-medium">

<!-- Botones grandes -->
<button type="submit" class="w-full sm:w-auto px-6 py-3
                             text-base font-medium">
```

---

## 🔍 Testing Responsive

### Breakpoints a Probar

1. **Mobile Portrait:** 375px - 414px (iPhone, Android)
2. **Mobile Landscape:** 667px - 896px
3. **Tablet Portrait:** 768px - 834px (iPad)
4. **Tablet Landscape:** 1024px - 1112px
5. **Desktop:** 1280px+

### Herramientas de Testing

- **Chrome DevTools:** Cmd/Ctrl + Shift + M
- **Firefox Responsive Design Mode:** Cmd/Ctrl + Shift + M
- **Navegadores reales:** Siempre probar en dispositivos reales cuando sea posible

### Checklist de Testing

- [ ] El sidebar se oculta correctamente en móvil
- [ ] Todos los botones son táctiles (44px mínimo)
- [ ] El texto es legible sin zoom
- [ ] No hay scroll horizontal inesperado
- [ ] Las imágenes se adaptan correctamente
- [ ] Los formularios son fáciles de completar
- [ ] Las animaciones son suaves
- [ ] El contenido no se solapa

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Angular Material Responsive](https://material.angular.io/cdk/layout/overview)
- [Web.dev Mobile UX](https://web.dev/mobile-ux/)

### Guías de Diseño

- [Material Design - Touch Targets](https://material.io/design/usability/accessibility.html#layout-and-typography)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/)
- [Android Material Design](https://material.io/design/layout/responsive-layout-grid.html)

---

## 🚀 Próximos Pasos Recomendados

1. **Revisar formularios:** Asegurarse que todos los formularios sean táctiles
2. **Optimizar imágenes:** Implementar lazy loading y srcset
3. **Probar en dispositivos reales:** iPhone, Android, iPad
4. **Agregar gestos táctiles:** Swipe para acciones comunes
5. **Performance:** Minimizar animaciones pesadas en móvil
6. **PWA:** Considerar convertir la app en Progressive Web App

---

## ❓ Preguntas Frecuentes

### ¿Cuándo usar `hidden` vs `opacity-0`?

- `hidden`: Elimina el elemento del DOM y del flujo de layout
- `opacity-0`: Mantiene el espacio pero lo hace invisible

```html
<!-- Recomendado para cambios responsive -->
<div class="hidden md:block">

<!-- Para animaciones -->
<div class="opacity-0 transition-opacity hover:opacity-100">
```

### ¿Cómo decidir los breakpoints?

Basarse en el contenido, no en dispositivos específicos. Si el layout se ve mal, ese es tu breakpoint.

### ¿Mobile-first o Desktop-first?

**Mobile-first** es la recomendación moderna:
- Fuerza a priorizar contenido esencial
- Mejor rendimiento en móviles
- Más fácil escalar hacia arriba que hacia abajo

---

**Última actualización:** 2025-11-12
**Autor:** Claude Code
**Versión:** 1.0.0
