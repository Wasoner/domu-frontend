import PropTypes from 'prop-types';
import './FeatureCard.css';

const FeatureCard = ({ title, children, variant = 'primary' }) => {
    return (
        <div className={`feature-card feature-card--${variant}`}>
            <h3>{title}</h3>
            <div className="feature-card__body">{children}</div>
        </div>
    );
};

FeatureCard.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary']),
};

export default FeatureCard;
