import React from 'react';

const ResidentCard = ({ title, children }) => {
    return (
        <div className="resident-card">
            <h3>{title}</h3>
            <div className="resident-card__body">{children}</div>
        </div>
    );
};

export default ResidentCard;
