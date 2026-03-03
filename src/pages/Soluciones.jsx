import { Link } from 'react-router-dom';
import { Header, MainContent, Footer } from '../layout';
import { Button, Icon, Seo } from '../components';
import { ROUTES } from '../constants';
import { useScrollReveal, useStaggerReveal } from '../hooks';
import './Soluciones.scss';

const roles = [
  {
    title: 'Administrador',
    iconName: 'chartBar',
    route: ROUTES.SOLUCIONES_ADMINISTRADOR,
    colorAccent: '#53a497',
    description:
      'Gestiona gastos comunes, cobranza, personal y proveedores desde un panel centralizado con reportes en tiempo real.',
    highlights: ['Gastos comunes', 'Dashboard', 'Proveedores'],
  },
  {
    title: 'Comité',
    iconName: 'scale',
    route: ROUTES.SOLUCIONES_COMITE,
    colorAccent: '#f16b32',
    description:
      'Fiscaliza la gestión administrativa con acceso a información financiera, votaciones digitales y documentación de la comunidad.',
    highlights: ['Votaciones', 'Fiscalización', 'Biblioteca'],
  },
  {
    title: 'Conserjería',
    iconName: 'buildingOffice',
    route: ROUTES.SOLUCIONES_CONSERJERIA,
    colorAccent: '#2d7a36',
    description:
      'Control de accesos con QR, recepción de encomiendas con evidencia fotográfica y bitácora digital de operaciones.',
    highlights: ['QR <5s', 'Encomiendas', 'Bitácora'],
  },
  {
    title: 'Cumplimiento normativo',
    iconName: 'buildingLibrary',
    route: ROUTES.SOLUCIONES_FUNCIONARIOS,
    colorAccent: '#0369a1',
    description:
      'Documentación, trazabilidad y transparencia que la Ley de Copropiedad 21.442 exige a las comunidades residenciales.',
    highlights: ['Ley 21.442', 'Trazabilidad', 'Reportes'],
  },
  {
    title: 'Residente',
    iconName: 'home',
    route: ROUTES.SOLUCIONES_RESIDENTE,
    colorAccent: '#f7ce0f',
    description:
      'Paga gastos comunes, reserva espacios, anuncia visitas y mantente conectado con tu comunidad desde cualquier dispositivo.',
    highlights: ['Pagos online', 'Reservas', 'Chat'],
  },
  {
    title: 'Proveedores',
    iconName: 'wrench',
    route: ROUTES.SOLUCIONES_PROVEEDORES,
    colorAccent: '#b54708',
    description:
      'Recibe órdenes de trabajo, envía cotizaciones y reporta avances sin depender de llamadas o correos.',
    highlights: ['Órdenes de trabajo', 'Cotizaciones', 'Seguimiento'],
  },
];

const differentiators = [
  {
    iconName: 'cpuChip',
    title: 'Integración total',
    stat: '1 sistema',
    description:
      'Un solo sistema que conecta administración, conserjería, residentes y proveedores. Sin herramientas fragmentadas ni datos duplicados.',
  },
  {
    iconName: 'shieldCheck',
    title: 'Cumplimiento normativo',
    stat: 'Ley 21.442',
    description:
      'Diseñado para facilitar el cumplimiento de la Ley de Copropiedad 21.442 con trazabilidad, reportes y documentación digital.',
  },
  {
    iconName: 'chartBar',
    title: 'Arquitectura robusta',
    stat: '2.000 uds',
    description:
      'Soporta comunidades de hasta 2.000 unidades con tiempos de respuesta menores a 500 ms y disponibilidad continua.',
  },
];

const Soluciones = () => {
  const handleCreateCommunity = () => {
    window.location.href = `${ROUTES.HOME}?openCommunityModal=1`;
  };

  const rolesRef = useStaggerReveal();
  const diffRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  return (
    <div className="soluciones-page public-page fade-in">
      <Seo
        title="Soluciones DOMU | Herramientas para cada rol en tu comunidad"
        description="Descubre las soluciones de DOMU para administradores, comités, conserjería, residentes, cumplimiento normativo y proveedores de edificios y condominios."
        keywords="soluciones domu, software condominios, administracion edificios, gestion comunitaria, ley 21442"
        canonicalPath="/soluciones"
      />
      <Header />

      <section className="soluciones-hero">
        <div className="container">
          <div className="soluciones-hero__content">
            <h1 className="soluciones-hero__title">
              Herramientas para cada rol en tu <strong>comunidad</strong>
            </h1>
            <p className="soluciones-hero__subtitle">
              DOMU es la plataforma integral que conecta a administradores, comités, conserjería,
              residentes y proveedores en un solo sistema.
            </p>
            <div className="soluciones-hero__actions">
              <Button onClick={handleCreateCommunity} variant="primary">
                Crear mi comunidad
              </Button>
            </div>
          </div>
        </div>
      </section>

      <MainContent>
        <section ref={rolesRef} className="soluciones-grid reveal-section">
          <div className="container">
            <div className="soluciones-grid__cards">
              {roles.map((role) => (
                <div
                  key={role.title}
                  className="soluciones-card reveal-stagger-child"
                  style={{ '--card-accent': role.colorAccent }}
                >
                  <div className="soluciones-card__icon" aria-hidden="true">
                    <Icon name={role.iconName} size={42} strokeWidth={1.8} />
                  </div>
                  <h3 className="soluciones-card__title">{role.title}</h3>
                  <p className="soluciones-card__description">{role.description}</p>
                  <div className="soluciones-card__highlights">
                    {role.highlights.map((h) => (
                      <span key={h} className="soluciones-card__pill">{h}</span>
                    ))}
                  </div>
                  <Link to={role.route} className="soluciones-card__link">
                    Ver más
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={diffRef} className="soluciones-diff reveal-section">
          <div className="container">
            <div className="soluciones-diff__header">
              <h2>¿Por qué DOMU?</h2>
            </div>
            <div className="soluciones-diff__grid">
              {differentiators.map((item) => (
                <div key={item.title} className="soluciones-diff__item">
                  <div className="soluciones-diff__icon" aria-hidden="true">
                    <Icon name={item.iconName} size={36} strokeWidth={1.8} />
                  </div>
                  <span className="soluciones-diff__stat mono-accent">{item.stat}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={ctaRef} className="soluciones-cta reveal-section">
          <div className="container">
            <div className="soluciones-cta__content">
              <h2>Centraliza la gestión de tu comunidad</h2>
              <p>Crea tu comunidad en DOMU y empieza a trabajar con herramientas profesionales</p>
              <div className="soluciones-cta__actions">
                <Button onClick={handleCreateCommunity} variant="primary">
                  Crear mi comunidad
                </Button>
                <Link to={ROUTES.ABOUT} className="btn btn--ghost">
                  Acerca de DOMU
                </Link>
              </div>
            </div>
          </div>
        </section>
      </MainContent>

      <Footer />
    </div>
  );
};

export default Soluciones;
