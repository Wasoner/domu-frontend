import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProtectedLayout } from '../layout';
import { Icon, Button, FormField, Spinner } from '../components';
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
    const location = useLocation();
    const editId = location.state?.editId;
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!editId);
    const [error, setError] = useState(null);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        categoryId: '1',
    });
    
    // Gestión de imágenes
    const [existingImages, setExistingImages] = useState([]); // URLs de Box
    const [deletedImageUrls, setDeletedImageUrls] = useState([]); // URLs que el usuario borró
    const [newImages, setNewImages] = useState([]); // Archivos nuevos (File objects)
    const [newPreviews, setNewPreviews] = useState([]); // Vistas previas de archivos nuevos

    useEffect(() => {
        if (editId) {
            const loadItem = async () => {
                try {
                    const item = await api.market.getItem(editId);
                    setFormData({
                        title: item.title,
                        description: item.description || '',
                        price: item.price.toString(),
                        categoryId: String(item.categoryId),
                    });
                    setExistingImages(item.imageUrls || []);
                } catch (err) {
                    setError("No se pudo cargar la información del producto");
                } finally {
                    setFetching(false);
                }
            };
            loadItem();
        }
    }, [editId]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setNewImages(prev => [...prev, ...files]);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => setNewPreviews(prev => [...prev, reader.result]);
                reader.readAsDataURL(file);
            });
        }
    };

    const removeExisting = (url) => {
        setExistingImages(prev => prev.filter(u => u !== url));
        setDeletedImageUrls(prev => [...prev, url]);
    };

    const removeNew = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            if (editId) {
                await api.market.updateItem(editId, {
                    ...formData,
                    images: newImages,
                    deletedImageUrls: deletedImageUrls
                });
            } else {
                await api.market.createItem({ ...formData, images: newImages });
            }
            navigate(ROUTES.RESIDENT_MARKETPLACE);
        } catch (err) {
            setError(err.message || "Ocurrió un error al guardar.");
            setLoading(false);
        }
    };

    if (fetching) return <ProtectedLayout><div className="market-create-loading"><Spinner /></div></ProtectedLayout>;

    return (
        <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
            <div className="market-create">
                <header className="market-create__header">
                    <button className="btn-back" onClick={() => navigate(-1)} disabled={loading}>
                        <Icon name="chevronRight" size={20} style={{ transform: 'rotate(180deg)' }} />
                        Volver
                    </button>
                    <h1>{editId ? "Editar publicación" : "Publicar producto"}</h1>
                    <p>{editId ? "Actualiza los detalles y fotos de tu anuncio." : "Comparte algo con tus vecinos. La primera foto será la portada."}</p>
                </header>

                <form className="market-create__form" onSubmit={handleSubmit}>
                    <div className="market-create__grid">
                        <div className="market-create__left">
                            <div className="market-create__card">
                                <h3>Información básica</h3>
                                <FormField label="Título" name="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required disabled={loading} />
                                <div className="form-row">
                                    <FormField label="Precio" name="price" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required disabled={loading} />
                                    <div className="form-group">
                                        <label>Categoría</label>
                                        <select name="categoryId" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="custom-select" disabled={loading}>
                                            {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <FormField label="Descripción" name="description" type="textarea" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} disabled={loading} />
                            </div>
                        </div>

                        <div className="market-create__right">
                            <div className="market-create__card">
                                <h3>Fotos del producto</h3>
                                <div className="images-grid">
                                    {/* Fotos actuales */}
                                    {existingImages.map((url, idx) => (
                                        <div key={`old-${idx}`} className="image-preview-item">
                                            <img src={url} alt="Actual" />
                                            <button type="button" className="btn-remove" onClick={() => removeExisting(url)}>
                                                <Icon name="trash" size={14} />
                                            </button>
                                            {idx === 0 && <span className="main-badge">Actual</span>}
                                        </div>
                                    ))}
                                    {/* Fotos nuevas */}
                                    {newPreviews.map((src, idx) => (
                                        <div key={`new-${idx}`} className="image-preview-item is-new">
                                            <img src={src} alt="Nueva" />
                                            <button type="button" className="btn-remove" onClick={() => removeNew(idx)}>
                                                <Icon name="xMark" size={14} />
                                            </button>
                                            <span className="main-badge new">Nueva</span>
                                        </div>
                                    ))}
                                    <label className="image-add-btn">
                                        <input type="file" multiple accept="image/*" onChange={handleImageChange} disabled={loading} />
                                        <Icon name="plus" size={24} />
                                        <span>Agregar</span>
                                    </label>
                                </div>
                            </div>

                            {error && <div className="market-create__error"><Icon name="exclamationTriangle" size={20} /><span>{error}</span></div>}

                            <div className="market-create__actions">
                                <Button type="submit" variant="primary" fullWidth loading={loading} disabled={existingImages.length === 0 && newImages.length === 0}>
                                    {loading ? "Guardando..." : "Guardar cambios"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </ProtectedLayout>
    );
};

export default ResidentMarketplaceCreate;
