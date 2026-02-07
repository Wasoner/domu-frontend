import { useState, useEffect } from 'react';
import { ProtectedLayout } from '../layout';
import { api } from '../services';
import { useAppContext } from '../context';
import { CreatePublicationModal, Button, Icon } from '../components';
import './ResidentPublications.scss';

/**
 * Resident Publications Page Component
 * Community bulletin board and announcements
 */
const ResidentPublications = () => {
  const { user } = useAppContext();
  const [filter, setFilter] = useState('all');
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState(null);

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

  const filteredPublications = filter === 'all'
    ? publications
    : publications.filter((p) => p.type === filter);

  const getTypeLabel = (type) => {
    const labels = {
      announcement: 'Anuncio',
      alert: 'Alerta',
      news: 'Noticia',
      event: 'Evento',
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type) => {
    const icons = {
      announcement: '📢',
      alert: '⚠️',
      news: '📰',
      event: '📅',
    };
    return icons[type] || '📋';
  };

  const handleCreate = () => {
    setEditingPublication(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pub) => {
    setEditingPublication(pub);
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
    try {
      if (editingPublication) {
        await api.forum.update(editingPublication.id, data);
        alert('Publicación actualizada correctamente.');
      } else {
        await api.forum.create(data);
        alert('Publicación creada correctamente.');
      }
      setIsModalOpen(false);
      fetchPublications();
    } catch (error) {
      console.error('Error saving publication:', error);
      alert('Error al guardar la publicación. Intenta nuevamente.');
    }
  };

  const isAdmin = user?.roleId === 1;
  const isConcierge = user?.roleId === 3;
  const canCreate = true; // Allow all residents to post for now

  return (
    <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
      <article className="resident-publications">
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

        <div className="resident-publications__filters">
          <button
            className={`resident-publications__filter-btn ${filter === 'all' ? 'is-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button
            className={`resident-publications__filter-btn ${filter === 'announcement' ? 'is-active' : ''}`}
            onClick={() => setFilter('announcement')}
          >
            📢 Anuncios
          </button>
          <button
            className={`resident-publications__filter-btn ${filter === 'alert' ? 'is-active' : ''}`}
            onClick={() => setFilter('alert')}
          >
            ⚠️ Alertas
          </button>
          <button
            className={`resident-publications__filter-btn ${filter === 'event' ? 'is-active' : ''}`}
            onClick={() => setFilter('event')}
          >
            📅 Eventos
          </button>
        </div>

        {loading ? (
          <div className="resident-publications__empty">
            <p>Cargando publicaciones...</p>
          </div>
        ) : filteredPublications.length === 0 ? (
          <div className="resident-publications__empty">
            <span className="resident-publications__empty-icon">📭</span>
            <p>No hay publicaciones en esta categoría</p>
          </div>
        ) : (
          <div className="resident-publications__list">
            {filteredPublications.map((pub) => {
              const canEdit = isAdmin || (user?.id && pub.authorId === user.id);

              return (
                <article
                  key={pub.id}
                  className={`resident-publications__card ${pub.pinned ? 'is-pinned' : ''}`}
                >
                  {pub.pinned && <span className="resident-publications__pin">📌 Fijado</span>}
                  <div className="resident-publications__card-header">
                    <span className="resident-publications__type-badge" data-type={pub.type}>
                      {getTypeIcon(pub.type)} {getTypeLabel(pub.type)}
                    </span>
                    <div className="resident-publications__meta">
                      <span className="resident-publications__date">
                        {getRelativeTime(pub.date)}
                      </span>
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
