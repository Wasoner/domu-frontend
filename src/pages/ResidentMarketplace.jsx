import { useState, useEffect } from 'react';
import { ProtectedLayout } from '../layout';
import { Icon, Button, Spinner, FormField, NeighborProfileModal } from '../components';
import { api } from '../services';
import { ROUTES } from '../constants';
import { useNavigate } from 'react-router-dom';
import './ResidentMarketplace.scss';

const CATEGORIES = [
    { id: null, name: 'Todo', icon: 'archiveBox' },
    { id: 1, name: 'Hogar', icon: 'home' },
    { id: 2, name: 'Tecnología', icon: 'cpuChip' },
    { id: 3, name: 'Servicios', icon: 'wrench' },
    { id: 4, name: 'Alimentos', icon: 'shoppingBag' },
];

const ResidentMarketplace = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetail, setShowDetail] = useState(null);
    const [showProfileId, setShowProfileId] = useState(null);
    const navigate = useNavigate();

    const fetchItems = async () => {
        setLoading(true);
        try {
            const data = await api.market.listItems({ categoryId: selectedCategory });
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching market items", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [selectedCategory]);

    const filteredItems = items.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleContact = async (item) => {
        try {
            const response = await api.chat.startConversation(item.userId, item.id);
            navigate(ROUTES.RESIDENT_CHAT, { state: { roomId: response.roomId } });
        } catch (err) {
            console.error("Error starting conversation", err);
        }
    };

    return (
        <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
            <div className="resident-marketplace">
                <header className="resident-marketplace__header">
                    <div className="resident-marketplace__header-info">
                        <h1>Tienda de la comunidad</h1>
                        <p>Compra y vende productos con tus vecinos de forma segura.</p>
                    </div>
                    <Button 
                        variant="primary" 
                        onClick={() => navigate(ROUTES.RESIDENT_MARKETPLACE + '/nuevo')}
                        icon={<Icon name="plus" size={18} />}
                    >
                        Publicar producto
                    </Button>
                </header>

                <div className="resident-marketplace__filters">
                    <div className="resident-marketplace__search">
                        <Icon name="magnifyingGlass" size={20} />
                        <input 
                            type="text" 
                            placeholder="Buscar en la comunidad..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="resident-marketplace__categories">
                        {CATEGORIES.map(cat => (
                            <button 
                                key={cat.id || 'all'} 
                                className={`category-pill ${selectedCategory === cat.id ? 'is-active' : ''}`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                <Icon name={cat.icon} size={16} />
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="resident-marketplace__loading">
                        <Spinner />
                        <p>Cargando productos...</p>
                    </div>
                ) : filteredItems.length > 0 ? (
                    <div className="resident-marketplace__grid">
                        {filteredItems.map(item => (
                            <div key={item.id} className="market-card" onClick={() => setShowDetail(item)}>
                                <div className="market-card__image">
                                    {item.mainImageUrl ? (
                                        <img src={item.mainImageUrl} alt={item.title} />
                                    ) : (
                                        <div className="market-card__placeholder">
                                            <Icon name="archiveBox" size={40} />
                                        </div>
                                    )}
                                    <span className="market-card__price">
                                        ${new Intl.NumberFormat('es-CL').format(item.price)}
                                    </span>
                                </div>
                                <div className="market-card__content">
                                    <span className="market-card__category">{item.categoryName}</span>
                                    <h3>{item.title}</h3>
                                    <div className="market-card__seller">
                                        <div className="market-card__avatar">
                                            {item.sellerName.charAt(0)}
                                        </div>
                                        <span>{item.sellerName}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="resident-marketplace__empty">
                        <Icon name="shoppingBag" size={64} />
                        <h2>No se encontraron productos</h2>
                        <p>Prueba cambiando los filtros o sé el primero en publicar algo.</p>
                    </div>
                )}

                {/* Modal de Detalle */}
                {showDetail && (
                    <div className="market-modal-overlay" onClick={() => setShowDetail(null)}>
                        <div className="market-modal" onClick={e => e.stopPropagation()}>
                            <button className="market-modal__close" onClick={() => setShowDetail(null)}>
                                <Icon name="xMark" size={24} />
                            </button>
                            
                            <div className="market-modal__grid">
                                <div className="market-modal__gallery">
                                    {showDetail.mainImageUrl ? (
                                        <img src={showDetail.mainImageUrl} alt={showDetail.title} />
                                    ) : (
                                        <div className="market-modal__placeholder">
                                            <Icon name="archiveBox" size={64} />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="market-modal__info">
                                    <div className="market-modal__header">
                                        <span className="market-modal__category-tag">{showDetail.categoryName}</span>
                                        <h1>{showDetail.title}</h1>
                                        <strong className="market-modal__price">
                                            ${new Intl.NumberFormat('es-CL').format(showDetail.price)}
                                        </strong>
                                    </div>

                                    <div className="market-modal__section">
                                        <h3>Descripción</h3>
                                        <p>{showDetail.description || 'Sin descripción disponible.'}</p>
                                        {showDetail.originalPriceLink && (
                                            <a 
                                                href={showDetail.originalPriceLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="market-modal__link"
                                            >
                                                Ver precio de referencia <Icon name="arrowTopRightOnSquare" size={14} />
                                            </a>
                                        )}
                                    </div>

                                    <div className="market-modal__seller-card">
                                        <div className="market-modal__seller-info">
                                            <div className="market-modal__seller-avatar">
                                                {showDetail.sellerName.charAt(0)}
                                            </div>
                                            <div>
                                                <strong>{showDetail.sellerName}</strong>
                                                <span>Vecino verificado</span>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="secondary" 
                                            fullWidth
                                            onClick={() => setShowProfileId(showDetail.userId)}
                                            icon={<Icon name="chatBubbleLeftRight" size={18} />}
                                        >
                                            Ver perfil y contactar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showProfileId && (
                    <NeighborProfileModal 
                        userId={showProfileId} 
                        onClose={() => setShowProfileId(null)} 
                    />
                )}
            </div>
        </ProtectedLayout>
    );
};

export default ResidentMarketplace;
