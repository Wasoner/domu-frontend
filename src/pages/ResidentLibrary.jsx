import { useState, useEffect } from 'react';
import { ProtectedLayout } from '../layout';
import { api } from '../services/api';
import { useAppContext } from '../context/useAppContext';
import { Button, Spinner } from '../components';
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
    { id: 'all', label: 'Todos', icon: '📁' },
    { id: 'legal', label: 'Reglamentos', icon: '📜' },
    { id: 'actas', label: 'Actas Asamblea', icon: '📋' },
    { id: 'emergencia', label: 'Emergencia', icon: '🚨' },
    { id: 'seguros', label: 'Seguros', icon: '🛡️' },
    { id: 'otros', label: 'Otros', icon: '📄' },
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

  const getCategoryIcon = (catId) => {
    return categories.find(c => c.id === catId)?.icon || '📄';
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="m15 15-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
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
              <span>{cat.icon}</span>
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
            <span className="resident-library__empty-icon">📂</span>
            <p>No se encontraron documentos</p>
          </div>
        ) : (
          <div className="resident-library__list">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="resident-library__item">
                <span className="resident-library__item-icon">{getCategoryIcon(doc.category)}</span>
                <div className="resident-library__item-info">
                  <strong className="resident-library__item-name">{doc.name}</strong>
                  <span className="resident-library__item-meta">
                    {formatSize(doc.size)} • {new Date(doc.uploadDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="resident-library__item-actions">
                  <a 
                    href={doc.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="resident-library__download-btn"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 3v10m0 0l-3-3m3 3l3-3M3 17h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Descargar
                  </a>
                  {isAdmin && (
                    <button 
                      className="resident-library__delete-btn"
                      onClick={() => handleDelete(doc.id)}
                      title="Eliminar documento"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 6h12M8 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2m2 0v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </ProtectedLayout>
  );
};

export default ResidentLibrary;
