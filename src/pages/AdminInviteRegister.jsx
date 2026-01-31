import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header, MainContent, Footer } from '../layout';
import { Button, Seo, Spinner } from '../components';
import { ROUTES } from '../constants';
import { api } from '../services';
import './AdminInviteRegister.scss';

const MIN_PASSWORD_LENGTH = 10;

const AdminInviteRegister = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [communityName, setCommunityName] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentNumber: '',
    password: '',
    confirmPassword: '',
  });

  const inviteCode = searchParams.get('code');

  useEffect(() => {
    const fetchInvite = async () => {
      if (!inviteCode) {
        setError('Enlace inválido: falta el código de invitación.');
        setLoadingInvite(false);
        return;
      }
      try {
        setError('');
        const invite = await api.adminInvites.getInfo(inviteCode);
        setCommunityName(invite.communityName || '');
        setFormData((prev) => ({
          ...prev,
          firstName: invite.firstName || '',
          lastName: invite.lastName || '',
          email: invite.adminEmail || '',
          phone: invite.phone || '',
          documentNumber: invite.documentNumber || '',
        }));
      } catch (fetchError) {
        console.error('Error obteniendo invitación de admin:', fetchError);
        setError(fetchError.message || 'No pudimos cargar la invitación.');
      } finally {
        setLoadingInvite(false);
      }
    };

    fetchInvite();
  }, [inviteCode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError('');
    setSuccess('');

    if (!inviteCode) {
      setError('No se encontró el código de invitación.');
      return;
    }

    if (!formData.password || formData.password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setSubmitting(true);
      await api.adminInvites.register(inviteCode, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        documentNumber: formData.documentNumber,
        password: formData.password,
      });
      setSuccess('¡Cuenta creada! Ya puedes iniciar sesión con tu correo.');
      setTimeout(() => navigate(ROUTES.LOGIN), 1600);
    } catch (submitError) {
      console.error('Error registrando admin desde invitación:', submitError);
      setError(submitError.message || 'No pudimos crear tu cuenta. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-invite-page">
      <Seo
        title="Invitación de administrador | Domu"
        description="Completa tu registro seguro para administrar comunidades en Domu."
        canonicalPath="/admin-invite"
        noindex
      />
      <Header />
      <MainContent>
        <div className="admin-invite-card fade-in">
          <h1>Crear usuario administrador</h1>
          {communityName && (
            <p className="admin-invite-subtitle">
              Comunidad: <strong>{communityName}</strong>
            </p>
          )}

          {error && (
            <div className="admin-invite-message error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="admin-invite-message success" role="status">
              {success}
            </div>
          )}

          {loadingInvite ? (
            <p className="admin-invite-loading">Cargando datos de la invitación…</p>
          ) : (
            <form className="admin-invite-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Nombre</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Apellido</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  aria-disabled="true"
                />
                <small className="field-hint">Lo tomamos de tu solicitud.</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Teléfono</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="documentNumber">Documento</label>
                  <input
                    id="documentNumber"
                    name="documentNumber"
                    type="text"
                    value={formData.documentNumber}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={MIN_PASSWORD_LENGTH}
                  required
                  disabled={submitting}
                />
                <small className="field-hint">Mínimo {MIN_PASSWORD_LENGTH} caracteres.</small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength={MIN_PASSWORD_LENGTH}
                  required
                  disabled={submitting}
                />
              </div>

              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? <Spinner size="sm" inline label="Creando cuenta…" /> : 'Crear cuenta'}
              </Button>

              <p className="admin-invite-back">
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => navigate(ROUTES.LOGIN)}
                  disabled={submitting}
                >
                  Inicia sesión
                </button>
              </p>
            </form>
          )}
        </div>
      </MainContent>
      <Footer />
    </div>
  );
};

export default AdminInviteRegister;
