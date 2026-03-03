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

  return (
    <div className="usertype-page public-page fade-in">
      <Seo
        title="DOMU para Proveedores | Gestión de servicios para comunidades"
        description="Gestiona órdenes de servicio, cotizaciones y seguimiento de trabajos para comunidades residenciales con DOMU."
      />
      <Header />
      <MainContent>
        <section className="usertype-hero">
          <div className="usertype-hero__content">
            <span className="usertype-hero__badge">Para Proveedores</span>
            <h1 className="usertype-hero__title">
              Trabaja con comunidades de forma organizada
            </h1>
            <p className="usertype-hero__subtitle">
              Recibe órdenes de trabajo, envía cotizaciones y reporta avances
              sin depender de llamadas, correos o grupos de WhatsApp.
            </p>
            <div className="usertype-hero__actions">
              <Button variant="primary" size="lg" onClick={handleContact}>
                Contactar equipo
              </Button>
              <Button variant="ghost" size="lg" onClick={handleDemo}>
                Explorar soluciones
              </Button>
            </div>
          </div>
        </section>

        <section ref={featuresRef} className="usertype-features reveal-section">
          <h2 className="usertype-features__title">Funcionalidades para proveedores</h2>
          <div className="usertype-features__grid">
            {features.map((feat, idx) => (
              <div className="usertype-feature-card reveal-stagger-child" key={idx}>
                <div className="usertype-feature-card__icon">
                  <Icon name={feat.iconName} size={32} />
                </div>
                <h3>{feat.title}</h3>
                <p>{feat.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section ref={benefitsRef} className="usertype-benefits reveal-section">
          <h2>Beneficios clave</h2>
          <div className="usertype-benefits__grid">
            {benefits.map((benefit, idx) => (
              <div className="usertype-benefit-item" key={idx}>
                <Icon name="checkCircle" size={20} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        <section ref={ctaRef} className="usertype-cta reveal-section">
          <h2>Profesionaliza tu servicio a comunidades</h2>
          <p>Ordenes de trabajo, cotizaciones y seguimiento en una sola plataforma.</p>
          <Button variant="primary" size="lg" onClick={handleContact}>
            Comenzar ahora
          </Button>
        </section>
      </MainContent>
      <Footer />
    </div>
  );
};

export default UserTypeProveedores;
