import { useMemo } from 'react';
import { useAppContext } from '../context';
import { ProtectedLayout } from '../layout';
import { VisitRegistrationPanel, Icon } from '../components';
import './ResidentVisits.scss';

const ROLE_LABELS = {
    resident: 'Residente',
    concierge: 'Conserje',
    admin: 'Administrador',
};

const ResidentVisits = () => {
    const { user } = useAppContext();

    const roleLabel = useMemo(() => {
        if (!user) return null;
        let role;
        if (user.userType) role = user.userType;
        else if (user.roleId === 1) role = 'admin';
        else if (user.roleId === 3) role = 'concierge';
        else role = 'resident';
        return ROLE_LABELS[role] || 'Usuario';
    }, [user]);

    return (
        <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
            <article className="resident-visits page-shell">
                <header className="resident-visits__intro">
                    <div className="resident-visits__intro-row">
                        <div className="resident-visits__intro-text">
                            <p className="resident-visits__eyebrow">Visitas</p>
                            <h1>Registro de visitas</h1>
                            <p className="resident-visits__subtitle">
                                Controla quién ingresa a tu comunidad y comparte la información con recepción para agilizar el ingreso.
                            </p>
                        </div>
                        {roleLabel && (
                            <div className="resident-visits__role-pill">
                                <span className="resident-visits__role-icon" aria-hidden="true">
                                    <Icon name="userCircle" size={18} />
                                </span>
                                {roleLabel}
                            </div>
                        )}
                    </div>
                </header>

                <VisitRegistrationPanel user={user} />
            </article>
        </ProtectedLayout>
    );
};

export default ResidentVisits;


