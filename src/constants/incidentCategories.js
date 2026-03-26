/**
 * Categorías de incidentes: claves en inglés (API) y etiquetas en español (UI).
 */

const LABELS_ES = {
  maintenance: 'Mantención',
  security: 'Seguridad',
  noise: 'Ruidos molestos',
  cleaning: 'Limpieza',
  parking: 'Estacionamiento',
  elevator: 'Ascensor',
  water: 'Agua',
  electricity: 'Electricidad',
  electrical: 'Eléctrico',
  plumbing: 'Gasfitería',
  'common-area': 'Área común',
  general: 'General',
  other: 'Otro',
};

const TITLE_PREFIX_KEYS = [...Object.keys(LABELS_ES), 'common_area'];

/**
 * Normaliza la clave de categoría (trim, minúsculas, guiones).
 */
export function normalizeIncidentCategoryKey(raw) {
  if (raw === null || raw === undefined) return 'other';
  const base = String(raw).trim().toLowerCase().replace(/_/g, '-');
  return base || 'other';
}

/**
 * Etiqueta en español; si no hay mapa, título legible sin forzar inglés.
 */
export function getIncidentCategoryLabelEs(raw) {
  const key = normalizeIncidentCategoryKey(raw);
  if (LABELS_ES[key]) return LABELS_ES[key];
  if (!raw || !String(raw).trim()) return LABELS_ES.other;
  return String(raw)
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Clave para iconos del tablero Kanban (mapea sinónimos a las claves de CATEGORY_ICONS).
 */
export function normalizeIncidentCategoryForKanbanIcon(raw) {
  const key = normalizeIncidentCategoryKey(raw);
  if (key === 'electrical') return 'electricity';
  if (key === 'plumbing') return 'water';
  return key;
}

/**
 * Quita prefijos en inglés "clave - " al inicio del título (una o varias veces si vienen encadenadas).
 * Ej.: "security - estacionamiento -2" → "estacionamiento -2"
 */
export function stripIncidentCategoryFromTitle(title) {
  if (!title || typeof title !== 'string') return '';
  const escaped = TITLE_PREFIX_KEYS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp(`^(?:${escaped})\\s*-\\s*`, 'i');
  let current = title.trim();
  const orig = current;
  let next = current.replace(re, '').trim();
  while (next !== current && next.length) {
    current = next;
    next = current.replace(re, '').trim();
  }
  return current || orig;
}
