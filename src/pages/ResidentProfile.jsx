import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppContext } from '../context';
import { ProtectedLayout } from '../layout';
import { ROUTES } from '../constants';
import { api } from '../services';
import './ResidentProfile.css';

/**
 * Resident Profile Page Component
 * Displays user profile information and allows editing
 */
const ResidentProfile = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAppContext();
    const [editData, setEditData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        documentNumber: user?.documentNumber || '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [saving, setSaving] = useState(false);
    const [changingPass, setChangingPass] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const displayName = user?.firstName
        ? `${user.firstName} ${user?.lastName || ''}`.trim()
        : user?.email || 'Usuario Domu';
    const roleLabel = user?.userType === 'admin'
        ? 'Administrador'
        : user?.userType === 'concierge'
            ? 'Conserje'
            : 'Residente';
    const unitLabel = user?.unitId
        ? `Unidad ${user.unitId}`
        : 'Unidad 1502';

    // Determinar la ruta del panel principal según el tipo de usuario
    const getMainPanelRoute = () => {
        if (user?.userType === 'admin') {
            return ROUTES.DASHBOARD;
        }
        return ROUTES.RESIDENT_PORTAL;
    };

    const handleGoBack = () => {
        navigate(getMainPanelRoute());
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            setSaving(true);
            const updated = await api.users.updateProfile(editData);
            setUser(updated);
            setMessage('Perfil actualizado correctamente.');
        } catch (err) {
            setError(err.message || 'No pudimos actualizar tu perfil.');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Las contraseñas nuevas no coinciden.');
            return;
        }
        try {
            setChangingPass(true);
            await api.users.changePassword(passwordData.currentPassword, passwordData.newPassword);
            setMessage('Contraseña actualizada correctamente.');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.message || 'No pudimos actualizar tu contraseña.');
        } finally {
            setChangingPass(false);
        }
    };

    return (
        <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
            <article className="resident-profile">
                <header className="resident-profile__header">
                    <button
                        className="resident-profile__back-button"
                        onClick={handleGoBack}
                        aria-label="Volver al panel principal"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Volver
                    </button>
                    <h1>Mi Perfil</h1>
                    <p className="resident-profile__subtitle">
                        Gestiona tu información personal y preferencias de cuenta
                    </p>
                </header>

                {(error || message) && (
                    <div className={`resident-profile__alert ${error ? 'is-error' : 'is-success'}`}>
                        {error || message}
                    </div>
                )}

                <section className="resident-profile__content">
                    <div className="resident-profile__card">
                        <h2>Información Personal</h2>
                        <form className="resident-profile__form" onSubmit={handleProfileSubmit}>
                            <div className="resident-profile__info-grid">
                                <div className="resident-profile__info-item">
                                    <label>Nombre</label>
                                    <input
                                        value={editData.firstName}
                                        onChange={(e) => setEditData((p) => ({ ...p, firstName: e.target.value }))}
                                        required
                                        disabled={saving}
                                    />
                                </div>
                                <div className="resident-profile__info-item">
                                    <label>Apellido</label>
                                    <input
                                        value={editData.lastName}
                                        onChange={(e) => setEditData((p) => ({ ...p, lastName: e.target.value }))}
                                        required
                                        disabled={saving}
                                    />
                                </div>
                                <div className="resident-profile__info-item">
                                    <label>Correo electrónico</label>
                                    <input value={user?.email || ''} disabled />
                                </div>
                                <div className="resident-profile__info-item">
                                    <label>Teléfono</label>
                                    <input
                                        value={editData.phone}
                                        onChange={(e) => setEditData((p) => ({ ...p, phone: e.target.value }))}
                                        required
                                        disabled={saving}
                                    />
                                </div>
                                <div className="resident-profile__info-item">
                                    <label>Documento</label>
                                    <input
                                        value={editData.documentNumber}
                                        onChange={(e) => setEditData((p) => ({ ...p, documentNumber: e.target.value }))}
                                        required
                                        disabled={saving}
                                    />
                                </div>
                                <div className="resident-profile__info-item">
                                    <label>Tipo de usuario</label>
                                    <input value={roleLabel} disabled />
                                </div>
                                <div className="resident-profile__info-item">
                                    <label>Unidad</label>
                                    <input value={unitLabel} disabled />
                                </div>
                            </div>
                            <div className="resident-profile__actions">
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="resident-profile__card">
                        <h2>Cambiar contraseña</h2>
                        <form className="resident-profile__form" onSubmit={handlePasswordSubmit}>
                            <div className="resident-profile__info-grid resident-profile__info-grid--narrow">
                                <div className="resident-profile__info-item">
                                    <label>Contraseña actual</label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
                                        required
                                        disabled={changingPass}
                                    />
                                </div>
                                <div className="resident-profile__info-item">
                                    <label>Nueva contraseña</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                                        required
                                        minLength={10}
                                        disabled={changingPass}
                                    />
                                </div>
                                <div className="resident-profile__info-item">
                                    <label>Confirmar nueva contraseña</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
                                        required
                                        minLength={10}
                                        disabled={changingPass}
                                    />
                                </div>
                            </div>
                            <div className="resident-profile__actions">
                                <button type="submit" className="btn btn-primary" disabled={changingPass}>
                                    {changingPass ? 'Actualizando...' : 'Actualizar contraseña'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </article>
        </ProtectedLayout>
    );
};

export default ResidentProfile;

