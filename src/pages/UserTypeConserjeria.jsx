import { Header, MainContent, Footer } from '../layout';
import { Button, Icon, Seo } from '../components';
import { ROUTES } from '../constants';
import { useScrollReveal, useStaggerReveal } from '../hooks';
import './UserTypeLanding.scss';

const features = [
  {
    iconName: 'door',
    title: 'Control de accesos con QR',
    description: 'Registra el ingreso y salida de visitas en menos de 5 segundos con lectura QR de cédula chilena.',
  },
  {
    iconName: 'clipboard',
    title: 'Preautorización de visitas',
    description: 'Los residentes preanuncian visitas desde su portal. El conserje solo valida el código QR temporal.',
  },
  {
    iconName: 'archiveBox',
    title: 'Recepción de encomiendas',
    description: 'Registra paquetes con evidencia fotográfica y notifica automáticamente al residente para su retiro.',
  },
  {
    iconName: 'clipboardCheck',
    title: 'Tareas y turnos',
    description: 'Recibe tareas asignadas por el administrador, registra inicio y fin de turno, y reporta avances.',
  },
  {
    iconName: 'exclamationTriangle',
    title: 'Reporte de incidencias',
    description: 'Documenta incidentes de seguridad o mantenimiento con evidencia y notificación inmediata.',
  },
  {
    iconName: 'document',
    title: 'Bitácora digital',
    description: 'Registro cronológico automático de accesos, encomiendas e incidencias. Sin cuadernos ni papeles.',
  },
];

const benefits = [
  'Registro de visitas en segundos, sin cuadernos ni formularios en papel',
  'Trazabilidad completa de cada acceso, encomienda e incidencia',
  'Comunicación directa con residentes y administración desde la plataforma',
  'Control de tareas y turnos con indicadores de cumplimiento',
  'Interfaz simple diseñada para el ritmo de trabajo de la conserjería',
  'Funciona desde cualquier dispositivo con navegador web',
];

const UserTypeConserjeria = () => {
  const featuresRef = useStaggerReveal();
  const benefitsRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  const handleCreateCommunity = () => {
    window.location.href = `${ROUTES.HOME}?openCommunityModal=1`;
  };

  const handleDemo = () => {
    window.location.href = ROUTES.SOLUCIONES;
  };

  const handleViewFeatures = () => {
    const target = document.getElementById('soluciones-funcionalidades');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="usertype-page public-page fade-in">
      <Seo
        title="DOMU para Conserjería | Control de accesos y gestión de edificios"
        description="Herramientas digitales para conserjería: control de accesos, registro de visitas, encomiendas y comunicación con residentes en un solo lugar."
        keywords="conserjeria domu, control accesos edificio, registro visitas condominio, gestion conserjeria"
        canonicalPath="/soluciones/conserjeria"
      />
      <Header />

      {/* Hero Section */}
      <section className="usertype-hero">
        <div className="usertype-hero__content">
          <div className="usertype-hero__text">
            <span className="usertype-hero__eyebrow">Solución para Conserjería</span>
            <h1 className="usertype-hero__title">
              Adiós al cuaderno de <strong>portería</strong>
            </h1>
            <p className="usertype-hero__subtitle">
              Control de accesos con QR, recepción de encomiendas con evidencia y gestión de tareas
              en una interfaz pensada para el ritmo de trabajo real de la conserjería.
            </p>
            <div className="usertype-hero__actions">
              <Button onClick={handleViewFeatures} variant="primary">
                Ver funcionalidades
              </Button>
              <Button onClick={handleDemo} variant="ghost">
                Explorar soluciones
              </Button>
            </div>
          </div>
          <div className="usertype-hero__visual">
            <span className="usertype-hero__illustration" aria-hidden="true">
              <Icon name="buildingOffice" className="usertype-hero__illustration-icon" strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </section>

      <MainContent>
        {/* Features Section */}
        <section id="soluciones-funcionalidades" ref={featuresRef} className="usertype-features reveal-section">
          <div className="container">
            <div className="usertype-section__header">
              <h2>Herramientas para el día a día</h2>
              <p>Cada función resuelve una tarea concreta que hoy se hace con papel o sistemas manuales</p>
            </div>
            <div className="usertype-features__grid">
              {features.map((feature, index) => (
                <div key={index} className="usertype-feature-card reveal-stagger-child">
                  <div className="usertype-feature-card__icon" aria-hidden="true">
                    <Icon name={feature.iconName} size={42} strokeWidth={1.8} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section ref={benefitsRef} className="usertype-benefits reveal-section">
          <div className="container">
            <div className="usertype-benefits__content">
              <div className="usertype-benefits__text">
                <h2>Beneficios para tu equipo de conserjería</h2>
                <ul className="usertype-benefits__list">
                  {benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
              <div className="usertype-benefits__visual">
                <div className="usertype-benefits__card">
                  <span className="usertype-benefits__card-icon" aria-hidden="true">
                    <Icon name="chartBar" className="usertype-benefits__card-icon-svg" strokeWidth={1.8} />
                  </span>
                  <h3>Panel de conserjería</h3>
                  <p>Tareas pendientes, visitas del día, encomiendas por entregar y turnos activos en una sola vista.</p>
                  <div className="usertype-benefits__card-stats">
                    <div>
                      <strong>&lt;5 s</strong>
                      <span>Registro de visita</span>
                    </div>
                    <div>
                      <strong>QR</strong>
                      <span>Cédula chilena</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} className="usertype-cta reveal-section">
          <div className="container">
            <div className="usertype-cta__content">
              <h2>Digitaliza la conserjería de tu edificio</h2>
              <p>Control de accesos, encomiendas y tareas sin papeles ni sistemas manuales</p>
              <div className="usertype-cta__actions">
                <Button onClick={handleCreateCommunity} variant="primary">
                  Crear mi comunidad
                </Button>
                <Button onClick={handleDemo} variant="ghost">
                  Conocer más
                </Button>
              </div>
            </div>
          </div>
        </section>
      </MainContent>

      <Footer />
    </div>
  );
};

export default UserTypeConserjeria;
