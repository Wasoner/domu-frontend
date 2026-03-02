import { useState, useEffect } from 'react';
import { ProtectedLayout } from '../layout';
import { api } from '../services';
import { useAppContext } from '../context';
import { CreatePublicationModal, Button, Icon, Skeleton } from '../components';
import './ResidentPublications.scss';

/**
 * Resident Publications Page Component
 * Community bulletin board and announcements
 */
const ResidentPublications = () => {
  const { user } = useAppContext();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      const data = await api.forum.list();
      if (Array.isArray(data)) {
        const mapped = data.map(p => ({
          ...p,
          type: p.category,
          author: p.authorName,
        }));
        setPublications(mapped);
      }
    } catch (error) {
      console.error('Error fetching publications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} d`;

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredPublications = publications
    .filter((p) => filter === 'all' || p.type === filter)
    .filter((p) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      return (
        (p.title || '').toLowerCase().includes(q) ||
        (p.content || '').toLowerCase().includes(q) ||
        (p.author || '').toLowerCase().includes(q)
      );
    });

  const getTypeLabel = (type) => {
    const labels = {
      announcement: 'Anuncio',
      alert: 'Alerta',
      news: 'Noticia',
      event: 'Evento',
    };
    return labels[type] || type;
  };

  const getTypeIconName = (type) => {
    const icons = {
      announcement: 'speakerWave',
      alert: 'exclamationTriangle',
      news: 'newspaper',
      event: 'calendar',
    };
    return icons[type] || 'document';
  };

  const handleCreate = () => {
    setEditingPublication(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pub) => {
    setEditingPublication(pub);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta publicación?')) {
      try {
        await api.forum.delete(id);
        fetchPublications();
      } catch (error) {
        console.error('Error deleting publication:', error);
      }
    }
  };

  const handleSubmit = async (data) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      if (editingPublication) {
        await api.forum.update(editingPublication.id, data);
        setSuccessMessage('Publicación actualizada correctamente.');
      } else {
        await api.forum.create(data);
        setSuccessMessage('Publicación creada correctamente.');
      }
      setIsModalOpen(false);
      fetchPublications();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (error) {
      console.error('Error saving publication:', error);
      setErrorMessage('Error al guardar la publicación. Intenta nuevamente.');
    }
  };

  const isAdmin = user?.roleId === 1;
  const isConcierge = user?.roleId === 3;
  const isStaff = user?.roleId === 4 || user?.userType === 'staff';
  const canCreate = !isStaff;

  return (
    <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge', 'staff']}>
      <article className="resident-publications page-shell">
        <header className="resident-publications__header">
          <div>
            <h1>Publicaciones</h1>
            <p className="resident-publications__subtitle">Noticias y comunicados de tu comunidad</p>
          </div>
          {canCreate && (
            <Button onClick={handleCreate} variant="primary" icon={<Icon name="plus" />}>
              Nueva Publicación
            </Button>
          )}
        </header>

        {successMessage && (
          <div className="resident-publications__message resident-publications__message--success" role="status">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="resident-publications__message resident-publications__message--error" role="alert">
            {errorMessage}
          </div>
        )}

        <div className="resident-publications__filters">
          <div className="resident-publications__search">
            <Icon name="magnifyingGlass" size={20} />
            <input
              type="text"
              placeholder="Buscar avisos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="resident-publications__categories">
            <button
              className={`category-pill ${filter === 'all' ? 'is-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todas
            </button>
            <button
              className={`category-pill ${filter === 'announcement' ? 'is-active' : ''}`}
              onClick={() => setFilter('announcement')}
            >
              <Icon name="speakerWave" size={16} /> Anuncios
            </button>
            <button
              className={`category-pill ${filter === 'alert' ? 'is-active' : ''}`}
              onClick={() => setFilter('alert')}
            >
              <Icon name="exclamationTriangle" size={16} /> Alertas
            </button>
            <button
              className={`category-pill ${filter === 'news' ? 'is-active' : ''}`}
              onClick={() => setFilter('news')}
            >
              <Icon name="newspaper" size={16} /> Noticias
            </button>
            <button
              className={`category-pill ${filter === 'event' ? 'is-active' : ''}`}
              onClick={() => setFilter('event')}
            >
              <Icon name="calendar" size={16} /> Eventos
            </button>
          </div>
        </div>

        {loading ? (
          <Skeleton.Cards count={4} />
        ) : filteredPublications.length === 0 ? (
          <div className="resident-publications__empty">
            <span className="resident-publications__empty-icon" aria-hidden="true">
              <Icon name="newspaper" size={48} />
            </span>
            <p>{searchTerm.trim() ? 'No se encontraron avisos con ese criterio' : 'No hay publicaciones en esta categoría'}</p>
          </div>
        ) : (
          <div className="resident-publications__list">
            {filteredPublications.map((pub) => {
              const canEdit = !isStaff && (isAdmin || (user?.id && pub.authorId === user.id));

              return (
                <article
                  key={pub.id}
                  className={`resident-publications__card ${pub.pinned ? 'is-pinned' : ''}`}
                >
                  <div className="resident-publications__card-header">
                    <span className="resident-publications__type-badge" data-type={pub.type}>
                      <Icon name={getTypeIconName(pub.type)} size={12} /> {getTypeLabel(pub.type)}
                    </span>
                    <div className="resident-publications__meta">
                      <span className="resident-publications__date">
                        {getRelativeTime(pub.date)}
                      </span>
                      {pub.pinned && (
                        <span className="resident-publications__pin">
                          <Icon name="pin" size={12} /> Fijado
                        </span>
                      )}
                      {canEdit && (
                        <div className="resident-publications__actions">
                          <button
                            className="icon-btn edit-btn"
                            onClick={() => handleEdit(pub)}
                            title="Editar"
                          >
                            <Icon name="edit" size={16} />
                          </button>
                          <button
                            className="icon-btn delete-btn"
                            onClick={() => handleDelete(pub.id)}
                            title="Eliminar"
                          >
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="resident-publications__title">{pub.title}</h3>
                  <p className="resident-publications__content">{pub.content}</p>
                  <p className="resident-publications__author">Publicado por: {pub.author}</p>
                </article>
              );
            })}
          </div>
        )}
      </article>

      <CreatePublicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingPublication}
        isAdmin={isAdmin || isConcierge}
      />
    </ProtectedLayout>
  );
};

export default ResidentPublications;
