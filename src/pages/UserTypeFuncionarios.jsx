import { Header, MainContent, Footer } from '../layout';
import { Button, Icon, Seo } from '../components';
import { ROUTES } from '../constants';
import { useScrollReveal, useStaggerReveal } from '../hooks';
import './UserTypeLanding.scss';

const features = [
  {
    iconName: 'document',
    title: 'Reportes financieros exportables',
    description: 'Las comunidades en DOMU generan estados financieros, estados de cuenta y reportes de morosidad que pueden compartirse con entidades fiscalizadoras.',
  },
  {
    iconName: 'shieldCheck',
    title: 'Cumplimiento de Ley 21.442',
    description: 'DOMU está diseñado para facilitar el cumplimiento de la Ley de Copropiedad Inmobiliaria, con trazabilidad de operaciones y documentación digital.',
  },
  {
    iconName: 'chartBar',
    title: 'Registro digital de accesos',
    description: 'Cada ingreso y salida de visitantes queda registrado digitalmente con fecha, hora e identificación, facilitando auditorías de seguridad.',
  },
  {
    iconName: 'clipboardCheck',
    title: 'Trazabilidad de gestión',
    description: 'Historial completo de tareas, incidencias, pagos y votaciones que permite verificar la gestión administrativa de una comunidad.',
  },
  {
    iconName: 'buildingBank',
    title: 'Protección de datos personales',
    description: 'Diseñado conforme a la Ley 21.719 de Protección de Datos, con cifrado, control de acceso por roles y cumplimiento de derechos ARCO.',
  },
  {
    iconName: 'users',
    title: 'Transparencia para copropietarios',
    description: 'El sistema permite que comités y residentes accedan a la información financiera, promoviendo la transparencia que exige la normativa.',
  },
];

const benefits = [
  'Comunidades con documentación financiera digital y exportable',
  'Registro de accesos verificable con identificación QR',
  'Votaciones digitales con resultados trazables y exportables en PDF',
  'Gestión de incidencias documentada con evidencia',
  'Cumplimiento normativo facilitado por diseño (Ley 21.442 y 21.719)',
  'Plataforma que promueve la transparencia entre administrador y copropietarios',
];

const UserTypeFuncionarios = () => {
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
        title="DOMU y el cumplimiento normativo | Transparencia para comunidades"
        description="Cómo DOMU facilita el cumplimiento de la Ley 21.442 y la Ley 21.719 en comunidades residenciales, con trazabilidad, reportes y documentación digital."
        keywords="cumplimiento normativo condominios, ley 21442, ley copropiedad inmobiliaria, transparencia comunidades chile"
        canonicalPath="/soluciones/funcionarios"
      />
      <Header />

      {/* Hero Section */}
      <section className="usertype-hero">
        <div className="usertype-hero__content">
          <div className="usertype-hero__text">
            <span className="usertype-hero__eyebrow">Cumplimiento normativo</span>
            <h1 className="usertype-hero__title">
              Comunidades preparadas para la <strong>fiscalización</strong>
            </h1>
            <p className="usertype-hero__subtitle">
              DOMU genera la documentación, trazabilidad y transparencia que la Ley de Copropiedad
              Inmobiliaria 21.442 exige a las comunidades residenciales.
            </p>
            <div className="usertype-hero__actions">
              <Button onClick={handleContact} variant="primary">
                Contactar ventas
              </Button>
              <Button onClick={handleDemo} variant="ghost">
                Explorar soluciones
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
        <section ref={featuresRef} className="usertype-features reveal-section">
          <div className="container">
            <div className="usertype-section__header">
              <h2>Qué ofrece DOMU para el cumplimiento normativo</h2>
              <p>Capacidades de la plataforma que facilitan la fiscalización y la transparencia comunitaria</p>
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
                <h2>Cómo DOMU facilita el cumplimiento</h2>
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
                  <h3>Diseñado para la normativa chilena</h3>
                  <p>Cada módulo fue desarrollado considerando los requerimientos de la Ley 21.442 y la Ley 21.719 de Protección de Datos.</p>
                  <div className="usertype-benefits__card-stats">
                    <div>
                      <strong>Ley 21.442</strong>
                      <span>Copropiedad</span>
                    </div>
                    <div>
                      <strong>Ley 21.719</strong>
                      <span>Datos personales</span>
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
              <h2>¿Tu comunidad necesita cumplir con la normativa vigente?</h2>
              <p>Contáctanos para conocer cómo DOMU ayuda a las comunidades a estar preparadas</p>
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
