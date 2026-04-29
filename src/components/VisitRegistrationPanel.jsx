import { useEffect, useMemo, useState, useCallback } from 'react';

import { api } from '../services';
import Button from './Button';
import Icon from './Icon';
import Skeleton from './Skeleton';
import './VisitPanel.scss';

const SUPPORTED_ROLES = ['resident', 'concierge', 'admin'];

const TABS = [
  { id: 'register', label: 'Nueva visita', iconName: 'plusCircle', description: 'Registrar una nueva visita' },
  { id: 'upcoming', label: 'Próximas', iconName: 'calendar', description: 'Visitas agendadas' },
  { id: 'history', label: 'Historial', iconName: 'clockHistory', description: 'Visitas pasadas' },
  { id: 'contacts', label: 'Contactos', iconName: 'users', description: 'Visitas frecuentes' },
];

const VISIT_TYPES = [
  { value: 'VISIT', label: 'Visita' },
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'SERVICE', label: 'Servicio técnico' },
  { value: 'OTHER', label: 'Otro' },
];

const getInitialFormState = () => {
  const now = new Date();
  // Ajuste simple para zona horaria local en inputs tipo date/time
  const dateStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // HH:MM

  return {
    firstName: '',
    paternalLastName: '',
    maternalLastName: '',
    rut: '',
    visitorType: 'VISIT',
    entryDate: dateStr,
    entryTime: timeStr,
    exitDate: '',
    exitTime: '',
    unit: '',
    customExit: false,
  };
};



const formatShortDate = (isoString) => {
  try {
    return new Intl.DateTimeFormat('es-CL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoString));
  } catch {
    return '-';
  }
};

const normalizeRut = (rut) => rut.replace(/\./g, '').replace(/\s+/g, '').toUpperCase();

const rutIsValid = (rut) => /^[0-9]{7,8}-[\dK]$/i.test(normalizeRut(rut));

const buildVisitorName = (formData) => `${formData.firstName} ${formData.paternalLastName} ${formData.maternalLastName}`.replace(/\s+/g, ' ').trim();

const statusLabel = (status) => {
  const normalized = (status || 'SCHEDULED').toUpperCase();
  if (normalized === 'CHECKED_IN') return 'Ingresada';
  if (normalized === 'EXPIRED') return 'Expirada';
  return 'Agendada';
};

const statusColor = (status) => {
  const normalized = (status || 'SCHEDULED').toUpperCase();
  if (normalized === 'CHECKED_IN') return 'success';
  if (normalized === 'EXPIRED') return 'muted';
  return 'pending';
};

const parseNameParts = (fullName) => {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  
  if (parts.length === 0) return { firstName: '', paternalLastName: '', maternalLastName: '' };
  
  if (parts.length === 1) {
    return { firstName: parts[0], paternalLastName: '', maternalLastName: '' };
  }
  
  if (parts.length === 2) {
    // Ej: Juan Perez
    return { firstName: parts[0], paternalLastName: parts[1], maternalLastName: '' };
  }
  
  // Ej: Juan Andres Perez Soto (4) -> First: Juan Andres, Pat: Perez, Mat: Soto
  // Ej: Juan Perez Soto (3) -> First: Juan, Pat: Perez, Mat: Soto
  const maternalLastName = parts.pop();
  const paternalLastName = parts.pop();
  const firstName = parts.join(' ');
  
  return { firstName, paternalLastName, maternalLastName };
};

const toIsoOrUndefined = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

const VisitRegistrationPanel = ({ user }) => {
  const resolvedRole = useMemo(() => {
    if (!user) return undefined;
    console.log('[VisitPanel] Usuario recibido:', user);
    if (user.userType) return user.userType;
    if (user.roleId === 1) return 'admin';
    if (user.roleId === 3) return 'concierge';
    return 'resident';
  }, [user]);
  console.log('[VisitPanel] Rol resuelto:', resolvedRole);
  const [activeTab, setActiveTab] = useState('register');
  const [formData, setFormData] = useState(getInitialFormState);
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [pastVisits, setPastVisits] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveContact, setSaveContact] = useState(false);
  const [housingUnits, setHousingUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [residentUnit, setResidentUnit] = useState(null);
  const [loadingResidentUnit, setLoadingResidentUnit] = useState(false);

  const canRegister = SUPPORTED_ROLES.includes(resolvedRole);
  // Para residentes, la unidad activa se obtiene desde /users/me/unit (edificio seleccionado).
  const residentUnitId = residentUnit?.unitId || null;
  const hasAccessToForm = resolvedRole === 'resident' ? (loadingResidentUnit || Boolean(residentUnitId)) : true;
  const hasUnit = resolvedRole === 'resident' ? Boolean(residentUnitId) : Boolean(formData.unit);

  const [qrInput, setQrInput] = useState('');

  // Debounce para procesar el QR solo cuando se haya terminado de "escribir"
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Condición relajada: basta con que tenga "RUN" (el = puede venir como ) u otro char)
      if (qrInput && qrInput.includes('RUN')) {
        console.log('[QR Debug] Detectado patrón RUN en input, procesando...');
        handleQrScan(qrInput);
      }
    }, 500); // Esperar 500ms de inactividad

    return () => clearTimeout(timeoutId);
  }, [qrInput]);

  const handleQrScan = async (rawText) => {
    try {
      console.log('[QR Debug] Texto crudo recibido:', rawText);
      
      // 1. Normalización de caracteres "basura" de la pistola
      // ) -> =
      // ^ -> &
      // _ -> ?
      // > -> / (en https>)
      const cleanText = rawText
        .replace(/\)/g, '=')
        .replace(/\^/g, '&')
        .replace(/_/g, '?')
        .replace(/>/g, '/');

      console.log('[QR Debug] Texto normalizado:', cleanText);
      
      // 2. Extracción usando Regex sobre el texto limpio
      const extract = (key) => {
        // Busca key=valor hasta el siguiente & o fin de linea
        const regex = new RegExp(`[?&]${key}=([^&]+)`, 'i');
        const match = cleanText.match(regex);
        return match ? decodeURIComponent(match[1]) : null;
      };

      // Extracción de campos
      let run = extract('RUN');
      if (run) {
        // Corregir formato RUN: 21950346/6 -> 21950346-6
        run = run.replace('/', '-');
      }

      const qrData = {
        run: run,
        type: extract('type'),
        serial: extract('serial'),
        mrz: extract('mrz'),
        name: extract('name') // Capturamos el nombre si viene en el QR
      };

      console.log('[QR Debug] Datos extraídos:', qrData);

      if (!qrData.run) {
        console.warn('[QR Debug] No se encontró RUN válido.');
        // Solo mostrar error visual si no se pudo rescatar nada útil
        if (rawText.length > 20) {
            setFeedback({ type: 'error', message: 'QR ilegible. Intenta nuevamente o ingresa manual.' });
        }
        return;
      }

      setLoadingVisits(true); 
      // Enviamos solo datos técnicos al backend para buscar
      const response = await api.visits.checkQr({
          run: qrData.run,
          type: qrData.type,
          serial: qrData.serial,
          mrz: qrData.mrz
      });
      
      console.log('[QR Debug] Respuesta API:', response);
      
      if (response) {
        // Determinar qué nombre usar:
        // 1. El de la base de datos (response.fullName) si existe.
        // 2. El del QR (qrData.name) si no existe en BD.
        const sourceName = response.exists ? response.fullName : qrData.name;
        
        // Parsear el nombre elegido
        const parsedName = sourceName ? parseNameParts(sourceName) : {};
        
        const now = new Date();
        
        setFormData(prev => {
            const newData = {
              ...prev,
              rut: response.documentNumber || qrData.run, // Prioridad a lo normalizado por backend
              firstName: parsedName.firstName || prev.firstName,
              paternalLastName: parsedName.paternalLastName || prev.paternalLastName,
              maternalLastName: parsedName.maternalLastName || prev.maternalLastName,
              entryDate: now.toLocaleDateString('en-CA'),
              entryTime: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            };
            console.log('[QR Debug] Formulario actualizado:', newData);
            return newData;
        });

        const successMessage = response.exists 
            ? 'Visitante registrado encontrado.' 
            : (qrData.name ? 'Datos cargados desde Cédula.' : 'Visitante nuevo. Completa el nombre.');

        setFeedback({ 
          type: 'success', 
          message: `${successMessage} Verifica unidad y da ingreso.` 
        });
        setQrInput(''); // Limpiar input
      }
    } catch (error) {
      console.error('[QR Debug] Error fatal:', error);
      setFeedback({ type: 'error', message: 'Error al procesar lectura.' });
    } finally {
      setLoadingVisits(false);
    }
  };

  const handleQrInputChange = (e) => {
    setQrInput(e.target.value);
  };

  const fetchVisits = useCallback(async () => {
    if (!user) return;
    setLoadingVisits(true);
    try {
      const response = await api.visits.listMine();
      setUpcomingVisits(response?.upcoming || []);
      setPastVisits(response?.past || []);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'No pudimos cargar tus visitas.' });
    } finally {
      setLoadingVisits(false);
    }
  }, [user]);

  const persistContact = async (contact) => {
    try {
      await api.visits.contacts.create(contact);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'No pudimos guardar el contacto.' });
    }
  };

  const fetchContacts = useCallback(async (searchTerm = '') => {
    if (!user) return;
    setLoadingContacts(true);
    try {
      const response = await api.visits.contacts.list(searchTerm || '', 10);
      setContacts(response || []);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'No pudimos cargar contactos.' });
    } finally {
      setLoadingContacts(false);
    }
  }, [user]);

  const fetchHousingUnits = useCallback(async () => {
    // Solo cargar unidades para admin/concierge (residentes usan su unitId del perfil)
    if (!user || resolvedRole === 'resident') return;
    console.log('[VisitPanel] Cargando unidades para rol:', resolvedRole);
    setLoadingUnits(true);
    try {
      const response = await api.housingUnits.list();
      console.log('[VisitPanel] Unidades recibidas:', response);
      // La respuesta es un array de objetos { unit: {...}, residents: [...] }
      // Extraemos solo el objeto 'unit' de cada elemento
      let units = [];
      if (Array.isArray(response)) {
        units = response.map(item => item.unit || item).filter(Boolean);
      }
      console.log('[VisitPanel] Unidades procesadas:', units);
      setHousingUnits(units);
    } catch (error) {
      console.error('[VisitPanel] Error cargando unidades:', error);
      // No mostrar error al usuario, simplemente no habrá opciones
      setHousingUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  }, [user, resolvedRole]);

  const fetchResidentUnit = useCallback(async () => {
    if (!user || resolvedRole !== 'resident') {
      setResidentUnit(null);
      return;
    }
    setLoadingResidentUnit(true);
    try {
      const response = await api.users.getMyUnit();
      const selectedBuildingId = user?.selectedBuildingId ?? user?.activeBuildingId;
      const matchesSelectedBuilding = !selectedBuildingId
        || !response?.buildingId
        || Number(response.buildingId) === Number(selectedBuildingId);
      setResidentUnit(matchesSelectedBuilding ? (response || null) : null);
    } catch (error) {
      console.error('[VisitPanel] Error cargando unidad activa del residente:', error);
      setResidentUnit(null);
    } finally {
      setLoadingResidentUnit(false);
    }
  }, [user, resolvedRole]);

  useEffect(() => {
    if (user) {
      fetchVisits();
      fetchContacts();
      fetchHousingUnits();
      fetchResidentUnit();
    }
  }, [user, fetchVisits, fetchContacts, fetchHousingUnits, fetchResidentUnit]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timeout = setTimeout(() => setFeedback(null), 4200);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(getInitialFormState());
  };

  const handleSaveContactToggle = (event) => {
    setSaveContact(event.target.checked);
  };

  const handleContactSearchChange = (event) => {
    setContactSearch(event.target.value);
  };

  const handleContactSearchSubmit = async (event) => {
    event.preventDefault();
    fetchContacts(contactSearch);
  };

  const handleReRegister = (visit) => {
    const parsed = parseNameParts(visit.visitorName);
    setFormData((prev) => ({
      ...prev,
      ...parsed,
      rut: visit.visitorDocument || '',
      unit: resolvedRole !== 'resident' ? (visit.unitId || '') : prev.unit,
      entryDate: '',
      entryTime: '',
      exitDate: '',
      exitTime: '',
      customExit: false,
    }));
    setActiveTab('register');
    setFeedback({ type: 'success', message: `Listo para re-registrar a ${visit.visitorName}` });
  };

  const calculateValidMinutes = () => {
    if (!formData.entryDate || !formData.entryTime) return 360; // 6 horas por defecto
    
    const entryDateTime = new Date(`${formData.entryDate}T${formData.entryTime}`);
    let exitDateTime;
    
    if (formData.customExit && formData.exitDate && formData.exitTime) {
      exitDateTime = new Date(`${formData.exitDate}T${formData.exitTime}`);
    } else {
      // Por defecto 6 horas
      exitDateTime = new Date(entryDateTime.getTime() + 6 * 60 * 60 * 1000);
    }
    
    const diffMs = exitDateTime - entryDateTime;
    return Math.max(15, Math.round(diffMs / 60000)); // mínimo 15 minutos
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'El nombre es obligatorio.';
    if (!formData.paternalLastName.trim()) return 'El apellido paterno es obligatorio.';
    if (!formData.maternalLastName.trim()) return 'El apellido materno es obligatorio.';
    if (!formData.rut.trim()) return 'El RUT es obligatorio.';
    if (!rutIsValid(formData.rut)) return 'El RUT debe tener el formato 12345678-9.';
    if (!hasUnit) return resolvedRole === 'resident'
      ? 'No encontramos tu unidad activa en la comunidad seleccionada. Contacta al administrador.'
      : 'Debes indicar la unidad/departamento para esta visita.';
    if (!formData.entryDate) return 'La fecha de ingreso es obligatoria.';
    if (!formData.entryTime) return 'La hora de ingreso es obligatoria.';
    if (formData.customExit) {
      if (!formData.exitDate) return 'La fecha de salida es obligatoria.';
      if (!formData.exitTime) return 'La hora de salida es obligatoria.';
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errorMessage = validateForm();
    if (errorMessage) {
      setFeedback({ type: 'error', message: errorMessage });
      return;
    }

    setSubmitting(true);
    try {
      const validFrom = formData.entryDate && formData.entryTime 
        ? toIsoOrUndefined(`${formData.entryDate}T${formData.entryTime}`)
        : undefined;
      
      // Para residentes, usar unitId del perfil; para admin/concierge, usar el del formulario
      const unitId = resolvedRole === 'resident' ? residentUnitId : Number(formData.unit);
      
      const payload = {
        visitorName: buildVisitorName(formData),
        visitorDocument: normalizeRut(formData.rut),
        visitorType: formData.visitorType || 'VISIT',
        validForMinutes: calculateValidMinutes(),
        ...(validFrom ? { validFrom } : {}),
        ...(unitId ? { unitId: Number(unitId) } : {}),
      };
      await api.visits.create(payload);
      if (saveContact) {
        await persistContact({
          visitorName: buildVisitorName(formData),
          visitorDocument: normalizeRut(formData.rut),
          unitId: resolvedRole !== 'resident' ? Number(formData.unit) || undefined : user?.unitId || undefined,
        });
        fetchContacts(contactSearch);
      }
      setFeedback({
        type: 'success',
        message: 'Visita registrada y enviada a conserjería.',
      });
      resetForm();
      fetchVisits();
      setActiveTab('upcoming');
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'No pudimos registrar la visita.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckIn = async (authorizationId) => {
    setSubmitting(true);
    try {
      await api.visits.checkIn(authorizationId);
      setFeedback({ type: 'success', message: 'Visita marcada como ingresada.' });
      fetchVisits();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'No pudimos marcar el ingreso.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContact = async (contact) => {
    try {
      await api.visits.contacts.delete(contact.id);
      fetchContacts(contactSearch);
      setFeedback({ type: 'success', message: 'Contacto eliminado.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'No pudimos eliminar el contacto.' });
    }
  };

  const handleLoadContact = (contact) => {
    const parsed = parseNameParts(contact.visitorName);
    setFormData((prev) => ({
      ...prev,
      ...parsed,
      rut: contact.visitorDocument || '',
      unit: resolvedRole !== 'resident' ? (contact.unitId || '') : prev.unit,
      entryDate: '',
      entryTime: '',
      exitDate: '',
      exitTime: '',
      customExit: false,
    }));
    setActiveTab('register');
    setFeedback({ type: 'success', message: `Contacto cargado: ${contact.visitorName}` });
  };

  // Estados de bloqueo
  if (!user) {
    return (
      <section className="visit-panel visit-panel--compact">
        <header className="visit-panel__header">
          <div>
            <p className="visit-panel__eyebrow">Registro de visitas</p>
            <h3>Inicia sesión para anunciar accesos</h3>
          </div>
        </header>
        <div className="visit-panel__locked-card" role="alert">
          <div className="visit-panel__locked-icon" aria-hidden="true">
            <Icon name="lock" size={22} />
          </div>
          <div>
            <p className="visit-panel__locked-title">Sesión requerida</p>
            <p className="visit-panel__locked-text">
              Necesitas iniciar sesión para registrar visitas y notificar a conserjería.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!canRegister || !hasAccessToForm) {
    return (
      <section className="visit-panel visit-panel--compact">
        <header className="visit-panel__header">
          <div>
            <p className="visit-panel__eyebrow">Registro de visitas</p>
            <h3>Acceso restringido</h3>
          </div>
        </header>
        <div className="visit-panel__locked-card" role="alert">
          <div className="visit-panel__locked-icon" aria-hidden="true">
            <Icon name="shield" size={22} />
          </div>
          <div>
            <p className="visit-panel__locked-title">No podemos registrar todavía</p>
            <p className="visit-panel__locked-text">
              {!canRegister
                ? 'Tu perfil no tiene permisos para anunciar visitas. Contacta al administrador.'
                : 'Necesitamos una unidad asociada. Actualiza tu perfil o solicita apoyo.'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="visit-panel" aria-label="Control y registro de visitas">
      {/* Feedback */}
      {feedback && (
        <div className={`visit-panel__feedback visit-panel__feedback--${feedback.type}`} role="status">
          <span className="visit-panel__feedback-icon" aria-hidden="true">
            {feedback.type === 'success' ? <Icon name="check" size={14} /> : <Icon name="exclamation" size={14} />}
          </span>
          {feedback.message}
        </div>
      )}

      {/* Tabs */}
      <div className="visit-panel__nav-shell">
        <nav className="visit-panel__categories" role="tablist" aria-label="Secciones de visitas">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              title={tab.description}
              className={`category-pill ${activeTab === tab.id ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon name={tab.iconName} size={16} />
              {tab.label}
              {tab.id === 'upcoming' && upcomingVisits.length > 0 && (
                <span className="visit-panel__category-badge">{upcomingVisits.length}</span>
              )}
              {tab.id === 'contacts' && contacts.length > 0 && (
                <span className="visit-panel__category-badge">{contacts.length}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="visit-panel__content">
        {/* Tab: Registrar nueva visita */}
        {activeTab === 'register' && (
          <div className="visit-panel__view">
            {/* QR Scanner for Admin/Concierge */}
            {resolvedRole !== 'resident' && (
              <div className="visit-form__qr-section">
                <label className="visit-form__field visit-form__field--qr">
                  <span className="visit-form__qr-label">
                    <Icon name="qrCode" size={18} />
                    Escanear cédula (QR)
                  </span>
                  <input
                    type="text"
                    value={qrInput}
                    onChange={handleQrInputChange}
                    placeholder="Haz clic aquí y escanea el código…"
                    className="visit-form__qr-input"
                    autoComplete="off"
                  />
                  <p className="visit-form__hint visit-form__hint--muted">
                    El formulario se completará automáticamente al leer el código.
                  </p>
                </label>
              </div>
            )}

            {/* Unit info */}
            {resolvedRole === 'resident' && residentUnitId && (
              <div className="visit-form__unit-badge">
                <span className="visit-form__unit-icon" aria-hidden="true">
                  <Icon name="buildingOffice" size={18} />
                </span>
                <span>
                  Unidad {residentUnit?.number || residentUnitId}
                  {residentUnit?.tower ? ` · Torre ${residentUnit.tower}` : ''}
                  {residentUnit?.floor ? ` · Piso ${residentUnit.floor}` : ''}
                </span>
              </div>
            )}

            <form className="visit-form visit-form--steps" onSubmit={handleSubmit}>
              {/* Sección 1: Datos del visitante */}
              <div className="visit-form__step">
                <div className="visit-form__step-header">
                  <span className="visit-form__step-number">1</span>
                  <h5>Datos del visitante</h5>
                </div>
                <div className="visit-form__step-content">
                  <div className="visit-form__grid visit-form__grid--2">
                    <label className="visit-form__field">
                      <span>Nombre <span className="required">*</span></span>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="María"
                        required
                      />
                    </label>

                    <label className="visit-form__field">
                      <span>RUT <span className="required">*</span></span>
                      <input
                        type="text"
                        name="rut"
                        value={formData.rut}
                        onChange={handleChange}
                        placeholder="12345678-9"
                        required
                      />
                    </label>

                    <label className="visit-form__field">
                      <span>Apellido paterno <span className="required">*</span></span>
                      <input
                        type="text"
                        name="paternalLastName"
                        value={formData.paternalLastName}
                        onChange={handleChange}
                        placeholder="Soto"
                        required
                      />
                    </label>

                    <label className="visit-form__field">
                      <span>Apellido materno <span className="required">*</span></span>
                      <input
                        type="text"
                        name="maternalLastName"
                        value={formData.maternalLastName}
                        onChange={handleChange}
                        placeholder="Espinoza"
                        required
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Sección 2: Tipo de visita */}
              <div className="visit-form__step">
                <div className="visit-form__step-header">
                  <span className="visit-form__step-number">2</span>
                  <h5>Tipo de visita</h5>
                </div>
                <div className="visit-form__step-content">
                  <label className="visit-form__field">
                    <span>Tipo</span>
                    <select
                      name="visitorType"
                      value={formData.visitorType}
                      onChange={handleChange}
                    >
                      {VISIT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {resolvedRole !== 'resident' && (
                    <label className="visit-form__field">
                      <span>Unidad / Depto <span className="required">*</span></span>
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        required
                        disabled={loadingUnits}
                      >
                        <option value="">
                          {loadingUnits ? 'Cargando...' : 'Selecciona una unidad'}
                        </option>
                        {housingUnits.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.tower ? `${unit.tower} - ` : ''}{unit.number}{unit.floor ? ` (Piso ${unit.floor})` : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              </div>

              {/* Sección 3: Fecha de entrada */}
              <div className="visit-form__step">
                <div className="visit-form__step-header">
                  <span className="visit-form__step-number">3</span>
                  <h5>Selecciona el día de entrada</h5>
                </div>
                <div className="visit-form__step-content">
                  <div className="visit-form__grid visit-form__grid--2">
                    <label className="visit-form__field">
                      <span>Fecha de ingreso</span>
                      <input
                        type="date"
                        name="entryDate"
                        value={formData.entryDate}
                        onChange={handleChange}
                        required
                      />
                    </label>

                    <label className="visit-form__field">
                      <span>Hora de ingreso</span>
                      <input
                        type="time"
                        name="entryTime"
                        value={formData.entryTime}
                        onChange={handleChange}
                        required
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Sección 4: Fecha de salida (opcional) */}
              {formData.customExit ? (
                <div className="visit-form__step">
                  <div className="visit-form__step-header">
                    <span className="visit-form__step-number">4</span>
                    <h5>Selecciona el día de salida</h5>
                  </div>
                  <div className="visit-form__step-content">
                    <div className="visit-form__grid visit-form__grid--2">
                      <label className="visit-form__field">
                        <span>Fecha de salida</span>
                        <input
                          type="date"
                          name="exitDate"
                          value={formData.exitDate}
                          onChange={handleChange}
                          min={formData.entryDate}
                        />
                      </label>

                      <label className="visit-form__field">
                        <span>Hora de salida</span>
                        <input
                          type="time"
                          name="exitTime"
                          value={formData.exitTime}
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <p className="visit-form__hint">
                      Por seguridad de tu comunidad, la validez de tu visita podrá ser de hasta 30 días
                    </p>
                  </div>
                </div>
              ) : (
                <div className="visit-form__duration-info">
                  <p>Por defecto, las invitaciones tienen una duración de 6 horas.</p>
                  <button
                    type="button"
                    className="visit-form__customize-btn"
                    onClick={() => setFormData({ ...formData, customExit: true })}
                  >
                    <Icon name="edit" size={16} />
                    Personalizar la fecha de salida
                  </button>
                </div>
              )}

              {/* Footer */}
              <div className="visit-form__footer">
                <label className="visit-form__checkbox">
                  <input
                    type="checkbox"
                    checked={saveContact}
                    onChange={handleSaveContactToggle}
                  />
                  <span>Guardar como contacto frecuente</span>
                </label>

                <div className="visit-form__actions">
                  <Button type="button" variant="ghost" onClick={resetForm} disabled={submitting}>
                    Limpiar
                  </Button>
                  <Button type="submit" variant="primary" disabled={submitting} loading={submitting}>
                    {submitting ? 'Registrando…' : 'Registrar visita'}
                  </Button>
                </div>
              </div>

              <p className="visit-form__privacy">
                <Icon name="informationCircle" size={16} />
                Los datos se usan solo para autorizar el ingreso ante conserjería.
              </p>
            </form>
          </div>
        )}

        {/* Tab: Próximas visitas */}
        {activeTab === 'upcoming' && (
          <div className="visit-panel__view">
            <div className="visit-panel__view-header">
              <h4>Próximas visitas</h4>
              <p>Visitas agendadas pendientes de ingreso</p>
            </div>

            {loadingVisits ? (
              <Skeleton.List rows={3} />
            ) : upcomingVisits.length === 0 ? (
              <div className="visit-panel__empty">
                <span className="visit-panel__empty-icon" aria-hidden="true">
                  <Icon name="calendar" size={40} />
                </span>
                <h5>Sin visitas agendadas</h5>
                <p>Registra una nueva visita para avisar al equipo de conserjería.</p>
                <Button
                  variant="secondary"
                  onClick={() => setActiveTab('register')}
                  icon={<Icon name="plusCircle" size={18} />}
                >
                  Nueva visita
                </Button>
              </div>
            ) : (
              <div className="visit-panel__list">
                {upcomingVisits.map((visit) => (
                  <article key={visit.authorizationId} className={`visit-card visit-card--${statusColor(visit.status)}`}>
                    <div className="visit-card__avatar">
                      {visit.visitorName?.charAt(0) || 'V'}
                    </div>
                    <div className="visit-card__content">
                      <h5 className="visit-card__name">{visit.visitorName}</h5>
                      <div className="visit-card__meta">
                        <span className="visit-card__meta-item">
                          <Icon name="buildingOffice" size={14} />
                          Unidad {visit.unitId}
                        </span>
                        <span className="visit-card__meta-item">
                          <Icon name="clock" size={14} />
                          Válida hasta {formatShortDate(visit.validUntil)}
                        </span>
                      </div>
                      <span className={`visit-card__status visit-card__status--${statusColor(visit.status)}`}>
                        {statusLabel(visit.status)}
                      </span>
                    </div>
                    <div className="visit-card__actions">
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleCheckIn(visit.authorizationId)}
                        disabled={submitting}
                      >
                        Dar ingreso
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Historial */}
        {activeTab === 'history' && (
          <div className="visit-panel__view">
            <div className="visit-panel__view-header">
              <h4>Historial de visitas</h4>
              <p>Registro de visitas anteriores</p>
            </div>

            {loadingVisits ? (
              <Skeleton.List rows={3} />
            ) : pastVisits.length === 0 ? (
              <div className="visit-panel__empty">
                <span className="visit-panel__empty-icon" aria-hidden="true">
                  <Icon name="clipboard" size={40} />
                </span>
                <h5>Sin historial</h5>
                <p>Aquí aparecerán las visitas que ya ingresaron o expiraron.</p>
              </div>
            ) : (
              <div className="visit-panel__list">
                {pastVisits.slice(0, 10).map((visit) => (
                  <article key={visit.authorizationId} className="visit-card visit-card--muted">
                    <div className="visit-card__avatar visit-card__avatar--muted">
                      {visit.visitorName?.charAt(0) || 'V'}
                    </div>
                    <div className="visit-card__content">
                      <h5 className="visit-card__name">{visit.visitorName}</h5>
                      <div className="visit-card__meta">
                        <span className="visit-card__meta-item">
                          <Icon name="buildingOffice" size={14} />
                          Unidad {visit.unitId}
                        </span>
                        <span className="visit-card__meta-item">
                          {visit.checkInAt ? (
                            <>
                              <Icon name="check" size={14} />
                              Ingresó {formatShortDate(visit.checkInAt)}
                            </>
                          ) : (
                            <>
                              <Icon name="clock" size={14} />
                              Expiró {formatShortDate(visit.validUntil)}
                            </>
                          )}
                        </span>
                      </div>
                      <span className={`visit-card__status visit-card__status--${statusColor(visit.status)}`}>
                        {statusLabel(visit.status)}
                      </span>
                    </div>
                    <div className="visit-card__actions">
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleReRegister(visit)}
                      >
                        Re-registrar
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Contactos */}
        {activeTab === 'contacts' && (
          <div className="visit-panel__view">
            <div className="visit-panel__view-header">
              <div>
                <h4>Contactos frecuentes</h4>
                <p>Visitantes guardados para registro rápido</p>
              </div>
              <form className="visit-panel__search visit-panel__search--inline" onSubmit={handleContactSearchSubmit}>
                <Icon name="magnifyingGlass" size={20} className="visit-panel__search-icon" />
                <input
                  type="search"
                  value={contactSearch}
                  onChange={handleContactSearchChange}
                  placeholder="Buscar por nombre o RUT…"
                  aria-label="Buscar contactos"
                />
                <Button type="submit" variant="secondary" size="small" disabled={loadingContacts} loading={loadingContacts}>
                  Buscar
                </Button>
              </form>
            </div>

            {loadingContacts ? (
              <div className="visit-panel__skeleton-block" aria-busy="true" aria-label="Cargando contactos">
                <Skeleton.List rows={4} />
              </div>
            ) : contacts.length === 0 ? (
              <div className="visit-panel__empty">
                <span className="visit-panel__empty-icon" aria-hidden="true">
                  <Icon name="users" size={40} />
                </span>
                <h5>Sin contactos guardados</h5>
                <p>Al registrar una visita, marca &quot;Guardar como contacto frecuente&quot; para tenerla aquí.</p>
                <Button
                  variant="secondary"
                  onClick={() => setActiveTab('register')}
                  icon={<Icon name="plusCircle" size={18} />}
                >
                  Nueva visita
                </Button>
              </div>
            ) : (
              <div className="visit-panel__list">
                {contacts.map((contact) => (
                  <article key={contact.id} className="visit-card">
                    <div className="visit-card__avatar">
                      {contact.visitorName?.charAt(0) || 'C'}
                    </div>
                    <div className="visit-card__content">
                      <h5 className="visit-card__name">{contact.visitorName}</h5>
                      <div className="visit-card__meta">
                        {contact.visitorDocument && (
                          <span className="visit-card__meta-item">
                            <Icon name="document" size={14} />
                            {contact.visitorDocument}
                          </span>
                        )}
                        {contact.unitId && (
                          <span className="visit-card__meta-item">
                            <Icon name="buildingOffice" size={14} />
                            Unidad {contact.unitId}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="visit-card__actions">
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleLoadContact(contact)}
                        icon={<Icon name="arrowRight" size={16} />}
                      >
                        Usar
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleDeleteContact(contact)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};


VisitRegistrationPanel.defaultProps = {
  user: null,
};

export default VisitRegistrationPanel;