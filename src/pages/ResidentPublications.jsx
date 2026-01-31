import { useState } from 'react';
import { ProtectedLayout } from '../layout';
import './ResidentPublications.scss';

/**
 * Resident Publications Page Component
 * Community bulletin board and announcements
 */
const ResidentPublications = () => {
  const [filter, setFilter] = useState('all');

  // Mock data - replace with API call
  const publications = [
    {
      id: 1,
      type: 'announcement',
      title: 'Información de interés para la comunidad',
      content: 'Recordatorio sobre mantenciones y uso responsable de espacios comunes.',
      date: '2026-01-17',
      author: 'Administración',
      pinned: true,
    },
    {
      id: 2,
      type: 'alert',
      title: 'Corte de gas programado',
      content: 'El servicio se suspenderá el viernes 24-01-2026 desde las 23:00 hrs hasta las 06:00 hrs del día siguiente.',
      date: '2026-01-20',
      author: 'Administración',
      pinned: false,
    },
    {
      id: 3,
      type: 'news',
      title: 'Cotizaciones de trabajos aprobadas',
      content: 'Revisa el detalle de los trabajos aprobados para áreas comunes en la última asamblea.',
      date: '2026-01-15',
      author: 'Comité',
      pinned: false,
    },
    {
      id: 4,
      type: 'event',
      title: 'Asamblea ordinaria de copropietarios',
      content: 'Se convoca a todos los copropietarios a la asamblea que se realizará el 15 de febrero a las 19:00 hrs.',
      date: '2026-01-10',
      author: 'Comité',
      pinned: false,
    },
  ];

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

  return (
    <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
      <article className="resident-publications">
        <header className="resident-publications__header">
          <div>
            <h1>Publicaciones</h1>
            <p className="resident-publications__subtitle">Noticias y comunicados de tu comunidad</p>
          </div>
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

        {filteredPublications.length === 0 ? (
          <div className="resident-publications__empty">
            <span className="resident-publications__empty-icon">📭</span>
            <p>No hay publicaciones en esta categoría</p>
          </div>
        ) : (
          <div className="resident-publications__list">
            {filteredPublications.map((pub) => (
              <article
                key={pub.id}
                className={`resident-publications__card ${pub.pinned ? 'is-pinned' : ''}`}
              >
                {pub.pinned && <span className="resident-publications__pin">📌 Fijado</span>}
                <div className="resident-publications__card-header">
                  <span className="resident-publications__type-badge" data-type={pub.type}>
                    {getTypeIcon(pub.type)} {getTypeLabel(pub.type)}
                  </span>
                  <span className="resident-publications__date">
                    {new Date(pub.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="resident-publications__title">{pub.title}</h3>
                <p className="resident-publications__content">{pub.content}</p>
                <p className="resident-publications__author">Publicado por: {pub.author}</p>
              </article>
            ))}
          </div>
        )}
      </article>
    </ProtectedLayout>
  );
};

export default ResidentPublications;
