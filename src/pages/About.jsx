import { Header, MainContent, Footer } from '../layout';
import { Seo } from '../components';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <Seo
        title="Acerca de Domu | Plataforma para administración de condominios"
        description="Conoce Domu, la plataforma integral para administrar edificios y condominios con pagos de gastos comunes, comunicación y control de accesos."
        keywords="sobre domu, plataforma condominios, software administración edificios"
        canonicalPath="/about"
      />
      <Header />

      <MainContent>
        <article>
          <h1>Acerca de Domu</h1>
          <p>Domu es una plataforma integral diseñada para simplificar la administración de edificios y condominios. Ofrecemos herramientas modernas y eficientes para gestionar tu comunidad.</p>
        </article>
      </MainContent>

      <Footer />
    </div>
  );
};

export default About;
