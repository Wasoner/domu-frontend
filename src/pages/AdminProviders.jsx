import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProtectedLayout } from '../layout';
import { useAppContext } from '../context';
import { Icon, Skeleton } from '../components';
import { api } from '../services';

const SERVICE_CATEGORIES = [
  'Electricidad',
  'Gasfitería',
  'Limpieza',
  'Jardinería',
  'Seguridad',
  'Ascensores',
  'Pintura',
  'Construcción',
  'Otro',
];

const AdminProviders = () => {
  const { user, buildingVersion } = useAppContext();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    businessName: '',
    rut: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    serviceCategory: '',
    active: true,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const lastFetchKeyRef = useRef(null);

  const fetchProviders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.adminProviders.list();
      setProviders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const fetchKey = `${user?.id}-${buildingVersion}`;
    if (fetchKey !== lastFetchKeyRef.current) {
      lastFetchKeyRef.current = fetchKey;
      fetchProviders();
    }
  }, [fetchProviders, user, buildingVersion]);

  const filteredProviders = useMemo(() => {
    let list = providers;
    if (showActiveOnly) {
      list = list.filter((p) => p.active);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          (p.businessName || '').toLowerCase().includes(term) ||
          (p.rut || '').toLowerCase().includes(term) ||
          (p.contactName || '').toLowerCase().includes(term) ||
          (p.email || '').toLowerCase().includes(term) ||
          (p.serviceCategory || '').toLowerCase().includes(term)
      );
    }
    return list;
  }, [providers, searchTerm, showActiveOnly]);

  const stats = useMemo(() => ({
    total: providers.length,
    active: providers.filter((p) => p.active).length,
    inactive: providers.filter((p) => !p.active).length,
  }), [providers]);

  const openCreateModal = () => {
    setEditing(null);
    setFormData({ businessName: '', rut: '', contactName: '', email: '', phone: '', address: '', serviceCategory: '', active: true });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (provider) => {
    setEditing(provider);
    setFormData({
      businessName: provider.businessName || '',
      rut: provider.rut || '',
      contactName: provider.contactName || '',
      email: provider.email || '',
      phone: provider.phone || '',
      address: provider.address || '',
      serviceCategory: provider.serviceCategory || '',
      active: provider.active,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.businessName.trim() || !formData.rut.trim() || !formData.serviceCategory.trim()) {
      setFormError('Razón social, RUT y categoría son obligatorios');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      if (editing) {
        await api.adminProviders.update(editing.id, formData);
        setSuccess('Proveedor actualizado correctamente');
      } else {
        await api.adminProviders.create(formData);
        setSuccess('Proveedor creado correctamente');
      }
      setShowModal(false);
      fetchProviders();
    } catch (err) {
      setFormError(err.message || 'Error al guardar proveedor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este proveedor?')) return;
    try {
      await api.adminProviders.delete(id);
      setSuccess('Proveedor eliminado');
      fetchProviders();
    } catch (err) {
      setError(err.message || 'Error al eliminar proveedor');
    }
  };

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  return (
    <ProtectedLayout allowedRoles={['admin']}>
      <div className="admin-staff-page">
        <div className="page-header">
          <h1><Icon name="briefcase" size={24} /> Proveedores</h1>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Icon name="plus" size={16} /> Nuevo proveedor
          </button>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card"><span className="stat-value">{stats.total}</span><span className="stat-label">Total</span></div>
          <div className="stat-card"><span className="stat-value">{stats.active}</span><span className="stat-label">Activos</span></div>
          <div className="stat-card"><span className="stat-value">{stats.inactive}</span><span className="stat-label">Inactivos</span></div>
        </div>

        <div className="filters-row">
          <input type="text" placeholder="Buscar proveedor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
          <label className="checkbox-label">
            <input type="checkbox" checked={showActiveOnly} onChange={(e) => setShowActiveOnly(e.target.checked)} />
            Solo activos
          </label>
        </div>

        {loading ? (
          <Skeleton.List count={5} />
        ) : filteredProviders.length === 0 ? (
          <div className="empty-state">No se encontraron proveedores</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Razón social</th>
                  <th>RUT</th>
                  <th>Contacto</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProviders.map((p) => (
                  <tr key={p.id}>
                    <td>{p.businessName}</td>
                    <td>{p.rut}</td>
                    <td>{p.contactName || '-'}<br /><small>{p.email || ''}</small></td>
                    <td>{p.serviceCategory}</td>
                    <td><span className={`badge ${p.active ? 'badge-success' : 'badge-secondary'}`}>{p.active ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={() => openEditModal(p)}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editing ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
              {formError && <div className="alert alert-error">{formError}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Razón social *</label>
                  <input type="text" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>RUT *</label>
                  <input type="text" value={formData.rut} onChange={(e) => setFormData({ ...formData, rut: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Nombre contacto</label>
                  <input type="text" value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Dirección</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Categoría de servicio *</label>
                  <select value={formData.serviceCategory} onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })} required>
                    <option value="">Seleccionar...</option>
                    {SERVICE_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />
                    Activo
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
};

export default AdminProviders;
