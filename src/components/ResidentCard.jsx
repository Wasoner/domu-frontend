import PropTypes from 'prop-types';
import './ResidentCard.css';

const ResidentCard = ({ title, children }) => {
    return (
        <div className="resident-card">
            <h3>{title}</h3>
            <div className="resident-card__body">{children}</div>
        </div>
    );
};

ResidentCard.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default ResidentCard;
