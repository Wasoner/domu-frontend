import { Header, MainContent, Footer } from '../layout';
import { Icon, Seo } from '../components';
import { ROUTES } from '../constants';
import './Contact.scss';

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'domuapp.copropiedad@gmail.com';
const MAILTO_SUBJECT = 'Solicitud de soporte - DOMU';

const Contact = () => {
  const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(MAILTO_SUBJECT)}`;

  return (
    <div className="contact-page public-page">
      <Seo
        title="Contactar soporte | Domu"
        description="Si tienes dudas o necesitas ayuda con DOMU, escríbenos."
        keywords="soporte domu, contacto, ayuda condominios"
        canonicalPath="/contact"
      />
      <Header />

      <MainContent fullWidth>
        <section className="contact-section">
          <div className="contact-card">
            <span className="contact-card__icon" aria-hidden="true">
              <Icon name="chatBubbleLeftRight" size={48} strokeWidth={1.5} />
            </span>
            <h1>Contactar soporte</h1>
            <p className="contact-card__description">
              Si tienes dudas o necesitas ayuda, escríbenos.
            </p>
            <a href={mailtoHref} className="contact-card__email">
              <Icon name="chatBubbleLeftRight" size={18} />
              {SUPPORT_EMAIL}
            </a>
            <a href={ROUTES.HOME} className="btn btn-ghost contact-card__back">
              Volver al inicio
            </a>
          </div>
        </section>
      </MainContent>

      <Footer />
    </div>
  );
};

export default Contact;
