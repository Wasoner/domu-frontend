import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context';
import { AuthLayout } from '../layout';
import { ROUTES } from '../constants';
import './ResidentProfile.css';

/**
 * Resident Profile Page Component
 * Displays user profile information and allows editing
 */
const ResidentProfile = () => {
    const navigate = useNavigate();
    const { user } = useAppContext();

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

    return (
        <AuthLayout user={user}>
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

                <section className="resident-profile__content">
                    <div className="resident-profile__card">
                        <h2>Información Personal</h2>
                        <div className="resident-profile__info-grid">
                            <div className="resident-profile__info-item">
                                <label>Nombre completo</label>
                                <p>{displayName}</p>
                            </div>
                            <div className="resident-profile__info-item">
                                <label>Correo electrónico</label>
                                <p>{user?.email || 'No disponible'}</p>
                            </div>
                            <div className="resident-profile__info-item">
                                <label>Tipo de usuario</label>
                                <p>{roleLabel}</p>
                            </div>
                            <div className="resident-profile__info-item">
                                <label>Unidad</label>
                                <p>{unitLabel}</p>
                            </div>
                        </div>
                    </div>

                    <div className="resident-profile__card">
                        <h2>Información de la Comunidad</h2>
                        <div className="resident-profile__info-grid">
                            <div className="resident-profile__info-item">
                                <label>Edificio</label>
                                <p>Edificio Orompello</p>
                            </div>
                            <div className="resident-profile__info-item">
                                <label>Ciudad</label>
                                <p>Concepción</p>
                            </div>
                        </div>
                    </div>
                </section>
            </article>
        </AuthLayout>
    );
};

export default ResidentProfile;

