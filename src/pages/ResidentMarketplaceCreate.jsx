import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProtectedLayout } from '../layout';
import { Icon, Button, FormField } from '../components';
import { api } from '../services';
import { ROUTES } from '../constants';
import './ResidentMarketplaceCreate.scss';

const CATEGORIES = [
    { id: 1, name: 'Hogar y Muebles', icon: 'home' },
    { id: 2, name: 'Tecnología', icon: 'cpuChip' },
    { id: 3, name: 'Servicios', icon: 'wrench' },
    { id: 4, name: 'Alimentos', icon: 'shoppingBag' },
    { id: 5, name: 'Otros', icon: 'archiveBox' },
];

const ResidentMarketplaceCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        categoryId: '1',
        originalPriceLink: '',
    });
    
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = {
                ...formData,
                image: image
            };
            
            await api.market.createItem(data);
            navigate(ROUTES.RESIDENT_MARKETPLACE);
        } catch (err) {
            console.error("Error creating marketplace item", err);
            setError(err.message || "Ocurrió un error al publicar el producto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
            <div className="market-create">
                <header className="market-create__header">
                    <button className="btn-back" onClick={() => navigate(-1)}>
                        <Icon name="chevronRight" size={20} style={{ transform: 'rotate(180deg)' }} />
                        Volver
                    </button>
                    <h1>Publicar producto</h1>
                    <p>Completa los detalles de lo que quieres ofrecer a tu comunidad.</p>
                </header>

                <form className="market-create__form" onSubmit={handleSubmit}>
                    <div className="market-create__grid">
                        <section className="market-create__section">
                            <div className="market-create__card">
                                <h3>Información básica</h3>
                                <FormField 
                                    label="Título del producto"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Ej: Bicicleta de montaña, Mesa de centro..."
                                    required
                                />
                                
                                <div className="form-row">
                                    <FormField 
                                        label="Precio (CLP)"
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0"
                                        required
                                    />
                                    <div className="form-group">
                                        <label>Categoría</label>
                                        <select 
                                            name="categoryId" 
                                            value={formData.categoryId} 
                                            onChange={handleChange}
                                            className="custom-select"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <FormField 
                                    label="Descripción"
                                    name="description"
                                    type="textarea"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Cuéntale a tus vecinos sobre el estado del producto, uso, etc."
                                    rows={4}
                                />

                                <FormField 
                                    label="Link de referencia (opcional)"
                                    name="originalPriceLink"
                                    value={formData.originalPriceLink}
                                    onChange={handleChange}
                                    placeholder="https://tienda.com/producto-original"
                                />
                            </div>
                        </section>

                        <section className="market-create__section">
                            <div className="market-create__card">
                                <h3>Foto del producto</h3>
                                <div className={`image-upload ${imagePreview ? 'has-image' : ''}`}>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleImageChange}
                                        id="product-image"
                                    />
                                    <label htmlFor="product-image">
                                        {imagePreview ? (
                                            <div className="image-preview">
                                                <img src={imagePreview} alt="Preview" />
                                                <div className="image-overlay">
                                                    <Icon name="refresh" size={24} />
                                                    <span>Cambiar foto</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="upload-placeholder">
                                                <Icon name="shoppingBag" size={48} />
                                                <span>Haz clic para subir una foto</span>
                                                <small>JPG, PNG o WEBP (máx. 5MB)</small>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {error && (
                                <div className="market-create__error">
                                    <Icon name="exclamationTriangle" size={20} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="market-create__actions">
                                <Button 
                                    type="submit" 
                                    variant="primary" 
                                    fullWidth 
                                    loading={loading}
                                    disabled={!formData.title || !formData.price || !image}
                                >
                                    Publicar ahora
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    fullWidth 
                                    onClick={() => navigate(-1)}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </section>
                    </div>
                </form>
            </div>
        </ProtectedLayout>
    );
};

export default ResidentMarketplaceCreate;
