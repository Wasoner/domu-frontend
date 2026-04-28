import { Header, MainContent, Footer } from '../layout';
import { Button, Icon, Seo } from '../components';
import { ROUTES } from '../constants';
import { useScrollReveal, useStaggerReveal } from '../hooks';
import './UserTypeLanding.scss';

const features = [
  {
    iconName: 'clipboardCheck',
    title: 'Órdenes de trabajo',
    description: 'Recibe órdenes de servicio directamente del administrador con el detalle del trabajo solicitado.',
  },
  {
    iconName: 'banknotes',
    title: 'Cotizaciones integradas',
    description: 'Envía cotizaciones desde la plataforma y que el administrador las apruebe o rechace sin correos de por medio.',
  },
  {
    iconName: 'chartBar',
    title: 'Seguimiento de trabajos',
    description: 'Actualiza el estado de cada servicio y comunica avances al administrador en tiempo real.',
  },
  {
    iconName: 'bellAlert',
    title: 'Alertas de asignación',
    description: 'Recibe notificaciones cuando se te asigne una nueva orden o cambie el estado de un trabajo.',
  },
  {
    iconName: 'document',
    title: 'Historial centralizado',
    description: 'Registro completo de todos los servicios realizados, cotizaciones enviadas y trabajos completados.',
  },
  {
    iconName: 'users',
    title: 'Comunicación directa',
    description: 'Canal de comunicación con el administrador de cada comunidad, sin depender de llamadas o WhatsApp.',
  },
];

const benefits = [
  'Todas tus órdenes de trabajo organizadas en un solo lugar',
  'Comunicación directa con administradores, sin intermediarios',
  'Historial verificable de cada servicio realizado',
  'Cotizaciones enviadas y aprobadas dentro de la plataforma',
  'Notificaciones inmediatas de nuevas asignaciones',
  'Profesionaliza tu operación ante las comunidades que atiendes',
];

const UserTypeProveedores = () => {
  const featuresRef = useStaggerReveal();
  const benefitsRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  const handleContact = () => {
    window.location.href = ROUTES.CONTACT;
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
        title="DOMU para Proveedores | Gestión de servicios para comunidades"
        description="Gestiona órdenes de servicio, cotizaciones y seguimiento de trabajos para comunidades residenciales con DOMU."
      />
      <Header />

      <section className="usertype-hero">
        <div className="usertype-hero__content">
          <div className="usertype-hero__text">
            <span className="usertype-hero__eyebrow">Solución para Proveedores</span>
            <h1 className="usertype-hero__title">
              Trabaja con comunidades de forma <strong>organizada</strong>
            </h1>
            <p className="usertype-hero__subtitle">
              Recibe órdenes de trabajo, envía cotizaciones y reporta avances sin depender de llamadas, correos o
              grupos de WhatsApp.
            </p>
            <div className="usertype-hero__actions">
              <Button variant="primary" onClick={handleViewFeatures}>
                Ver funcionalidades
              </Button>
              <Button variant="ghost" onClick={handleDemo}>
                Explorar soluciones
              </Button>
            </div>
          </div>
          <div className="usertype-hero__visual">
            <span className="usertype-hero__illustration" aria-hidden="true">
              <Icon name="wrench" className="usertype-hero__illustration-icon" strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </section>

      <MainContent>
        <section id="soluciones-funcionalidades" ref={featuresRef} className="usertype-features reveal-section">
          <div className="container">
            <div className="usertype-section__header">
              <h2>Herramientas pensadas para proveedores de servicios</h2>
              <p>Flujo operativo claro para recibir, cotizar, ejecutar y reportar cada trabajo</p>
            </div>
            <div className="usertype-features__grid">
              {features.map((feat, idx) => (
                <div className="usertype-feature-card reveal-stagger-child" key={idx}>
                  <div className="usertype-feature-card__icon" aria-hidden="true">
                    <Icon name={feat.iconName} size={42} strokeWidth={1.8} />
                  </div>
                  <h3>{feat.title}</h3>
                  <p>{feat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={benefitsRef} className="usertype-benefits reveal-section">
          <div className="container">
            <div className="usertype-benefits__content">
              <div className="usertype-benefits__text">
                <h2>Beneficios para tu operación como proveedor</h2>
                <ul className="usertype-benefits__list">
                  {benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
              <div className="usertype-benefits__visual">
                <div className="usertype-benefits__card">
                  <span className="usertype-benefits__card-icon" aria-hidden="true">
                    <Icon name="clipboardCheck" className="usertype-benefits__card-icon-svg" strokeWidth={1.8} />
                  </span>
                  <h3>Centro de trabajo proveedor</h3>
                  <p>Órdenes activas, cotizaciones enviadas y estados de servicio centralizados en un solo panel.</p>
                  <div className="usertype-benefits__card-stats">
                    <div>
                      <strong>24/7</strong>
                      <span>Acceso web</span>
                    </div>
                    <div>
                      <strong>1</strong>
                      <span>Canal único operativo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section ref={ctaRef} className="usertype-cta reveal-section">
          <div className="container">
            <div className="usertype-cta__content">
              <h2>Conecta tu servicio con comunidades mejor organizadas</h2>
              <p>Integra tus órdenes, cotizaciones y avances en un flujo digital profesional</p>
              <div className="usertype-cta__actions">
                <Button variant="primary" onClick={handleContact}>
                  Contactar equipo
                </Button>
                <Button variant="ghost" onClick={handleDemo}>
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

export default UserTypeProveedores;
