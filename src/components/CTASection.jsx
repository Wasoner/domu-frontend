import './CTASection.css';

const CTASection = ({ ctaText = 'Solicitar acceso' }) => {
    return (
        <section className="cta-section">
            <div className="cta-inner">
                <h3>¿No tienes acceso como residente?</h3>
                <div className="cta-actions">
                    <button className="btn btn-primary">{ctaText}</button>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
