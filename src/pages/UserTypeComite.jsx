import { Header, MainContent, Footer } from '../layout';
import { Button, Icon, Seo } from '../components';
import { ROUTES } from '../constants';
import { useScrollReveal, useStaggerReveal } from '../hooks';
import './UserTypeLanding.scss';

const features = [
  {
    iconName: 'chartBar',
    title: 'Supervisión financiera',
    description: 'Accede a los ingresos, egresos, estados de morosidad y movimientos financieros de tu comunidad en tiempo real.',
  },
  {
    iconName: 'handRaised',
    title: 'Votaciones digitales',
    description: 'Organiza votaciones con cierre programable, resultados transparentes y registro exportable en PDF.',
  },
  {
    iconName: 'checkBadge',
    title: 'Revisión de cotizaciones',
    description: 'Revisa las cotizaciones y órdenes de trabajo enviadas por proveedores antes de su aprobación.',
  },
  {
    iconName: 'magnifyingGlass',
    title: 'Trazabilidad completa',
    description: 'Historial de todas las operaciones: pagos recibidos, tareas asignadas, incidencias y accesos registrados.',
  },
  {
    iconName: 'document',
    title: 'Biblioteca documental',
    description: 'Almacena y consulta reglamentos, actas de reunión y documentos relevantes de la comunidad.',
  },
  {
    iconName: 'chatBubbleLeftRight',
    title: 'Canal directo con residentes',
    description: 'Publica decisiones del comité en el foro y recibe retroalimentación de los copropietarios.',
  },
];

const benefits = [
  'Acceso directo a la información financiera de la comunidad',
  'Votaciones digitales con cierre programado y resultados exportables',
  'Historial auditable de todas las operaciones administrativas',
  'Canal de comunicación directo con residentes y administrador',
  'Documentos de la comunidad centralizados y siempre disponibles',
  'Herramientas para ejercer el rol fiscalizador que establece la Ley 21.442',
];

const UserTypeComite = () => {
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
        title="DOMU para Comité de Administración | Supervisión y votaciones"
        description="Herramientas para comités de administración: supervisión financiera, votaciones digitales, aprobación de proyectos y transparencia en la gestión."
        keywords="comite administracion domu, votaciones edificio, supervision condominio, transparencia financiera"
        canonicalPath="/soluciones/comite"
      />
      <Header />

      {/* Hero Section */}
      <section className="usertype-hero">
        <div className="usertype-hero__content">
          <div className="usertype-hero__text">
            <span className="usertype-hero__eyebrow">Solución para Comité</span>
            <h1 className="usertype-hero__title">
              Fiscaliza con datos, no con <strong>suposiciones</strong>
            </h1>
            <p className="usertype-hero__subtitle">
              Accede a la información financiera, organiza votaciones digitales y supervisa
              la gestión administrativa con trazabilidad completa de cada operación.
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
              <Icon name="scale" className="usertype-hero__illustration-icon" strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </section>

      <MainContent>
        {/* Features Section */}
        <section id="soluciones-funcionalidades" ref={featuresRef} className="usertype-features reveal-section">
          <div className="container">
            <div className="usertype-section__header">
              <h2>Herramientas para el rol fiscalizador</h2>
              <p>Todo lo que necesita el comité para supervisar, votar e informar a la comunidad</p>
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
                <h2>Beneficios para tu comité de administración</h2>
                <ul className="usertype-benefits__list">
                  {benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
              <div className="usertype-benefits__visual">
                <div className="usertype-benefits__card">
                  <span className="usertype-benefits__card-icon" aria-hidden="true">
                    <Icon name="magnifyingGlass" className="usertype-benefits__card-icon-svg" strokeWidth={1.8} />
                  </span>
                  <h3>Panel de fiscalización</h3>
                  <p>Movimientos financieros, cotizaciones de proveedores y documentación de la comunidad en un solo lugar.</p>
                  <div className="usertype-benefits__card-stats">
                    <div>
                      <strong>16 RF</strong>
                      <span>Procesos cubiertos</span>
                    </div>
                    <div>
                      <strong>5 roles</strong>
                      <span>Conectados</span>
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
              <h2>Dale al comité las herramientas que necesita</h2>
              <p>Supervisión real con datos reales, no con informes que llegan tarde</p>
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

export default UserTypeComite;
