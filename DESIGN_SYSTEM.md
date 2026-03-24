# Sistema de Diseno DOMU - Referencia

## 1. Paleta de Colores

### Colores primarios
| Variable | Hex | Uso |
|----------|-----|-----|
| `--color-turquoise` | #53a497 | Identidad de marca, acciones principales |
| `--color-orange` | #f16b32 | Acento, CTAs, enlaces |
| `--color-yellow` | #f7ce0f | **DEPRECATED** - Color legacy (tesis Cap.6) |
| `--color-black` | #000000 | Texto principal |
| `--color-gray-dark` | #67696a | Texto secundario |
| `--color-gray` | #808282 | Texto muted |
| `--color-white` | #ffffff | Fondos |

### Colores de texto (escala neutral)
| Variable | Hex | Uso |
|----------|-----|-----|
| `--color-text-dark` | #1e293b | Titulos oscuros |
| `--color-text-secondary` | #475569 | Texto secundario |
| `--color-text-muted` | #64748b | Texto silenciado |
| `--color-text-subtle` | #94a3b8 | Texto sutil, placeholders |

### Fondos
| Variable | Hex | Uso |
|----------|-----|-----|
| `--color-bg-primary` | #ffffff | Fondo principal |
| `--color-bg-secondary` | #f8f9fa | Fondos de cards, headers |
| `--color-bg-tertiary` | #f1f3f5 | Fondos alternos |
| `--color-bg-accent` | #e8f5f2 | Fondos con acento turquesa |
| `--color-bg-hover` | #f1f5f9 | Estados hover |
| `--color-bg-input` | #f9fafb | Fondos de inputs |

### Bordes
| Variable | Valor | Uso |
|----------|-------|-----|
| `--color-border-light` | rgba(0,0,0,0.06) | Bordes sutiles |
| `--color-border-medium` | rgba(0,0,0,0.12) | Bordes estandar |
| `--color-border-focus` | rgba(83,164,151,0.4) | Focus ring |
| `--color-border-default` | #e2e8f0 | Bordes por defecto |
| `--color-border-soft` | #cbd5e1 | Bordes suaves |
| `--color-border-subtle` | #f3f4f6 | Bordes muy sutiles |

### Colores semanticos
| Variable | Hex | Uso |
|----------|-----|-----|
| `--color-success` / `--color-success-bg` | #2d7a36 / #e7f5e8 | Exito |
| `--color-error` / `--color-error-bg` | #b42318 / #fef2f2 | Error |
| `--color-warning` / `--color-warning-bg` | #b54708 / #fff4e5 | Advertencia |
| `--color-info` / `--color-info-bg` | #0369a1 / #e0f2fe | Informacion |

---

## 2. Tipografia

- **Familia**: `'Roboto Mono', 'Courier New', monospace`
- **h1**: `clamp(2rem, 5vw, 3.5rem)`, weight 700
- **h2**: `clamp(1.5rem, 4vw, 2.5rem)`, weight 700
- **h3**: `clamp(1.25rem, 3vw, 1.75rem)`, weight 700
- **Body**: weight 400, line-height 1.6
- **Parrafos**: color `--color-gray-dark`, line-height 1.7

---

## 3. Spacing y Layout

### Variables de spacing
| Variable | Valor | Uso |
|----------|-------|-----|
| `--space-page-x` | clamp(1rem, 3vw, 2.5rem) | Padding horizontal de pagina |
| `--space-page-y` | clamp(1rem, 2vw, 1.5rem) | Padding vertical de pagina |
| `--space-gap` | clamp(1rem, 2vw, 1.5rem) | Gap general |
| `--touch-min` | 44px | Tamano minimo touch target |

### Sombras
| Variable | Uso |
|----------|-----|
| `--shadow-sm` | Cards, tablas |
| `--shadow-md` | Elevacion media |
| `--shadow-lg` | Modals, dropdowns |
| `--shadow-xl` | Modals overlay |
| `--shadow-turquoise` | Botones turquesa |
| `--shadow-orange` | Botones naranja |

### Border radius
| Variable | Valor | Uso |
|----------|-------|-----|
| `--radius-sm` | 8px | Inputs, badges |
| `--radius-md` | 12px | Cards pequenas |
| `--radius-lg` | 16px | Cards grandes |
| `--radius-xl` | 20px | Modals |
| `--radius-pill` | 999px | Pills, badges |

---

## 4. Breakpoints

Mixins disponibles (auto-inyectados via Vite, no requieren import):

| Mixin | Breakpoint | Uso tipico |
|-------|-----------|------------|
| `@include below-xs` | 380px | Pantallas muy pequenas |
| `@include below-sm` | 480px | Moviles pequenos |
| `@include below-md` | 640px | Moviles grandes |
| `@include below-lg` | 768px | Tablets |
| `@include below-xl` | 900px | Tablets grandes |
| `@include below-2xl` | 1024px | Pantallas medianas |

**Uso:**
```scss
.my-component {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  @include below-lg {
    grid-template-columns: 1fr;
  }
}
```

---

## 5. Mixins Disponibles

Todos los mixins estan auto-inyectados via `vite.config.js` (`additionalData`) y disponibles en cualquier archivo SCSS importado desde JS. Para archivos cargados via `@use` desde SCSS, agregar `@use '../styles/partials/domu-mixins' as *;`.

### Modal
| Mixin | Parametros | Descripcion |
|-------|-----------|-------------|
| `modal-overlay` | `$z: 1200, $bg: rgba(0,0,0,0.5), $blur: 6px` | Overlay fijo con backdrop |
| `modal-container` | `$max-w: 600px` | Container con scroll, shadow, border |
| `modal-header` | - | Header con space-between, bg secondary |
| `modal-close-btn` | - | Boton cerrar con hover error |
| `modal-body` | - | Body con padding y overflow |
| `modal-footer` | - | Footer con border-top, bg secondary |

### Form
| Mixin | Parametros | Descripcion |
|-------|-----------|-------------|
| `form-container` | `$gap: 1.5rem` | Container flex column |
| `form-group` | - | Grupo label+input |
| `form-label` | - | Label estandar |
| `form-input` | - | Input con focus turquesa |
| `form-grid` | `$cols: 2, $gap: 1.25rem` | Grid de formulario |
| `form-error-banner` | - | Banner de error |
| `form-info-banner` | - | Banner informativo |
| `form-help-text` | - | Texto de ayuda |

### Table
| Mixin | Descripcion |
|-------|-------------|
| `data-table-container` | Container con overflow-x, border, shadow |
| `data-table` | Tabla con thead turquesa gradient, hover rows |

### Badge
| Mixin | Descripcion |
|-------|-------------|
| `status-badge` | Base: pill, 0.75rem, uppercase |
| `badge-variant($bg, $color)` | Variante custom |
| `badge-success`, `badge-error`, `badge-warning`, `badge-info`, `badge-neutral` | Semanticas |
| `badge-active`, `badge-inactive`, `badge-pending`, `badge-in-progress`, `badge-completed` | Estados |
| `badge-priority-high`, `badge-priority-medium`, `badge-priority-low` | Prioridades |

### Page Layout
| Mixin | Parametros | Descripcion |
|-------|-----------|-------------|
| `dashboard-page` | `$gap: 1.5rem` | Flex column con gap |
| `dashboard-header` | - | Header space-between wrap |
| `dashboard-controls` | - | Controles/filtros flex wrap |
| `dashboard-empty` | - | Empty state con dashed border |

### Card
| Mixin | Descripcion |
|-------|-------------|
| `card-base` | Card con bg, border, shadow, padding |

### Animations
| Mixin/Keyframe | Descripcion |
|----------------|-------------|
| `skeleton-shimmer($duration: 1.4s)` | Shimmer loading animation |
| `@keyframes shimmer` | Keyframe del shimmer |
| `@keyframes modal-scale-in` | Animacion de entrada de modal |

---

## 6. Patrones

### Nueva pagina dashboard
```scss
.my-page {
  @include dashboard-page;
}

.my-page__header {
  @include dashboard-header;
}

.my-page__controls {
  @include dashboard-controls;
}

.my-page__empty {
  @include dashboard-empty;
}
```

### Nuevo modal
```scss
.my-modal-overlay {
  @include modal-overlay;
}

.my-modal {
  @include modal-container(500px);
}

.my-modal__header {
  @include modal-header;
}

.my-modal__close {
  @include modal-close-btn;
}

.my-modal__body {
  @include modal-body;
}

.my-modal__footer {
  @include modal-footer;
}
```

### Nueva tabla de datos
```scss
.my-table-container {
  @include data-table-container;
}

.my-table {
  @include data-table;
}
```

### Nuevos badges
```scss
.my-badge {
  @include status-badge;
}

.my-badge--active {
  @include badge-active;
}

.my-badge--custom {
  @include badge-variant(rgba(100, 200, 150, 0.1), #2d7a36);
}
```

---

## 7. Reglas

1. **NO hardcodear hex** - Usar siempre CSS custom properties (`var(--color-*)`)
2. **NO duplicar modals** - Usar los mixins `modal-*` para toda estructura modal
3. **NO duplicar tablas** - Usar `data-table-container` + `data-table`
4. **NO duplicar badges** - Usar `status-badge` + `badge-variant`
5. **NO usar `@media` con px literales** - Usar mixins `below-*` para breakpoints estandar
6. **NO usar `--color-yellow`** para nuevos componentes - Es color legacy
7. **Overrides van DESPUES del @include** - El mixin pone la base, el override personaliza
8. Breakpoints no-estandar (600px, 800px, etc.) se mantienen con `@media` directo + comentario
9. Los mixins estan auto-inyectados - No requieren import en archivos SCSS importados desde JS
