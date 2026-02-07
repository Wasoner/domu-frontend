import { Icon } from './index';
import './MarketCard.scss';

/**
 * MarketCard - Componente individual para mostrar un producto en el marketplace
 * @param {Object} item - Datos del producto
 * @param {Function} onClick - Función al hacer clic en la tarjeta
 */
const MarketCard = ({ item, onClick }) => {
    return (
        <div className="market-card" onClick={onClick}>
            <div className="market-card__image">
                {item.mainImageUrl ? (
                    <img src={item.mainImageUrl} alt={item.title} loading="lazy" />
                ) : (
                    <div className="market-card__placeholder">
                        <Icon name="archiveBox" size={40} />
                    </div>
                )}
                <span className="market-card__price">
                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(item.price)}
                </span>
            </div>
            <div className="market-card__content">
                <span className="market-card__category">{item.categoryName}</span>
                <h3>{item.title}</h3>
                <div className="market-card__seller">
                    <div className="market-card__avatar">
                        {item.sellerPhotoUrl ? (
                            <img src={item.sellerPhotoUrl} alt="" />
                        ) : (
                            item.sellerName.charAt(0)
                        )}
                    </div>
                    <span>{item.sellerName}</span>
                </div>
            </div>
        </div>
    );
};

export default MarketCard;
