import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Seo, Skeleton, Icon } from '../components';
import { api } from '../services';
import { ROUTES } from '../constants';
import './UserConfirmation.scss';

const ERROR_CONTENT = {
  expired: {
    title: 'Enlace de confirmación expirado',
    description: 'El enlace que recibiste por correo tiene una validez de 7 días y ya no es válido.',
    action: 'Contacta a soporte para que te envíen un nuevo enlace de confirmación.',
  },
  used: {
    title: 'Enlace ya utilizado',
    description: 'Este enlace de confirmación ya fue usado para activar tu cuenta.',
    action: 'Si aún no puedes iniciar sesión, contacta a soporte.',
  },
  invalid: {
    title: 'Enlace inválido',
    description: 'El enlace de confirmación no es válido o está incompleto.',
    action: 'Verifica que copiaste el enlace completo desde el correo. Si el problema persiste, contacta a soporte.',
  },
  default: {
    title: 'No se pudo confirmar tu cuenta',
    description: 'Ocurrió un problema al procesar tu solicitud.',
    action: 'Intenta de nuevo más tarde o contacta a soporte si el problema continúa.',
  },
};

const getErrorContent = (message) => {
  const m = (message || '').toLowerCase();
  if (m.includes('expirado')) return ERROR_CONTENT.expired;
  if (m.includes('utilizado') || m.includes('ya ha sido')) return ERROR_CONTENT.used;
  if (m.includes('inválido') || m.includes('no proporcionado')) return ERROR_CONTENT.invalid;
  return ERROR_CONTENT.default;
};

const UserConfirmation = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmAccount = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token de confirmación no proporcionado.');
        return;
      }

      try {
        await api.post('/auth/confirm', { token });
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'No pudimos confirmar tu cuenta. El enlace puede haber expirado.');
      }
    };

    confirmAccount();
  }, [token]);

  return (
    <div className="user-confirmation-page">
      <Seo title="Confirmar Cuenta | Domu" noindex />
      
      <div className="user-confirmation-card card">
        <div className="user-confirmation-card__logo">
          <Icon name="homeModern" size={48} />
          <h1>DOMU</h1>
        </div>

        {status === 'loading' && (
          <div className="user-confirmation-card__loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 0' }}>
            <Skeleton variant="circle" width="56px" height="56px" />
            <Skeleton variant="text" width="200px" />
            <Skeleton variant="text" width="160px" height="12px" />
          </div>
        )}

        {status === 'success' && (
          <div className="user-confirmation-card__success">
            <div className="status-icon status-icon--success">
              <Icon name="check" size={32} />
            </div>
            <h2>¡Cuenta confirmada!</h2>
            <p>Tu cuenta ha sido activada exitosamente. Ahora puedes iniciar sesión con tus credenciales temporales.</p>
            <Link to={ROUTES.LOGIN} className="btn btn-primary">
              Ir al inicio de sesión
            </Link>
          </div>
        )}

        {status === 'error' && (() => {
          const content = getErrorContent(message);
          return (
            <div className="user-confirmation-card__error">
              <div className="status-icon status-icon--error">
                <Icon name="exclamation" size={32} />
              </div>
              <h2>{content.title}</h2>
              <p>{content.description}</p>
              <p className="user-confirmation-card__action">{content.action}</p>
              <div className="error-actions">
                <Link to={ROUTES.HOME} className="btn btn-secondary">
                  Volver al inicio
                </Link>
                <Link to={ROUTES.CONTACT} className="btn btn-primary">
                  Contactar soporte
                </Link>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default UserConfirmation;
