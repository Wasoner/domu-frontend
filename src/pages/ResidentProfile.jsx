import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
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
    const [activeTab, setActiveTab] = useState('overview');
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

    const displayName = useMemo(() => (user?.firstName
        ? `${user.firstName} ${user?.lastName || ''}`.trim()
        : user?.email || 'Usuario Domu'), [user]);

    const roleLabel = useMemo(() => {
        if (user?.userType === 'admin') return 'Administrador';
        if (user?.userType === 'concierge') return 'Conserje';
        return 'Residente';
    }, [user]);

    const unitLabel = user?.unitId ? `Unidad ${user.unitId}` : 'Sin unidad asignada';

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

    const backButton = (
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
    );

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
        <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']} bodyActions={backButton}>
            <article className="resident-profile">
                <header className="resident-profile__header">
                    <h1>Mi Perfil</h1>
                </header>

                {(error || message) && (
                    <div className={`resident-profile__alert ${error ? 'is-error' : 'is-success'}`}>
                        {error || message}
                    </div>
                )}

                <section className="resident-profile__content">
                    <div className="resident-profile__tabs" role="tablist" aria-label="Información de perfil">
                        <button
                            type="button"
                            className={`resident-profile__tab ${activeTab === 'overview' ? 'is-active' : ''}`}
                            role="tab"
                            aria-selected={activeTab === 'overview'}
                            onClick={() => setActiveTab('overview')}
                        >
                            Información personal
                        </button>
                        <button
                            type="button"
                            className={`resident-profile__tab ${activeTab === 'edit' ? 'is-active' : ''}`}
                            role="tab"
                            aria-selected={activeTab === 'edit'}
                            onClick={() => setActiveTab('edit')}
                        >
                            Editar y seguridad
                        </button>
                    </div>

                    {activeTab === 'overview' && (
                        <div className="resident-profile__grid">
                            <article className="resident-profile__card resident-profile__card--summary">
                                <div className="profile-summary__top">
                                    <div>
                                        <p className="profile-summary__eyebrow">Cuenta</p>
                                        <h2>{displayName}</h2>
                                        <p className="profile-summary__role">{roleLabel}</p>
                                    </div>
                                    <div className="profile-summary__badge">{unitLabel}</div>
                                </div>
                                <div className="profile-summary__details">
                                    <div>
                                        <p className="profile-summary__label">Correo</p>
                                        <p className="profile-summary__value">{user?.email || 'Sin correo'}</p>
                                    </div>
                                    <div>
                                        <p className="profile-summary__label">Teléfono</p>
                                        <p className="profile-summary__value">{user?.phone || 'No definido'}</p>
                                    </div>
                                    <div>
                                        <p className="profile-summary__label">Documento</p>
                                        <p className="profile-summary__value">{user?.documentNumber || 'No definido'}</p>
                                    </div>
                                </div>
                            </article>
                        </div>
                    )}

                    {activeTab === 'edit' && (
                        <div className="resident-profile__grid">
                            <article className="resident-profile__card resident-profile__card--form">
                                <h2>Editar información y seguridad</h2>
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
                                    </div>
                                    <div className="resident-profile__actions">
                                        <button type="submit" className="btn btn-primary" disabled={saving}>
                                            {saving ? 'Guardando...' : 'Guardar cambios'}
                                        </button>
                                    </div>
                                </form>

                                <div className="resident-profile__divider" role="presentation" />

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
                            </article>
                        </div>
                    )}
                </section>
            </article>
        </ProtectedLayout>
    );
};

export default ResidentProfile;

