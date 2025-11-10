import { Button, FeatureCard, ResidentCard } from '../components';
import { Header, MainContent, Footer } from '../layout';
import heroLogo from '../assets/LogotipoDOMU.svg';
import { ROUTES } from '../constants';
import './Home.css';

/**
 * Home Page Component
 * Main landing page for Domu platform
 */
const Home = () => {
  const handleCreateCommunity = () => {
    // TODO: Implement community creation flow
    console.log('Creating community...');
    // Navigate to login or create account
    window.location.href = ROUTES.LOGIN;
  };

  const handleResidentLogin = () => {
    // Navigate to login page for residents
    window.location.href = ROUTES.LOGIN;
  };

  const handleDemoAccess = () => {
    // TODO: Implement demo access flow
    console.log('Accessing demo...');
    // For now, redirect to about page
    window.location.href = ROUTES.ABOUT;
  };

  return (
    <div className="home-page fade-in">
      <Header />

      <MainContent>
        <div className="container">
          <div className="home-grid">
            <section className="left-column">
              <h1>Software para la administración de edificios y condominios</h1>
              <p className="lead">Administra edificios con Domu: el software y la aplicación para tu comunidad. Gastos Comunes en línea y mucho más.</p>

              <div className="hero-media">
                <img src={heroLogo} alt="DOMU - Software para administración de edificios y condominios" className="hero-logo" />
              </div>
            </section>

            <aside className="right-column" aria-label="Acciones principales">
              <div className="stack-cards">
                <FeatureCard title="Crea tu comunidad">
                  <p>Una vez creada tu comunidad te contactaremos para seguir avanzando.</p>
                  <Button onClick={handleCreateCommunity} variant="primary">
                    Crea tu Comunidad
                  </Button>
                </FeatureCard>

                <ResidentCard title="¿Eres residente?">
                  <p>Ingresa a tu portal para pagos y comunicación.</p>
                  <Button onClick={handleResidentLogin} variant="primary">
                    Soy residente
                  </Button>
                </ResidentCard>

                <FeatureCard title="Prueba gratis">
                  <p>Explora la demo online</p>
                  <Button onClick={handleDemoAccess} variant="primary">
                    Entrar Demo Online Gratis
                  </Button>
                </FeatureCard>
              </div>
            </aside>
          </div>
        </div>
      </MainContent>

      <Footer />
    </div>
  );
};

export default Home;
