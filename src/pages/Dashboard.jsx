import { useAppContext } from '../context';
import { Header, MainContent, Footer } from '../layout';
import './Dashboard.css';

/**
 * Dashboard Page Component
 * Main dashboard for administrators to manage communities
 */
const Dashboard = () => {
    const { user } = useAppContext();

    return (
        <div className="dashboard-page">
            <Header />
            <MainContent>
                <article>
                    <h1>Dashboard Administrativo</h1>
                    <p>Bienvenido, {user?.email || 'Administrador'}</p>

                    <section style={{ marginTop: '2rem' }}>
                        <h2>Funcionalidades principales</h2>
                        <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
                            <li>Gestión de comunidades</li>
                            <li>Gestión de residentes</li>
                            <li>Gastos comunes</li>
                            <li>Facturación</li>
                            <li>Comunicaciones</li>
                            <li>Eventos y actividades</li>
                            <li>Reportería</li>
                        </ul>
                    </section>
                </article>

                <div style={{ marginTop: '2rem', color: 'var(--color-gray-dark)' }}>
                    <p>🚧 Esta sección está en desarrollo</p>
                </div>
            </MainContent>
            <Footer />
        </div>
    );
};

export default Dashboard;

