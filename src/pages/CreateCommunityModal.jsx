import { useCallback, useEffect, useState } from 'react';
import { Button, LocationPicker } from '../components';
import { communityMaps } from '../services';
import { api } from '../services';
import './CreateCommunityModal.scss';

const COMMUNITY_FORM_STORAGE_KEY = 'communityFormDraft';
const COMMUNITY_DOC_NAME_KEY = 'communityDocName';
const BUILDING_TYPE_HOUSE = 'HOUSE';
const BUILDING_TYPE_APARTMENT = 'APARTMENT';
const BUILDING_TYPE_MIXED = 'MIXED';

const communityFormDefaults = {
  name: '',
  buildingType: BUILDING_TYPE_HOUSE,
  towerLabel: '',
  address: '',
  commune: '',
  city: '',
  postalCode: '',
  adminPhone: '',
  adminEmail: '',
  adminName: '',
  adminDocument: '',
  floors: '',
  unitsCount: '',
  houseUnitsCount: '',
  apartmentUnitsCount: '',
  latitude: '',
  longitude: '',
  proofText: '',
};

const formatRut = (value) => {
  let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length === 0) return '';
  if (clean.length === 1) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
};

const getDefaultCommunityStatus = () => ({
  loading: false,
  message: null,
  error: null,
  success: false,
  status: null,
});

const formatNumber = (value) => {
  return new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(Number(value) || 0);
};

const parsePositiveInteger = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const normalizeBuildingType = (value) => {
  if (typeof value !== 'string') return BUILDING_TYPE_HOUSE;
  const normalized = value.trim().toUpperCase();
  if ([BUILDING_TYPE_HOUSE, BUILDING_TYPE_APARTMENT, BUILDING_TYPE_MIXED].includes(normalized)) {
    return normalized;
  }
  return BUILDING_TYPE_HOUSE;
};

const resolveUnitsCountByType = ({ buildingType, houseUnitsCount, apartmentUnitsCount, unitsCount }) => {
  if (buildingType === BUILDING_TYPE_HOUSE) {
    return parsePositiveInteger(houseUnitsCount ?? unitsCount);
  }
  if (buildingType === BUILDING_TYPE_APARTMENT) {
    return parsePositiveInteger(apartmentUnitsCount ?? unitsCount);
  }
  if (buildingType === BUILDING_TYPE_MIXED) {
    const houses = parsePositiveInteger(houseUnitsCount) || 0;
    const apartments = parsePositiveInteger(apartmentUnitsCount) || 0;
    const total = houses + apartments;
    return total > 0 ? total : null;
  }
  return parsePositiveInteger(unitsCount);
};

const CreateCommunityModal = ({ open, onClose }) => {
  const [step, setStep] = useState(1);
  const [communityForm, setCommunityForm] = useState(() => {
    const stored = localStorage.getItem(COMMUNITY_FORM_STORAGE_KEY);
    if (stored) {
      try {
        return { ...communityFormDefaults, ...JSON.parse(stored) };
      } catch (error) {
        console.warn('[Community form] No se pudo parsear el borrador guardado', error);
      }
    }
    return communityFormDefaults;
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [documentName, setDocumentName] = useState(() => localStorage.getItem(COMMUNITY_DOC_NAME_KEY) || '');
  const [communityStatus, setCommunityStatus] = useState(getDefaultCommunityStatus);
  const [mappedCommunities, setMappedCommunities] = useState([]);
  const [communityUsageStats, setCommunityUsageStats] = useState(() => communityMaps.getStats());
  const [selectedMappedCommunityId, setSelectedMappedCommunityId] = useState('');

  useEffect(() => {
    localStorage.setItem(COMMUNITY_FORM_STORAGE_KEY, JSON.stringify(communityForm));
    if (documentName) {
      localStorage.setItem(COMMUNITY_DOC_NAME_KEY, documentName);
    } else {
      localStorage.removeItem(COMMUNITY_DOC_NAME_KEY);
    }
  }, [communityForm, documentName]);

  const syncCommunityRegistry = useCallback(() => {
    setMappedCommunities(communityMaps.list());
    setCommunityUsageStats(communityMaps.getStats());
  }, []);

  useEffect(() => {
    syncCommunityRegistry();
  }, [syncCommunityRegistry]);

  useEffect(() => {
    if (open) {
      setCommunityStatus(getDefaultCommunityStatus());
      setStep(1);
      syncCommunityRegistry();
    }
  }, [open, syncCommunityRegistry]);

  const resetCommunityState = () => {
    setStep(1);
    setCommunityForm(communityFormDefaults);
    setCommunityStatus(getDefaultCommunityStatus());
    setDocumentFile(null);
    setDocumentName('');
    setSelectedMappedCommunityId('');
    localStorage.removeItem(COMMUNITY_FORM_STORAGE_KEY);
    localStorage.removeItem(COMMUNITY_DOC_NAME_KEY);
  };

  const handleCloseAndReset = () => {
    onClose();
    resetCommunityState();
  };

  const handleProofFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSizeBytes = 50 * 1024 * 1024;
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const isAllowedType = allowedMimeTypes.includes(file.type) || allowedExtensions.includes(fileExtension);

    if (!isAllowedType) {
      setDocumentFile(null);
      setDocumentName('');
      setCommunityStatus({
        ...getDefaultCommunityStatus(),
        error: 'Formato inválido. Solo se permite PDF, JPG, JPEG o PNG.',
      });
      event.target.value = '';
      return;
    }

    if (file.size > maxSizeBytes) {
      setDocumentFile(null);
      setDocumentName('');
      setCommunityStatus({
        ...getDefaultCommunityStatus(),
        error: 'El archivo excede el tamaño máximo permitido de 50MB.',
      });
      event.target.value = '';
      return;
    }

    setCommunityStatus((prev) => ({ ...prev, error: '' }));
    setDocumentFile(file);
    setDocumentName(file.name);
    setCommunityForm((prev) => ({
      ...prev,
      proofText: prev.proofText?.trim() ? prev.proofText : `Documento adjunto: ${file.name}`,
    }));
  };

  const applyMappedCommunityToForm = (mappedCommunity, options = {}) => {
    if (!mappedCommunity) return;
    const { recordSelection = false } = options;
    const latitude = Number(mappedCommunity.latitude);
    const longitude = Number(mappedCommunity.longitude);
    const mappedBuildingTypeRaw = typeof mappedCommunity.buildingType === 'string'
      ? mappedCommunity.buildingType.trim().toUpperCase()
      : '';
    const mappedBuildingType = [BUILDING_TYPE_HOUSE, BUILDING_TYPE_APARTMENT, BUILDING_TYPE_MIXED].includes(mappedBuildingTypeRaw)
      ? mappedBuildingTypeRaw
      : null;
    const mappedUnitsCount = parsePositiveInteger(mappedCommunity.unitsCount);
    const mappedHouseUnitsCount = parsePositiveInteger(mappedCommunity.houseUnitsCount);
    const mappedApartmentUnitsCount = parsePositiveInteger(mappedCommunity.apartmentUnitsCount);

    setCommunityForm((prev) => ({
      ...prev,
      name: mappedCommunity.name || prev.name,
      address: mappedCommunity.address || prev.address,
      commune: mappedCommunity.commune || prev.commune,
      city: mappedCommunity.city || prev.city,
      postalCode: mappedCommunity.postalCode || prev.postalCode,
      towerLabel: mappedCommunity.towerLabel || prev.towerLabel,
      buildingType: mappedBuildingType || prev.buildingType,
      unitsCount: mappedUnitsCount ?? prev.unitsCount,
      houseUnitsCount: mappedHouseUnitsCount
        ?? ((mappedBuildingType === BUILDING_TYPE_HOUSE && mappedUnitsCount) ? mappedUnitsCount : prev.houseUnitsCount),
      apartmentUnitsCount: mappedApartmentUnitsCount
        ?? ((mappedBuildingType === BUILDING_TYPE_APARTMENT && mappedUnitsCount) ? mappedUnitsCount : prev.apartmentUnitsCount),
      floors: mappedCommunity.floors ?? prev.floors,
      latitude: Number.isFinite(latitude) ? latitude.toFixed(6) : prev.latitude,
      longitude: Number.isFinite(longitude) ? longitude.toFixed(6) : prev.longitude,
    }));

    if (mappedCommunity.id) {
      setSelectedMappedCommunityId(String(mappedCommunity.id));
      if (recordSelection) {
        communityMaps.registerSelection(mappedCommunity.id);
        syncCommunityRegistry();
      }
    }
  };

  const handleMappedCommunityChange = (event) => {
    const nextId = event.target.value;
    setSelectedMappedCommunityId(nextId);

    if (!nextId) {
      return;
    }

    const mappedCommunity = mappedCommunities.find((item) => String(item.id) === nextId);
    if (mappedCommunity) {
      applyMappedCommunityToForm(mappedCommunity, { recordSelection: true });
    }
  };

  const handleSavedLocationSelect = (mappedCommunity) => {
    if (mappedCommunity?.id) {
      setSelectedMappedCommunityId(String(mappedCommunity.id));
    }
  };

  const handleLocationSelect = ({ lat, lng, address, postcode, city, state, communityId }) => {
    if (typeof lat === 'number' && typeof lng === 'number') {
      setCommunityForm((prev) => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
        address: address || prev.address,
        city: city || prev.city,
        commune: state || prev.commune,
        postalCode: postcode || prev.postalCode,
      }));
    }

    if (communityId) {
      setSelectedMappedCommunityId(String(communityId));
      communityMaps.registerSelection(communityId);
      syncCommunityRegistry();
    } else {
      setSelectedMappedCommunityId('');
    }
  };

  const handleBuildingTypeChange = (event) => {
    const nextType = normalizeBuildingType(event.target.value);
    setCommunityForm((prev) => {
      const next = { ...prev, buildingType: nextType };

      if (nextType === BUILDING_TYPE_HOUSE) {
        next.apartmentUnitsCount = '';
        next.floors = '';
      }

      if (nextType === BUILDING_TYPE_APARTMENT) {
        next.houseUnitsCount = '';
      }

      return next;
    });
  };

  const handleCommunitySubmit = async (event) => {
    event.preventDefault();
    if (!documentFile) {
      setCommunityStatus({ ...getDefaultCommunityStatus(), error: 'Adjunta el documento de propiedad (PDF o imagen).' });
      return;
    }

    const buildingType = normalizeBuildingType(communityForm.buildingType);
    const houseUnitsCount = parsePositiveInteger(communityForm.houseUnitsCount);
    const apartmentUnitsCount = parsePositiveInteger(communityForm.apartmentUnitsCount);
    const floors = buildingType === BUILDING_TYPE_HOUSE ? null : parsePositiveInteger(communityForm.floors);
    const unitsCount = resolveUnitsCountByType({
      buildingType,
      houseUnitsCount,
      apartmentUnitsCount,
      unitsCount: communityForm.unitsCount,
    });

    if (buildingType === BUILDING_TYPE_HOUSE && !houseUnitsCount) {
      setCommunityStatus({ ...getDefaultCommunityStatus(), error: 'Ingresa el número de casas (unidades).' });
      return;
    }
    if (buildingType === BUILDING_TYPE_APARTMENT && !apartmentUnitsCount) {
      setCommunityStatus({ ...getDefaultCommunityStatus(), error: 'Ingresa el número de departamentos (unidades).' });
      return;
    }
    if (buildingType === BUILDING_TYPE_MIXED && (!houseUnitsCount || !apartmentUnitsCount)) {
      setCommunityStatus({ ...getDefaultCommunityStatus(), error: 'Ingresa el número de casas y departamentos.' });
      return;
    }
    if ((buildingType === BUILDING_TYPE_APARTMENT || buildingType === BUILDING_TYPE_MIXED) && !floors) {
      setCommunityStatus({ ...getDefaultCommunityStatus(), error: 'Ingresa el número de pisos.' });
      return;
    }
    if (!unitsCount) {
      setCommunityStatus({ ...getDefaultCommunityStatus(), error: 'No pudimos calcular la cantidad total de unidades.' });
      return;
    }

    setCommunityStatus({ ...getDefaultCommunityStatus(), loading: true });
    try {
      const payload = {
        ...communityForm,
        documentFile,
        buildingType,
        houseUnitsCount,
        apartmentUnitsCount,
        floors,
        unitsCount,
        latitude: communityForm.latitude ? Number(communityForm.latitude) : null,
        longitude: communityForm.longitude ? Number(communityForm.longitude) : null,
        proofText: communityForm.proofText?.trim() || `Documento adjunto: ${documentFile.name}`,
      };
      const response = await api.buildings.createRequest(payload);
      communityMaps.registerCommunity({
        ...communityForm,
        id: selectedMappedCommunityId || undefined,
        latitude: payload.latitude,
        longitude: payload.longitude,
        buildingType: payload.buildingType,
        houseUnitsCount: payload.houseUnitsCount,
        apartmentUnitsCount: payload.apartmentUnitsCount,
        floors: payload.floors,
        unitsCount: payload.unitsCount,
        source: 'community-request',
        status: response?.status || 'PENDING',
      });
      syncCommunityRegistry();
      setCommunityStatus({
        ...getDefaultCommunityStatus(),
        success: true,
        message: '¡Solicitud enviada!',
        status: response?.status || 'PENDING',
      });
    } catch (error) {
      setCommunityStatus({ ...getDefaultCommunityStatus(), error: error.message });
    }
  };

  const handleNewCommunityRequest = () => {
    resetCommunityState();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="community-modal" onClick={(e) => e.stopPropagation()}>
        <header className="community-modal__header">
          <div>
            <p className="eyebrow">{communityStatus.success ? 'Solicitud enviada' : 'Solicitud de comunidad'}</p>
            <h3>{communityStatus.success ? '¡Listo! Hemos recibido tu solicitud' : 'Crear mi comunidad'}</h3>
            {!communityStatus.success && (
              <div className="stepper">
                <span className={step === 1 ? 'step-current' : 'step-done'}>
                  <span className="stepper__number">1</span>
                  <span className="stepper__label">Administrador</span>
                </span>
                <span className={step === 2 ? 'step-current' : step > 2 ? 'step-done' : 'step-upcoming'}>
                  <span className="stepper__number">2</span>
                  <span className="stepper__label">Comunidad</span>
                </span>
                <span className={step === 3 ? 'step-current' : 'step-upcoming'}>
                  <span className="stepper__number">3</span>
                  <span className="stepper__label">Documento</span>
                </span>
              </div>
            )}
          </div>
          <button type="button" className="close-button" onClick={handleCloseAndReset} aria-label="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </header>

        {communityStatus.success ? (
          <div className="community-success">
            <div className="community-success__icon">✓</div>
            <h4>¡Solicitud enviada!</h4>
            <p className="community-success__note">
              Tu solicitud ha sido recibida y será revisada por nuestro equipo.
              Te enviaremos un correo con el resultado.
            </p>
            <div className="community-success__actions">
              <Button type="button" variant="primary" onClick={handleCloseAndReset}>Volver al inicio</Button>
              <Button type="button" variant="ghost" onClick={handleNewCommunityRequest}>Nueva solicitud</Button>
            </div>
          </div>
        ) : (
          <div className="community-modal__content">
            <form className="community-form" onSubmit={handleCommunitySubmit}>
              {communityStatus.error && (
                <p className="error-text">{communityStatus.error}</p>
              )}

              {step === 1 && (
                <div className="form-page">
                  <p className="eyebrow">Datos del administrador</p>
                  <div className="form-grid">
                    <label>
                      Nombre completo *
                      <input
                        type="text"
                        placeholder="Ej: Juan Pérez"
                        value={communityForm.adminName}
                        onChange={(e) => setCommunityForm({ ...communityForm, adminName: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      Correo electrónico
                      <input
                        type="email"
                        placeholder="admin@ejemplo.com"
                        value={communityForm.adminEmail}
                        onChange={(e) => setCommunityForm({ ...communityForm, adminEmail: e.target.value })}
                      />
                    </label>
                    <label>
                      Teléfono
                      <input
                        type="tel"
                        placeholder="+56 9 1234 5678"
                        value={communityForm.adminPhone}
                        onChange={(e) => setCommunityForm({ ...communityForm, adminPhone: e.target.value })}
                      />
                    </label>
                    <label>
                      RUT / Documento
                      <input
                        type="text"
                        placeholder="12.345.678-9"
                        maxLength={12}
                        value={communityForm.adminDocument}
                        onChange={(e) => setCommunityForm({ ...communityForm, adminDocument: formatRut(e.target.value) })}
                      />
                    </label>
                  </div>
                  <div className="community-modal__actions">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button type="button" variant="primary" onClick={() => setStep(2)}>Siguiente</Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="form-page">
                  <p className="eyebrow">Datos de la comunidad</p>
                  <div className="form-grid">
                    <label>
                      Nombre del condominio *
                      <input
                        type="text"
                        placeholder="Ej: Edificio Plaza Central"
                        value={communityForm.name}
                        onChange={(e) => setCommunityForm({ ...communityForm, name: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      Dirección *
                      <input
                        type="text"
                        placeholder="Av. Libertad 123"
                        value={communityForm.address}
                        onChange={(e) => setCommunityForm({ ...communityForm, address: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      Comuna *
                      <input
                        type="text"
                        placeholder="Santiago"
                        value={communityForm.commune}
                        onChange={(e) => setCommunityForm({ ...communityForm, commune: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      Ciudad
                      <input
                        type="text"
                        placeholder="Región Metropolitana"
                        value={communityForm.city}
                        onChange={(e) => setCommunityForm({ ...communityForm, city: e.target.value })}
                      />
                    </label>
                    <label>
                      Torre / Etiqueta
                      <input
                        type="text"
                        placeholder="Torre A"
                        value={communityForm.towerLabel}
                        onChange={(e) => setCommunityForm({ ...communityForm, towerLabel: e.target.value })}
                      />
                    </label>
                    <label>
                      Tipo de comunidad *
                      <select
                        value={communityForm.buildingType}
                        onChange={handleBuildingTypeChange}
                      >
                        <option value={BUILDING_TYPE_HOUSE}>Casas</option>
                        <option value={BUILDING_TYPE_APARTMENT}>Departamentos</option>
                        <option value={BUILDING_TYPE_MIXED}>Ambos</option>
                      </select>
                    </label>

                    {communityForm.buildingType === BUILDING_TYPE_HOUSE && (
                      <label>
                        Número de casas (unidades) *
                        <input
                          type="number"
                          min="1"
                          max="9999"
                          value={communityForm.houseUnitsCount}
                          onChange={(e) => setCommunityForm({ ...communityForm, houseUnitsCount: e.target.value })}
                          required
                        />
                      </label>
                    )}

                    {communityForm.buildingType === BUILDING_TYPE_APARTMENT && (
                      <>
                        <label>
                          Número de departamentos (unidades) *
                          <input
                            type="number"
                            min="1"
                            max="9999"
                            value={communityForm.apartmentUnitsCount}
                            onChange={(e) => setCommunityForm({ ...communityForm, apartmentUnitsCount: e.target.value })}
                            required
                          />
                        </label>
                        <label>
                          Número de pisos *
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={communityForm.floors}
                            onChange={(e) => setCommunityForm({ ...communityForm, floors: e.target.value })}
                            required
                          />
                        </label>
                      </>
                    )}

                    {communityForm.buildingType === BUILDING_TYPE_MIXED && (
                      <>
                        <label>
                          Número de casas (unidades) *
                          <input
                            type="number"
                            min="1"
                            max="9999"
                            value={communityForm.houseUnitsCount}
                            onChange={(e) => setCommunityForm({ ...communityForm, houseUnitsCount: e.target.value })}
                            required
                          />
                        </label>
                        <label>
                          Número de departamentos (unidades) *
                          <input
                            type="number"
                            min="1"
                            max="9999"
                            value={communityForm.apartmentUnitsCount}
                            onChange={(e) => setCommunityForm({ ...communityForm, apartmentUnitsCount: e.target.value })}
                            required
                          />
                        </label>
                        <label>
                          Número de pisos *
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={communityForm.floors}
                            onChange={(e) => setCommunityForm({ ...communityForm, floors: e.target.value })}
                            required
                          />
                        </label>
                      </>
                    )}
                  </div>
                  <div className="community-map-summary">
                    <p className="community-map-summary__title">Mapa comunitario DOMU</p>
                    <div className="community-map-summary__stats" role="status" aria-live="polite">
                      <div className="community-map-summary__stat">
                        <span>Condominios mapeados</span>
                        <strong>{formatNumber(communityUsageStats.mappedCommunities)}</strong>
                      </div>
                      <div className="community-map-summary__stat">
                        <span>Unidades estimadas</span>
                        <strong>{formatNumber(communityUsageStats.estimatedUsers)}</strong>
                      </div>
                      <div className="community-map-summary__stat">
                        <span>Veces seleccionado</span>
                        <strong>{formatNumber(communityUsageStats.totalSelections)}</strong>
                      </div>
                    </div>
                    {mappedCommunities.length > 0 && (
                      <label className="community-map-summary__select">
                        Elegir condominio guardado
                        <select value={selectedMappedCommunityId} onChange={handleMappedCommunityChange}>
                          <option value="">Seleccionar del historial</option>
                          {mappedCommunities.map((mappedCommunity) => (
                            <option key={mappedCommunity.id} value={mappedCommunity.id}>
                              {mappedCommunity.name || 'Condominio sin nombre'}
                              {mappedCommunity.commune ? ` - ${mappedCommunity.commune}` : ''}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>
                  <p className="eyebrow community-form__location-label">Ubicación en el mapa (opcional)</p>
                  <LocationPicker
                    latitude={communityForm.latitude}
                    longitude={communityForm.longitude}
                    onSelect={handleLocationSelect}
                    savedLocations={mappedCommunities}
                    onSavedLocationSelect={handleSavedLocationSelect}
                  />
                  <div className="community-modal__actions">
                    <Button type="button" variant="ghost" onClick={() => setStep(1)}>Atrás</Button>
                    <Button type="button" variant="primary" onClick={() => setStep(3)}>Siguiente</Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="form-page">
                  <p className="eyebrow">Documento de acreditación</p>
                  <label>
                    Texto de acreditación *
                    <textarea
                      rows={3}
                      placeholder="Ej: Adjunto acta de asamblea de nombramiento como administrador"
                      value={communityForm.proofText}
                      onChange={(e) => setCommunityForm({ ...communityForm, proofText: e.target.value })}
                      required
                    />
                  </label>
                  <label className="file-input">
                    Documento adjunto (PDF o imagen) *
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleProofFile} />
                  </label>
                  {documentName && <p className="info-text">Archivo seleccionado: {documentName}</p>}
                  <div className="community-modal__actions">
                    <Button type="button" variant="ghost" onClick={() => setStep(2)}>Atrás</Button>
                    <Button type="submit" variant="primary" disabled={communityStatus.loading}>
                      {communityStatus.loading ? 'Enviando...' : 'Enviar solicitud'}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCommunityModal;
