import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import './VisitPanel.css';

const VISIT_STORAGE_KEY = 'domu.visit-requests';
const SUPPORTED_ROLES = ['resident', 'concierge', 'admin'];
const ROLE_LABELS = {
  resident: 'Residente',
  concierge: 'Conserje',
  admin: 'Administrador',
};

const defaultPastVisits = [
  {
    id: 'past-1',
    fullName: 'Carlos Olguín',
    unit: '1502',
    time: '2025-11-06T17:40:00',
  },
  {
    id: 'past-2',
    fullName: 'Raúl Grande',
    unit: '1502',
    time: '2025-11-05T22:25:00',
  },
  {
    id: 'past-3',
    fullName: 'Francisca Villanueva',
    unit: '1502',
    time: '2025-10-24T23:18:00',
  },
  {
    id: 'past-4',
    fullName: 'Tatiana Pastén',
    unit: '1502',
    time: '2025-10-13T08:33:00',
  },
];

const defaultBlockedVisits = [
  {
    id: 'blocked-1',
    fullName: 'Proveedor genérico',
    note: 'Restringido por la comunidad (bloqueado el 01/10/2025)',
  },
];

const initialFormState = {
  firstName: '',
  paternalLastName: '',
  maternalLastName: '',
  rut: '',
  unit: '',
};

const loadStoredVisits = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(VISIT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('[VisitRegistrationPanel] No se pudo leer visitas almacenadas:', error);
    return [];
  }
};

const persistVisits = (visits) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(VISIT_STORAGE_KEY, JSON.stringify(visits));
  } catch (error) {
    console.warn('[VisitRegistrationPanel] No se pudo guardar visitas:', error);
  }
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

const normalizeRut = (rut) => rut.replace(/\./g, '').replace(/\s+/g, '').toUpperCase();

const rutIsValid = (rut) => /^[0-9]{7,8}-[\dK]$/i.test(normalizeRut(rut));

const generateVisitId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `visit-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const VisitRegistrationPanel = ({ user }) => {
  const resolvedRole = useMemo(() => {
    if (!user) return undefined;
    if (user.userType) return user.userType;
    if (user.roleId === 1) return 'admin';
    if (user.roleId === 3) return 'concierge';
    return 'resident';
  }, [user]);

  const [formData, setFormData] = useState(initialFormState);
  const [upcomingVisits, setUpcomingVisits] = useState(loadStoredVisits);
  const [pastVisits, setPastVisits] = useState(defaultPastVisits);
  const [blockedVisits] = useState(defaultBlockedVisits);
  const [feedback, setFeedback] = useState(null);

  const canRegister = SUPPORTED_ROLES.includes(resolvedRole);

  useEffect(() => {
    persistVisits(upcomingVisits);
  }, [upcomingVisits]);

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

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'El nombre es obligatorio.';
    if (!formData.paternalLastName.trim()) return 'El apellido paterno es obligatorio.';
    if (!formData.maternalLastName.trim()) return 'El apellido materno es obligatorio.';
    if (!formData.rut.trim()) return 'El RUT es obligatorio.';
    if (!rutIsValid(formData.rut)) return 'El RUT debe tener el formato 12345678-9.';
    if (!formData.unit.trim()) return 'Debes indicar la unidad o departamento de destino.';
    return null;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const errorMessage = validateForm();
    if (errorMessage) {
      setFeedback({ type: 'error', message: errorMessage });
      return;
    }

    const newVisit = {
      id: generateVisitId(),
      firstName: formData.firstName.trim(),
      paternalLastName: formData.paternalLastName.trim(),
      maternalLastName: formData.maternalLastName.trim(),
      rut: normalizeRut(formData.rut),
      unit: formData.unit.trim().toUpperCase(),
      createdAt: new Date().toISOString(),
      createdBy: user?.firstName
        ? `${user.firstName} ${user?.lastName || ''}`.trim()
        : user?.email || 'Usuario DOMU',
      createdByRole: ROLE_LABELS[resolvedRole] || 'Usuario',
    };

    setUpcomingVisits((prev) => [newVisit, ...prev]);
    setFeedback({
      type: 'success',
      message: `Visita registrada. Recuerda informar a recepción para la unidad ${newVisit.unit}.`,
    });
    resetForm();
  };

  const handleCheckIn = (visitId) => {
    setUpcomingVisits((prev) => {
      const target = prev.find((visit) => visit.id === visitId);
      if (!target) return prev;
      setPastVisits((current) => [
        {
          id: `${visitId}-past`,
          fullName: `${target.firstName} ${target.paternalLastName}`,
          unit: target.unit,
          time: new Date().toISOString(),
        },
        ...current,
      ]);
      setFeedback({ type: 'success', message: 'Visita marcada como ingresada.' });
      return prev.filter((visit) => visit.id !== visitId);
    });
  };

  if (!user) {
    return (
      <section className="visit-panel">
        <header className="visit-panel__header">
          <div>
            <p className="visit-panel__eyebrow">Registro de visitas</p>
            <h3>Inicia sesión para anunciar accesos</h3>
          </div>
        </header>
        <p className="visit-panel__locked">
          Necesitas estar autenticado para registrar visitas y notificar a conserjería.
        </p>
      </section>
    );
  }

  if (!canRegister) {
    return (
      <section className="visit-panel">
        <header className="visit-panel__header">
          <div>
            <p className="visit-panel__eyebrow">Registro de visitas</p>
            <h3>Acceso restringido</h3>
          </div>
        </header>
        <p className="visit-panel__locked">
          Tu perfil todavía no tiene permiso para anunciar visitas. Contacta al administrador para habilitarlo.
        </p>
      </section>
    );
  }

  const fullNamePreview = `${formData.firstName || 'Nombre'} ${formData.paternalLastName || 'Apellido'}`.trim();

  return (
    <section className="visit-panel" aria-label="Control y registro de visitas">
      <header className="visit-panel__header">
        <div>
          <p className="visit-panel__eyebrow">Registro de visitas</p>
          <h3>Controla quién ingresa a tu comunidad</h3>
          <span className="visit-panel__helper">
            {resolvedRole === 'admin'
              ? 'Los administradores solo deben registrar visitas cuando la situación lo amerite.'
              : 'Crea el registro y comparte esta información con recepción para agilizar el ingreso.'}
          </span>
        </div>
        <div className="visit-panel__role-pill">
          Registrando como <strong>{ROLE_LABELS[resolvedRole]}</strong>
        </div>
      </header>

      {feedback && (
        <div className={`visit-panel__feedback visit-panel__feedback--${feedback.type}`} role="status">
          {feedback.message}
        </div>
      )}

      <div className="visit-panel__layout">
        <form className="visit-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Datos de la visita</legend>
            <div className="visit-form__grid">
              <label className="visit-form__field">
                <span>Nombre</span>
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
                <span>Apellido paterno</span>
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
                <span>Apellido materno</span>
                <input
                  type="text"
                  name="maternalLastName"
                  value={formData.maternalLastName}
                  onChange={handleChange}
                  placeholder="Espinoza"
                  required
                />
              </label>

              <label className="visit-form__field">
                <span>RUT</span>
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
                <span>Unidad o departamento</span>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="Ej: 1502"
                  required
                />
              </label>
            </div>
          </fieldset>

          <div className="visit-form__actions">
            <Button type="submit" variant="primary">
              Registrar visita
            </Button>
            <Button type="button" variant="ghost" onClick={resetForm}>
              Limpiar
            </Button>
          </div>

          <p className="visit-form__preview">
            Próxima visita: <strong>{fullNamePreview}</strong> {formData.unit && `→ Unidad ${formData.unit}`}
          </p>
        </form>

        <div className="visit-panel__boards">
          <article className="visit-board">
            <header>
              <h4>Próximas visitas</h4>
              <span>{upcomingVisits.length || '0'}</span>
            </header>
            <ul className="visit-board__list">
              {upcomingVisits.length === 0 && (
                <li className="visit-board__empty">
                  <strong>¿Aún sin visitas?</strong>
                  <span>Registra desde aquí para avisar al equipo de conserjería.</span>
                </li>
              )}

              {upcomingVisits.map((visit) => (
                <li key={visit.id} className="visit-card">
                  <div>
                    <strong>{`${visit.firstName} ${visit.paternalLastName}`}</strong>
                    <p>Unidad {visit.unit}</p>
                    <small>Registrado por {visit.createdByRole} · {visit.createdBy}</small>
                  </div>
                  <button
                    type="button"
                    className="visit-card__action"
                    onClick={() => handleCheckIn(visit.id)}
                  >
                    Dar ingreso
                  </button>
                </li>
              ))}
            </ul>
          </article>

          <article className="visit-board">
            <header>
              <h4>Visitas pasadas</h4>
              <span>{pastVisits.length}</span>
            </header>
            <ul className="visit-board__list">
              {pastVisits.map((visit) => (
                <li key={visit.id} className="visit-card visit-card--muted">
                  <div>
                    <strong>{visit.fullName}</strong>
                    <p>Ingresó a las {formatDate(visit.time)}</p>
                    <small>Unidad {visit.unit}</small>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="visit-board">
            <header>
              <h4>No autorizadas</h4>
              <span>{blockedVisits.length}</span>
            </header>
            <ul className="visit-board__list">
              {blockedVisits.map((visit) => (
                <li key={visit.id} className="visit-card visit-card--alert">
                  <div>
                    <strong>{visit.fullName}</strong>
                    <p>{visit.note}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Button variant="secondary" type="button">
              Reportar visita no autorizada
            </Button>
          </article>
        </div>
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
  }),
};

VisitRegistrationPanel.defaultProps = {
  user: null,
};

export default VisitRegistrationPanel;

