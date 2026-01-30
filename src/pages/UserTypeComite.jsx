import { Header, MainContent, Footer } from '../layout';
import { Button, Seo } from '../components';
import { ROUTES } from '../constants';
import './UserTypeLanding.css';

const features = [
  {
    icon: '👁️',
    title: 'Supervisión financiera',
    description: 'Revisa en tiempo real los ingresos, egresos y estado de cuentas de tu comunidad.',
  },
  {
    icon: '🗳️',
    title: 'Sistema de votaciones',
    description: 'Organiza votaciones digitales para decisiones importantes con resultados transparentes.',
  },
  {
    icon: '✅',
    title: 'Aprobación de proyectos',
    description: 'Revisa y aprueba cotizaciones, presupuestos y proyectos de mejora del edificio.',
  },
  {
    icon: '📈',
    title: 'Dashboard de transparencia',
    description: 'Panel visual con indicadores clave de gestión y cumplimiento administrativo.',
  },
  {
    icon: '📄',
    title: 'Actas digitales',
    description: 'Registra y almacena actas de reuniones con firmas digitales y acceso histórico.',
  },
  {
    icon: '💬',
    title: 'Comunicación con la comunidad',
    description: 'Canal directo para informar decisiones y recibir feedback de los residentes.',
  },
];

const benefits = [
  'Visión en tiempo real de la gestión administrativa',
  'Decisiones informadas con datos actualizados',
  'Historial completo de votaciones y acuerdos',
  'Mayor participación de copropietarios en decisiones',
  'Transparencia total en el manejo de fondos',
  'Documentación digital de toda la gestión',
];

const UserTypeComite = () => {
  const handleCreateCommunity = () => {
    window.location.href = ROUTES.HOME;
  };

  const handleDemo = () => {
    window.location.href = ROUTES.ABOUT;
  };

  return (
    <div className="usertype-page fade-in">
      <Seo
        title="DOMU para Comité de Administración | Supervisión y votaciones"
        description="Herramientas para comités de administración: supervisión financiera, votaciones digitales, aprobación de proyectos y transparencia en la gestión."
        keywords="comite administracion domu, votaciones edificio, supervision condominio, transparencia financiera"
        canonicalPath="/soluciones/comite"
      />
      <Header />

      {/* Hero Section */}
      <section className="usertype-hero animated-section">
        <div className="usertype-hero__content">
          <div className="usertype-hero__text">
            <span className="usertype-hero__icon">🗳️</span>
            <span className="usertype-hero__eyebrow">Solución para Comité</span>
            <h1 className="usertype-hero__title">
              Supervisión y <strong>transparencia</strong> para tu comunidad
            </h1>
            <p className="usertype-hero__subtitle">
              Fiscaliza la gestión administrativa, organiza votaciones y toma decisiones 
              informadas con acceso total a la información de tu edificio.
            </p>
            <div className="usertype-hero__actions">
              <Button onClick={handleCreateCommunity} variant="primary">
                Crear mi comunidad
              </Button>
              <Button onClick={handleDemo} variant="ghost">
                Ver demo
              </Button>
            </div>
          </div>
          <div className="usertype-hero__visual">
            <span className="usertype-hero__illustration" aria-hidden="true">🗳️</span>
          </div>
        </div>
      </section>

      <MainContent>
        {/* Features Section */}
        <section className="usertype-features animated-section">
          <div className="container">
            <div className="usertype-section__header">
              <h2>Funcionalidades para el Comité</h2>
              <p>Herramientas para fiscalizar, decidir y comunicar de forma efectiva</p>
            </div>
            <div className="usertype-features__grid">
              {features.map((feature, index) => (
                <div key={index} className="usertype-feature-card">
                  <div className="usertype-feature-card__icon">{feature.icon}</div>
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
                <h2>Beneficios para tu comité de administración</h2>
                <ul className="usertype-benefits__list">
                  {benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
              <div className="usertype-benefits__visual">
                <div className="usertype-benefits__card">
                  <span className="usertype-benefits__card-icon">🔍</span>
                  <h3>Panel de fiscalización</h3>
                  <p>Acceso completo a movimientos financieros, contratos y documentación de la comunidad.</p>
                  <div className="usertype-benefits__card-stats">
                    <div>
                      <strong>100%</strong>
                      <span>Transparencia</span>
                    </div>
                    <div>
                      <strong>+80%</strong>
                      <span>Participación</span>
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
              <h2>¿Listo para una gestión más transparente?</h2>
              <p>Únete a los comités que ya cuentan con herramientas profesionales de supervisión</p>
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
