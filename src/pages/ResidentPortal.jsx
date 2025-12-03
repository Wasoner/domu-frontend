import { useAppContext } from '../context';
import { AuthLayout } from '../layout';
import { VisitRegistrationPanel } from '../components';
import './ResidentPortal.css';

const residentHighlights = [
    {
        icon: '🏠',
        title: 'Inicio personalizado',
        description: 'Resumen de pagos, reservas y mensajes de tu comunidad.',
    },
    {
        icon: '💳',
        title: 'Pagos al día',
        description: 'Accede directo a tus gastos comunes y estados de cuenta.',
    },
    {
        icon: '🤝',
        title: 'Vida en comunidad',
        description: 'Eventos, reglamentos y avisos importantes en un solo lugar.',
    },
];

const residentLayoutSteps = [
    {
        title: '1. Barra superior',
        description: 'Atajos a soporte, cambio de unidad y botón para cerrar sesión.',
    },
    {
        title: '2. Accesos rápidos',
        description: 'Tarjetas centrales con pagos, comunicaciones y eventos.',
    },
    {
        title: '3. Actividad reciente',
        description: 'Timeline con novedades de tu edificio y tickets pendientes.',
    },
    {
        title: '4. Centro de ayuda',
        description: 'Enlaces útiles y preguntas frecuentes en el pie del portal.',
    },
];

/**
 * Resident Portal Page Component
 * Portal for residents to access their community information
 */
const ResidentPortal = () => {
    const { user } = useAppContext();

    return (
        <AuthLayout user={user}>
            <article>
                    <h1>Portal de Residente</h1>
                    <p>Bienvenido, {user?.email || 'Residente'}</p>

                    <section className="info-banner" aria-live="polite">
                        <strong>Tips para orientarte</strong>
                        <p>
                            Recorre estos bloques para conocer cómo está distribuido tu portal.
                            Puedes ocultar esta guía una vez que te familiarices.
                        </p>
                    </section>

                    <section className="info-grid" aria-label="Mapa del portal de residente">
                        {residentHighlights.map((item) => (
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
                            {residentLayoutSteps.map((step) => (
                                <li key={step.title}>
                                    <h4>{step.title}</h4>
                                    <p>{step.description}</p>
                                </li>
                            ))}
                        </ol>
                    </section>

                    <section className="services-section">
                        <h2>Tus servicios</h2>
                        <div className="services-grid">
                            <div className="service-card">
                                <h3>Gastos Comunes</h3>
                                <p>Consulta y paga tus gastos comunes</p>
                                <button className="btn btn-primary">
                                    Ver Gastos
                                </button>
                            </div>

                            <div className="service-card">
                                <h3>Comunicaciones</h3>
                                <p>Revisa avisos y comunicaciones</p>
                                <button className="btn btn-primary">
                                    Ver Comunicaciones
                                </button>
                            </div>

                            <div className="service-card">
                                <h3>Eventos</h3>
                                <p>Consulta eventos y actividades</p>
                                <button className="btn btn-primary">
                                    Ver Eventos
                                </button>
                            </div>
                        </div>
                    </section>

                    <VisitRegistrationPanel user={user} />

                    <div className="under-construction">
                        <p>🚧 Esta sección está en desarrollo</p>
                    </div>
            </article>
        </AuthLayout>
    );
};

export default ResidentPortal;

