import { useState } from 'react';
import { ProtectedLayout } from '../layout';
import { Seo, Skeleton, Icon } from '../components';
import { api } from '../services';
import './AdminCreateUser.scss';

const ROLE_TYPES = [
  { 
    id: 'resident', 
    roleId: 2, 
    label: 'Residente', 
    icon: 'home', 
    description: 'Propietarios o arrendatarios que viven en el edificio.',
    resident: true
  },
  { 
    id: 'concierge', 
    roleId: 3, 
    label: 'Conserje', 
    icon: 'shieldCheck', 
    description: 'Personal de seguridad y recepción.',
    resident: false
  },
  { 
    id: 'staff', 
    roleId: 4, 
    label: 'Funcionario', 
    icon: 'clipboardCheck', 
    description: 'Personal de mantenimiento, aseo o administración interna.',
    resident: false
  },
  { 
    id: 'admin', 
    roleId: 1, 
    label: 'Administrador', 
    icon: 'userGroup', 
    description: 'Personal con permisos totales de gestión.',
    resident: false
  },
];

const AdminCreateUser = () => {
  const [selectedType, setSelectedType] = useState(ROLE_TYPES[0]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentNumber: '',
    unitNumber: '',
    birthDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setError('');
    setSuccess('');
  };

  const validate = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      return 'Nombre y apellido son obligatorios.';
    }
    if (!formData.email.trim()) {
      return 'El correo es obligatorio.';
    }
    if (selectedType.id === 'resident' && !formData.unitNumber.trim()) {
      return 'Para un residente es obligatorio indicar la unidad.';
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.adminUsers.create({
        ...formData,
        roleId: selectedType.roleId,
        resident: selectedType.resident,
        unitNumber: formData.unitNumber.trim() || null,
        birthDate: formData.birthDate || null,
        password: '1234567890',
      });
      
      setSuccess(`${selectedType.label} creado exitosamente con contraseña por defecto 1234567890.`);
      
      // Limpiar formulario excepto unidad si es útil
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        documentNumber: '',
        unitNumber: '',
        birthDate: '',
      });
    } catch (submitError) {
      setError(submitError.message || 'No pudimos crear el usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedLayout allowedRoles={['admin']}>
      <Seo
        title="Gestión de Usuarios | Domu"
        description="Panel para crear residentes, conserjes y administradores."
        noindex
      />
      
      <section className="admin-create-user page-shell">
        <header className="admin-create-user__header page-header">
          <div className="admin-create-user__title-group">
            <p className="eyebrow page-eyebrow">Administración</p>
            <h1 className="page-title">Crear Nuevo Usuario</h1>
            <p className="subtitle page-subtitle">
              Registra residentes o personal del edificio en la plataforma.
            </p>
          </div>
        </header>

        <div className="admin-create-user__content">
          {/* Selector de tipo de usuario */}
          <div className="admin-create-user__type-selector">
            <h2 className="section-title">1. Selecciona el tipo de perfil</h2>
            <div className="role-grid">
              {ROLE_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={`role-card ${selectedType.id === type.id ? 'is-selected' : ''}`}
                  onClick={() => handleTypeSelect(type)}
                >
                  <div className="role-card__icon">
                    <Icon name={type.icon} size={24} />
                  </div>
                  <div className="role-card__info">
                    <h3>{type.label}</h3>
                    <p>{type.description}</p>
                  </div>
                  <div className="role-card__check">
                    <Icon name="check" size={16} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Formulario de datos */}
          <div className="admin-create-user__form-container">
            <h2 className="section-title">2. Completa la información del {selectedType.label.toLowerCase()}</h2>
            
            <form className="admin-create-user__form card" onSubmit={handleSubmit}>
              {error && <div className="alert alert--error">{error}</div>}
              {success && <div className="alert alert--success">{success}</div>}

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName">Nombre</label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Ej. Juan"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Apellido</label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Ej. Pérez"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="juan.perez@email.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Teléfono de contacto</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+56 9 1234 5678"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="documentNumber">RUT / Documento</label>
                  <input
                    id="documentNumber"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleChange}
                    placeholder="12.345.678-9"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="birthDate">Fecha de nacimiento (opcional)</label>
                  <input
                    id="birthDate"
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    disabled={loading}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {(selectedType.id === 'resident' || selectedType.id === 'staff') && (
                  <div className="form-group form-group--full">
                    <label htmlFor="unitNumber">
                      Unidad {selectedType.id === 'resident' && <span className="required">*</span>}
                    </label>
                    <input
                      id="unitNumber"
                      type="number"
                      name="unitNumber"
                      value={formData.unitNumber}
                      onChange={handleChange}
                      placeholder="Ej. 101"
                      min="1"
                      disabled={loading}
                      required={selectedType.id === 'resident'}
                    />
                  </div>
                )}
              </div>

              <div className="admin-create-user__footer">
                <div className="info-box">
                  <Icon name="info" size={16} />
                  <p>
                    Se enviará un correo con las credenciales de acceso. 
                    Contraseña temporal: <strong>1234567890</strong>
                  </p>
                </div>
                
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? (
                    <Skeleton.Inline width="70px" label="Creando..." />
                  ) : (
                    <>
                      <Icon name="userPlus" size={18} />
                      Crear {selectedType.label}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </ProtectedLayout>
  );
};

export default AdminCreateUser;