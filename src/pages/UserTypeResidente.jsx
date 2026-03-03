import { Header, MainContent, Footer } from '../layout';
import { Button, Icon, Seo } from '../components';
import { ROUTES } from '../constants';
import { useScrollReveal, useStaggerReveal } from '../hooks';
import './UserTypeLanding.scss';

const features = [
  {
    iconName: 'creditCard',
    title: 'Paga tus gastos comunes',
    description: 'Pago en línea seguro vía Mercado Pago. Consulta tu estado de cuenta y descarga comprobantes en PDF.',
  },
  {
    iconName: 'calendar',
    title: 'Reserva espacios comunes',
    description: 'Agenda quinchos, salas de eventos y áreas comunes directamente desde tu portal, con disponibilidad en tiempo real.',
  },
  {
    iconName: 'users',
    title: 'Preanuncia tus visitas',
    description: 'Registra visitas con anticipación para que ingresen de forma ágil. Recibe notificación cuando lleguen.',
  },
  {
    iconName: 'exclamationTriangle',
    title: 'Reporta incidencias',
    description: 'Informa problemas de mantenimiento o seguridad con evidencia fotográfica y haz seguimiento del ticket.',
  },
  {
    iconName: 'chatBubbleLeftRight',
    title: 'Comunidad conectada',
    description: 'Foro comunitario, marketplace vecinal para compra y venta, y chat directo con otros residentes.',
  },
  {
    iconName: 'archiveBox',
    title: 'Encomiendas con aviso',
    description: 'Recibe notificación cuando llegue un paquete a conserjería y confirma su retiro desde el portal.',
  },
];

const benefits = [
  'Paga gastos comunes desde tu celular, a cualquier hora',
  'Reserva espacios comunes con disponibilidad en tiempo real',
  'Comunicación directa con administración y vecinos',
  'Notificaciones de encomiendas, avisos e incidencias',
  'Seguimiento del estado de tus reportes y solicitudes',
  'Acceso desde cualquier dispositivo: celular, tablet o computador',
];

const UserTypeResidente = () => {
  const featuresRef = useStaggerReveal();
  const benefitsRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  const handleLogin = () => {
    window.location.href = ROUTES.LOGIN;
  };

  const handleDemo = () => {
    window.location.href = ROUTES.SOLUCIONES;
  };

  return (
    <div className="usertype-page public-page fade-in">
      <Seo
        title="DOMU para Residentes | Portal de pagos y servicios"
        description="Portal para residentes: paga gastos comunes en línea, reserva espacios, registra visitas y mantente comunicado con tu comunidad."
        keywords="residente domu, pago gastos comunes online, portal residentes, reserva espacios comunes"
        canonicalPath="/soluciones/residente"
      />
      <Header />

      {/* Hero Section */}
      <section className="usertype-hero">
        <div className="usertype-hero__content">
          <div className="usertype-hero__text">
            <span className="usertype-hero__eyebrow">Solución para Residentes</span>
            <h1 className="usertype-hero__title">
              Tu edificio, siempre al <strong>alcance</strong>
            </h1>
            <p className="usertype-hero__subtitle">
              Paga gastos comunes, reserva el quincho, anuncia visitas y mantente al día
              con tu comunidad. Todo desde el portal web, sin instalar nada.
            </p>
            <div className="usertype-hero__actions">
              <Button onClick={handleLogin} variant="primary">
                Soy residente
              </Button>
              <Button onClick={handleDemo} variant="ghost">
                Explorar soluciones
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
        <section ref={featuresRef} className="usertype-features reveal-section">
          <div className="container">
            <div className="usertype-section__header">
              <h2>Todo lo que necesitas como residente</h2>
              <p>Pagos, reservas, comunicación y gestiones con tu edificio en un solo lugar</p>
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
                    <Icon name="home" className="usertype-benefits__card-icon-svg" strokeWidth={1.8} />
                  </span>
                  <h3>Portal del residente</h3>
                  <p>Pagos, reservas, encomiendas y comunicación con tu comunidad desde cualquier navegador.</p>
                  <div className="usertype-benefits__card-stats">
                    <div>
                      <strong>24/7</strong>
                      <span>Disponible siempre</span>
                    </div>
                    <div>
                      <strong>0</strong>
                      <span>Descargas necesarias</span>
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
              <h2>Accede al portal de tu comunidad</h2>
              <p>Ingresa para pagar, reservar y mantenerte conectado con tu edificio</p>
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
