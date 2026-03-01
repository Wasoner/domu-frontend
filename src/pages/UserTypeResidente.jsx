import { Header, MainContent, Footer } from '../layout';
import { Button, Icon, Seo } from '../components';
import { ROUTES } from '../constants';
import './UserTypeLanding.scss';

const features = [
  {
    iconName: 'creditCard',
    title: 'Pago de gastos comunes',
    description: 'Paga tus gastos comunes en línea de forma segura con múltiples medios de pago.',
  },
  {
    iconName: 'calendar',
    title: 'Reserva de espacios',
    description: 'Reserva quinchos, salas de eventos y otros espacios comunes en segundos.',
  },
  {
    iconName: 'users',
    title: 'Registro de visitas',
    description: 'Anuncia visitas y proveedores con anticipación para agilizar su ingreso.',
  },
  {
    iconName: 'exclamationTriangle',
    title: 'Reportar incidencias',
    description: 'Informa problemas de mantenimiento o seguridad directamente a la administración.',
  },
  {
    iconName: 'speakerWave',
    title: 'Ver comunicados',
    description: 'Mantente informado con los avisos oficiales y noticias de tu comunidad.',
  },
  {
    iconName: 'clockHistory',
    title: 'Historial de pagos',
    description: 'Consulta tu historial de pagos, saldos pendientes y descarga comprobantes.',
  },
];

const benefits = [
  'Pagos desde cualquier lugar, las 24 horas del día',
  'Reservas de espacios comunes al instante',
  'Comunicación directa con la administración',
  'Notificaciones de avisos importantes',
  'Seguimiento de incidencias reportadas',
  'Acceso desde el portal web o aplicación móvil',
];

const UserTypeResidente = () => {
  const handleLogin = () => {
    window.location.href = ROUTES.LOGIN;
  };

  const handleDemo = () => {
    window.location.href = ROUTES.ABOUT;
  };

  return (
    <div className="usertype-page fade-in">
      <Seo
        title="DOMU para Residentes | Portal de pagos y servicios"
        description="Portal para residentes: paga gastos comunes en línea, reserva espacios, registra visitas y mantente comunicado con tu comunidad."
        keywords="residente domu, pago gastos comunes online, portal residentes, reserva espacios comunes"
        canonicalPath="/soluciones/residente"
      />
      <Header />

      {/* Hero Section */}
      <section className="usertype-hero animated-section">
        <div className="usertype-hero__content">
          <div className="usertype-hero__text">
            <span className="usertype-hero__eyebrow">Solución para Residentes</span>
            <h1 className="usertype-hero__title">
              Tu comunidad en la <strong>palma de tu mano</strong>
            </h1>
            <p className="usertype-hero__subtitle">
              Paga gastos comunes, reserva espacios y mantente conectado con tu edificio. 
              Todo desde un portal web diseñado para tu comodidad.
            </p>
            <div className="usertype-hero__actions">
              <Button onClick={handleLogin} variant="primary">
                Soy residente
              </Button>
              <Button onClick={handleDemo} variant="ghost">
                Ver demo
              </Button>
            </div>
          </div>
          <div className="usertype-hero__visual">
            <span className="usertype-hero__illustration" aria-hidden="true">
              <Icon name="home" className="usertype-hero__illustration-icon" strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </section>

      <MainContent>
        {/* Features Section */}
        <section className="usertype-features animated-section">
          <div className="container">
            <div className="usertype-section__header">
              <h2>Funcionalidades para Residentes</h2>
              <p>Todo lo que necesitas para interactuar con tu comunidad de forma simple</p>
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
                <h2>Beneficios para ti como residente</h2>
                <ul className="usertype-benefits__list">
                  {benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
              <div className="usertype-benefits__visual">
                <div className="usertype-benefits__card">
                  <span className="usertype-benefits__card-icon" aria-hidden="true">
                    <Icon name="cpuChip" className="usertype-benefits__card-icon-svg" strokeWidth={1.8} />
                  </span>
                  <h3>Portal del residente</h3>
                  <p>Accede a todos los servicios de tu comunidad desde cualquier dispositivo, cuando lo necesites.</p>
                  <div className="usertype-benefits__card-stats">
                    <div>
                      <strong>24/7</strong>
                      <span>Disponibilidad</span>
                    </div>
                    <div>
                      <strong>2 min</strong>
                      <span>Pago promedio</span>
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
              <h2>¿Ya eres residente de una comunidad DOMU?</h2>
              <p>Ingresa a tu portal para acceder a todos los servicios de tu edificio</p>
              <div className="usertype-cta__actions">
                <Button onClick={handleLogin} variant="primary">
                  Ingresar al portal
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

export default UserTypeResidente;
