import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProtectedLayout } from '../layout';
import { useAppContext } from '../context';
import { Icon } from '../components';
import { api } from '../services';
import { ROUTES } from '../constants';
import './NotificationPreferences.scss';

const NotificationPreferences = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.notifications.getPreferences();
      setPreferences(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading preferences:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleToggle = async (notificationType, currentValue) => {
    const newValue = !currentValue;
    setSaving(notificationType);
    try {
      await api.notifications.updatePreference(notificationType, newValue);
      setPreferences((prev) =>
        prev.map((p) =>
          p.notificationType === notificationType
            ? { ...p, inAppEnabled: newValue }
            : p
        )
      );
    } catch (err) {
      console.error('Error updating preference:', err);
    } finally {
      setSaving(null);
    }
  };

  return (
    <ProtectedLayout>
      <div className="notification-prefs">
        <div className="notification-prefs__header">
          <button
            type="button"
            className="notification-prefs__back"
            onClick={() => navigate(ROUTES.NOTIFICATIONS)}
          >
            <Icon name="arrowLeft" size={20} />
          </button>
          <h1 className="notification-prefs__title">Preferencias de notificaciones</h1>
        </div>

        <p className="notification-prefs__description">
          Elige que tipo de notificaciones deseas recibir en la aplicacion.
        </p>

        <div className="notification-prefs__list">
          {loading ? (
            <div className="notification-prefs__loading">Cargando preferencias...</div>
          ) : preferences.length === 0 ? (
            <div className="notification-prefs__empty">No hay preferencias disponibles</div>
          ) : (
            preferences.map((pref) => (
              <div key={pref.notificationType} className="notification-prefs__item">
                <div className="notification-prefs__item-info">
                  <span className="notification-prefs__item-label">{pref.label}</span>
                  <span className="notification-prefs__item-type">{pref.notificationType}</span>
                </div>
                <button
                  type="button"
                  className={`notification-prefs__toggle ${pref.inAppEnabled ? 'notification-prefs__toggle--on' : ''}`}
                  onClick={() => handleToggle(pref.notificationType, pref.inAppEnabled)}
                  disabled={saving === pref.notificationType}
                  aria-label={pref.inAppEnabled ? 'Desactivar' : 'Activar'}
                >
                  <span className="notification-prefs__toggle-knob" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
};

export default NotificationPreferences;
