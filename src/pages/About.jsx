import { useNavigate } from 'react-router-dom';
import { Header, MainContent, Footer } from '../layout';
import { Button, Icon, Seo } from '../components';
import { ROUTES } from '../constants';
import './About.scss';

const impactHighlights = [
  {
    value: '<5 s',
    label: 'Registro de visitas diseñado para validarse en segundos mediante QR de cédula chilena.',
  },
  {
    value: '75%',
    label: 'Reducción de tareas manuales reportada en pilotos iniciales descritos en el informe.',
  },
  {
    value: '5 roles',
    label: 'Administrador, conserje, personal, residente y proveedor conectados en la misma plataforma.',
  },
  {
    value: '16 RF',
    label: 'Requerimientos funcionales definidos para seguridad, operación, finanzas y participación.',
  },
];

const strategicPillars = [
  {
    icon: 'shieldCheck',
    title: 'Seguridad y trazabilidad',
    description: 'Control de accesos, bitácoras y evidencia para reducir errores y mejorar el seguimiento.',
  },
  {
    icon: 'currencyDollar',
    title: 'Gestión financiera clara',
    description: 'Estados de gastos comunes, conciliación y reportes para decisiones transparentes.',
  },
  {
    icon: 'users',
    title: 'Comunidad activa',
    description: 'Canales para comunicación, reservas y votaciones que fortalecen la convivencia.',
  },
];

const coreModules = [
  {
    title: 'Accesos y visitas',
    description: 'Registro de ingreso/salida y preautorización de visitas con QR temporal.',
  },
  {
    title: 'Encomiendas',
    description: 'Recepción con evidencia y notificación automática al residente.',
  },
  {
    title: 'Finanzas y gastos comunes',
    description: 'Cobranza, pagos y seguimiento de morosidad en una sola vista.',
  },
  {
    title: 'Operación interna',
    description: 'Asignación de tareas y turnos para conserjería, aseo y personal de apoyo.',
  },
  {
    title: 'Espacios y participación',
    description: 'Reservas de áreas comunes, foros y votaciones con trazabilidad.',
  },
  {
    title: 'Soporte y mantenimiento',
    description: 'Tickets, proveedores y mantenimientos preventivos con historial centralizado.',
  },
];

const currentWebExperience = [
  'Portal de residentes con pagos, cartola, encomiendas y medidores.',
  'Módulos comunitarios como publicaciones, biblioteca y marketplace.',
  'Panel administrativo para incidencias, gastos comunes, personal y tareas.',
  'Landing de soluciones por perfil: conserjería, administrador, comité y residentes.',
];

const technicalStack = [
  'Frontend web: React + SCSS + Vite',
  'Backend: Java 21 + Javalin (API REST + JSON)',
  'Móvil: React Native + Expo',
  'Datos y seguridad: MySQL, JWT y RBAC',
];

const OPEN_COMMUNITY_MODAL_QUERY = 'openCommunityModal=1';

const About = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate(`${ROUTES.HOME}?${OPEN_COMMUNITY_MODAL_QUERY}`);
  };

  const handleGoSolutions = () => {
    navigate(ROUTES.SOLUCIONES_ADMINISTRADOR);
  };

  return (
    <div className="about-page public-page">
      <Seo
        title="Acerca de Domu | Gestión integral para comunidades residenciales"
        description="Conoce la visión, los módulos clave y el enfoque tecnológico de Domu para modernizar la administración de edificios y condominios."
        keywords="domu, gestión comunidades, control de accesos, gastos comunes, software condominios chile"
        canonicalPath="/about"
      />
      <Header />

      <MainContent fullWidth>
        <section className="about-hero animated-section">
          <div className="container about-hero__content">
            <div className="about-hero__text">
              <span className="about-hero__eyebrow">Acerca de Domu</span>
              <h1>Digitalizamos la gestión comunitaria de punta a punta</h1>
              <p>
                DOMU nace para resolver una realidad frecuente en comunidades residenciales:
                procesos críticos aún gestionados con planillas, cuadernos y múltiples sistemas
                desconectados. La propuesta unifica control de accesos, operación interna, finanzas
                y comunicación comunitaria en una experiencia única.
              </p>
              <div className="about-hero__actions">
                <Button onClick={handleGoHome} variant="primary">
                  Crear mi comunidad
                </Button>
                <Button onClick={handleGoSolutions} variant="ghost">
                  Ver soluciones
                </Button>
              </div>
            </div>

            <aside className="about-hero__panel" aria-label="Base de diseño y alcance de DOMU">
              <h2>Base del proyecto</h2>
              <ul>
                <li>Informe de título con foco en Ley de Copropiedad Inmobiliaria 21.442.</li>
                <li>Arquitectura modular para trazabilidad operativa y financiera.</li>
                <li>Stack documentado para web, backend, móvil y analítica de gestión.</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="about-section animated-section">
          <div className="container">
            <header className="about-section__header">
              <h2>Impacto planteado en el informe</h2>
              <p>Indicadores y alcance funcional tomados de la documentación del proyecto DOMU.</p>
            </header>
            <div className="about-metrics">
              {impactHighlights.map((item) => (
                <article key={item.value} className="about-metric-card">
                  <strong>{item.value}</strong>
                  <p>{item.label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-section about-section--accent animated-section">
          <div className="container">
            <header className="about-section__header">
              <h2>Pilares estratégicos</h2>
            </header>
            <div className="about-pillars">
              {strategicPillars.map((pillar) => (
                <article key={pillar.title} className="about-pillar-card">
                  <span className="about-pillar-card__icon" aria-hidden="true">
                    <Icon name={pillar.icon} size={22} strokeWidth={1.8} />
                  </span>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-section animated-section">
          <div className="container about-modules-wrap">
            <div>
              <header className="about-section__header about-section__header--left">
                <h2>Módulos funcionales de DOMU</h2>
                <p>
                  La solución integra procesos críticos de la comunidad en un entorno centralizado,
                  evitando la fragmentación entre sistemas.
                </p>
              </header>
              <div className="about-modules-grid">
                {coreModules.map((module) => (
                  <article key={module.title} className="about-module-card">
                    <h3>{module.title}</h3>
                    <p>{module.description}</p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="about-side-card">
              <h3>Documentación y estado actual web</h3>
              <ul>
                {currentWebExperience.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h4>Stack definido</h4>
              <ul>
                {technicalStack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </aside>
          </div>
        </section>
      </MainContent>

      <Footer />
    </div>
  );
};

export default About;
