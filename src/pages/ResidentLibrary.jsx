import { useState, useEffect } from 'react';
import { ProtectedLayout } from '../layout';
import { api } from '../services/api';
import { useAppContext } from '../context/useAppContext';
import { Button, Icon, Spinner } from '../components';
import './ResidentLibrary.scss';

/**
 * Resident Library Page Component
 * Document repository and community files
 */
const ResidentLibrary = () => {
  const { user } = useAppContext();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);
  
  // Upload state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'legal',
    file: null
  });

  const isAdmin = user?.roleId === 1;

  const categories = [
    { id: 'all', label: 'Todos', iconName: 'folder' },
    { id: 'legal', label: 'Reglamentos', iconName: 'scale' },
    { id: 'actas', label: 'Actas Asamblea', iconName: 'clipboard' },
    { id: 'emergencia', label: 'Emergencia', iconName: 'exclamationTriangle' },
    { id: 'seguros', label: 'Seguros', iconName: 'shield' },
    { id: 'otros', label: 'Otros', iconName: 'document' },
  ];

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.library.list();
      setDocuments(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('No se pudieron cargar los documentos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (!previewDocument) return undefined;

    const handleEscToClosePreview = (event) => {
      if (event.key === 'Escape') {
        setPreviewDocument(null);
      }
    };

    window.addEventListener('keydown', handleEscToClosePreview);

    return () => {
      window.removeEventListener('keydown', handleEscToClosePreview);
    };
  }, [previewDocument]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setUploadError('Solo se permiten archivos PDF');
        return;
      }
      if (file.size > 30 * 1024 * 1024) {
        setUploadError('El archivo excede el límite de 30MB');
        return;
      }
      setFormData({ ...formData, file });
      setUploadError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file || !formData.name) {
      setUploadError('Por favor completa todos los campos');
      return;
    }

    try {
      setUploadLoading(true);
      setUploadError(null);
      await api.library.upload(formData);
      setShowUploadForm(false);
      setFormData({ name: '', category: 'legal', file: null });
      fetchDocuments();
    } catch (err) {
      setUploadError(err.message || 'Error al subir el documento');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este documento?')) return;
    
    try {
      await api.library.delete(id);
      setDocuments(documents.filter(doc => doc.id !== id));
    } catch (err) {
      alert('Error al eliminar el documento: ' + err.message);
    }
  };

  const handleOpenPreview = (doc) => {
    if (!doc?.fileUrl) return;
    setPreviewDocument(doc);
  };

  const handleClosePreview = () => {
    setPreviewDocument(null);
  };

  const getCategoryIconName = (catId) => {
    return categories.find(c => c.id === catId)?.iconName || 'document';
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (value) => {
    if (!value) return 'Fecha no disponible';

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return 'Fecha no disponible';

    return parsedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredDocuments = documents
    .filter((doc) => filter === 'all' || doc.category === filter)
    .filter((doc) => doc.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge', 'staff']}>
      <article className="resident-library page-shell">
        <header className="resident-library__header">
          <div>
            <h1>Biblioteca</h1>
            <p className="resident-library__subtitle">Documentos y archivos de la comunidad</p>
          </div>
          <div className="resident-library__actions">
            <div className="resident-library__search">
              <Icon name="magnifyingGlass" size={20} />
              <input
                type="text"
                placeholder="Buscar documento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isAdmin && (
              <Button 
                variant="primary" 
                onClick={() => setShowUploadForm(!showUploadForm)}
              >
                {showUploadForm ? 'Cancelar' : 'Subir Documento'}
              </Button>
            )}
          </div>
        </header>

        {showUploadForm && isAdmin && (
          <section className="resident-library__upload-card">
            <h3>Cargar nuevo documento</h3>
            <form onSubmit={handleUpload}>
              <div className="resident-library__form-grid">
                <div className="form-group">
                  <label>Nombre del documento</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej: Reglamento de Copropiedad 2026"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Archivo (PDF, máx 30MB)</label>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={handleFileChange}
                    required
                  />
                </div>
              </div>
              {uploadError && <p className="error-message">{uploadError}</p>}
              <div className="resident-library__form-actions">
                <Button type="submit" loading={uploadLoading} disabled={uploadLoading}>
                  Guardar en Biblioteca
                </Button>
              </div>
            </form>
          </section>
        )}

        <div className="resident-library__categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`resident-library__category-btn ${filter === cat.id ? 'is-active' : ''}`}
              onClick={() => setFilter(cat.id)}
            >
              <Icon name={cat.iconName} size={16} className="resident-library__category-icon" />
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="resident-library__loading">
            <Spinner />
            <p>Cargando biblioteca...</p>
          </div>
        ) : error ? (
          <div className="resident-library__error">
            <p>{error}</p>
            <Button onClick={fetchDocuments}>Reintentar</Button>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="resident-library__empty">
            <Icon name="folder" size={64} className="resident-library__empty-icon" />
            <p>No se encontraron documentos</p>
          </div>
        ) : (
          <div className="resident-library__list">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="resident-library__item">
                <span className="resident-library__item-icon">
                  <Icon name={getCategoryIconName(doc.category)} size={22} />
                </span>
                <div className="resident-library__item-info">
                  <strong className="resident-library__item-name">{doc.name}</strong>
                  <span className="resident-library__item-meta">
                    {formatSize(doc.size)} • {formatDate(doc.uploadDate)}
                  </span>
                </div>
                <div className="resident-library__item-actions">
                  <button
                    type="button"
                    className="resident-library__preview-btn"
                    onClick={() => handleOpenPreview(doc)}
                  >
                    <Icon name="eye" size={18} strokeWidth={1.8} />
                    Visualizar
                  </button>
                  <a 
                    href={doc.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="resident-library__download-btn"
                  >
                    <Icon name="download" size={18} />
                    Descargar
                  </a>
                  {isAdmin && (
                    <button 
                      type="button"
                      className="resident-library__delete-btn"
                      onClick={() => handleDelete(doc.id)}
                      title="Eliminar documento"
                      aria-label="Eliminar documento"
                    >
                      <Icon name="trash" size={18} strokeWidth={1.8} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {previewDocument && (
          <div className="resident-library__preview-overlay" onClick={handleClosePreview}>
            <section
              className="resident-library__preview-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="resident-library-preview-title"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="resident-library__preview-header">
                <div>
                  <h3 id="resident-library-preview-title">{previewDocument.name}</h3>
                  <p>
                    {formatSize(previewDocument.size)} • {formatDate(previewDocument.uploadDate)}
                  </p>
                </div>
                <button
                  type="button"
                  className="resident-library__preview-close"
                  onClick={handleClosePreview}
                  aria-label="Cerrar visor de documento"
                >
                  <Icon name="close" size={18} />
                </button>
              </header>
              <div className="resident-library__preview-content">
                <iframe
                  title={`Vista previa de ${previewDocument.name}`}
                  src={previewDocument.fileUrl}
                  className="resident-library__preview-frame"
                />
              </div>
              <footer className="resident-library__preview-footer">
                <a
                  href={previewDocument.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resident-library__download-btn"
                >
                  <Icon name="download" size={18} />
                  Descargar PDF
                </a>
              </footer>
            </section>
          </div>
        )}
      </article>
    </ProtectedLayout>
  );
};

export default ResidentLibrary;
