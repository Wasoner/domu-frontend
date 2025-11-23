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
            const userType = userRoleId === 1 ? 'admin' : 'resident';

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
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
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
