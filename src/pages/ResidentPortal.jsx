import { useAppContext } from '../context';
import { Header, MainContent, Footer } from '../layout';
import './ResidentPortal.css';

/**
 * Resident Portal Page Component
 * Portal for residents to access their community information
 */
const ResidentPortal = () => {
    const { user } = useAppContext();

    return (
        <div className="resident-portal-page">
            <Header />
            <MainContent>
                <article>
                    <h1>Portal de Residente</h1>
                    <p>Bienvenido, {user?.email || 'Residente'}</p>

                    <section style={{ marginTop: '2rem' }}>
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

                    <div style={{ marginTop: '2rem', color: 'var(--color-gray-dark)' }}>
                        <p>🚧 Esta sección está en desarrollo</p>
                    </div>
                </article>
            </MainContent>
            <Footer />
        </div>
    );
};

export default ResidentPortal;

