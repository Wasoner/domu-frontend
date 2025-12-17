import { useAppContext } from '../context';
import { ProtectedLayout } from '../layout';
import { VisitRegistrationPanel } from '../components';
import './Dashboard.css';

const adminHighlights = [
    {
        icon: '📊',
        title: 'Panel de indicadores',
        description: 'Observa ocupación, pagos y alertas globales ni bien ingresas.',
    },
    {
        icon: '🧩',
        title: 'Módulos clave',
        description: 'Accesos directos a comunidades, residentes, gastos comunes y cobranzas.',
    },
    {
        icon: '📣',
        title: 'Centro de avisos',
        description: 'Mensajes internos, tareas pendientes y recordatorios automáticos.',
    },
];

const adminLayoutSteps = [
    {
        title: '1. Encabezado inteligente',
        description: 'Barra superior con menú, selector de comunidad y controles de sesión.',
    },
    {
        title: '2. Tarjetas resumen',
        description: 'Indicadores principales con estado de cobros, tickets y ocupación.',
    },
    {
        title: '3. Panel lateral',
        description: 'Timeline de eventos, últimos movimientos y próximas tareas.',
    },
    {
        title: '4. Zona de detalle',
        description: 'Secciones inferiores para profundizar en comunidades, residentes y finanzas.',
    },
];

/**
 * Dashboard Page Component
 * Main dashboard for administrators to manage communities
 */
const Dashboard = () => {
    const { user } = useAppContext();

    return (
        <ProtectedLayout allowedRoles={['admin', 'concierge']}>
            <article>
                <h1>Dashboard Administrativo</h1>
                <p>Bienvenido, {user?.email || 'Administrador'}</p>

                <section className="info-banner info-banner--notice" aria-live="polite">
                    <strong>Recuerda avisar a tus usuarios</strong>
                    <p>Las cuentas creadas por el admin se generan con contraseña por defecto 1234567890. Pídeles cambiarla en su perfil.</p>
                </section>

                <section className="info-banner" aria-live="polite">
                    <strong>Nuevo ingreso detectado</strong>
                    <p>
                        Usa las tarjetas de ayuda para ubicar rápidamente cada bloque del portal.
                        Puedes volver a esta guía desde el menú de ayuda.
                    </p>
                </section>

                <section className="info-grid" aria-label="Mapa del dashboard administrativo">
                    {adminHighlights.map((item) => (
                        <article className="info-card" key={item.title}>
                            <span className="info-card__icon" aria-hidden="true">
                                {item.icon}
                            </span>
                            <div>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </div>
                        </article>
                    ))}
                </section>

                <section className="layout-guide">
                    <h2>¿Cómo está distribuido el portal?</h2>
                    <ol className="layout-steps">
                        {adminLayoutSteps.map((step) => (
                            <li key={step.title}>
                                <h4>{step.title}</h4>
                                <p>{step.description}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="features-section">
                    <h2>Funcionalidades principales</h2>
                    <ul>
                        <li>Gestión de comunidades</li>
                        <li>Gestión de residentes</li>
                        <li>Gastos comunes</li>
                        <li>Facturación</li>
                        <li>Comunicaciones</li>
                        <li>Eventos y actividades</li>
                        <li>Reportería</li>
                    </ul>
                </section>

                <VisitRegistrationPanel user={user} />
            </article>

            <div className="under-construction">
                <p>🚧 Esta sección está en desarrollo</p>
            </div>
        </ProtectedLayout>
    );
};

export default Dashboard;

