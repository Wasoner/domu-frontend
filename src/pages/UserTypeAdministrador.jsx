import { Header, MainContent, Footer } from '../layout';
import { Button, Icon, Seo } from '../components';
import { ROUTES } from '../constants';
import './UserTypeLanding.scss';

const features = [
  {
    iconName: 'banknotes',
    title: 'Gestión de gastos comunes',
    description: 'Genera y administra cobros mensuales con cálculo automático de prorrateos y multas.',
  },
  {
    iconName: 'bellAlert',
    title: 'Cobranza automatizada',
    description: 'Envía recordatorios de pago automáticos y gestiona la cartera de morosos eficientemente.',
  },
  {
    iconName: 'chartBar',
    title: 'Reportes financieros',
    description: 'Visualiza el estado financiero de la comunidad con reportes detallados y exportables.',
  },
  {
    iconName: 'speakerWave',
    title: 'Comunicados masivos',
    description: 'Envía avisos a toda la comunidad por email, notificaciones push o publicaciones en el muro.',
  },
  {
    iconName: 'exclamationTriangle',
    title: 'Control de morosidad',
    description: 'Monitorea deudores, aplica intereses y gestiona convenios de pago desde un solo lugar.',
  },
  {
    iconName: 'clipboardCheck',
    title: 'Gestión de proveedores',
    description: 'Administra contratos, pagos y evaluación de proveedores de servicios del edificio.',
  },
];

const benefits = [
  'Ahorro significativo de tiempo en tareas administrativas',
  'Reducción de morosidad con cobranza automatizada',
  'Transparencia total con reportes en tiempo real',
  'Comunicación eficiente con toda la comunidad',
  'Gestión centralizada de múltiples comunidades',
  'Cumplimiento normativo con documentación digital',
];

const UserTypeAdministrador = () => {
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
        title="DOMU para Administradores | Software de gestión de condominios"
        description="Software completo para administradores de edificios: gestión de gastos comunes, cobranza, reportes financieros y comunicación con residentes."
        keywords="administrador edificios domu, software administracion condominios, gastos comunes, cobranza edificios"
        canonicalPath="/soluciones/administrador"
      />
      <Header />

      {/* Hero Section */}
      <section className="usertype-hero animated-section">
        <div className="usertype-hero__content">
          <div className="usertype-hero__text">
            <span className="usertype-hero__icon" aria-hidden="true">
              <Icon name="chartBar" className="usertype-hero__icon-svg" strokeWidth={1.8} />
            </span>
            <span className="usertype-hero__eyebrow">Solución para Administradores</span>
            <h1 className="usertype-hero__title">
              Administración <strong>profesional</strong> de condominios
            </h1>
            <p className="usertype-hero__subtitle">
              Gestiona gastos comunes, cobranza y comunicación desde una plataforma integral. 
              Optimiza tu tiempo y mejora la satisfacción de tus comunidades.
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
              <Icon name="chartBar" className="usertype-hero__illustration-icon" strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </section>

      <MainContent>
        {/* Features Section */}
        <section id="soluciones-funcionalidades" className="usertype-features animated-section">
          <div className="container">
            <div className="usertype-section__header">
              <h2>Funcionalidades para Administradores</h2>
              <p>Todo lo que necesitas para gestionar tus comunidades de forma profesional</p>
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
                <h2>Beneficios para tu gestión administrativa</h2>
                <ul className="usertype-benefits__list">
                  {benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
              <div className="usertype-benefits__visual">
                <div className="usertype-benefits__card">
                  <span className="usertype-benefits__card-icon" aria-hidden="true">
                    <Icon name="buildingOffice" className="usertype-benefits__card-icon-svg" strokeWidth={1.8} />
                  </span>
                  <h3>Dashboard administrativo</h3>
                  <p>Control total de tus comunidades con métricas clave, alertas y tareas pendientes en un solo vistazo.</p>
                  <div className="usertype-benefits__card-stats">
                    <div>
                      <strong>-40%</strong>
                      <span>Morosidad</span>
                    </div>
                    <div>
                      <strong>3x</strong>
                      <span>Más eficiencia</span>
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
              <h2>¿Listo para profesionalizar tu administración?</h2>
              <p>Únete a los administradores que ya optimizaron su gestión con DOMU</p>
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

export default UserTypeAdministrador;
