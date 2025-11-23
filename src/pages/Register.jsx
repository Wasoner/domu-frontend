import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header, MainContent, Footer } from '../layout';
import { Button } from '../components';
import { ROUTES } from '../constants';
import { api } from '../services';
import { useAppContext } from '../context';
import './Register.css';

/**
 * Register Page Component
 * Handles user registration for both administrators and residents
 */
const Register = () => {
    const navigate = useNavigate();
    const { setUser } = useAppContext();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'resident',
        phone: '',
        documentNumber: '',
        birthDate: '',
        resident: true,
        unitId: '',
        roleId: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Validar que las contraseñas coincidan
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        // Validar longitud mínima de contraseña (backend requiere mínimo 10)
        if (formData.password.length < 10) {
            setError('La contraseña debe tener al menos 10 caracteres');
            setLoading(false);
            return;
        }

        // Validar campos requeridos
        if (!formData.phone || formData.phone.trim() === '') {
            setError('El teléfono es requerido');
            setLoading(false);
            return;
        }

        if (!formData.documentNumber || formData.documentNumber.trim() === '') {
            setError('El número de documento es requerido');
            setLoading(false);
            return;
        }

        if (!formData.birthDate) {
            setError('La fecha de nacimiento es requerida');
            setLoading(false);
            return;
        }

        if (!formData.unitId || formData.unitId.trim() === '') {
            setError('El ID de unidad es requerido');
            setLoading(false);
            return;
        }
        
        // Validar que unitId sea un número
        const unitIdNum = parseInt(formData.unitId, 10);
        if (isNaN(unitIdNum) || unitIdNum <= 0) {
            setError('El ID de unidad debe ser un número válido mayor a 0');
            setLoading(false);
            return;
        }

        try {
            // Preparar datos para enviar al backend según lo que espera RegistrationRequest
            // El backend espera: firstName, lastName, email, password, phone, documentNumber, 
            // birthDate, resident, unitId (número), roleId (número)
            const registerData = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                password: formData.password,
                phone: formData.phone.trim(),
                documentNumber: formData.documentNumber.trim(),
                birthDate: formData.birthDate,
                resident: formData.resident,
                // unitId debe ser un número (ID de la unidad de vivienda)
                // IMPORTANTE: La unidad debe existir en la base de datos antes de registrar el usuario
                unitId: parseInt(formData.unitId, 10),
                // roleId se asigna automáticamente según el tipo de usuario
                roleId: formData.roleId || (formData.userType === 'admin' ? 1 : 2),
            };
            
            // Validar que unitId sea un número válido
            if (isNaN(registerData.unitId) || registerData.unitId <= 0) {
                setError('El ID de unidad debe ser un número válido mayor a 0');
                setLoading(false);
                return;
            }

            // Llamar al backend para registrar
            const response = await api.auth.register(registerData);

            // Si el registro fue exitoso
            setSuccess('¡Registro exitoso! Redirigiendo...');

            // Guardar información del usuario en el contexto si viene en la respuesta
            if (response.user || response.token) {
                setUser({
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    userType: formData.userType,
                    ...response.user,
                });

                // Si el backend retorna un token, navegar automáticamente
                if (response.token) {
                    setTimeout(() => {
                        if (formData.userType === 'admin') {
                            navigate(ROUTES.DASHBOARD);
                        } else {
                            navigate(ROUTES.RESIDENT_PORTAL);
                        }
                    }, 1500);
                } else {
                    // Si no hay token, redirigir al login
                    setTimeout(() => {
                        navigate(ROUTES.LOGIN);
                    }, 2000);
                }
            } else {
                // Si no hay respuesta de usuario, redirigir al login
                setTimeout(() => {
                    navigate(ROUTES.LOGIN);
                }, 2000);
            }
        } catch (error) {
            console.error('Error en registro:', error);
            setError(error.message || 'Error al registrar. Por favor, intenta nuevamente.');
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
        <div className="register-page">
            <Header />
            <MainContent>
                <div className="register-container fade-in">
                    <h1>Crear Cuenta</h1>

                    <form onSubmit={handleSubmit} className="register-form" aria-label="Formulario de registro">
                        {error && (
                            <div className="error-message" role="alert">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="success-message" role="alert">
                                {success}
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

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">Nombre</label>
                                <input
                                    id="firstName"
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Juan"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">Apellido</label>
                                <input
                                    id="lastName"
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Pérez"
                                    required
                                    disabled={loading}
                                />
                            </div>
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

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="phone">Teléfono</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+56 9 1234 5678"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="documentNumber">Número de Documento</label>
                                <input
                                    id="documentNumber"
                                    type="text"
                                    name="documentNumber"
                                    value={formData.documentNumber}
                                    onChange={handleChange}
                                    placeholder="12345678-9"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="birthDate">Fecha de Nacimiento</label>
                            <input
                                id="birthDate"
                                type="date"
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="unitId">ID de Unidad</label>
                            <input
                                id="unitId"
                                type="number"
                                name="unitId"
                                value={formData.unitId}
                                onChange={handleChange}
                                placeholder="Ej: 1, 2, 3..."
                                required
                                disabled={loading}
                                min="1"
                            />
                            <small className="form-hint">
                                ID numérico de la unidad de vivienda (debe existir en la base de datos).
                                <br />
                                <strong>Nota:</strong> La unidad debe crearse antes de registrar el usuario.
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="resident">
                                <input
                                    id="resident"
                                    type="checkbox"
                                    name="resident"
                                    checked={formData.resident}
                                    onChange={(e) => setFormData(prev => ({ ...prev, resident: e.target.checked }))}
                                    disabled={loading}
                                />
                                {' '}Es residente
                            </label>
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
                                minLength={10}
                            />
                            <small className="form-hint">Mínimo 10 caracteres</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                                minLength={10}
                            />
                        </div>

                        <Button 
                            type="submit" 
                            variant="primary" 
                            disabled={loading}
                        >
                            {loading ? 'Registrando...' : 'Crear Cuenta'}
                        </Button>
                    </form>

                    <div className="register-footer">
                        <p>
                            ¿Ya tienes una cuenta?{' '}
                            <Link to={ROUTES.LOGIN} className="link-login">
                                Inicia sesión
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

export default Register;

