import { useEffect, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { api } from '../services';
import Button from './Button';
import './VisitPanel.css';

const SUPPORTED_ROLES = ['resident', 'concierge', 'admin'];
const ROLE_LABELS = {
  resident: 'Residente',
  concierge: 'Conserje',
  admin: 'Administrador',
};

const TABS = [
  { id: 'register', label: 'Nueva visita', icon: '➕', description: 'Registrar una nueva visita' },
  { id: 'upcoming', label: 'Próximas', icon: '📅', description: 'Visitas agendadas' },
  { id: 'history', label: 'Historial', icon: '📋', description: 'Visitas pasadas' },
  { id: 'contacts', label: 'Contactos', icon: '👥', description: 'Visitas frecuentes' },
];

const VISIT_TYPES = [
  { value: 'VISIT', label: 'Visita' },
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'SERVICE', label: 'Servicio técnico' },
  { value: 'OTHER', label: 'Otro' },
];

const initialFormState = {
  firstName: '',
  paternalLastName: '',
  maternalLastName: '',
  rut: '',
  visitorType: 'VISIT',
  entryDate: '',
  entryTime: '',
  exitDate: '',
  exitTime: '',
  unit: '',
  notifyAll: false,
  customExit: false,
};

const formatDate = (isoString) => {
  try {
    return new Intl.DateTimeFormat('es-CL', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(isoString));
  } catch {
    return 'Fecha no disponible';
  }
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
  const parts = (fullName || '').split(/\s+/).filter(Boolean);
  const firstName = parts.shift() || '';
  const paternalLastName = parts.shift() || '';
  const maternalLastName = parts.join(' ');
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
    if (user.userType) return user.userType;
    if (user.roleId === 1) return 'admin';
    if (user.roleId === 3) return 'concierge';
    return 'resident';
  }, [user]);
  const displayRole = ROLE_LABELS[resolvedRole] || 'Usuario';

  const [activeTab, setActiveTab] = useState('register');
  const [formData, setFormData] = useState(initialFormState);
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [pastVisits, setPastVisits] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveContact, setSaveContact] = useState(false);

  const canRegister = SUPPORTED_ROLES.includes(resolvedRole);
  const hasUnit = resolvedRole === 'resident' ? Boolean(user?.unitId) : Boolean(formData.unit);

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

  useEffect(() => {
    if (user) {
      fetchVisits();
      fetchContacts();
    }
  }, [user, fetchVisits, fetchContacts]);

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
    setFormData(initialFormState);
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
      ? 'No encontramos tu unidad. Actualiza tu perfil o contacta al administrador.'
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
      
      const payload = {
        visitorName: buildVisitorName(formData),
        visitorDocument: normalizeRut(formData.rut),
        visitorType: formData.visitorType || 'VISIT',
        validForMinutes: calculateValidMinutes(),
        ...(validFrom ? { validFrom } : {}),
        ...(resolvedRole !== 'resident' ? { unitId: Number(formData.unit) } : {}),
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
          <div className="visit-panel__locked-icon" aria-hidden="true">🔒</div>
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

  if (!canRegister || !hasUnit) {
    return (
      <section className="visit-panel visit-panel--compact">
        <header className="visit-panel__header">
          <div>
            <p className="visit-panel__eyebrow">Registro de visitas</p>
            <h3>Acceso restringido</h3>
          </div>
        </header>
        <div className="visit-panel__locked-card" role="alert">
          <div className="visit-panel__locked-icon" aria-hidden="true">🚫</div>
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
      {/* Header */}
      <header className="visit-panel__header">
        <div className="visit-panel__header-content">
          <p className="visit-panel__eyebrow">Registro de visitas</p>
          <h3>Controla quién ingresa a tu comunidad</h3>
        </div>
        <div className="visit-panel__role-pill">
          <span className="visit-panel__role-icon">👤</span>
          {displayRole}
        </div>
      </header>

      {/* Feedback */}
      {feedback && (
        <div className={`visit-panel__feedback visit-panel__feedback--${feedback.type}`} role="status">
          <span className="visit-panel__feedback-icon">
            {feedback.type === 'success' ? '✓' : '!'}
          </span>
          {feedback.message}
        </div>
      )}

      {/* Tabs */}
      <nav className="visit-panel__tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`visit-panel__tab ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="visit-panel__tab-icon">{tab.icon}</span>
            <span className="visit-panel__tab-label">{tab.label}</span>
            {tab.id === 'upcoming' && upcomingVisits.length > 0 && (
              <span className="visit-panel__tab-badge">{upcomingVisits.length}</span>
            )}
            {tab.id === 'contacts' && contacts.length > 0 && (
              <span className="visit-panel__tab-badge">{contacts.length}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="visit-panel__content">
        {/* Tab: Registrar nueva visita */}
        {activeTab === 'register' && (
          <div className="visit-panel__view">
            {/* Unit info */}
            {resolvedRole === 'resident' && user?.unitId && (
              <div className="visit-form__unit-badge">
                <span className="visit-form__unit-icon">🏢</span>
                <span>Unidad {user.unitId}</span>
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

                  <label className="visit-form__checkbox-card">
                    <input
                      type="checkbox"
                      name="notifyAll"
                      checked={formData.notifyAll}
                      onChange={(e) => setFormData({ ...formData, notifyAll: e.target.checked })}
                    />
                    <span className="visit-form__checkbox-text">
                      Marcar como visible para todos y notificar a todos cuando llegue tu visita
                    </span>
                  </label>

                  {resolvedRole !== 'resident' && (
                    <label className="visit-form__field">
                      <span>Unidad / Depto <span className="required">*</span></span>
                      <input
                        type="text"
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        placeholder="Ej: 1502"
                        required
                      />
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
                    <span>✏️</span> Personalizar la fecha de salida
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
                  <Button type="submit" variant="secondary" disabled={submitting}>
                    {submitting ? 'Registrando...' : 'Continuar'}
                  </Button>
                </div>
              </div>

              <p className="visit-form__privacy">
                <span>📋</span> Aviso de privacidad
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
              <div className="visit-panel__loading">Cargando visitas...</div>
            ) : upcomingVisits.length === 0 ? (
              <div className="visit-panel__empty">
                <span className="visit-panel__empty-icon">📅</span>
                <h5>Sin visitas agendadas</h5>
                <p>Registra una nueva visita para avisar al equipo de conserjería</p>
                <Button variant="primary" onClick={() => setActiveTab('register')}>
                  Registrar visita
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
                        <span>🏠 Unidad {visit.unitId}</span>
                        <span>⏱ Válida hasta {formatShortDate(visit.validUntil)}</span>
                      </div>
                      <span className={`visit-card__status visit-card__status--${statusColor(visit.status)}`}>
                        {statusLabel(visit.status)}
                      </span>
                    </div>
                    <div className="visit-card__actions">
                      <Button
                        variant="primary"
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
              <div className="visit-panel__loading">Cargando historial...</div>
            ) : pastVisits.length === 0 ? (
              <div className="visit-panel__empty">
                <span className="visit-panel__empty-icon">📋</span>
                <h5>Sin historial</h5>
                <p>Aquí aparecerán las visitas que ya ingresaron o expiraron</p>
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
                        <span>🏠 Unidad {visit.unitId}</span>
                        <span>
                          {visit.checkInAt
                            ? `✓ Ingresó ${formatShortDate(visit.checkInAt)}`
                            : `✗ Expiró ${formatShortDate(visit.validUntil)}`}
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
              <form className="visit-panel__search" onSubmit={handleContactSearchSubmit}>
                <input
                  type="search"
                  value={contactSearch}
                  onChange={handleContactSearchChange}
                  placeholder="Buscar por nombre o RUT..."
                />
                <Button type="submit" variant="secondary" size="small" disabled={loadingContacts}>
                  {loadingContacts ? '...' : 'Buscar'}
                </Button>
              </form>
            </div>

            {loadingContacts ? (
              <div className="visit-panel__loading">Buscando contactos...</div>
            ) : contacts.length === 0 ? (
              <div className="visit-panel__empty">
                <span className="visit-panel__empty-icon">👥</span>
                <h5>Sin contactos guardados</h5>
                <p>Al registrar una visita, marca "Guardar como contacto" para tenerla aquí</p>
                <Button variant="primary" onClick={() => setActiveTab('register')}>
                  Registrar visita
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
                        {contact.visitorDocument && <span>📄 {contact.visitorDocument}</span>}
                        {contact.unitId && <span>🏠 Unidad {contact.unitId}</span>}
                      </div>
                    </div>
                    <div className="visit-card__actions">
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => handleLoadContact(contact)}
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

VisitRegistrationPanel.propTypes = {
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    userType: PropTypes.string,
    roleId: PropTypes.number,
    unitId: PropTypes.number,
  }),
};

VisitRegistrationPanel.defaultProps = {
  user: null,
};

export default VisitRegistrationPanel;
