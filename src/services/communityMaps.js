const COMMUNITY_MAP_STORAGE_KEY = 'domuCommunityMapRegistry';
const COMMUNITY_MAP_STORAGE_VERSION = 1;
const hasStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const toSafeNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeText = (value) => String(value || '').trim();

const toIdSegment = (value) => normalizeText(value)
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 48);

const buildCommunityId = (community) => {
  const nameSegment = toIdSegment(community?.name) || 'condominio';
  const addressSegment = toIdSegment(community?.address) || 'sin-direccion';
  const lat = toSafeNumber(community?.latitude);
  const lng = toSafeNumber(community?.longitude);
  const geoSegment = lat !== null && lng !== null
    ? `${lat.toFixed(4)}_${lng.toFixed(4)}`
    : 'sin-mapa';

  return `${nameSegment}_${addressSegment}_${geoSegment}`;
};

const getDefaultRegistry = () => ({
  version: COMMUNITY_MAP_STORAGE_VERSION,
  communities: [],
});

const loadRegistry = () => {
  if (!hasStorage()) return getDefaultRegistry();
  try {
    const raw = localStorage.getItem(COMMUNITY_MAP_STORAGE_KEY);
    if (!raw) return getDefaultRegistry();

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return getDefaultRegistry();

    const communities = Array.isArray(parsed.communities)
      ? parsed.communities.filter((item) => item && typeof item === 'object')
      : [];

    return {
      version: COMMUNITY_MAP_STORAGE_VERSION,
      communities,
    };
  } catch {
    return getDefaultRegistry();
  }
};

const saveRegistry = (registry) => {
  if (!hasStorage()) return;
  localStorage.setItem(COMMUNITY_MAP_STORAGE_KEY, JSON.stringify({
    version: COMMUNITY_MAP_STORAGE_VERSION,
    communities: Array.isArray(registry?.communities) ? registry.communities : [],
  }));
};

const normalizeCommunity = (community, previous = null) => {
  const now = new Date().toISOString();
  const latitude = toSafeNumber(community?.latitude);
  const longitude = toSafeNumber(community?.longitude);
  const unitsCount = toSafeNumber(community?.unitsCount);
  const floors = toSafeNumber(community?.floors);
  const existingSubmissions = Number(previous?.submissions) || 0;
  const existingSelections = Number(previous?.selectionCount) || 0;

  return {
    id: normalizeText(community?.id) || previous?.id || buildCommunityId(community),
    name: normalizeText(community?.name),
    address: normalizeText(community?.address),
    commune: normalizeText(community?.commune),
    city: normalizeText(community?.city),
    postalCode: normalizeText(community?.postalCode),
    towerLabel: normalizeText(community?.towerLabel),
    latitude,
    longitude,
    floors,
    unitsCount,
    source: normalizeText(community?.source) || previous?.source || 'community-request',
    status: normalizeText(community?.status) || previous?.status || '',
    submissions: Math.max(1, existingSubmissions + 1),
    selectionCount: existingSelections,
    createdAt: previous?.createdAt || now,
    updatedAt: now,
    lastSelectedAt: previous?.lastSelectedAt || null,
  };
};

const sortCommunities = (communities) => {
  return [...communities].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
};

const getUsageStats = (communities) => {
  const safeCommunities = Array.isArray(communities) ? communities : [];

  return safeCommunities.reduce((acc, community) => {
    const hasMap = Number.isFinite(toSafeNumber(community?.latitude)) && Number.isFinite(toSafeNumber(community?.longitude));
    const unitsCount = toSafeNumber(community?.unitsCount) || 0;
    const selectionCount = Number(community?.selectionCount) || 0;
    const submissions = Number(community?.submissions) || 0;

    return {
      totalCommunities: acc.totalCommunities + 1,
      mappedCommunities: acc.mappedCommunities + (hasMap ? 1 : 0),
      estimatedUsers: acc.estimatedUsers + unitsCount,
      totalSelections: acc.totalSelections + selectionCount,
      totalSubmissions: acc.totalSubmissions + submissions,
    };
  }, {
    totalCommunities: 0,
    mappedCommunities: 0,
    estimatedUsers: 0,
    totalSelections: 0,
    totalSubmissions: 0,
  });
};

export const communityMaps = {
  list: () => {
    const registry = loadRegistry();
    return sortCommunities(registry.communities);
  },

  getById: (id) => {
    const safeId = normalizeText(id);
    if (!safeId) return null;
    const registry = loadRegistry();
    return registry.communities.find((item) => String(item.id) === safeId) || null;
  },

  registerCommunity: (community) => {
    const registry = loadRegistry();
    const incomingId = normalizeText(community?.id) || buildCommunityId(community);
    const index = registry.communities.findIndex((item) => String(item.id) === incomingId);
    const existing = index >= 0 ? registry.communities[index] : null;
    const normalized = normalizeCommunity({ ...community, id: incomingId }, existing);

    if (index >= 0) {
      registry.communities[index] = normalized;
    } else {
      registry.communities.push(normalized);
    }

    saveRegistry(registry);
    return normalized;
  },

  registerSelection: (id) => {
    const safeId = normalizeText(id);
    if (!safeId) return null;

    const registry = loadRegistry();
    const index = registry.communities.findIndex((item) => String(item.id) === safeId);
    if (index < 0) return null;

    const current = registry.communities[index];
    registry.communities[index] = {
      ...current,
      selectionCount: (Number(current.selectionCount) || 0) + 1,
      lastSelectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveRegistry(registry);
    return registry.communities[index];
  },

  getStats: () => {
    const registry = loadRegistry();
    return getUsageStats(registry.communities);
  },
};
