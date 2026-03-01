import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import FormField from './FormField';
import Icon from './Icon';
import './CreatePublicationModal.scss';

const CATEGORIES = [
  { value: 'announcement', label: 'Anuncio', icon: 'speakerWave' },
  { value: 'alert', label: 'Alerta', icon: 'exclamationTriangle' },
  { value: 'news', label: 'Noticia', icon: 'newspaper' },
  { value: 'event', label: 'Evento', icon: 'calendar' },
];

const CreatePublicationModal = ({ isOpen, onClose, onSubmit, initialData, isAdmin, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'announcement',
    pinned: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        category: initialData.category || 'announcement',
        pinned: initialData.pinned || false,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'announcement',
        pinned: false,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content publication-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>{initialData ? 'Editar Publicación' : 'Nueva Publicación'}</h3>
          <button type="button" className="close-button" onClick={onClose}>
            <Icon name="close" size={24} />
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <FormField
            label="Título"
            type="text"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Título del aviso"
          />
          
          <div className="form-group">
            <label className="form-label">Categoría</label>
            <div className="category-selector">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`category-btn ${formData.category === cat.value ? 'is-active' : ''}`}
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                >
                  <Icon name={cat.icon} size={16} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <FormField
            label="Contenido"
            type="textarea"
            name="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            placeholder="Escribe el contenido aquí..."
            rows={6}
          />

          {isAdmin && (
            <div className="form-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                />
                Fijar como anuncio oficial
              </label>
            </div>
          )}

          <div className="modal-actions">
            <Button variant="ghost" onClick={onClose} type="button" disabled={loading}>Cancelar</Button>
            <Button variant="primary" type="submit" loading={loading}>
              {initialData ? 'Guardar Cambios' : 'Publicar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

CreatePublicationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  isAdmin: PropTypes.bool,
};

export default CreatePublicationModal;
