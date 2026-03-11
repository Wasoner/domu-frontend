import { useEffect, useMemo, useState } from 'react';
import { ProtectedLayout } from '../layout';
import { Icon, Button, CreatePollModal, Skeleton } from '../components';
import { useAppContext } from '../context';
import { api } from '../services';
import './Votaciones.scss';

const formatRemaining = (closesAt) => {
  if (!closesAt) return { text: 'Sin fecha', expired: false };
  const target = new Date(closesAt);
  const diffMs = target - new Date();
  if (Number.isNaN(diffMs)) return { text: 'Fecha inválida', expired: false };
  if (diffMs <= 0) return { text: 'Cerrada', expired: true };
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return { text: `${days}d ${hours}h restantes`, expired: false };
  if (hours > 0) return { text: `${hours}h ${minutes}m restantes`, expired: false };
  return { text: `${minutes}m restantes`, expired: false };
};

const PollCard = ({ poll, onVote, onExport, onClose, canVote, loadingPollId }) => {
  const remaining = formatRemaining(poll.closesAt);
  const total = poll.totalVotes || 0;
  const voted = poll.voted;
  const isClosed = poll.status === 'CLOSED' || remaining.expired;

  return (
    <article className="resident-votaciones__card">
      <div className="resident-votaciones__card-header">
        <span
          className={`resident-votaciones__type-badge ${isClosed ? 'is-closed' : 'is-open'}`}
          data-status={isClosed ? 'closed' : 'open'}
        >
          <Icon name={isClosed ? 'archiveBox' : 'checkBadge'} size={12} />
          {isClosed ? 'Cerrada' : 'Abierta'}
        </span>
        <div className="resident-votaciones__meta">
          <span className="resident-votaciones__time">{remaining.text}</span>
          <span className="resident-votaciones__votes">{total} voto{total === 1 ? '' : 's'}</span>
        </div>
      </div>
      <h3 className="resident-votaciones__title">{poll.title}</h3>
      {poll.description && (
        <p className="resident-votaciones__content">{poll.description}</p>
      )}

      <div
        className="resident-votaciones__options"
        role="group"
        aria-label={`Opciones para ${poll.title}`}
      >
        {poll.options.map((opt) => {
          const percentage = Math.round(opt.percentage || 0);
          const selected = poll.selectedOptionId === opt.id;
          const disabled = isClosed || voted || loadingPollId === poll.id || !canVote;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              className={`resident-votaciones__option ${selected ? 'is-selected' : ''}`}
              onClick={() => onVote(poll.id, opt.id)}
            >
              <div className="resident-votaciones__option-top">
                <span>{opt.label}</span>
                <span className="resident-votaciones__percentage">{percentage}%</span>
              </div>
              <div className="resident-votaciones__bar" aria-hidden="true">
                <span style={{ width: `${percentage}%` }} />
              </div>
              <small className="resident-votaciones__votes-option">
                {opt.votes ?? 0} voto{(opt.votes ?? 0) === 1 ? '' : 's'}
              </small>
            </button>
          );
        })}
      </div>

      <div className="resident-votaciones__card-footer">
        {isClosed && (
          <button
            type="button"
            className="resident-votaciones__ghost-btn"
            onClick={() => onExport(poll.id)}
          >
            <Icon name="download" size={16} /> Exportar CSV
          </button>
        )}
        {!isClosed && onClose && (
          <button
            type="button"
            className="resident-votaciones__ghost-btn"
            onClick={() => onClose(poll.id)}
          >
            Cerrar ahora
          </button>
        )}
        {voted && !isClosed && (
          <span className="resident-votaciones__hint">Ya registraste tu voto</span>
        )}
        {!canVote && (
          <span className="resident-votaciones__hint">Sin permisos para votar</span>
        )}
      </div>
    </article>
  );
};

const Votaciones = () => {
  const { hasPermission } = useAppContext();
  const [tab, setTab] = useState('open');
  const [loading, setLoading] = useState(false);
  const [loadingPollId, setLoadingPollId] = useState(null);
  const [error, setError] = useState(null);
  const [polls, setPolls] = useState({ open: [], closed: [] });
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const canCreate = hasPermission('VOTES_CREATE');
  const canVote = hasPermission('VOTES_VIEW');

  const openPolls = useMemo(() => polls.open || [], [polls]);
  const closedPolls = useMemo(() => polls.closed || [], [polls]);

  const fetchPolls = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.polls.list();
      setPolls({
        open: data?.open || [],
        closed: data?.closed || [],
      });
    } catch (err) {
      setError(err.message || 'No pudimos cargar las votaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleCreate = async (payload) => {
    setCreating(true);
    setError(null);
    try {
      await api.polls.create(payload);
      setShowForm(false);
      setTab('open');
      fetchPolls();
    } catch (err) {
      setError(err.message || 'No pudimos crear la votación.');
    } finally {
      setCreating(false);
    }
  };

  const handleVote = async (pollId, optionId) => {
    if (!canVote) return;
    setLoadingPollId(pollId);
    setError(null);
    try {
      await api.polls.vote(pollId, optionId);
      fetchPolls();
    } catch (err) {
      setError(err.message || 'No pudimos registrar tu voto.');
    } finally {
      setLoadingPollId(null);
    }
  };

  const handleExport = async (pollId) => {
    try {
      const csv = await api.polls.exportCsv(pollId);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `votacion-${pollId}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'No pudimos exportar la votación.');
    }
  };

  const handleClose = async (pollId) => {
    setLoadingPollId(pollId);
    setError(null);
    try {
      await api.polls.close(pollId);
      fetchPolls();
    } catch (err) {
      setError(err.message || 'No pudimos cerrar la votación.');
    } finally {
      setLoadingPollId(null);
    }
  };

  const currentList = tab === 'open' ? openPolls : closedPolls;

  return (
    <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge', 'staff']}>
      <article className="resident-votaciones page-shell">
        <header className="resident-votaciones__header">
          <div>
            <h1>Votaciones</h1>
            <p className="resident-votaciones__subtitle">
              Crea votaciones rápidas y permite que la comunidad decida.
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setShowForm(true)} variant="primary" icon={<Icon name="plus" />}>
              Nueva votación
            </Button>
          )}
        </header>

        {error && (
          <div className="resident-votaciones__message resident-votaciones__message--error" role="alert">
            {error}
          </div>
        )}

        <div className="resident-votaciones__filters">
          <div className="resident-votaciones__categories">
            <button
              className={`category-pill ${tab === 'open' ? 'is-active' : ''}`}
              onClick={() => setTab('open')}
              role="tab"
              aria-selected={tab === 'open'}
            >
              <Icon name="checkBadge" size={16} /> Abiertas ({openPolls.length})
            </button>
            <button
              className={`category-pill ${tab === 'closed' ? 'is-active' : ''}`}
              onClick={() => setTab('closed')}
              role="tab"
              aria-selected={tab === 'closed'}
            >
              <Icon name="archiveBox" size={16} /> Cerradas ({closedPolls.length})
            </button>
            <button
              type="button"
              className="category-pill category-pill--ghost"
              onClick={fetchPolls}
              disabled={loading}
            >
              {loading ? 'Actualizando…' : 'Refrescar'}
            </button>
          </div>
        </div>

        <section className="resident-votaciones__list" aria-live="polite">
          {loading && currentList.length === 0 && (
            <Skeleton.Cards count={3} />
          )}
          {!loading && currentList.length === 0 && (
            <div className="resident-votaciones__empty">
              <span className="resident-votaciones__empty-icon" aria-hidden="true">
                <Icon name="checkBadge" size={48} />
              </span>
              <p>
                {tab === 'open'
                  ? 'Sin votaciones abiertas por ahora.'
                  : 'Aún no hay histórico de votaciones.'}
              </p>
            </div>
          )}
          {!loading &&
            currentList.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onVote={handleVote}
                onExport={handleExport}
                onClose={canCreate ? handleClose : null}
                canVote={canVote}
                loadingPollId={loadingPollId}
              />
            ))}
        </section>

        <CreatePollModal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
          loading={creating}
        />
      </article>
    </ProtectedLayout>
  );
};

export default Votaciones;
