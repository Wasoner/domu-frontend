import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProtectedLayout } from '../layout';
import { Skeleton, Button } from '../components';
import { api } from '../services';
import './AdminCommonExpenses.scss';

const emptyCharge = {
  description: '',
  type: '',
  origin: '',
  amount: '',
  receiptText: '',
};

const AdminCommonExpenses = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [periods, setPeriods] = useState([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [periodsLoaded, setPeriodsLoaded] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    period: '',
    dueDate: '',
    reserveAmount: '',
    note: '',
  });
  const [charges, setCharges] = useState([{ ...emptyCharge }]);
  const [appendTarget, setAppendTarget] = useState('');
  const [appendCharges, setAppendCharges] = useState([{ ...emptyCharge }]);
  const [appendNote, setAppendNote] = useState('');
  const [receiptChargeId, setReceiptChargeId] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const tabs = [
    {
      id: 'create',
      label: 'Crear período',
      caption: 'Define el mes y prorratea cargos.',
    },
    {
      id: 'append',
      label: 'Agregar cargos',
      caption: 'Añade cobros extraordinarios.',
    },
    {
      id: 'receipt',
      label: 'Subir boleta',
      caption: 'Adjunta respaldo por cargo.',
    },
    {
      id: 'periods',
      label: 'Historial',
      caption: 'Revisa períodos y totales.',
    },
  ];

  const loadPeriods = useCallback(async () => {
    setLoadingPeriods(true);
    setError(null);
    try {
      const periodData = await api.finance.listPeriods();
      setPeriods(Array.isArray(periodData) ? periodData : []);
      setPeriodsLoaded(true);
    } catch (err) {
      setError(err.message || 'No pudimos cargar los períodos de gastos comunes.');
    } finally {
      setLoadingPeriods(false);
    }
  }, []);

  useEffect(() => {
    if ((activeTab === 'append' || activeTab === 'periods') && !periodsLoaded) {
      loadPeriods();
    }
  }, [activeTab, periodsLoaded, loadPeriods]);

  const periodOptions = useMemo(() => {
    return periods.map((p) => ({
      id: p.periodId,
      label: `${String(p.month).padStart(2, '0')}/${p.year}`,
      status: p.status,
      total: p.totalAmount,
      reserve: p.reserveAmount,
      corrections: p.correctionsCount,
    }));
  }, [periods]);

  const formatCurrency = (value) => {
    const safe = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(safe);
  };

  const handleChargeChange = (index, field, value, targetSetter) => {
    targetSetter((prev) => prev.map((item, idx) => (
      idx === index ? { ...item, [field]: value } : item
    )));
  };

  const handleAddChargeRow = (targetSetter) => {
    targetSetter((prev) => [...prev, { ...emptyCharge }]);
  };

  const handleRemoveChargeRow = (index, targetSetter) => {
    targetSetter((prev) => prev.filter((_, idx) => idx !== index));
  };

  const normalizeCharges = (list) => {
    return list
      .filter((item) => item.description && item.amount && item.type)
      .map((item) => ({
        description: item.description.trim(),
        amount: Number(item.amount),
        type: item.type.trim(),
        origin: item.origin?.trim() || null,
        prorateable: true,
        unitId: null,
        receiptText: item.receiptText?.trim() || null,
      }));
  };

  const resetForm = () => {
    setForm({ period: '', dueDate: '', reserveAmount: '', note: '' });
    setCharges([{ ...emptyCharge }]);
  };

  const refreshPeriods = async () => {
    try {
      const data = await api.finance.listPeriods();
      setPeriods(Array.isArray(data) ? data : []);
      setPeriodsLoaded(true);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleCreatePeriod = async (event) => {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    if (!form.period || !form.dueDate) {
      setError('Debes seleccionar un período y fecha de vencimiento.');
      return;
    }

    const [year, month] = form.period.split('-').map((v) => Number(v));
    const payloadCharges = normalizeCharges(charges);
    if (payloadCharges.length === 0) {
      setError('Agrega al menos un cargo válido.');
      return;
    }

    try {
      setActionLoading(true);
      await api.finance.createPeriod({
        year,
        month,
        dueDate: form.dueDate,
        reserveAmount: form.reserveAmount ? Number(form.reserveAmount) : 0,
        note: form.note,
        charges: payloadCharges,
      });
      setFeedback('Período creado correctamente.');
      resetForm();
      await refreshPeriods();
    } catch (err) {
      setError(err.message || 'No pudimos crear el período.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAppendCharges = async (event) => {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    if (!appendTarget) {
      setError('Selecciona el período al que quieres agregar cargos.');
      return;
    }
    const payloadCharges = normalizeCharges(appendCharges);
    if (payloadCharges.length === 0) {
      setError('Agrega al menos un cargo válido para el período.');
      return;
    }

    try {
      setActionLoading(true);
      await api.finance.addCharges(appendTarget, {
        charges: payloadCharges,
        note: appendNote,
      });
      setFeedback('Cargos agregados correctamente.');
      setAppendCharges([{ ...emptyCharge }]);
      setAppendNote('');
      await refreshPeriods();
    } catch (err) {
      setError(err.message || 'No pudimos agregar los cargos.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadReceipt = async (event) => {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    if (!receiptChargeId || !receiptFile) {
      setError('Ingresa el ID del cargo y selecciona la boleta.');
      return;
    }

    try {
      setActionLoading(true);
      await api.finance.uploadChargeReceipt(receiptChargeId, receiptFile);
      setFeedback('Boleta subida correctamente.');
      setReceiptChargeId('');
      setReceiptFile(null);
    } catch (err) {
      setError(err.message || 'No pudimos subir la boleta.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <ProtectedLayout allowedRoles={['admin']}>
      <section className="admin-ggcc page-shell">
        <header className="admin-ggcc__header page-header">
          <div>
            <p className="admin-ggcc__eyebrow page-eyebrow">Centro financiero</p>
            <h1 className="page-title">Gestión de gastos comunes</h1>
            <p className="admin-ggcc__subtitle page-subtitle">
              Registra periodos mensuales, sube cargos detallados y mantén un historial transparente para la comunidad.
            </p>
          </div>
          <div className="admin-ggcc__summary">
            <div>
              <span>Períodos activos</span>
              <strong>{periodsLoaded ? periods.length : '—'}</strong>
            </div>
            <div>
              <span>Última actualización</span>
              <strong>
                {periodsLoaded && periods[0]
                  ? `${String(periods[0].month).padStart(2, '0')}/${periods[0].year}`
                  : '—'}
              </strong>
            </div>
          </div>
        </header>

        {error && <div className="admin-ggcc__alert admin-ggcc__alert--error">{error}</div>}
        {feedback && <div className="admin-ggcc__alert admin-ggcc__alert--success">{feedback}</div>}

        <div className="admin-ggcc__tabs" role="tablist" aria-label="Secciones de gastos comunes">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`ggcc-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`ggcc-panel-${tab.id}`}
              className={`admin-ggcc__tab ${activeTab === tab.id ? 'admin-ggcc__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="admin-ggcc__tab-title">{tab.label}</span>
              <span className="admin-ggcc__tab-caption">{tab.caption}</span>
            </button>
          ))}
        </div>

        {activeTab === 'create' && (
          <div
            className="admin-ggcc__panel"
            role="tabpanel"
            id="ggcc-panel-create"
            aria-labelledby="ggcc-tab-create"
          >
            <article className="admin-ggcc__card page-card">
              <h2>Crear período</h2>
              <form onSubmit={handleCreatePeriod} className="admin-ggcc__form">
                <div className="admin-ggcc__form-row">
                  <label>
                    Período (mes)
                    <input
                      type="month"
                      value={form.period}
                      onChange={(e) => setForm((prev) => ({ ...prev, period: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Vencimiento
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                      required
                    />
                  </label>
                </div>
                <div className="admin-ggcc__form-row">
                  <label>
                    Fondo de reserva (CLP)
                    <input
                      type="number"
                      min="0"
                      value={form.reserveAmount}
                      onChange={(e) => setForm((prev) => ({ ...prev, reserveAmount: e.target.value }))}
                      placeholder="0"
                    />
                  </label>
                  <label>
                    Nota / comentario
                    <input
                      type="text"
                      value={form.note}
                      onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                      placeholder="Ej: Ajuste por mantención preventiva"
                    />
                  </label>
                </div>

                <div className="admin-ggcc__charges">
                  <div className="admin-ggcc__charges-header">
                    <h3>Cargos del período</h3>
                    <button type="button" className="admin-ggcc__ghost" onClick={() => handleAddChargeRow(setCharges)}>
                      + Agregar cargo
                    </button>
                  </div>
                  <p className="admin-ggcc__hint">
                    Todos los cargos se prorratean entre las unidades. Usa la descripción para detallar intereses o cobros adicionales.
                  </p>
                  {charges.map((charge, index) => (
                    <div key={`charge-${index}`} className="admin-ggcc__charge-row">
                      <input
                        type="text"
                        placeholder="Descripción (ej: interés por mora)"
                        value={charge.description}
                        onChange={(e) => handleChargeChange(index, 'description', e.target.value, setCharges)}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Tipo (ej: Interés, Servicio)"
                        value={charge.type}
                        onChange={(e) => handleChargeChange(index, 'type', e.target.value, setCharges)}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Origen (opcional)"
                        value={charge.origin}
                        onChange={(e) => handleChargeChange(index, 'origin', e.target.value, setCharges)}
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Monto"
                        value={charge.amount}
                        onChange={(e) => handleChargeChange(index, 'amount', e.target.value, setCharges)}
                        required
                      />
                      <div className="admin-ggcc__badge">Prorrateo general</div>
                      <input
                        type="text"
                        placeholder="Detalle adicional"
                        value={charge.receiptText}
                        onChange={(e) => handleChargeChange(index, 'receiptText', e.target.value, setCharges)}
                      />
                      {charges.length > 1 && (
                        <button
                          type="button"
                          className="admin-ggcc__remove"
                          onClick={() => handleRemoveChargeRow(index, setCharges)}
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <Button type="submit" variant="primary" loading={actionLoading}>Crear período</Button>
              </form>
            </article>
          </div>
        )}

        {activeTab === 'append' && (
          <div
            className="admin-ggcc__panel"
            role="tabpanel"
            id="ggcc-panel-append"
            aria-labelledby="ggcc-tab-append"
          >
            <article className="admin-ggcc__card page-card">
              <h2>Agregar cargos a un período</h2>
              <form onSubmit={handleAppendCharges} className="admin-ggcc__form">
                <div className="admin-ggcc__form-row">
                  <label>
                    Período
                    <select
                      value={appendTarget}
                      onChange={(e) => setAppendTarget(e.target.value)}
                      required
                      disabled={loadingPeriods && !periodsLoaded}
                    >
                      <option value="">{loadingPeriods ? 'Cargando...' : 'Selecciona'}</option>
                      {periodOptions.map((period) => (
                        <option key={period.id} value={period.id}>{period.label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Nota / corrección
                    <input
                      type="text"
                      value={appendNote}
                      onChange={(e) => setAppendNote(e.target.value)}
                      placeholder="Ej: Ajuste por gasto extraordinario"
                    />
                  </label>
                </div>
                <div className="admin-ggcc__charges">
                  <div className="admin-ggcc__charges-header">
                    <h3>Nuevos cargos</h3>
                    <button type="button" className="admin-ggcc__ghost" onClick={() => handleAddChargeRow(setAppendCharges)}>
                      + Agregar cargo
                    </button>
                  </div>
                  <p className="admin-ggcc__hint">
                    Los cargos se aplican a todas las unidades. Detalla aquí cualquier interés o cobro adicional.
                  </p>
                  {appendCharges.map((charge, index) => (
                    <div key={`append-${index}`} className="admin-ggcc__charge-row">
                      <input
                        type="text"
                        placeholder="Descripción (ej: interés por mora)"
                        value={charge.description}
                        onChange={(e) => handleChargeChange(index, 'description', e.target.value, setAppendCharges)}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Tipo (ej: Interés, Servicio)"
                        value={charge.type}
                        onChange={(e) => handleChargeChange(index, 'type', e.target.value, setAppendCharges)}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Origen (opcional)"
                        value={charge.origin}
                        onChange={(e) => handleChargeChange(index, 'origin', e.target.value, setAppendCharges)}
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Monto"
                        value={charge.amount}
                        onChange={(e) => handleChargeChange(index, 'amount', e.target.value, setAppendCharges)}
                        required
                      />
                      <div className="admin-ggcc__badge">Prorrateo general</div>
                      <input
                        type="text"
                        placeholder="Detalle adicional"
                        value={charge.receiptText}
                        onChange={(e) => handleChargeChange(index, 'receiptText', e.target.value, setAppendCharges)}
                      />
                      {appendCharges.length > 1 && (
                        <button
                          type="button"
                          className="admin-ggcc__remove"
                          onClick={() => handleRemoveChargeRow(index, setAppendCharges)}
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <Button type="submit" variant="primary" loading={actionLoading}>Agregar cargos</Button>
              </form>
            </article>
          </div>
        )}

        {activeTab === 'receipt' && (
          <div
            className="admin-ggcc__panel"
            role="tabpanel"
            id="ggcc-panel-receipt"
            aria-labelledby="ggcc-tab-receipt"
          >
            <article className="admin-ggcc__card admin-ggcc__card--secondary page-card">
              <h2>Subir boleta</h2>
              <p className="admin-ggcc__hint">
                Sube la boleta asociada a un cargo específico (ID del cargo). El archivo se almacenará en Box.
              </p>
              <form onSubmit={handleUploadReceipt} className="admin-ggcc__form admin-ggcc__form--compact">
                <label>
                  ID del cargo
                  <input
                    type="number"
                    value={receiptChargeId}
                    onChange={(e) => setReceiptChargeId(e.target.value)}
                    placeholder="Ej: 1234"
                    required
                  />
                </label>
                <label>
                  Archivo de boleta
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    required
                  />
                </label>
                <Button type="submit" variant="primary" loading={actionLoading}>Subir boleta</Button>
              </form>
            </article>
          </div>
        )}

        {activeTab === 'periods' && (
          <div
            className="admin-ggcc__panel"
            role="tabpanel"
            id="ggcc-panel-periods"
            aria-labelledby="ggcc-tab-periods"
          >
            <article className="admin-ggcc__card admin-ggcc__card--secondary page-card">
              <h2>Períodos registrados</h2>
              {loadingPeriods ? (
                <Skeleton.List rows={3} />
              ) : (
                <div className="admin-ggcc__periods">
                  {periodOptions.length === 0 && <p>No hay períodos registrados aún.</p>}
                  {periodOptions.map((period) => (
                    <div key={period.id} className="admin-ggcc__period">
                      <div>
                        <h4>{period.label}</h4>
                        <span>{period.status}</span>
                      </div>
                      <div>
                        <p>Total: {formatCurrency(period.total)}</p>
                        <p>Reserva: {formatCurrency(period.reserve)}</p>
                      </div>
                      <div>
                        <p>Correcciones: {period.corrections || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </div>
        )}
      </section>
    </ProtectedLayout>
  );
};

export default AdminCommonExpenses;
