import { Header, MainContent, Footer } from '../layout';
import { Button, Icon, Seo } from '../components';
import { ROUTES } from '../constants';
import './UserTypeLanding.scss';

const features = [
  {
    iconName: 'door',
    title: 'Control de accesos',
    description: 'Gestiona el ingreso de residentes, visitas y proveedores con registro digital en tiempo real.',
  },
  {
    iconName: 'clipboard',
    title: 'Registro de visitas',
    description: 'Registra y autoriza visitas de forma rápida con notificación automática al residente.',
  },
  {
    iconName: 'archiveBox',
    title: 'Recepción de encomiendas',
    description: 'Administra la llegada de paquetes y notifica al destinatario para su retiro oportuno.',
  },
  {
    iconName: 'chatBubbleLeftRight',
    title: 'Comunicación con residentes',
    description: 'Canal directo para avisos urgentes, consultas y coordinación con la comunidad.',
  },
  {
    iconName: 'exclamationTriangle',
    title: 'Reportes de incidencias',
    description: 'Documenta y reporta incidentes de seguridad o mantenimiento al instante.',
  },
  {
    iconName: 'document',
    title: 'Bitácora digital',
    description: 'Registro cronológico de todas las actividades y eventos del edificio.',
  },
];

const benefits = [
  'Gestión simplificada de accesos sin papeles ni registros manuales',
  'Trazabilidad completa de visitas y encomiendas',
  'Comunicación directa con residentes y administración',
  'Historial de incidencias para seguimiento y resolución',
  'Interfaz intuitiva diseñada para uso diario',
  'Acceso desde cualquier dispositivo con conexión a internet',
];

const UserTypeConserjeria = () => {
  const handleCreateCommunity = () => {
    window.location.href = `${ROUTES.HOME}?openCommunityModal=1`;
  };

  const handleDemo = () => {
    window.location.href = ROUTES.ABOUT;
  };

  const handleViewFeatures = () => {
    const target = document.getElementById('soluciones-funcionalidades');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="usertype-page fade-in">
      <Seo
        title="DOMU para Conserjería | Control de accesos y gestión de edificios"
        description="Herramientas digitales para conserjería: control de accesos, registro de visitas, encomiendas y comunicación con residentes en un solo lugar."
        keywords="conserjeria domu, control accesos edificio, registro visitas condominio, gestion conserjeria"
        canonicalPath="/soluciones/conserjeria"
      />
      <Header />

      {/* Hero Section */}
      <section className="usertype-hero animated-section">
        <div className="usertype-hero__content">
          <div className="usertype-hero__text">
            <span className="usertype-hero__eyebrow">Solución para Conserjería</span>
            <h1 className="usertype-hero__title">
              Gestión digital para <strong>conserjería</strong>
            </h1>
            <p className="usertype-hero__subtitle">
              Simplifica el control de accesos, registro de visitas y comunicación con residentes. 
              Todo desde una plataforma intuitiva diseñada para el día a día de la conserjería.
            </p>
            <div className="usertype-hero__actions">
              <Button onClick={handleViewFeatures} variant="primary">
                Ver funcionalidades
              </Button>
              <Button onClick={handleDemo} variant="ghost">
                Ver demo
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
        <section id="soluciones-funcionalidades" className="usertype-features animated-section">
          <div className="container">
            <div className="usertype-section__header">
              <h2>Funcionalidades para Conserjería</h2>
              <p>Herramientas diseñadas para optimizar las tareas diarias de conserjería</p>
            </div>
            <div className="usertype-features__grid">
              {features.map((feature, index) => (
                <div key={index} className="usertype-feature-card">
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
        <section className="usertype-benefits animated-section">
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
                  <p>Vista centralizada con todas las tareas pendientes, visitas del día y notificaciones importantes.</p>
                  <div className="usertype-benefits__card-stats">
                    <div>
                      <strong>-60%</strong>
                      <span>Tiempo en registro</span>
                    </div>
                    <div>
                      <strong>100%</strong>
                      <span>Trazabilidad</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="usertype-cta animated-section">
          <div className="container">
            <div className="usertype-cta__content">
              <h2>¿Listo para modernizar tu conserjería?</h2>
              <p>Únete a las comunidades que ya optimizaron la gestión de su edificio con DOMU</p>
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
