import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header, MainContent, Footer } from '../layout';
import { Button } from '../components';
import { ROUTES } from '../constants';
import { api } from '../services';
import { useAppContext } from '../context';
import './Login.css';

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
        userType: 'resident',
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
                    : 'resident';

            // Guardar información del usuario en el contexto
            setUser({
                email: formData.email,
                userType: userType,
                ...response.user,
            });

            // Navegar según el tipo de usuario
            if (userType === 'admin') {
                navigate(ROUTES.DASHBOARD);
            } else {
                navigate(ROUTES.RESIDENT_PORTAL);
            }
        } catch (error) {
            console.error('Error en login:', error);
            setError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
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
            <Header />
            <MainContent>
                <div className="login-container fade-in">
                    <h1>Iniciar Sesión</h1>

                    <form onSubmit={handleSubmit} className="login-form" aria-label="Formulario de inicio de sesión">
                        {error && (
                            <div className="error-message" role="alert">
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="userType">Tipo de usuario</label>
                            <select
                                id="userType"
                                name="userType"
                                value={formData.userType}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            >
                                <option value="resident">Residente</option>
                                <option value="concierge">Conserje</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>

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
                            <label htmlFor="password">Contraseña</label>
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
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M1 1l18 18M8.18 8.18a3 3 0 0 0 3.64 3.64M8.18 8.18L4.29 4.29m7.53 7.53l3.88 3.88M3.27 3.27L1.59 4.95m14.14 14.14l1.68-1.68M7.05 7.05L4.29 4.29m7.53 7.53l3.88 3.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7 1.5 0 2.91-.35 4.15-.95l-2.5-2.5a3 3 0 0 1-3.3-3.3L5.05 5.85C3.35 6.91 2.5 8.5 2.5 10c0 2.21 1.79 4 4 4 1.5 0 2.91-.35 4.15-.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
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
            </MainContent>
            <Footer />
        </div>
    );
};

export default Login;
