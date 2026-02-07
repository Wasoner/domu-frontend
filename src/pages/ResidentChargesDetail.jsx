import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProtectedLayout } from '../layout';
import { Icon } from '../components';
import { api } from '../services';
import { ROUTES } from '../constants';
import './ResidentChargesDetail.scss';

const ResidentChargesDetail = () => {
  const navigate = useNavigate();
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

  const handleGenerateChargeBoleta = async (chargeId) => {
    try {
      const { blob, fileName } = await api.finance.generateChargeBoleta(chargeId);
      downloadBlob(blob, fileName || 'boleta-cargo.pdf');
    } catch (err) {
      setError(err.message || 'No pudimos generar la boleta.');
    }
  };

  const handleDownloadPaymentReceipt = async (paymentId) => {
    try {
      const { blob, fileName } = await api.finance.downloadPaymentReceipt(paymentId);
      downloadBlob(blob, fileName || 'comprobante-pago.pdf');
    } catch (err) {
      setError(err.message || 'No pudimos generar el comprobante.');
    }
  };

  const handleGoToPayment = () => {
    navigate(ROUTES.RESIDENT_PAYMENT);
  };

  const selectedPeriodLabel = detail ? `${String(detail.month).padStart(2, '0')}/${detail.year}` : '';

  const isLoading = loadingPeriods || loadingDetail;
  const hasPeriods = periods.length > 0;

  const movements = useMemo(() => {
    if (!detail) return [];
    const items = [];

    (detail.charges || []).forEach((c) => {
      items.push({
        id: `charge-${c.id}`,
        rawId: c.id,
        type: 'CHARGE',
        label: c.description,
        amount: -(Math.abs(c.amount || 0)),
        date: new Date(detail.year, detail.month - 1, 1),
        details: {
          type: c.type,
          origin: c.origin,
          receiptAvailable: c.receiptAvailable,
        },
      });
    });

    (detail.payments || []).forEach((p) => {
      items.push({
        id: `payment-${p.id}`,
        rawId: p.id,
        type: 'PAYMENT',
        label: p.chargeDescription || 'Abono',
        amount: Math.abs(p.amount || 0),
        date: p.issuedAt ? new Date(p.issuedAt) : new Date(detail.year, detail.month - 1, 15),
        details: {
          paymentMethod: p.paymentMethod,
          reference: p.reference,
        },
      });
    });

    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    return items;
  }, [detail]);

  const [expandedId, setExpandedId] = useState(null);
  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
      <article className="resident-charges-detail page-shell">
        <header className="resident-charges-detail__header">
          <div>
            <p className="resident-charges-detail__eyebrow">Gastos comunes</p>
            <h1>Detalle mensual</h1>
            <p className="resident-charges-detail__subtitle">
              Consulta cargos, origen y correcciones del período seleccionado.
            </p>
          </div>
          <div className="resident-charges-detail__actions">
            {detail && detail.unitPending > 0 && (
              <button
                type="button"
                className="resident-charges-detail__pay-btn"
                onClick={handleGoToPayment}
              >
                <Icon name="creditCard" size={18} />
                Pagar online
              </button>
            )}
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

            <section className="resident-charges-detail__movements">
              <h2>Movimientos del período</h2>
              {movements.length === 0 ? (
                <div className="resident-charges-detail__movements-empty">
                  No hay movimientos registrados en este período.
                </div>
              ) : (
                <div className="resident-charges-detail__cartola">
                  {movements.map((mov) => {
                    const isExpanded = expandedId === mov.id;
                    return (
                      <div key={mov.id} className={`cartola-row ${isExpanded ? 'cartola-row--expanded' : ''}`}>
                        <button
                          type="button"
                          className="cartola-row__main"
                          onClick={() => toggleExpand(mov.id)}
                        >
                          <span className="cartola-row__date">{formatDate(mov.date)}</span>
                          <span className="cartola-row__label">{mov.label}</span>
                          <span className={`cartola-row__amount ${mov.amount >= 0 ? 'cartola-row__amount--positive' : 'cartola-row__amount--negative'}`}>
                            {mov.amount >= 0 ? '+' : ''}{formatCurrency(mov.amount)}
                          </span>
                          <Icon name="chevronDown" size={16} className={`cartola-row__chevron ${isExpanded ? 'cartola-row__chevron--open' : ''}`} />
                        </button>
                        {isExpanded && (
                          <div className="cartola-row__details">
                            <div className="cartola-row__detail">
                              <span>ID</span>
                              <strong>#{mov.rawId}</strong>
                            </div>
                            {mov.type === 'CHARGE' && (
                              <>
                                {mov.details.type && (
                                  <div className="cartola-row__detail">
                                    <span>Tipo</span>
                                    <strong>{mov.details.type}</strong>
                                  </div>
                                )}
                                {mov.details.origin && (
                                  <div className="cartola-row__detail">
                                    <span>Origen</span>
                                    <strong>{mov.details.origin}</strong>
                                  </div>
                                )}
                                <div className="cartola-row__detail">
                                  <span>Boleta</span>
                                  <button
                                    type="button"
                                    className="cartola-row__receipt-btn"
                                    onClick={(e) => { e.stopPropagation(); handleGenerateChargeBoleta(mov.rawId); }}
                                  >
                                    <Icon name="download" size={14} />
                                    Generar boleta
                                  </button>
                                </div>
                                {mov.details.receiptAvailable && (
                                  <div className="cartola-row__detail">
                                    <span>Adjunto</span>
                                    <button
                                      type="button"
                                      className="cartola-row__receipt-btn cartola-row__receipt-btn--secondary"
                                      onClick={(e) => { e.stopPropagation(); handleDownloadReceipt(mov.rawId); }}
                                    >
                                      <Icon name="document" size={14} />
                                      Ver adjunto
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                            {mov.type === 'PAYMENT' && (
                              <>
                                {mov.details.paymentMethod && (
                                  <div className="cartola-row__detail">
                                    <span>Método</span>
                                    <strong>{mov.details.paymentMethod}</strong>
                                  </div>
                                )}
                                {mov.details.reference && (
                                  <div className="cartola-row__detail">
                                    <span>Referencia</span>
                                    <strong>{mov.details.reference}</strong>
                                  </div>
                                )}
                                <div className="cartola-row__detail">
                                  <span>Comprobante</span>
                                  <button
                                    type="button"
                                    className="cartola-row__receipt-btn"
                                    onClick={(e) => { e.stopPropagation(); handleDownloadPaymentReceipt(mov.rawId); }}
                                  >
                                    <Icon name="download" size={14} />
                                    Generar boleta
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
