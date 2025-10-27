import { useState } from 'react';
import { Button, FeatureCard, ResidentCard, CTASection } from '../components';
import { Header, MainContent, Footer } from '../layout';
import heroLogo from '../assets/LogotipoDOMU.svg';

/**
 * Home Page Component
 * Example of a page component wrapped in a layout
 */
const Home = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="home-page">
      <Header />

      <MainContent>
        <div className="home-grid">
          <div className="left-column">
            <h1>Software para la administración de edificios y condominios</h1>
            <p className="lead">Administra edificios con Domu: el software y la aplicación para tu comunidad. Gastos Comunes en línea y mucho más.</p>

            {/* Placeholder image (we ignore video as requested) */}
            <div className="hero-media" aria-hidden>
              <img src={heroLogo} alt="DOMU hero" className="hero-logo" />
            </div>
          </div>

          <aside className="right-column">
            <div className="stack-cards">
              <FeatureCard title="Crea tu comunidad">
                <p>Una vez creada tu comunidad te contactaremos para seguir avanzando.</p>
                <Button onClick={() => { }}>Crea tu Comunidad</Button>
              </FeatureCard>

              <ResidentCard title="¿Eres residente?">
                <p>Ingresa a tu portal para pagos y comunicación.</p>
                <div style={{ marginTop: 12 }}>
                  <Button onClick={() => { }}>Soy residente</Button>
                </div>
              </ResidentCard>

              <FeatureCard title="Prueba gratis">
                <p>Explora la demo online</p>
                <Button onClick={() => { }}>Entrar Demo Online Gratis</Button>
              </FeatureCard>
            </div>
          </aside>
        </div>
      </MainContent>

      <Footer />
    </div>
  );
};

export default Home;
