import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ProtectedLayout } from '../layout';
import { useAppContext } from '../context';
import { Icon } from '../components';
import { api } from '../services';
import './AdminHousingUnits.scss';

/**
 * Página de administración de unidades habitacionales
 */
const AdminHousingUnits = () => {
  const { user, buildingVersion } = useAppContext();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResidentsModal, setShowResidentsModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [availableResidents, setAvailableResidents] = useState([]);
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [residentDirectory, setResidentDirectory] = useState([]);
  const [residentDirectoryLoaded, setResidentDirectoryLoaded] = useState(false);
  const lastFetchKeyRef = useRef(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [formData, setFormData] = useState({
    number: '',
    tower: '',
    floor: '',
    aliquotPercentage: '',
    squareMeters: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const ModalPortal = ({ children }) => {
    if (typeof document === 'undefined') return null;
    return createPortal(children, document.body);
  };

  // Fetch units
  const fetchUnits = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.housingUnits.list();
      const nextUnits = data || [];
      setUnits(nextUnits);
      return nextUnits;
    } catch (err) {
      console.error('Error cargando unidades:', err);
      setError(err.message || 'Error al cargar las unidades');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const key = `${user.id || user.email || 'anon'}-${buildingVersion ?? '0'}`;
    if (lastFetchKeyRef.current !== key) {
      lastFetchKeyRef.current = key;
      fetchUnits();
    }
  }, [fetchUnits, buildingVersion, user]);

  useEffect(() => {
    setResidentDirectory([]);
    setResidentDirectoryLoaded(false);
    setAvailableResidents([]);
  }, [buildingVersion]);

  // Abrir modal de crear
  const handleOpenCreate = () => {
    setSelectedUnit(null);
    setFormData({
      number: '',
      tower: '',
      floor: '',
      aliquotPercentage: '',
      squareMeters: '',
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  // Abrir modal de editar
  const handleOpenEdit = (unit) => {
    setSelectedUnit(unit);
    setFormData({
      number: unit.unit.number || '',
      tower: unit.unit.tower || '',
      floor: unit.unit.floor || '',
      aliquotPercentage: unit.unit.aliquotPercentage || '',
      squareMeters: unit.unit.squareMeters || '',
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    if (!formData.number.trim()) errors.number = 'El número es requerido';
    if (!formData.tower.trim()) errors.tower = 'La torre es requerida';
    if (!formData.floor.trim()) errors.floor = 'El piso es requerido';

    if (formData.aliquotPercentage && Number(formData.aliquotPercentage) < 0) {
      errors.aliquotPercentage = 'La alícuota no puede ser negativa';
    }
    if (formData.squareMeters && Number(formData.squareMeters) <= 0) {
      errors.squareMeters = 'Los metros cuadrados deben ser mayores a cero';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar unidad (crear o editar)
  const handleSaveUnit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (selectedUnit) {
        await api.housingUnits.update(selectedUnit.unit.id, formData);
      } else {
        await api.housingUnits.create(formData);
      }
      await fetchUnits();
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error guardando unidad:', err);
      setFormErrors({ submit: err.message || 'Error al guardar la unidad' });
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar unidad
  const handleDeleteUnit = async (unit) => {
    if (unit.unit.residentCount > 0) {
      if (!window.confirm(
        `Esta unidad tiene ${unit.unit.residentCount} residente(s). ` +
        'Primero debes desvincular a todos los residentes antes de eliminarla. ¿Deseas ver los residentes?'
      )) return;
      handleOpenResidents(unit);
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar la unidad ${unit.unit.number}?`)) {
      return;
    }

    try {
      await api.housingUnits.delete(unit.unit.id);
      await fetchUnits();
    } catch (err) {
      console.error('Error eliminando unidad:', err);
      alert(err.message || 'Error al eliminar la unidad');
    }
  };

  // Abrir modal de residentes
  const handleOpenResidents = async (unit) => {
    setSelectedUnit(unit);
    setShowResidentsModal(true);
    await loadAvailableResidents(unit);
  };

  // Cargar residentes disponibles (sin unidad o del mismo edificio)
  const loadResidentDirectory = useCallback(async (force = false) => {
    if (residentDirectoryLoaded && !force) {
      return residentDirectory;
    }
    const residents = await api.adminUsers.getResidents();
    const safeResidents = residents || [];
    setResidentDirectory(safeResidents);
    setResidentDirectoryLoaded(true);
    return safeResidents;
  }, [residentDirectoryLoaded, residentDirectory]);

  const loadAvailableResidents = async (unit, forceDirectoryReload = false) => {
    setLoadingResidents(true);
    try {
      const residents = await loadResidentDirectory(forceDirectoryReload);
      // Filtrar residentes que no están asignados a esta unidad específica
      // Incluye: residentes sin unidad o residentes asignados a otras unidades
      const currentResidentIds = (unit.residents || []).map(r => r.id);
      const available = residents.filter(resident =>
        !currentResidentIds.includes(resident.id)
      );
      setAvailableResidents(available);
    } catch (err) {
      console.error('Error cargando residentes disponibles:', err);
      setAvailableResidents([]);
    } finally {
      setLoadingResidents(false);
    }
  };

  // Desvincular residente
  const handleUnlinkResident = async (residentId) => {
    if (!window.confirm('¿Estás seguro de desvincular este residente de la unidad?')) {
      return;
    }

    try {
      await api.housingUnits.unlinkResident(selectedUnit.unit.id, residentId);
      const updatedUnits = await fetchUnits();
      const updatedUnit = updatedUnits.find(u => u.unit.id === selectedUnit.unit.id);
      if (updatedUnit) {
        setSelectedUnit(updatedUnit);
      }
      // Recargar residentes disponibles
      await loadAvailableResidents(updatedUnit || selectedUnit);
    } catch (err) {
      console.error('Error desvinculando residente:', err);
      alert(err.message || 'Error al desvincular residente');
    }
  };

  // Vincular residente a unidad
  const handleLinkResident = async () => {
    if (!selectedResidentId) {
      alert('Por favor selecciona un residente');
      return;
    }

    if (!selectedUnit || !selectedUnit.unit) {
      alert('Error: No hay unidad seleccionada');
      return;
    }

    // Validar que tenemos el ID correcto de la unidad
    const unitId = selectedUnit.unit.id;
    if (!unitId || unitId === null || unitId === undefined) {
      console.error('Error: unit.id no está definido', selectedUnit);
      alert('Error: No se pudo obtener el ID de la unidad. Por favor, cierra y vuelve a abrir el modal.');
      return;
    }

    // Validar que no estamos usando el número en lugar del ID
    if (typeof unitId === 'string' && !isNaN(unitId)) {
      console.warn('Advertencia: unitId es string, convirtiendo a número:', unitId);
    }

    try {
      console.log('=== INFORMACIÓN DE ASIGNACIÓN ===');
      console.log('Residente ID:', selectedResidentId);
      console.log('Unidad ID:', unitId);
      console.log('Unidad Number:', selectedUnit.unit.number);
      console.log('Unidad completa:', selectedUnit.unit);
      console.log('===============================');

      // Llamar al API con el ID numérico
      await api.housingUnits.linkResident(Number(unitId), Number(selectedResidentId));

      console.log('Residente vinculado exitosamente');

      // Esperar un momento para asegurar que la base de datos se actualizó
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedUnits = await fetchUnits();
      const updatedUnit = updatedUnits.find(u => u.unit.id === selectedUnit.unit.id);

      if (updatedUnit) {
        console.log('Unidad actualizada:', updatedUnit);
        setSelectedUnit(updatedUnit);
      } else {
        console.warn('No se encontró la unidad actualizada');
      }

      await loadAvailableResidents(updatedUnit || selectedUnit);

      // Cerrar modal de asignación y limpiar selección
      setShowAssignModal(false);
      setSelectedResidentId('');
    } catch (err) {
      console.error('Error vinculando residente:', err);
      const errorMessage = err.message || err.response?.data?.message || 'Error al vincular residente a la unidad';
      alert(`Error: ${errorMessage}`);
    }
  };

  const filteredUnits = useMemo(() => {
    if (!searchTerm.trim()) return units;
    const term = searchTerm.toLowerCase();
    return units.filter((item) => (
      item.unit.number?.toLowerCase().includes(term)
      || item.unit.tower?.toLowerCase().includes(term)
      || item.unit.floor?.toLowerCase().includes(term)
      || item.unit.createdByUserName?.toLowerCase().includes(term)
    ));
  }, [units, searchTerm]);

  const stats = useMemo(() => {
    const totalUnits = units.length;
    const occupiedUnits = units.filter((item) => (item.unit.residentCount || 0) > 0).length;
    const vacantUnits = totalUnits - occupiedUnits;
    return { totalUnits, occupiedUnits, vacantUnits };
  }, [units]);
  const isInitialLoading = loading && units.length === 0;

  if (error && units.length === 0 && !loading) {
    return (
      <ProtectedLayout allowedRoles={['admin']}>
        <div className="admin-housing-units__error">
          <h2>Error al cargar unidades</h2>
          <p>{error}</p>
          <button onClick={fetchUnits} className="button button--primary">
            Reintentar
          </button>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout allowedRoles={['admin']}>
      <div className="admin-housing-units page-shell page-shell--wide">
        <header className="admin-housing-units__header page-header">
          <div>
            <p className="admin-housing-units__eyebrow page-eyebrow">Edificio</p>
            <h1 className="page-title">Unidades habitacionales</h1>
            <p className="page-subtitle">Administra unidades, residentes asociados y métricas de ocupación.</p>
          </div>
          <div className="admin-housing-units__header-actions page-actions">
            <button onClick={fetchUnits} className="button button--secondary" disabled={loading}>
              {loading ? 'Actualizando…' : 'Actualizar'}
            </button>
            <button onClick={handleOpenCreate} className="button button--primary">
              + Crear Unidad
            </button>
          </div>
        </header>

        {error && (
          <div className="admin-housing-units__error-banner">
            <p>{error}</p>
          </div>
        )}

        <section className="admin-housing-units__stats page-stats" aria-label="Resumen de unidades">
          <div className="admin-housing-units__stat page-stat">
            <span>Total unidades</span>
            <strong className={isInitialLoading ? 'skeleton-block skeleton-block--lg' : ''}>
              {isInitialLoading ? '' : stats.totalUnits}
            </strong>
          </div>
          <div className="admin-housing-units__stat page-stat">
            <span>Con residentes</span>
            <strong className={isInitialLoading ? 'skeleton-block skeleton-block--lg' : ''}>
              {isInitialLoading ? '' : stats.occupiedUnits}
            </strong>
          </div>
          <div className="admin-housing-units__stat admin-housing-units__stat--accent page-stat">
            <span>Disponibles</span>
            <strong className={isInitialLoading ? 'skeleton-block skeleton-block--lg' : ''}>
              {isInitialLoading ? '' : stats.vacantUnits}
            </strong>
          </div>
        </section>

        <div className="admin-housing-units__controls page-controls">
          <div className="admin-housing-units__search">
            <input
              type="text"
              placeholder="Buscar por número, torre, piso o creador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-housing-units__search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="admin-housing-units__search-clear"
                onClick={() => setSearchTerm('')}
              >
                <Icon name="close" size={12} />
              </button>
            )}
          </div>
        </div>

        {filteredUnits.length === 0 && !isInitialLoading ? (
          <div className="admin-housing-units__empty">
            <div className="admin-housing-units__empty-icon">
              <Icon name={searchTerm ? 'search' : 'home'} size={48} />
            </div>
            <div>
              <h3>{searchTerm ? 'No encontramos unidades' : 'No hay unidades registradas'}</h3>
              <p>
                {searchTerm
                  ? `No hay resultados para "${searchTerm}".`
                  : 'Comienza gestionando las unidades habitacionales de tu edificio. Crea tu primera unidad para empezar.'}
              </p>
            </div>
            {!searchTerm && (
              <button onClick={handleOpenCreate} className="button button--primary">
                + Crear primera unidad
              </button>
            )}
          </div>
        ) : (
          <div className="admin-housing-units__table-container">
            <table className="admin-housing-units__table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Torre</th>
                  <th>Piso</th>
                  <th>Alícuota %</th>
                  <th>Metros²</th>
                  <th>Residentes</th>
                  <th>Creado por</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isInitialLoading
                  ? Array.from({ length: 4 }, (_, index) => (
                    <tr key={`skeleton-${index}`} className="admin-housing-units__row-skeleton" aria-hidden="true">
                      <td><span className="skeleton-block skeleton-block--sm" /></td>
                      <td><span className="skeleton-block skeleton-block--xs" /></td>
                      <td><span className="skeleton-block skeleton-block--xs" /></td>
                      <td><span className="skeleton-block skeleton-block--xs" /></td>
                      <td><span className="skeleton-block skeleton-block--xs" /></td>
                      <td><span className="skeleton-block skeleton-block--sm" /></td>
                      <td><span className="skeleton-block skeleton-block--md" /></td>
                      <td>
                        <div className="admin-housing-units__skeleton-actions">
                          <span className="skeleton-block skeleton-block--xs" />
                          <span className="skeleton-block skeleton-block--xs" />
                        </div>
                      </td>
                    </tr>
                  ))
                  : filteredUnits.map((item) => (
                    <tr key={item.unit.id}>
                      <td><strong>{item.unit.number}</strong></td>
                      <td>{item.unit.tower}</td>
                      <td>{item.unit.floor}</td>
                      <td>{item.unit.aliquotPercentage ? `${item.unit.aliquotPercentage}%` : '-'}</td>
                      <td>{item.unit.squareMeters ? `${item.unit.squareMeters} m²` : '-'}</td>
                      <td>
                        <button
                          className="button button--link"
                          onClick={() => handleOpenResidents(item)}
                        >
                          {item.unit.residentCount || 0} residente(s)
                        </button>
                      </td>
                      <td className="admin-housing-units__creator">
                        {item.unit.createdByUserName || '-'}
                      </td>
                      <td className="admin-housing-units__actions">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="button button--small button--secondary"
                          title="Editar"
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(item)}
                          className="button button--small button--danger"
                          title="Eliminar"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de crear/editar */}
        {showCreateModal && (
          <ModalPortal>
            <div className="admin-housing-units__modal-overlay" onClick={() => setShowCreateModal(false)}>
              <div className="admin-housing-units__modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-housing-units__modal-header">
                  <h2>{selectedUnit ? 'Editar Unidad' : 'Crear Nueva Unidad'}</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="admin-housing-units__modal-close"
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              <form onSubmit={handleSaveUnit}>
                <div className="admin-housing-units__modal-body">
                  <div className="form-group">
                    <label htmlFor="number">Número de Unidad *</label>
                    <input
                      type="text"
                      id="number"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      className={formErrors.number ? 'input-error' : ''}
                      required
                    />
                    {formErrors.number && <span className="error-text">{formErrors.number}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="tower">Torre *</label>
                    <input
                      type="text"
                      id="tower"
                      value={formData.tower}
                      onChange={(e) => setFormData({ ...formData, tower: e.target.value })}
                      className={formErrors.tower ? 'input-error' : ''}
                      required
                    />
                    {formErrors.tower && <span className="error-text">{formErrors.tower}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="floor">Piso *</label>
                    <input
                      type="text"
                      id="floor"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      className={formErrors.floor ? 'input-error' : ''}
                      required
                    />
                    {formErrors.floor && <span className="error-text">{formErrors.floor}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="aliquotPercentage">Alícuota % (opcional)</label>
                    <input
                      type="number"
                      id="aliquotPercentage"
                      step="0.01"
                      min="0"
                      value={formData.aliquotPercentage}
                      onChange={(e) => setFormData({ ...formData, aliquotPercentage: e.target.value })}
                      className={formErrors.aliquotPercentage ? 'input-error' : ''}
                    />
                    {formErrors.aliquotPercentage && (
                      <span className="error-text">{formErrors.aliquotPercentage}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="squareMeters">Metros Cuadrados (opcional)</label>
                    <input
                      type="number"
                      id="squareMeters"
                      step="0.01"
                      min="0.01"
                      value={formData.squareMeters}
                      onChange={(e) => setFormData({ ...formData, squareMeters: e.target.value })}
                      className={formErrors.squareMeters ? 'input-error' : ''}
                    />
                    {formErrors.squareMeters && (
                      <span className="error-text">{formErrors.squareMeters}</span>
                    )}
                  </div>

                  {formErrors.submit && (
                    <div className="alert alert--error">{formErrors.submit}</div>
                  )}
                </div>

                <div className="admin-housing-units__modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="button button--secondary"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="button button--primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Guardando...' : (selectedUnit ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
          </ModalPortal>
        )}

        {/* Modal de residentes */}
        {showResidentsModal && selectedUnit && (
          <ModalPortal>
            <div className="admin-housing-units__modal-overlay" onClick={() => setShowResidentsModal(false)}>
              <div className="admin-housing-units__modal admin-housing-units__modal--large" onClick={(e) => e.stopPropagation()}>
                <div className="admin-housing-units__modal-header">
                  <h2>Residentes de Unidad {selectedUnit.unit.number}</h2>
                  <button
                    onClick={() => setShowResidentsModal(false)}
                    className="admin-housing-units__modal-close"
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              <div className="admin-housing-units__modal-body">
                {/* Sección de residentes asignados */}
                <div className="residents-section">
                  <div className="residents-section__header">
                    <h3>Residentes Asignados</h3>
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="button button--small button--primary"
                    >
                      + Asignar Residente
                    </button>
                  </div>
                  {selectedUnit.residents && selectedUnit.residents.length > 0 ? (
                    <div className="residents-list">
                      {selectedUnit.residents.map((resident) => (
                        <div key={resident.id} className="resident-item">
                          <div className="resident-item__info">
                            <div className="resident-item__name">
                              {resident.firstName} {resident.lastName}
                            </div>
                            <div className="resident-item__details">
                              <span>{resident.email}</span>
                              {resident.phone && <span> • {resident.phone}</span>}
                            </div>
                            <div className="resident-item__doc">
                              RUT/DNI: {resident.documentNumber}
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnlinkResident(resident.id)}
                            className="button button--small button--danger"
                            title="Desvincular"
                          >
                            Desvincular
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="residents-list__empty">
                      <p>No hay residentes vinculados a esta unidad</p>
                      <button
                        onClick={() => setShowAssignModal(true)}
                        className="button button--primary"
                      >
                        Asignar Primer Residente
                      </button>
                    </div>
                  )}
                </div>
              </div>
                <div className="admin-housing-units__modal-footer">
                  <button
                    onClick={() => {
                      setShowResidentsModal(false);
                      setShowAssignModal(false);
                      setSelectedResidentId('');
                    }}
                    className="button button--secondary"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </ModalPortal>
        )}

        {/* Modal de asignar residente */}
        {showAssignModal && selectedUnit && (
          <ModalPortal>
            <div className="admin-housing-units__modal-overlay" onClick={() => setShowAssignModal(false)}>
              <div className="admin-housing-units__modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-housing-units__modal-header">
                  <h2>Asignar Residente a Unidad {selectedUnit.unit.number}</h2>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedResidentId('');
                    }}
                    className="admin-housing-units__modal-close"
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              <div className="admin-housing-units__modal-body">
                {loadingResidents ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Cargando residentes disponibles...</p>
                  </div>
                ) : availableResidents.length > 0 ? (
                  <div className="form-group">
                    <label htmlFor="resident-select">Seleccionar Residente *</label>
                    <select
                      id="resident-select"
                      value={selectedResidentId}
                      onChange={(e) => setSelectedResidentId(e.target.value)}
                      className="form-select"
                      required
                    >
                      <option value="">-- Selecciona un residente --</option>
                      {availableResidents.map((resident) => (
                        <option key={resident.id} value={resident.id}>
                          {resident.firstName} {resident.lastName} - {resident.email}
                          {resident.unitNumber && ` (Actual: ${resident.unitNumber})`}
                        </option>
                      ))}
                    </select>
                    <p className="form-help-text">
                      Se mostrarán residentes del edificio que no tienen unidad asignada.
                    </p>
                  </div>
                ) : (
                  <div className="alert alert--info">
                    <p>No hay residentes disponibles para asignar.</p>
                    <p>Todos los residentes del edificio ya tienen una unidad asignada.</p>
                  </div>
                )}
              </div>
                <div className="admin-housing-units__modal-footer">
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedResidentId('');
                    }}
                    className="button button--secondary"
                  >
                    Cancelar
                  </button>
                  {availableResidents.length > 0 && (
                    <button
                      onClick={handleLinkResident}
                      className="button button--primary"
                      disabled={!selectedResidentId}
                    >
                      Asignar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </ModalPortal>
        )}
      </div>
    </ProtectedLayout>
  );
};

export default AdminHousingUnits;
