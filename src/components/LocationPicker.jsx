import PropTypes from 'prop-types';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Map, Marker, ZoomControl } from 'pigeon-maps';

// Centro por defecto: Concepción, Chile
const DEFAULT_CENTER = [-36.82699, -73.04977];
const MAPTILER_KEY = String(import.meta.env.VITE_MAPTILER_KEY || '').trim();
const HAS_MAPTILER = MAPTILER_KEY.length > 0;
const AUTOCOMPLETE_MIN_CHARS = 3;
const AUTOCOMPLETE_LIMIT = 5;
const AUTOCOMPLETE_DEBOUNCE_MS = 350;
const HAS_DIGITS_REGEX = /\d/;

const parseMaptilerFeature = (feature) => {
  if (!feature) return {};

  const context = Array.isArray(feature.context) ? feature.context : [];
  const findContext = (...prefixes) => {
    for (const prefix of prefixes) {
      const match = context.find((item) => String(item?.id || '').startsWith(prefix));
      if (match?.text) return match.text;
      if (match?.name) return match.name;
    }
    return '';
  };

  return {
    address: feature.place_name || feature.place_name_es || feature.text || '',
    postcode: findContext('postcode'),
    city: findContext('place', 'locality', 'municipality') || feature.text || '',
    state: findContext('region', 'district', 'county') || '',
  };
};

const getMaptilerCoordinates = (feature) => {
  if (!feature) return null;
  const coordinates = feature.center || feature?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const [lng, lat] = coordinates.map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
};

const parseMaptilerSuggestion = (feature, index = 0) => {
  const coords = getMaptilerCoordinates(feature);
  if (!coords) return null;

  const extra = parseMaptilerFeature(feature);
  const label = extra.address || feature?.place_name || feature?.text || '';
  if (!label) return null;

  return {
    id: `maptiler-${feature?.id || `${coords.lat}-${coords.lng}-${index}`}`,
    label,
    lat: coords.lat,
    lng: coords.lng,
    extra,
  };
};

const parseNominatimSuggestion = (result, index = 0) => {
  const lat = Number(result?.lat);
  const lng = Number(result?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const address = result?.address || {};
  const city = address.city || address.town || address.village || address.county || '';
  const state = address.state || address.region || '';
  const postcode = address.postcode || '';
  const label = result?.display_name || '';
  if (!label) return null;

  return {
    id: `nominatim-${result?.place_id || `${lat}-${lng}-${index}`}`,
    label,
    lat,
    lng,
    extra: {
      address: label,
      city,
      state,
      postcode,
    },
  };
};

const dedupeSuggestions = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${Number(item.lat).toFixed(6)}|${Number(item.lng).toFixed(6)}|${String(item.label).toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const includesStreetNumber = (text) => HAS_DIGITS_REGEX.test(String(text || ''));

const escapeRegExp = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const extractHouseNumber = (text) => {
  const match = String(text || '').match(/\b\d+[A-Za-z]?\b/);
  return match ? match[0] : '';
};

const hasHouseNumber = (text, houseNumber) => {
  if (!houseNumber) return false;
  const pattern = new RegExp(`\\b${escapeRegExp(houseNumber)}\\b`, 'i');
  return pattern.test(String(text || ''));
};

const suggestionMatchesHouseNumber = (suggestion, houseNumber) => (
  hasHouseNumber(suggestion?.label, houseNumber) ||
  hasHouseNumber(suggestion?.extra?.address, houseNumber)
);

const buildTypedAddressSuggestion = (query, fallbackSuggestion) => {
  if (!fallbackSuggestion) return null;
  const city = fallbackSuggestion.extra?.city || '';
  const state = fallbackSuggestion.extra?.state || '';
  const suffix = [city, state].filter(Boolean).join(', ');
  const label = suffix ? `${query}, ${suffix}` : query;
  return {
    ...fallbackSuggestion,
    id: `typed-address-${String(query).toLowerCase().replace(/\s+/g, '-').slice(0, 80)}`,
    label,
    extra: {
      ...fallbackSuggestion.extra,
      address: query,
    },
  };
};

const LocationPicker = ({ latitude, longitude, onSelect, className, savedLocations, onSavedLocationSelect }) => {
  const hasCoords = useMemo(() => (
    latitude !== undefined &&
    latitude !== null &&
    longitude !== undefined &&
    longitude !== null &&
    latitude !== '' &&
    longitude !== '' &&
    !Number.isNaN(Number(latitude)) &&
    !Number.isNaN(Number(longitude))
  ), [latitude, longitude]);

  const [mapCenter, setMapCenter] = useState(() => (hasCoords ? [Number(latitude), Number(longitude)] : DEFAULT_CENTER));
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState(-1);
  const autocompleteRequestRef = useRef(0);
  const blurTimeoutRef = useRef(null);
  const mapProvider = useMemo(() => {
    if (!HAS_MAPTILER) return undefined;
    return (x, y, z, dpr) => {
      const scale = dpr >= 2 ? '@2x' : '';
      return `https://api.maptiler.com/maps/streets-v2/256/${z}/${x}/${y}${scale}.png?key=${MAPTILER_KEY}`;
    };
  }, []);
  const mappedCommunities = useMemo(
    () => (Array.isArray(savedLocations) ? savedLocations : [])
      .map((item) => ({
        ...item,
        latitude: Number(item?.latitude),
        longitude: Number(item?.longitude),
      }))
      .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)),
    [savedLocations]
  );

  useEffect(() => {
    if (hasCoords) {
      setMapCenter([Number(latitude), Number(longitude)]);
    }
  }, [hasCoords, latitude, longitude]);

  useEffect(() => {
    if (!HAS_MAPTILER) {
      setStatus((prev) => prev || 'Mapa en modo OpenStreetMap. Configura VITE_MAPTILER_KEY para habilitar MapTiler Free.');
    }
  }, []);

  useEffect(() => () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
  }, []);

  const applySelection = useCallback((lat, lng, extra = {}) => {
    setMapCenter([lat, lng]);
    const payload = { lat, lng, ...extra };
    onSelect?.(payload);
  }, [onSelect]);

  const fetchReverse = useCallback(async (lat, lng) => {
    if (HAS_MAPTILER) {
      try {
        const url = `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_KEY}&language=es&limit=1`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          const feature = Array.isArray(data?.features) ? data.features[0] : null;
          const parsed = parseMaptilerFeature(feature);
          if (parsed.address) {
            return parsed;
          }
        }
      } catch {
        // fallback to Nominatim
      }
    }

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const data = await res.json();
      const addressText = data?.display_name;
      const addr = data?.address || {};
      const city = addr.city || addr.town || addr.village || '';
      const state = addr.state || '';
      const postcode = addr.postcode || '';
      return { address: addressText, postcode, city, state };
    } catch {
      return {};
    }
  }, []);

  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.trim().length < AUTOCOMPLETE_MIN_CHARS) {
      return [];
    }

    const queryHasStreetNumber = includesStreetNumber(query);
    const queryHouseNumber = extractHouseNumber(query);
    let maptilerSuggestions = [];
    let nominatimSuggestions = [];

    if (HAS_MAPTILER) {
      try {
        const maptilerUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_KEY}&language=es&limit=${AUTOCOMPLETE_LIMIT}&autocomplete=true`;
        const maptilerRes = await fetch(maptilerUrl, { headers: { Accept: 'application/json' } });
        if (maptilerRes.ok) {
          const maptilerData = await maptilerRes.json();
          maptilerSuggestions = (Array.isArray(maptilerData?.features) ? maptilerData.features : [])
            .map((feature, index) => parseMaptilerSuggestion(feature, index))
            .filter(Boolean);
        }
      } catch {
        // fallback a Nominatim
      }
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=${AUTOCOMPLETE_LIMIT}&accept-language=es`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) {
        return dedupeSuggestions(maptilerSuggestions).slice(0, AUTOCOMPLETE_LIMIT);
      }
      const data = await res.json();
      nominatimSuggestions = (Array.isArray(data) ? data : [])
        .map((result, index) => parseNominatimSuggestion(result, index))
        .filter(Boolean);
    } catch {
      nominatimSuggestions = [];
    }

    const merged = queryHasStreetNumber
      ? [...nominatimSuggestions, ...maptilerSuggestions]
      : [...maptilerSuggestions, ...nominatimSuggestions];

    const deduped = dedupeSuggestions(merged);
    if (!queryHasStreetNumber) {
      return deduped.slice(0, AUTOCOMPLETE_LIMIT);
    }

    const withSameHouseNumber = deduped.filter((item) => suggestionMatchesHouseNumber(item, queryHouseNumber));
    if (withSameHouseNumber.length > 0) {
      return withSameHouseNumber.slice(0, AUTOCOMPLETE_LIMIT);
    }

    const typedSuggestion = buildTypedAddressSuggestion(query, deduped[0]);
    const withTypedFallback = typedSuggestion ? [typedSuggestion, ...deduped] : deduped;
    return withTypedFallback.slice(0, AUTOCOMPLETE_LIMIT);
  }, []);

  useEffect(() => {
    const query = search.trim();

    if (query.length < AUTOCOMPLETE_MIN_CHARS) {
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightedSuggestionIndex(-1);
      setIsSuggesting(false);
      return;
    }

    const requestId = autocompleteRequestRef.current + 1;
    autocompleteRequestRef.current = requestId;

    const timeoutId = setTimeout(async () => {
      setIsSuggesting(true);
      const nextSuggestions = await fetchSuggestions(query);

      if (autocompleteRequestRef.current !== requestId) {
        return;
      }

      setSuggestions(nextSuggestions);
      setShowSuggestions(true);
      setHighlightedSuggestionIndex(-1);
      setIsSuggesting(false);
    }, AUTOCOMPLETE_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [fetchSuggestions, search]);

  const selectSuggestion = useCallback((suggestion) => {
    if (!suggestion) return;

    const label = suggestion.label || suggestion.extra?.address || '';
    setSearch(label);
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightedSuggestionIndex(-1);
    setStatus('Dirección sugerida aplicada.');
    applySelection(suggestion.lat, suggestion.lng, {
      ...suggestion.extra,
      address: suggestion.extra?.address || label,
    });
  }, [applySelection]);

  const handleSearchInputFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    if (suggestions.length > 0 || isSuggesting) {
      setShowSuggestions(true);
    }
  };

  const handleSearchInputBlur = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    blurTimeoutRef.current = setTimeout(() => {
      setShowSuggestions(false);
    }, 120);
  };

  const handleSearchInputChange = (event) => {
    setSearch(event.target.value);
    setShowSuggestions(true);
  };

  const handleSearchInputKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      if (!suggestions.length) return;
      event.preventDefault();
      setShowSuggestions(true);
      setHighlightedSuggestionIndex((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      if (!suggestions.length) return;
      event.preventDefault();
      setShowSuggestions(true);
      setHighlightedSuggestionIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      return;
    }

    if (event.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedSuggestionIndex(-1);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (showSuggestions && highlightedSuggestionIndex >= 0 && suggestions.length > 0) {
        selectSuggestion(suggestions[highlightedSuggestionIndex]);
        return;
      }
      void handleSearch();
    }
  };

  const handleClick = async ({ latLng }) => {
    const [lat, lng] = latLng || [];
    if (typeof lat === 'number' && typeof lng === 'number') {
      setShowSuggestions(false);
      setStatus('Obteniendo dirección...');
      const extra = await fetchReverse(lat, lng);
      setStatus(extra.address ? 'Dirección aproximada encontrada.' : 'Coordenadas seleccionadas.');
      applySelection(lat, lng, extra);
    }
  };

  const handleSearch = async () => {
    const query = search.trim();
    const queryHasStreetNumber = includesStreetNumber(query);
    const queryHouseNumber = extractHouseNumber(query);

    if (!query) {
      return;
    }
    if (isSearching) {
      return;
    }

    const selectedSuggestion = highlightedSuggestionIndex >= 0
      ? suggestions[highlightedSuggestionIndex]
      : null;
    if (selectedSuggestion) {
      selectSuggestion(selectedSuggestion);
      return;
    }

    setIsSearching(true);
    setStatus('Buscando dirección...');
    try {
      if (HAS_MAPTILER && !queryHasStreetNumber) {
        const maptilerUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_KEY}&language=es&limit=1`;
        const maptilerRes = await fetch(maptilerUrl, { headers: { Accept: 'application/json' } });
        if (maptilerRes.ok) {
          const maptilerData = await maptilerRes.json();
          const feature = Array.isArray(maptilerData?.features) ? maptilerData.features[0] : null;
          const suggestion = parseMaptilerSuggestion(feature);
          if (suggestion) {
            setStatus('Ubicación encontrada, obteniendo dirección...');
            const extra = suggestion.extra || {};
            setStatus(extra.address ? 'Dirección aproximada encontrada.' : 'Ubicación encontrada.');
            applySelection(suggestion.lat, suggestion.lng, extra);
            setSuggestions([]);
            setShowSuggestions(false);
            setHighlightedSuggestionIndex(-1);
            return;
          }
        }
      }

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=1&accept-language=es`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const firstSuggestion = parseNominatimSuggestion(data[0]);
        if (firstSuggestion) {
          setStatus('Ubicación encontrada, obteniendo dirección...');
          const hasMatchingHouseNumber = suggestionMatchesHouseNumber(firstSuggestion, queryHouseNumber);
          const extra = firstSuggestion.extra?.address
            ? firstSuggestion.extra
            : await fetchReverse(firstSuggestion.lat, firstSuggestion.lng);
          const normalizedExtra = queryHasStreetNumber && !hasMatchingHouseNumber
            ? { ...extra, address: query }
            : extra;
          setStatus(normalizedExtra.address ? 'Dirección aproximada encontrada.' : 'Ubicación encontrada.');
          applySelection(firstSuggestion.lat, firstSuggestion.lng, normalizedExtra);
          setSuggestions([]);
          setShowSuggestions(false);
          setHighlightedSuggestionIndex(-1);
          return;
        }
      }

      if (HAS_MAPTILER && queryHasStreetNumber) {
        const maptilerUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_KEY}&language=es&limit=1`;
        const maptilerRes = await fetch(maptilerUrl, { headers: { Accept: 'application/json' } });
        if (maptilerRes.ok) {
          const maptilerData = await maptilerRes.json();
          const feature = Array.isArray(maptilerData?.features) ? maptilerData.features[0] : null;
          const suggestion = parseMaptilerSuggestion(feature);
          if (suggestion) {
            setStatus('Ubicación encontrada, obteniendo dirección...');
            const hasMatchingHouseNumber = suggestionMatchesHouseNumber(suggestion, queryHouseNumber);
            const extra = suggestion.extra || {};
            const normalizedExtra = !hasMatchingHouseNumber ? { ...extra, address: query } : extra;
            setStatus(normalizedExtra.address ? 'Dirección aproximada encontrada.' : 'Ubicación encontrada.');
            applySelection(suggestion.lat, suggestion.lng, normalizedExtra);
            setSuggestions([]);
            setShowSuggestions(false);
            setHighlightedSuggestionIndex(-1);
            return;
          }
        }
      }
      setStatus('No se encontraron resultados.');
    } catch {
      setStatus('Error buscando la dirección.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSavedMarkerClick = useCallback(({ event, payload }) => {
    event?.stopPropagation?.();
    const mappedCommunity = payload?.mappedCommunity;
    if (!mappedCommunity) return;

    setStatus(`Condominio seleccionado: ${mappedCommunity.name || 'Comunidad guardada'}.`);
    applySelection(mappedCommunity.latitude, mappedCommunity.longitude, {
      address: mappedCommunity.address || '',
      city: mappedCommunity.city || '',
      state: mappedCommunity.commune || '',
      communityId: mappedCommunity.id,
    });
    onSavedLocationSelect?.(mappedCommunity);
  }, [applySelection, onSavedLocationSelect]);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setStatus('Tu navegador no permite geolocalización.');
      return;
    }
    if (isLocating) {
      return;
    }
    setIsLocating(true);
    setShowSuggestions(false);
    setStatus('Obteniendo ubicación...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords || {};
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          fetchReverse(lat, lng).then((extra) => {
            applySelection(lat, lng, extra);
            setStatus(extra.address ? 'Ubicación actual aplicada.' : 'Ubicación actual aplicada (sin dirección).');
            setIsLocating(false);
          });
        } else {
          setStatus('No se pudo leer tu ubicación.');
          setIsLocating(false);
        }
      },
      () => {
        setStatus('No se pudo obtener tu ubicación.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  return (
    <div className={`location-picker ${className || ''}`}>
      <div className="location-picker__controls">
        <div className="location-picker__search">
          <div className="location-picker__search-input-wrap">
            <input
              type="text"
              placeholder="Buscar dirección o calle (ej: Av. O'Higgins 100, Concepción)"
              value={search}
              onChange={handleSearchInputChange}
              onFocus={handleSearchInputFocus}
              onBlur={handleSearchInputBlur}
              onKeyDown={handleSearchInputKeyDown}
              autoComplete="off"
              aria-label="Buscar dirección"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
            />
            {showSuggestions && (
              <div className="location-picker__suggestions" role="listbox">
                {isSuggesting && suggestions.length === 0 && (
                  <div className="location-picker__suggestions-empty">Buscando sugerencias...</div>
                )}
                {!isSuggesting && suggestions.length === 0 && search.trim().length >= AUTOCOMPLETE_MIN_CHARS && (
                  <div className="location-picker__suggestions-empty">Sin sugerencias para esa búsqueda.</div>
                )}
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className={`location-picker__suggestion${highlightedSuggestionIndex === index ? ' is-active' : ''}`}
                    role="option"
                    aria-selected={highlightedSuggestionIndex === index}
                    onMouseEnter={() => setHighlightedSuggestionIndex(index)}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectSuggestion(suggestion);
                    }}
                  >
                    <span className="location-picker__suggestion-main">{suggestion.label}</span>
                    <span className="location-picker__suggestion-meta">
                      {suggestion.extra?.city || suggestion.extra?.state || 'Dirección sugerida'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            className="location-picker__btn location-picker__btn--primary"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
        <div className="location-picker__actions">
          <button type="button" className="location-picker__btn" onClick={handleGeolocate} disabled={isLocating}>
            {isLocating ? 'Ubicando...' : 'Usar mi ubicación'}
          </button>
        </div>
      </div>
      <div className="location-picker__map-shell">
        <div className="location-picker__map">
          <Map
            height={300}
            defaultCenter={DEFAULT_CENTER}
            center={mapCenter}
            defaultZoom={14}
            minZoom={2}
            onClick={handleClick}
            provider={mapProvider}
            attribution={HAS_MAPTILER ? '© MapTiler © OpenStreetMap contributors' : undefined}
            animate
          >
            <ZoomControl />
            {mappedCommunities.map((mappedCommunity) => (
              <Marker
                key={`mapped-community-${mappedCommunity.id || `${mappedCommunity.latitude}-${mappedCommunity.longitude}`}`}
                anchor={[mappedCommunity.latitude, mappedCommunity.longitude]}
                color="#f16b32"
                payload={{ mappedCommunity }}
                onClick={handleSavedMarkerClick}
              />
            ))}
            {(hasCoords || mapCenter) && <Marker anchor={mapCenter} color="#53a497" />}
          </Map>
        </div>
      </div>
      <div className="location-picker__footer">
        <span className="location-picker__coords">
          Lat: {mapCenter ? Number(mapCenter[0]).toFixed(6) : '—'}
        </span>
        <span className="location-picker__coords">
          Lng: {mapCenter ? Number(mapCenter[1]).toFixed(6) : '—'}
        </span>
        {mappedCommunities.length > 0 && (
          <span className="location-picker__hint">
            Condominios guardados en mapa: {mappedCommunities.length}
          </span>
        )}
        <span className="location-picker__hint">Haz click en el mapa para fijar la ubicación exacta.</span>
      </div>
      {status && <div className="location-picker__status">{status}</div>}
    </div>
  );
};

LocationPicker.propTypes = {
  latitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  longitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelect: PropTypes.func,
  className: PropTypes.string,
  savedLocations: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    commune: PropTypes.string,
    latitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    longitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  })),
  onSavedLocationSelect: PropTypes.func,
};

export default LocationPicker;
