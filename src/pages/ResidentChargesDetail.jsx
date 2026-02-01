import { useEffect, useState } from 'react';
import { ProtectedLayout } from '../layout';
import { api } from '../services';
import './ResidentChargesDetail.scss';

const ResidentChargesDetail = () => {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [detail, setDetail] = useState(null);
  const [loadingPeriods, setLoadingPeriods] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPeriods = async () => {
      setLoadingPeriods(true);
      setLoadingDetail(false);
      setError(null);
      try {
        const data = await api.finance.listMyPeriods();
        const list = Array.isArray(data) ? data : [];
        setPeriods(list);
        if (list.length > 0) {
          setLoadingDetail(true);
          setSelectedPeriodId(String(list[0].periodId));
        } else {
          setSelectedPeriodId('');
          setDetail(null);
        }
      } catch (err) {
        setError(err.message || 'No pudimos cargar los periodos.');
      } finally {
        setLoadingPeriods(false);
      }
    };
    fetchPeriods();
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!selectedPeriodId) {
        setLoadingDetail(false);
        return;
      }
      setLoadingDetail(true);
      setError(null);
      try {
        const data = await api.finance.getMyPeriodDetail(selectedPeriodId);
        setDetail(data);
      } catch (err) {
        setError(err.message || 'No pudimos cargar el detalle del período.');
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [selectedPeriodId]);

  const formatCurrency = (value) => {
    const safe = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(safe);
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es-CL');
  };

  const downloadBlob = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName || 'documento.pdf';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    if (!selectedPeriodId) return;
    try {
      const { blob, fileName } = await api.finance.downloadMyPeriodPdf(selectedPeriodId);
      downloadBlob(blob, fileName || 'gasto-comun.pdf');
    } catch (err) {
      setError(err.message || 'No pudimos descargar el PDF.');
    }
  };

  const handleDownloadReceipt = async (chargeId) => {
    try {
      const { blob, fileName } = await api.finance.downloadChargeReceipt(chargeId);
      downloadBlob(blob, fileName || 'boleta.pdf');
    } catch (err) {
      setError(err.message || 'No pudimos descargar la boleta.');
    }
  };

  const selectedPeriodLabel = detail ? `${String(detail.month).padStart(2, '0')}/${detail.year}` : '';

  const isLoading = loadingPeriods || loadingDetail;
  const hasPeriods = periods.length > 0;

  return (
    <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
      <article className="resident-charges-detail">
        <header className="resident-charges-detail__header">
          <div>
            <p className="resident-charges-detail__eyebrow">Gastos comunes</p>
            <h1>Detalle mensual</h1>
            <p className="resident-charges-detail__subtitle">
              Consulta cargos, origen y correcciones del período seleccionado.
            </p>
          </div>
          <div className="resident-charges-detail__actions">
            <button
              type="button"
              className="resident-charges-detail__primary"
              onClick={handleDownloadPdf}
              disabled={!detail}
            >
              Descargar PDF
            </button>
          </div>
        </header>

        {error && <p className="resident-charges-detail__error">{error}</p>}

        <div className="resident-charges-detail__controls">
          <label className="resident-charges-detail__select-label">
            <span>Período</span>
            <select
              value={selectedPeriodId || ''}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="resident-charges-detail__select"
            >
              <option value="">Selecciona un período</option>
              {periods.map((period) => (
                <option key={period.periodId} value={String(period.periodId)}>
                  {String(period.month).padStart(2, '0')}/{period.year}
                </option>
              ))}
            </select>
          </label>
          {detail && (
            <div className="resident-charges-detail__building">
              <span>{detail.buildingName}</span>
              <strong>{detail.unitLabel}</strong>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="resident-charges-detail__skeleton" aria-hidden="true">
            <div className="resident-charges-detail__summary resident-charges-detail__summary--skeleton">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={`summary-skeleton-${index}`} className="resident-charges-detail__summary-card resident-charges-detail__summary-card--skeleton">
                  <span className="resident-charges-detail__skeleton-block resident-charges-detail__skeleton-block--sm" />
                  <span className="resident-charges-detail__skeleton-block resident-charges-detail__skeleton-block--lg" />
                </div>
              ))}
            </div>

            <section className="resident-charges-detail__table">
              <div className="resident-charges-detail__skeleton-title">
                <span className="resident-charges-detail__skeleton-block resident-charges-detail__skeleton-block--md" />
              </div>
              <div className="resident-charges-detail__table-grid resident-charges-detail__table-grid--skeleton">
                <div className="resident-charges-detail__table-row resident-charges-detail__table-row--skeleton">
                  {Array.from({ length: 5 }, (_, index) => (
                    <span key={`head-skeleton-${index}`} className="resident-charges-detail__skeleton-block resident-charges-detail__skeleton-block--xs" />
                  ))}
                </div>
                {Array.from({ length: 4 }, (_, rowIndex) => (
                  <div key={`row-skeleton-${rowIndex}`} className="resident-charges-detail__table-row resident-charges-detail__table-row--skeleton">
                    <span className="resident-charges-detail__skeleton-block resident-charges-detail__skeleton-block--sm" />
                    <span className="resident-charges-detail__skeleton-block resident-charges-detail__skeleton-block--sm" />
                    <span className="resident-charges-detail__skeleton-block resident-charges-detail__skeleton-block--lg" />
                    <span className="resident-charges-detail__skeleton-block resident-charges-detail__skeleton-block--sm" />
                    <span className="resident-charges-detail__skeleton-block resident-charges-detail__skeleton-block--xs" />
                  </div>
                ))}
              </div>
            </section>

            <section className="resident-charges-detail__history resident-charges-detail__history--skeleton">
              <span className="resident-charges-detail__skeleton-block resident-charges-detail__skeleton-block--md" />
              <div className="resident-charges-detail__skeleton-lines">
                <span className="resident-charges-detail__skeleton-block resident-charges-detail__skeleton-block--lg" />
                <span className="resident-charges-detail__skeleton-block resident-charges-detail__skeleton-block--md" />
                <span className="resident-charges-detail__skeleton-block resident-charges-detail__skeleton-block--lg" />
              </div>
            </section>
          </div>
        ) : detail ? (
          <div className="resident-charges-detail__content">
            <div className="resident-charges-detail__summary">
              <div className="resident-charges-detail__summary-card">
                <span>Total {selectedPeriodLabel}</span>
                <strong>{formatCurrency(detail.unitTotal)}</strong>
              </div>
              <div className="resident-charges-detail__summary-card">
                <span>Pagado</span>
                <strong>{formatCurrency(detail.unitPaid)}</strong>
              </div>
              <div className="resident-charges-detail__summary-card">
                <span>Pendiente</span>
                <strong>{formatCurrency(detail.unitPending)}</strong>
              </div>
              <div className="resident-charges-detail__summary-card">
                <span>Vence</span>
                <strong>{formatDate(detail.dueDate)}</strong>
              </div>
            </div>

            <section className="resident-charges-detail__table">
              <h2>Desglose de cargos</h2>
              <div className="resident-charges-detail__table-grid">
                <div className="resident-charges-detail__table-row resident-charges-detail__table-row--head">
                  <span>Tipo</span>
                  <span>Origen</span>
                  <span>Descripción</span>
                  <span>Monto</span>
                  <span>Boleta</span>
                </div>
                {(detail.charges || []).map((charge) => (
                  <div key={charge.id} className="resident-charges-detail__table-row">
                    <span>{charge.type}</span>
                    <span>{charge.origin || '—'}</span>
                    <span>{charge.description}</span>
                    <span className="resident-charges-detail__amount">{formatCurrency(charge.amount)}</span>
                    <span>
                      {charge.receiptAvailable ? (
                        <button
                          type="button"
                          className="resident-charges-detail__link"
                          onClick={() => handleDownloadReceipt(charge.id)}
                        >
                          Ver boleta
                        </button>
                      ) : (
                        'No disponible'
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="resident-charges-detail__history">
              <h2>Historial de correcciones</h2>
              {(detail.revisions || []).length === 0 ? (
                <p>No hay ajustes registrados en este período.</p>
              ) : (
                <ul>
                  {(detail.revisions || []).map((revision) => (
                    <li key={revision.id}>
                      <strong>{revision.action}</strong>
                      <span>{revision.note || 'Sin observaciones'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : hasPeriods ? (
          <div className="resident-charges-detail__empty">
            <span className="resident-charges-detail__empty-icon">📊</span>
            <p>Selecciona un período para ver el detalle</p>
          </div>
        ) : (
          <div className="resident-charges-detail__empty">
            <span className="resident-charges-detail__empty-icon">📊</span>
            <p>Aún no hay gastos comunes publicados</p>
          </div>
        )}
      </article>
    </ProtectedLayout>
  );
};

export default ResidentChargesDetail;
