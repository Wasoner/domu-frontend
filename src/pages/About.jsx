import { Header, MainContent, Footer } from '../layout';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
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
