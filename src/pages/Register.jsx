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
 * Handles user registration for residents and concierge profiles
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            const derivedRoleId = formData.roleId
                ? parseInt(formData.roleId, 10)
                : (formData.userType === 'concierge' ? 3 : 2);

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
                roleId: derivedRoleId,
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
                        navigate(ROUTES.RESIDENT_PORTAL);
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
                                <option value="concierge">Conserje</option>
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
                                    minLength={10}
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
                            <small className="form-hint">Mínimo 10 caracteres</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                            <div className="password-input-wrapper">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                    minLength={10}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={loading}
                                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {showConfirmPassword ? (
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

