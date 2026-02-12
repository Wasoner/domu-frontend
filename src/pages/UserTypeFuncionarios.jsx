import { Header, MainContent, Footer } from '../layout';
import { Button, Icon, Seo } from '../components';
import { ROUTES } from '../constants';
import './UserTypeLanding.scss';

const features = [
  {
    iconName: 'magnifyingGlass',
    title: 'Fiscalización de comunidades',
    description: 'Supervisa el cumplimiento normativo de edificios y condominios en tu jurisdicción.',
  },
  {
    iconName: 'chartBar',
    title: 'Reportes consolidados',
    description: 'Accede a reportes agregados de múltiples comunidades para análisis territorial.',
  },
  {
    iconName: 'clipboardCheck',
    title: 'Gestión de permisos',
    description: 'Administra y verifica permisos de operación y certificaciones de edificios.',
  },
  {
    iconName: 'buildingBank',
    title: 'Estadísticas territoriales',
    description: 'Visualiza indicadores de gestión comunitaria a nivel municipal o regional.',
  },
  {
    iconName: 'bellAlert',
    title: 'Alertas de cumplimiento',
    description: 'Recibe notificaciones automáticas sobre vencimientos y obligaciones pendientes.',
  },
  {
    iconName: 'users',
    title: 'Coordinación con administradores',
    description: 'Canal de comunicación oficial para requerimientos y consultas a administradores.',
  },
];

const benefits = [
  'Supervisión eficiente de múltiples comunidades',
  'Datos centralizados y actualizados en tiempo real',
  'Cumplimiento normativo verificable',
  'Comunicación directa con administradores',
  'Reportes exportables para informes oficiales',
  'Trazabilidad completa de gestiones realizadas',
];

const UserTypeFuncionarios = () => {
  const handleContact = () => {
    window.location.href = ROUTES.ABOUT;
  };

  const handleDemo = () => {
    window.location.href = ROUTES.ABOUT;
  };

  return (
    <div className="usertype-page fade-in">
      <Seo
        title="DOMU para Funcionarios | Fiscalización y supervisión de condominios"
        description="Herramientas para funcionarios municipales: fiscalización de comunidades, reportes consolidados, estadísticas y coordinación con administradores."
        keywords="funcionarios domu, fiscalizacion condominios, supervision municipal edificios, reportes comunidades"
        canonicalPath="/soluciones/funcionarios"
      />
      <Header />

      {/* Hero Section */}
      <section className="usertype-hero animated-section">
        <div className="usertype-hero__content">
          <div className="usertype-hero__text">
            <span className="usertype-hero__icon" aria-hidden="true">
              <Icon name="buildingLibrary" className="usertype-hero__icon-svg" strokeWidth={1.8} />
            </span>
            <span className="usertype-hero__eyebrow">Solución para Funcionarios</span>
            <h1 className="usertype-hero__title">
              Fiscalización <strong>inteligente</strong> de comunidades
            </h1>
            <p className="usertype-hero__subtitle">
              Supervisa el cumplimiento normativo, accede a estadísticas territoriales y 
              coordina con administradores desde una plataforma centralizada.
            </p>
            <div className="usertype-hero__actions">
              <Button onClick={handleContact} variant="primary">
                Contactar ventas
              </Button>
              <Button onClick={handleDemo} variant="ghost">
                Ver demo
              </Button>
            </div>
          </div>
          <div className="usertype-hero__visual">
            <span className="usertype-hero__illustration" aria-hidden="true">
              <Icon name="buildingLibrary" className="usertype-hero__illustration-icon" strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </section>

      <MainContent>
        {/* Features Section */}
        <section className="usertype-features animated-section">
          <div className="container">
            <div className="usertype-section__header">
              <h2>Funcionalidades para Funcionarios</h2>
              <p>Herramientas de supervisión y gestión territorial de comunidades</p>
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
                <h2>Beneficios para la gestión pública</h2>
                <ul className="usertype-benefits__list">
                  {benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
              <div className="usertype-benefits__visual">
                <div className="usertype-benefits__card">
                  <span className="usertype-benefits__card-icon" aria-hidden="true">
                    <Icon name="archiveBox" className="usertype-benefits__card-icon-svg" strokeWidth={1.8} />
                  </span>
                  <h3>Panel de fiscalización</h3>
                  <p>Vista consolidada de comunidades con indicadores de cumplimiento y alertas automáticas.</p>
                  <div className="usertype-benefits__card-stats">
                    <div>
                      <strong>+50%</strong>
                      <span>Eficiencia</span>
                    </div>
                    <div>
                      <strong>100%</strong>
                      <span>Digital</span>
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
              <h2>¿Interesado en implementar DOMU en tu municipio?</h2>
              <p>Contáctanos para conocer planes institucionales y casos de éxito</p>
              <div className="usertype-cta__actions">
                <Button onClick={handleContact} variant="primary">
                  Contactar ventas
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

export default UserTypeFuncionarios;
