import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header, MainContent, Footer } from '../layout';
import { Button } from '../components';
import { ROUTES } from '../constants';
import './Login.css';

/**
 * Login Page Component
 * Handles user authentication for both administrators and residents
 */
const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        userType: 'resident',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login attempt:', formData);

        if (formData.userType === 'admin') {
            navigate(ROUTES.DASHBOARD);
        } else {
            navigate(ROUTES.RESIDENT_PORTAL);
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
                        <div className="form-group">
                            <label htmlFor="userType">Tipo de usuario</label>
                            <select
                                id="userType"
                                name="userType"
                                value={formData.userType}
                                onChange={handleChange}
                                required
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
                            />
                        </div>

                        <Button type="submit" variant="primary">Iniciar Sesión</Button>
                    </form>

                    <Link to={ROUTES.HOME} className="link-back">
                        ← Volver al inicio
                    </Link>
                </div>
            </MainContent>
            <Footer />
        </div>
    );
};

export default Login;
