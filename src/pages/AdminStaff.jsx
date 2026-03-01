import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProtectedLayout } from '../layout';
import { useAppContext } from '../context';
import { Icon, Skeleton } from '../components';
import { api } from '../services';
import { ROUTES } from '../constants';
import './AdminStaff.scss';

/**
 * Página de administración de personal (Staff)
 */
const AdminStaff = () => {
  const { user, buildingVersion } = useAppContext();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    rut: '',
    email: '',
    phone: '',
    position: '',
    active: true,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const lastFetchKeyRef = useRef(null);

  const POSITIONS = [
    'Conserje',
    'Mantenimiento',
    'Seguridad',
    'Limpieza',
    'Administrador',
    'Otro',
  ];

  const fetchStaff = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      let data;
      if (showActiveOnly) {
        // Intentar primero con listActive, si falla usar list y filtrar
        try {
          data = await api.adminStaff.listActive();
        } catch (err) {
          // Si listActive no existe, usar list y filtrar en el frontend
          console.warn('Endpoint listActive no disponible, usando list y filtrando:', err.message);
          const allStaff = await api.adminStaff.list();
          data = (allStaff || []).filter(s => s.active === true);
        }
      } else {
        data = await api.adminStaff.list();
      }
      setStaff(data || []);
    } catch (err) {
      console.error('Error cargando personal:', err);
      // Solo mostrar error si realmente falló todo
      if (err.message && !err.message.includes('ECONNREFUSED')) {
        setError(err.message || 'Error al cargar el personal');
      } else {
        // Si es error de conexión, solo loguear sin mostrar error al usuario
        setError(null);
        setStaff([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user, showActiveOnly]);

  useEffect(() => {
    if (!user) return;
    const key = `${user.id || user.email || 'anon'}-${buildingVersion ?? '0'}-${showActiveOnly}`;
    if (lastFetchKeyRef.current !== key) {
      lastFetchKeyRef.current = key;
      fetchStaff();
    }
  }, [fetchStaff, buildingVersion, user, showActiveOnly]);

  // Filtrar por búsqueda
  const filteredStaff = useMemo(() => {
    if (!searchTerm.trim()) return staff;
    const term = searchTerm.toLowerCase();
    return staff.filter(
      (s) =>
        s.firstName?.toLowerCase().includes(term) ||
        s.lastName?.toLowerCase().includes(term) ||
        s.rut?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.phone?.includes(term) ||
        s.position?.toLowerCase().includes(term)
    );
  }, [staff, searchTerm]);

  // Estadísticas
  const stats = useMemo(() => {
    return {
      total: staff.length,
      active: staff.filter((s) => s.active).length,
      inactive: staff.filter((s) => !s.active).length,
    };
  }, [staff]);

  const handleOpenModal = (staffMember) => {
    // Solo permitir editar, no crear nuevo
    if (!staffMember) return;
    
    setEditingStaff(staffMember);
    setFormData({
      firstName: staffMember.firstName || '',
      lastName: staffMember.lastName || '',
      rut: staffMember.rut || '',
      email: staffMember.email || '',
      phone: staffMember.phone || '',
      position: staffMember.position || '',
      active: staffMember.active !== undefined ? staffMember.active : true,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStaff(null);
    setFormError('');
    setFormData({
      firstName: '',
      lastName: '',
      rut: '',
      email: '',
      phone: '',
      position: '',
      active: true,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setFormError('');
  };

  const validateForm = () => {
    // Solo validar campos editables (posición y estado)
    if (!formData.position.trim()) {
      return 'El cargo es obligatorio.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Solo permitir editar, no crear
    if (!editingStaff) {
      setFormError('Para crear nuevo personal, usa la opción "Crear Funcionario" en el menú de usuarios.');
      return;
    }
    
    const validation = validateForm();
    if (validation) {
      setFormError(validation);
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.adminStaff.update(editingStaff.id, formData);
      setSuccess('Personal actualizado exitosamente.');
      handleCloseModal();
      fetchStaff();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setFormError(err.message || 'Error al actualizar el personal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este miembro del personal?')) {
      return;
    }

    try {
      await api.adminStaff.delete(id);
      setSuccess('Personal eliminado exitosamente.');
      fetchStaff();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Error al eliminar el personal.');
    }
  };

  const handleToggleActive = async (staffMember) => {
    try {
      await api.adminStaff.update(staffMember.id, {
        ...staffMember,
        active: !staffMember.active,
      });
      setSuccess(
        `Personal ${staffMember.active ? 'desactivado' : 'activado'} exitosamente.`
      );
      fetchStaff();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Error al actualizar el estado.');
    }
  };

  return (
    <ProtectedLayout allowedRoles={['admin']}>
      <article className="admin-staff page-shell">
        <header className="admin-staff__header page-header">
          <div className="admin-staff__title-section">
            <p className="admin-staff__eyebrow page-eyebrow">Administración</p>
            <h1 className="page-title">Gestión de Personal</h1>
            <p className="admin-staff__subtitle page-subtitle">
              Administra el personal del edificio. Para crear nuevo personal, regístralo como Funcionario desde la sección de usuarios.
            </p>
          </div>
          <div className="admin-staff__actions page-actions">
            <button
              type="button"
              className="admin-staff__refresh"
              onClick={fetchStaff}
              disabled={loading}
              title="Actualizar lista"
            >
              {loading ? 'Actualizando…' : 'Actualizar'}
            </button>
            <Link to={ROUTES.ADMIN_CREATE_USER} className="btn btn-primary">
              <Icon name="userPlus" size={18} />
              Crear Funcionario
            </Link>
          </div>
        </header>

        {/* Mensajes de éxito/error */}
        {success && (
          <div className="admin-staff__message admin-staff__message--success">
            <Icon name="check" size={16} />
            {success}
          </div>
        )}
        {error && (
          <div className="admin-staff__message admin-staff__message--error">
            <Icon name="exclamation" size={16} />
            {error}
            <button type="button" onClick={() => setError(null)}>
              <Icon name="close" size={12} />
            </button>
          </div>
        )}

        {/* Información sobre creación de personal */}
        <div className="admin-staff__info-banner">
          <Icon name="info" size={18} />
          <div>
            <strong>¿Necesitas crear nuevo personal?</strong>
            <p>
              Para agregar nuevo personal (conserjes, mantenimiento, etc.), créalo como <strong>Funcionario</strong> desde la sección{' '}
              <Link to={ROUTES.ADMIN_CREATE_USER} className="admin-staff__info-link">
                "Registrar Usuario"
              </Link>
              . El sistema automáticamente creará el registro de personal asociado.
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <section className="admin-staff__stats-grid page-stats" aria-label="Resumen de personal">
          <div className="admin-staff__stat-card page-stat">
            <span>Total personal</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="admin-staff__stat-card admin-staff__stat-card--accent page-stat">
            <span>Activos</span>
            <strong>{stats.active}</strong>
          </div>
          <div className="admin-staff__stat-card page-stat">
            <span>Inactivos</span>
            <strong>{stats.inactive}</strong>
          </div>
        </section>

        {/* Controles */}
        <div className="admin-staff__controls page-controls">
          <div className="admin-staff__search">
            <Icon name="search" size={16} className="admin-staff__search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, RUT, email, teléfono o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-staff__search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="admin-staff__search-clear"
                onClick={() => setSearchTerm('')}
              >
                <Icon name="close" size={12} />
              </button>
            )}
          </div>
          <label className="admin-staff__filter-toggle">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
            />
            <span>Solo activos</span>
          </label>
        </div>

        {/* Tabla de personal */}
        {loading && staff.length === 0 ? (
          <Skeleton.List rows={5} />
        ) : filteredStaff.length === 0 ? (
          <div className="admin-staff__empty">
            <span className="admin-staff__empty-icon">
              <Icon name="userGroup" size={40} />
            </span>
            <p>
              {searchTerm
                ? `No se encontró personal que coincida con "${searchTerm}"`
                : 'No hay personal registrado en este edificio'}
            </p>
          </div>
        ) : (
          <div className="admin-staff__table-container">
            <table className="admin-staff__table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>RUT</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Cargo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member) => (
                  <tr key={member.id} className={!member.active ? 'admin-staff__row--inactive' : ''}>
                    <td>
                      <strong>
                        {member.firstName} {member.lastName}
                      </strong>
                    </td>
                    <td>{member.rut || '-'}</td>
                    <td>
                      {member.email ? (
                        <a href={`mailto:${member.email}`}>{member.email}</a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{member.phone || '-'}</td>
                    <td>{member.position || '-'}</td>
                    <td>
                      <span
                        className={`admin-staff__status-badge admin-staff__status-badge--${
                          member.active ? 'active' : 'inactive'
                        }`}
                      >
                        {member.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-staff__actions-cell">
                        <button
                          type="button"
                          className="admin-staff__action-btn admin-staff__action-btn--edit"
                          onClick={() => handleOpenModal(member)}
                          title="Editar"
                        >
                          <Icon name="edit" size={14} />
                        </button>
                        <button
                          type="button"
                          className={`admin-staff__action-btn admin-staff__action-btn--toggle ${
                            member.active ? 'admin-staff__action-btn--deactivate' : 'admin-staff__action-btn--activate'
                          }`}
                          onClick={() => handleToggleActive(member)}
                          title={member.active ? 'Desactivar' : 'Activar'}
                        >
                          <Icon name="eye" size={14} />
                        </button>
                        <button
                          type="button"
                          className="admin-staff__action-btn admin-staff__action-btn--delete"
                          onClick={() => handleDelete(member.id)}
                          title="Eliminar"
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de crear/editar */}
        {showModal && (
          <div className="admin-staff__modal-overlay" onClick={handleCloseModal}>
            <div className="admin-staff__modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-staff__modal-header">
                <h2>Editar Personal</h2>
                <button
                  type="button"
                  className="admin-staff__modal-close"
                  onClick={handleCloseModal}
                >
                  <Icon name="close" size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="admin-staff__form">
                <div className="admin-staff__form-info">
                  <Icon name="info" size={16} />
                  <p>
                    Solo puedes editar el <strong>cargo</strong> y el <strong>estado activo</strong>. 
                    Los demás datos se gestionan desde el perfil de usuario.
                  </p>
                </div>
                
                {formError && (
                  <div className="admin-staff__form-error">
                    <Icon name="exclamation" size={16} />
                    {formError}
                  </div>
                )}

                <div className="admin-staff__form-grid">
                  <div className="admin-staff__form-group">
                    <label htmlFor="firstName">Nombre</label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={true}
                      placeholder="Ej. Juan"
                    />
                    <p className="admin-staff__form-help">El nombre se actualiza desde el perfil de usuario</p>
                  </div>

                  <div className="admin-staff__form-group">
                    <label htmlFor="lastName">Apellido</label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={true}
                      placeholder="Ej. Pérez"
                    />
                    <p className="admin-staff__form-help">El apellido se actualiza desde el perfil de usuario</p>
                  </div>

                  <div className="admin-staff__form-group">
                    <label htmlFor="rut">RUT</label>
                    <input
                      id="rut"
                      name="rut"
                      type="text"
                      value={formData.rut}
                      onChange={handleChange}
                      disabled={true}
                      placeholder="12.345.678-9"
                    />
                    <p className="admin-staff__form-help">El RUT se actualiza desde el perfil de usuario</p>
                  </div>

                  <div className="admin-staff__form-group">
                    <label htmlFor="position">
                      Cargo <span className="required">*</span>
                    </label>
                    <select
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                    >
                      <option value="">Selecciona un cargo...</option>
                      {POSITIONS.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-staff__form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={true}
                      placeholder="juan.perez@email.com"
                    />
                    <p className="admin-staff__form-help">El email se actualiza desde el perfil de usuario</p>
                  </div>

                  <div className="admin-staff__form-group">
                    <label htmlFor="phone">Teléfono</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={true}
                      placeholder="+56 9 1234 5678"
                    />
                    <p className="admin-staff__form-help">El teléfono se actualiza desde el perfil de usuario</p>
                  </div>

                  <div className="admin-staff__form-group admin-staff__form-group--full">
                    <label className="admin-staff__checkbox-label">
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                      <span>Personal activo</span>
                    </label>
                  </div>
                </div>

                <div className="admin-staff__form-footer">
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={handleCloseModal}
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || !editingStaff}
                  >
                    {submitting ? 'Guardando...' : 'Actualizar'}
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

export default AdminStaff;
