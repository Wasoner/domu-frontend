import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header, MainContent, Footer } from '../layout';
import { Button, Icon, Seo } from '../components';
import { ROUTES } from '../constants';
import { api } from '../services';
import { useAppContext } from '../context';
import './Login.scss';

/**
 * Login Page Component
 * Handles user authentication for both administrators and residents
 */
const Login = () => {
    const navigate = useNavigate();
    const { setUser } = useAppContext();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Llamar al backend para autenticar (solo email y password)
            const response = await api.auth.login(
                formData.email,
                formData.password
            );

            // Determinar el tipo de usuario basado en roleId de la respuesta
            const userRoleId = response.user?.roleId;
            const userType = userRoleId === 1
                ? 'admin'
                : userRoleId === 3
                    ? 'concierge'
                    : userRoleId === 4
                        ? 'staff'
                        : 'resident';

            // Guardar información del usuario en el contexto
            setUser({
                email: formData.email,
                userType: userType,
                isAuthenticated: true,
                ...response.user,
            });

            // Navegar según el tipo de usuario
            if (userType === 'admin') {
                navigate(ROUTES.DASHBOARD);
            } else {
                navigate(ROUTES.RESIDENT_PORTAL);
            }
        } catch (err) {
            console.error('Error en login:', err);
            const msg = (err.message || '').toLowerCase();
            if (msg.includes('invalid credentials') || msg.includes('credenciales') || msg.includes('unauthorized')) {
                setError('Correo o contraseña incorrectos');
            } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('conectar')) {
                setError('No se pudo conectar con el servidor');
            } else {
                setError(err.message || 'Error al iniciar sesión. Intenta de nuevo más tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="login-page">
            <Seo
                title="Ingresar a Domu | Portal seguro para residentes y administradores"
                description="Accede al portal seguro de Domu para gestionar tu comunidad, revisar gastos comunes y administrar residentes."
                canonicalPath="/login"
                noindex
            />
            <Header />
            <MainContent>
                <div className="login-container fade-in">
                    <div className="login-card">
                        <div className="login-intro">
                            <div className="login-intro__eyebrow">Bienvenido a Domu</div>
                            <h1>Gestiona tu comunidad</h1>
                            <p className="login-intro__lead">
                                Accede a una plataforma integral para la administración de tu edificio.
                            </p>
                            <ul className="login-intro__list">
                                <li>Revisa y paga tus gastos comunes</li>
                                <li>Reserva espacios comunes fácilmente</li>
                                <li>Gestiona visitas y encomiendas</li>
                                <li>Vota en las decisiones de tu comunidad</li>
                            </ul>
                        </div>
                        
                        <div className="login-form-panel">
                            <h2>Iniciar Sesión</h2>
                            <form onSubmit={handleSubmit} className="login-form" aria-label="Formulario de inicio de sesión">
                                {error && (
                                    <div className="error-message" role="alert">
                                        {error}
                                    </div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="tu@email.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <div className="form-group__label-row">
                                        <label htmlFor="password">Contraseña</label>
                                        <Link to={ROUTES.FORGOT_PASSWORD} className="link-forgot">
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
                                    <div className="password-input-wrapper">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            required
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={loading}
                                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                        >
                                            <Icon name={showPassword ? 'eye' : 'eyeSlash'} size={20} />
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={loading}
                                    fullWidth
                                >
                                    Iniciar Sesión
                                </Button>
                            </form>

                            <div className="login-footer">
                                <p>
                                    ¿No tienes una cuenta?{' '}
                                    <Link to={ROUTES.REGISTER} className="link-register">
                                        Regístrate aquí
                                    </Link>
                                </p>
                                <Link to={ROUTES.HOME} className="link-back">
                                    ← Volver al inicio
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </MainContent>
            <Footer />
        </div>
    );
};

export default Login;
