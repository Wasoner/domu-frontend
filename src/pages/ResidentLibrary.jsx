import { useState } from 'react';
import { ProtectedLayout } from '../layout';
import './ResidentLibrary.scss';

/**
 * Resident Library Page Component
 * Document repository and community files
 */
const ResidentLibrary = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with API call
  const documents = [
    { id: 1, name: 'Reglamento de Copropiedad', category: 'legal', date: '2025-03-15', size: '2.4 MB', icon: '📜' },
    { id: 2, name: 'Acta Asamblea Ordinaria 2025', category: 'actas', date: '2025-12-20', size: '1.1 MB', icon: '📋' },
    { id: 3, name: 'Balance Financiero 2025', category: 'finanzas', date: '2026-01-05', size: '850 KB', icon: '📊' },
    { id: 4, name: 'Manual de Convivencia', category: 'legal', date: '2024-06-10', size: '1.8 MB', icon: '📖' },
    { id: 5, name: 'Presupuesto 2026', category: 'finanzas', date: '2025-11-30', size: '520 KB', icon: '💰' },
    { id: 6, name: 'Acta Asamblea Extraordinaria Oct 2025', category: 'actas', date: '2025-10-15', size: '980 KB', icon: '📋' },
    { id: 7, name: 'Cotización Pintura Fachada', category: 'proyectos', date: '2026-01-10', size: '3.2 MB', icon: '🎨' },
    { id: 8, name: 'Póliza de Seguro 2026', category: 'legal', date: '2026-01-01', size: '4.5 MB', icon: '🛡️' },
  ];

  const categories = [
    { id: 'all', label: 'Todos', icon: '📁' },
    { id: 'legal', label: 'Legales', icon: '📜' },
    { id: 'actas', label: 'Actas', icon: '📋' },
    { id: 'finanzas', label: 'Finanzas', icon: '📊' },
    { id: 'proyectos', label: 'Proyectos', icon: '🏗️' },
  ];

  const filteredDocuments = documents
    .filter((doc) => filter === 'all' || doc.category === filter)
    .filter((doc) => doc.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
      <article className="resident-library page-shell">
        <header className="resident-library__header">
          <div>
            <h1>Biblioteca</h1>
            <p className="resident-library__subtitle">Documentos y archivos de la comunidad</p>
          </div>
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
        </header>

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

        {filteredDocuments.length === 0 ? (
          <div className="resident-library__empty">
            <span className="resident-library__empty-icon">📂</span>
            <p>No se encontraron documentos</p>
          </div>
        ) : (
          <div className="resident-library__list">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="resident-library__item">
                <span className="resident-library__item-icon">{doc.icon}</span>
                <div className="resident-library__item-info">
                  <strong className="resident-library__item-name">{doc.name}</strong>
                  <span className="resident-library__item-meta">
                    {doc.size} • {new Date(doc.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <button className="resident-library__download-btn">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 3v10m0 0l-3-3m3 3l3-3M3 17h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Descargar
                </button>
              </div>
            ))}
          </div>
        )}
      </article>
    </ProtectedLayout>
  );
};

export default ResidentLibrary;
