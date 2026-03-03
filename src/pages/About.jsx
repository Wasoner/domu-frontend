import { useNavigate } from 'react-router-dom';
import { Header, MainContent, Footer } from '../layout';
import { Button, Icon, Seo } from '../components';
import { ROUTES } from '../constants';
import { useScrollReveal, useStaggerReveal } from '../hooks';
import './About.scss';

const impactHighlights = [
  {
    value: '<5 s',
    label: 'Registro de visitas validado en segundos mediante lectura QR de cédula chilena.',
  },
  {
    value: '2.000',
    label: 'Unidades habitacionales soportadas por instalación, con arquitectura preparada para escalar.',
  },
  {
    value: '5 roles',
    label: 'Administrador, conserje, personal, residente y proveedor operando en una sola plataforma.',
  },
  {
    value: '16 RF',
    label: 'Requerimientos funcionales validados que cubren seguridad, operación, finanzas y participación.',
  },
];

const strategicPillars = [
  {
    icon: 'shieldCheck',
    title: 'Seguridad y trazabilidad',
    description: 'Control de accesos con QR, bitácoras digitales y evidencia fotográfica en cada operación. Sin cuadernos ni registros manuales.',
  },
  {
    icon: 'currencyDollar',
    title: 'Gestión financiera integrada',
    description: 'Generación de gastos comunes, pagos en línea, seguimiento de morosidad y reportes exportables en una sola vista.',
  },
  {
    icon: 'users',
    title: 'Comunidad conectada',
    description: 'Chat en tiempo real, foro comunitario, votaciones digitales y reserva de espacios comunes para fortalecer la convivencia.',
  },
];

const coreModules = [
  {
    title: 'Accesos y visitas',
    description: 'Registro de ingreso y salida con lectura QR de cédula chilena. Preautorización de visitas con código temporal y notificación al residente.',
  },
  {
    title: 'Encomiendas',
    description: 'Recepción de paquetes con evidencia fotográfica, firma digital de entrega y notificación automática al destinatario.',
  },
  {
    title: 'Finanzas y gastos comunes',
    description: 'Generación de cobros mensuales, pagos en línea vía Mercado Pago, seguimiento de morosidad y estados de cuenta en PDF.',
  },
  {
    title: 'Operación interna',
    description: 'Asignación de tareas y control de turnos para conserjería y personal de apoyo, con indicadores de cumplimiento.',
  },
  {
    title: 'Espacios y participación',
    description: 'Reserva de áreas comunes con control de capacidad, foro comunitario, marketplace vecinal y votaciones digitales.',
  },
  {
    title: 'Incidencias y proveedores',
    description: 'Sistema de tickets para reportar problemas, gestión de proveedores con órdenes de trabajo y seguimiento centralizado.',
  },
];

const currentWebExperience = [
  'Portal de residentes: pagos en línea, cartola, encomiendas y medidores.',
  'Módulos comunitarios: publicaciones, biblioteca documental y marketplace vecinal.',
  'Panel administrativo: gastos comunes, incidencias, personal y tareas.',
  'Experiencia móvil: portal web responsivo accesible desde cualquier celular o tablet.',
];

const technicalStack = [
  'Frontend: React + SCSS + Vite (PWA accesible desde celular, tablet y PC)',
  'Backend: Java 21 + Javalin (API REST con respuesta ≤500 ms)',
  'Base de datos: MySQL con cifrado TLS 1.3',
  'Seguridad: JWT, control de acceso por roles (RBAC) y hash BCrypt',
];

const OPEN_COMMUNITY_MODAL_QUERY = 'openCommunityModal=1';

const About = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate(`${ROUTES.HOME}?${OPEN_COMMUNITY_MODAL_QUERY}`);
  };

  const handleGoSolutions = () => {
    navigate(ROUTES.SOLUCIONES);
  };

  const metricsRef = useStaggerReveal();
  const pillarsRef = useScrollReveal();
  const modulesRef = useScrollReveal();

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
        <section className="about-hero">
          <div className="container about-hero__content">
            <div className="about-hero__text">
              <span className="about-hero__eyebrow">Acerca de Domu</span>
              <h1>Una sola plataforma para toda la gestión de tu comunidad</h1>
              <p>
                En la mayoría de edificios y condominios de Chile, la administración todavía depende
                de planillas Excel, cuadernos de portería y múltiples herramientas desconectadas.
                DOMU reúne accesos, finanzas, operación y comunicación en un sistema integrado,
                diseñado desde su origen para cumplir con la Ley de Copropiedad Inmobiliaria 21.442.
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
              <h2>Respaldo del proyecto</h2>
              <ul>
                <li>Desarrollado como proyecto de ingeniería con 16 requerimientos funcionales validados.</li>
                <li>Alineado con la Ley de Copropiedad Inmobiliaria 21.442 y la Ley de Protección de Datos 21.719.</li>
                <li>Arquitectura preparada para soportar hasta 2.000 unidades y 5.000 usuarios concurrentes.</li>
              </ul>
            </aside>
          </div>
        </section>

        <section ref={metricsRef} className="about-section reveal-section">
          <div className="container">
            <header className="about-section__header">
              <h2>DOMU en números</h2>
              <p>Indicadores técnicos y de alcance funcional documentados en el proyecto.</p>
            </header>
            <div className="about-metrics">
              {impactHighlights.map((item) => (
                <article key={item.value} className="about-metric-card reveal-stagger-child">
                  <strong>{item.value}</strong>
                  <p>{item.label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section ref={pillarsRef} className="about-section about-section--accent reveal-section">
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

        <section ref={modulesRef} className="about-section reveal-section">
          <div className="container about-modules-wrap">
            <div>
              <header className="about-section__header about-section__header--left">
                <h2>Todo integrado, sin fragmentación</h2>
                <p>
                  A diferencia de soluciones que separan módulos en distintos planes de precio,
                  DOMU integra todos los procesos críticos en un solo entorno con datos consistentes.
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
              <h3>Lo que ya puedes usar hoy</h3>
              <ul>
                {currentWebExperience.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h4>Tecnología detrás de DOMU</h4>
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
