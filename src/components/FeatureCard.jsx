import React from 'react';

const FeatureCard = ({ title, children, variant = 'turquoise' }) => {
    return (
        <div className={`feature-card feature-card--${variant}`}>
            <h3>{title}</h3>
            <div className="feature-card__body">{children}</div>
        </div>
    );
};

export default FeatureCard;
