import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Header, MainContent, Footer } from '../layout';
import { Button, Icon, Seo } from '../components';
import { ROUTES } from '../constants';
import { api } from '../services';
import './ForgotPassword.scss';

const MIN_PASSWORD_LENGTH = 10;

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState({ new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
      setSuccess('Si el correo existe, recibirás un enlace para restablecer tu contraseña.');
    } catch (err) {
      setError(err.message || 'No se pudo enviar el correo. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (password.new !== password.confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.new.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
      return;
    }
    setLoading(true);
    try {
      await api.auth.resetPassword(token, password.new);
      setSuccess('Contraseña actualizada. Ya puedes iniciar sesión.');
      setTimeout(() => navigate(ROUTES.LOGIN), 2000);
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('expirado')) {
        setError('El enlace ha expirado. Solicita uno nuevo.');
      } else if (msg.includes('utilizado')) {
        setError('Este enlace ya fue utilizado.');
      } else if (msg.includes('inválido')) {
        setError('Enlace inválido. Solicita uno nuevo.');
      } else {
        setError(err.message || 'No se pudo restablecer la contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isResetMode = !!token;

  return (
    <div className="forgot-password-page">
      <Seo
        title={isResetMode ? 'Restablecer contraseña | Domu' : 'Recuperar contraseña | Domu'}
        description="Recupera el acceso a tu cuenta DOMU"
        canonicalPath={ROUTES.FORGOT_PASSWORD}
        noindex
      />
      <Header />
      <MainContent>
        <div className="forgot-password-container fade-in">
          <div className="forgot-password-card">
            <span className="forgot-password-card__icon" aria-hidden="true">
              <Icon name="key" size={40} strokeWidth={1.5} />
            </span>
            <h1>{isResetMode ? 'Nueva contraseña' : 'Recuperar contraseña'}</h1>

            {success && (
              <div className="success-message" role="status">
                {success}
              </div>
            )}
            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            {!success && (
              <>
                {isResetMode ? (
                  <form onSubmit={handleResetPassword} className="forgot-password-form">
                    <div className="form-group">
                      <label htmlFor="newPassword">Nueva contraseña</label>
                      <div className="password-input-wrapper">
                        <input
                          id="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={password.new}
                          onChange={(e) => setPassword((p) => ({ ...p, new: e.target.value }))}
                          placeholder="Mínimo 10 caracteres"
                          minLength={MIN_PASSWORD_LENGTH}
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          <Icon name={showPassword ? 'eye' : 'eyeSlash'} size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirmar contraseña</label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={password.confirm}
                        onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))}
                        placeholder="Repite la contraseña"
                        minLength={MIN_PASSWORD_LENGTH}
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" variant="primary" loading={loading} fullWidth>
                      Restablecer contraseña
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleRequestReset} className="forgot-password-form">
                    <p className="forgot-password-card__description">
                      Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" variant="primary" loading={loading} fullWidth>
                      Enviar enlace
                    </Button>
                  </form>
                )}
              </>
            )}

            <div className="forgot-password-footer">
              <Link to={ROUTES.LOGIN} className="link-back">
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </MainContent>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
