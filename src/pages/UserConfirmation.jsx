import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Seo, Spinner, Icon } from '../components';
import { api } from '../services';
import { ROUTES } from '../constants';
import './UserConfirmation.scss';

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
          <div className="user-confirmation-card__loading">
            <Spinner label="Confirmando tu cuenta..." />
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

        {status === 'error' && (
          <div className="user-confirmation-card__error">
            <div className="status-icon status-icon--error">
              <Icon name="exclamation" size={32} />
            </div>
            <h2>Ups, algo salió mal</h2>
            <p>{message}</p>
            <div className="error-actions">
              <Link to={ROUTES.HOME} className="btn btn-secondary">
                Volver al inicio
              </Link>
              <Link to={ROUTES.CONTACT} className="btn btn-ghost">
                Contactar soporte
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserConfirmation;
