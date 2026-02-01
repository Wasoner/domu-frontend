import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services';
import { Icon } from './index';
import { ROUTES } from '../constants';
import './MarketCarousel.scss';

const MarketCarousel = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const data = await api.market.listItems();
                setItems(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching market items", err);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    if (loading) return <div className="market-carousel-skeleton" />;
    if (items.length === 0) return null;

    return (
        <section className="market-carousel">
            <div className="market-carousel__header">
                <div className="market-carousel__title-group">
                    <span className="market-carousel__icon">🛍️</span>
                    <div>
                        <h2>Tienda de la comunidad</h2>
                        <p>Descubre lo que tus vecinos están ofreciendo</p>
                    </div>
                </div>
                <Link to={ROUTES.RESIDENT_MARKETPLACE || '/marketplace'} className="market-carousel__btn-more">
                    Ir a la tienda <Icon name="chevronRight" size={16} />
                </Link>
            </div>

            <div className="market-carousel__track">
                {items.map((item) => (
                    <div key={item.id} className="market-item-card">
                        <div className="market-item-card__image-container">
                            {item.mainImageUrl ? (
                                <img src={item.mainImageUrl} alt={item.title} />
                            ) : (
                                <div className="market-item-card__placeholder">
                                    <Icon name="archiveBox" size={32} />
                                </div>
                            )}
                            <span className="market-item-card__price">
                                ${new Intl.NumberFormat('es-CL').format(item.price)}
                            </span>
                        </div>
                        <div className="market-item-card__info">
                            <h3>{item.title}</h3>
                            <p>{item.sellerName}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default MarketCarousel;
