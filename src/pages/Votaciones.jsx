import { useEffect, useMemo, useState } from 'react';
import { ProtectedLayout } from '../layout';
import { Icon } from '../components';
import { useAppContext } from '../context';
import { api } from '../services';
import './Votaciones.scss';

const buildOptionId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const defaultForm = () => ({
  title: '',
  description: '',
  closesAt: '',
  options: [
    { id: buildOptionId(), label: '' },
    { id: buildOptionId(), label: '' },
  ],
});

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
    <article className="poll-card">
      <header className="poll-card__header">
        <div>
          <p className="poll-card__eyebrow">{poll.status === 'CLOSED' ? 'Histórico' : 'Activa'}</p>
          <h3>{poll.title}</h3>
          {poll.description && <p className="poll-card__description">{poll.description}</p>}
        </div>
        <div className="poll-card__meta">
          <span className={`poll-card__badge ${isClosed ? 'is-closed' : 'is-open'}`}>
            {isClosed ? 'Cerrada' : 'Abierta'}
          </span>
          <span className="poll-card__time">{remaining.text}</span>
          <span className="poll-card__votes">{total} voto{total === 1 ? '' : 's'}</span>
        </div>
      </header>

      <div className="poll-card__options" role="group" aria-label={`Opciones para ${poll.title}`}>
        {poll.options.map((opt) => {
          const percentage = Math.round(opt.percentage || 0);
          const selected = poll.selectedOptionId === opt.id;
          const disabled = isClosed || voted || loadingPollId === poll.id || !canVote;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              className={`poll-card__option ${selected ? 'is-selected' : ''}`}
              onClick={() => onVote(poll.id, opt.id)}
            >
              <div className="poll-card__option-top">
                <span>{opt.label}</span>
                <span className="poll-card__percentage">{percentage}%</span>
              </div>
              <div className="poll-card__bar" aria-hidden="true">
                <span style={{ width: `${percentage}%` }} />
              </div>
              <small className="poll-card__votes-option">
                {opt.votes ?? 0} voto{(opt.votes ?? 0) === 1 ? '' : 's'}
              </small>
            </button>
          );
        })}
      </div>

      <footer className="poll-card__footer">
        {isClosed && (
          <button type="button" className="poll-card__ghost" onClick={() => onExport(poll.id)}>
            <Icon name="download" size={16} /> Exportar CSV
          </button>
        )}
        {!isClosed && onClose && (
          <button type="button" className="poll-card__ghost" onClick={() => onClose(poll.id)}>
            Cerrar ahora
          </button>
        )}
        {voted && !isClosed && <span className="poll-card__hint">Ya registraste tu voto</span>}
        {!canVote && <span className="poll-card__hint">Sin permisos para votar</span>}
      </footer>
    </article>
  );
};

const Votaciones = () => {
  const { user } = useAppContext();
  const [tab, setTab] = useState('open');
  const [loading, setLoading] = useState(false);
  const [loadingPollId, setLoadingPollId] = useState(null);
  const [error, setError] = useState(null);
  const [polls, setPolls] = useState({ open: [], closed: [] });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const canCreate = user?.userType === 'admin' || user?.userType === 'concierge';
  const canVote = ['resident', 'admin', 'concierge', 'staff'].includes(user?.userType);

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

  const updateOption = (id, label) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((opt) => (opt.id === id ? { ...opt, label } : opt)),
    }));
  };

  const addOption = () => {
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, { id: buildOptionId(), label: '' }],
    }));
  };

  const removeOption = (id) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((opt) => opt.id !== id),
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || '',
        closesAt: form.closesAt,
        options: form.options
          .map((opt) => opt.label.trim())
          .filter((opt) => opt.length > 0),
      };
      await api.polls.create(payload);
      setForm(defaultForm);
      setShowForm(false);
      setTab('open');
      fetchPolls();
    } catch (err) {
      setError(err.message || 'No pudimos crear la votación.');
    } finally {
      setLoading(false);
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
      <article className="polls-page page-shell">
        <header className="polls-page__header">
          <div>
            <p className="polls-page__eyebrow">Participación</p>
            <h1>Votaciones</h1>
            <p className="polls-page__subtitle">Crea votaciones rápidas y permite que la comunidad decida.</p>
          </div>
          {canCreate && (
            <button type="button" className="polls-page__primary" onClick={() => setShowForm(true)}>
              + Nueva votación
            </button>
          )}
        </header>

        {error && <div className="polls-page__error">{error}</div>}

        <div className="polls-page__tabs" role="tablist">
          <button
            type="button"
            className={`polls-page__tab ${tab === 'open' ? 'is-active' : ''}`}
            onClick={() => setTab('open')}
            role="tab"
            aria-selected={tab === 'open'}
          >
            Abiertas ({openPolls.length})
          </button>
          <button
            type="button"
            className={`polls-page__tab ${tab === 'closed' ? 'is-active' : ''}`}
            onClick={() => setTab('closed')}
            role="tab"
            aria-selected={tab === 'closed'}
          >
            Cerradas ({closedPolls.length})
          </button>
          <button type="button" className="polls-page__ghost" onClick={fetchPolls} disabled={loading}>
            {loading ? 'Actualizando…' : 'Refrescar'}
          </button>
        </div>

        <section className="polls-page__list" aria-live="polite">
          {loading && currentList.length === 0 && (
            <div className="polls-page__skeleton" aria-hidden="true">
              {[0, 1, 2].map((key) => (
                <div key={key} className="polls-page__skeleton-card">
                  <div className="polls-page__skeleton-header">
                    <span className="polls-page__skeleton-block polls-page__skeleton-block--lg" />
                    <span className="polls-page__skeleton-block polls-page__skeleton-block--sm" />
                  </div>
                  <span className="polls-page__skeleton-block polls-page__skeleton-block--md" />
                  <span className="polls-page__skeleton-block polls-page__skeleton-block--xl" />
                  <div className="polls-page__skeleton-footer">
                    <span className="polls-page__skeleton-block polls-page__skeleton-block--sm" />
                    <span className="polls-page__skeleton-block polls-page__skeleton-block--sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && currentList.length === 0 && (
            <div className="polls-page__empty">
              {tab === 'open' ? 'Sin votaciones abiertas por ahora.' : 'Aún no hay histórico de votaciones.'}
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

        {showForm && (
          <div className="polls-modal" role="dialog" aria-modal="true">
            <div className="polls-modal__card">
              <header className="polls-modal__header">
                <h2>Nueva votación</h2>
                <button type="button" className="polls-modal__close" onClick={() => setShowForm(false)}>
                  ✕
                </button>
              </header>
              <form className="polls-form" onSubmit={handleCreate}>
                <label className="polls-form__field">
                  <span>Título</span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    required
                    maxLength={180}
                  />
                </label>
                <label className="polls-form__field">
                  <span>Descripción</span>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </label>
                <label className="polls-form__field">
                  <span>Cierre</span>
                  <input
                    type="datetime-local"
                    value={form.closesAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, closesAt: e.target.value }))}
                    required
                  />
                </label>
                <div className="polls-form__options">
                  <div className="polls-form__options-header">
                    <span>Opciones (mínimo 2)</span>
                    <button type="button" onClick={addOption} className="polls-form__ghost">
                      + Agregar opción
                    </button>
                  </div>
                  {form.options.map((opt, index) => (
                    <div key={opt.id} className="polls-form__option">
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) => updateOption(opt.id, e.target.value)}
                        placeholder={`Opción ${index + 1}`}
                        required={index < 2}
                      />
                      {form.options.length > 2 && (
                        <button type="button" onClick={() => removeOption(opt.id)} className="polls-form__ghost">
                          Eliminar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="polls-form__actions">
                  <button type="button" className="polls-form__ghost" onClick={() => setShowForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="polls-form__submit" disabled={loading}>
                    {loading ? 'Creando…' : 'Crear votación'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </article>
    </ProtectedLayout>
  );
};

export default Votaciones;
