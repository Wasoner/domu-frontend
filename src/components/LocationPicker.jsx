import PropTypes from 'prop-types';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Map, Marker, ZoomControl } from 'pigeon-maps';

// Centro por defecto: Concepción, Chile
const DEFAULT_CENTER = [-36.82699, -73.04977];

const LocationPicker = ({ latitude, longitude, onSelect, className }) => {
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

  useEffect(() => {
    if (hasCoords) {
      setMapCenter([Number(latitude), Number(longitude)]);
    }
  }, [hasCoords, latitude, longitude]);

  const applySelection = useCallback((lat, lng, extra = {}) => {
    setMapCenter([lat, lng]);
    const payload = { lat, lng, ...extra };
    onSelect?.(payload);
  }, [onSelect]);

  const fetchReverse = useCallback(async (lat, lng) => {
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

  const handleClick = async ({ latLng }) => {
    const [lat, lng] = latLng || [];
    if (typeof lat === 'number' && typeof lng === 'number') {
      setStatus('Obteniendo dirección...');
      const extra = await fetchReverse(lat, lng);
      setStatus(extra.address ? 'Dirección aproximada encontrada.' : 'Coordenadas seleccionadas.');
      applySelection(lat, lng, extra);
    }
  };

  const handleSearch = async () => {
    if (!search || !search.trim()) {
      return;
    }
    if (isSearching) {
      return;
    }
    setIsSearching(true);
    setStatus('Buscando dirección...');
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&addressdetails=1&limit=1&accept-language=es`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const first = data[0];
        const lat = Number(first.lat);
        const lng = Number(first.lon);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setStatus('Ubicación encontrada, obteniendo dirección...');
          const extra = await fetchReverse(lat, lng);
          setStatus(extra.address ? 'Dirección aproximada encontrada.' : 'Ubicación encontrada.');
          applySelection(lat, lng, extra);
          setIsSearching(false);
          return;
        }
      }
      setStatus('No se encontraron resultados.');
    } catch {
      setStatus('Error buscando la dirección.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setStatus('Tu navegador no permite geolocalización.');
      return;
    }
    if (isLocating) {
      return;
    }
    setIsLocating(true);
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
          <input
            type="text"
            placeholder="Buscar dirección o calle (ej: Av. O'Higgins 100, Concepción)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
      <Map
        height={300}
        defaultCenter={DEFAULT_CENTER}
        center={mapCenter}
        defaultZoom={14}
        minZoom={2}
        onClick={handleClick}
        animate
      >
        <ZoomControl />
        {(hasCoords || mapCenter) && <Marker anchor={mapCenter} color="#53a497" />}
      </Map>
      <div className="location-picker__footer">
        <span className="location-picker__coords">
          Lat: {mapCenter ? Number(mapCenter[0]).toFixed(6) : '—'}
        </span>
        <span className="location-picker__coords">
          Lng: {mapCenter ? Number(mapCenter[1]).toFixed(6) : '—'}
        </span>
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
};

export default LocationPicker;
