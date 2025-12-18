import { useState } from 'react';
import { ProtectedLayout } from '../layout';
import { api } from '../services';
import './AdminCreateUser.css';

const MIN_PASSWORD_LENGTH = 10;

const roleOptions = [
  { value: 3, label: 'Conserje', resident: false },
  { value: 4, label: 'Funcionario', resident: false },
];

const AdminCreateUser = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentNumber: '',
    roleId: 3,
    resident: false,
    unitId: '',
    birthDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleRoleChange = (event) => {
    const selected = Number(event.target.value);
    const role = roleOptions.find((r) => r.value === selected);
    setFormData((prev) => ({
      ...prev,
      roleId: selected,
      resident: role?.resident ?? false,
    }));
  };

  const validate = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      return 'Nombre y apellido son obligatorios.';
    }
    if (!formData.email.trim()) {
      return 'El correo es obligatorio.';
    }
    if (!formData.phone.trim()) {
      return 'El teléfono es obligatorio.';
    }
    if (!formData.documentNumber.trim()) {
      return 'El documento es obligatorio.';
    }
    if (!formData.roleId) {
      return 'Selecciona un rol.';
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
        unitId: formData.unitId || null,
        birthDate: formData.birthDate || null,
        password: '1234567890',
      });
      setSuccess('Usuario creado con contraseña por defecto 1234567890. Se envió correo con credenciales.');
      setFormData((prev) => ({
        ...prev,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        documentNumber: '',
        roleId: 3,
        resident: false,
        unitId: '',
        birthDate: '',
      }));
    } catch (submitError) {
      setError(submitError.message || 'No pudimos crear el usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedLayout allowedRoles={['admin']}>
      <section className="admin-create-user">
        <header className="admin-create-user__header">
          <div>
            <p className="eyebrow">Usuarios</p>
            <h1>Crear nuevo usuario</h1>
            <p className="subtitle">Conserjes y funcionarios del condominio.</p>
          </div>
        </header>

        <div className="admin-create-user__card">
          <form className="admin-create-user__form" onSubmit={handleSubmit}>
            {error && <div className="alert alert--error">{error}</div>}
            {success && <div className="alert alert--success">{success}</div>}

            <div className="form-row">
              <label className="form-field">
                <span>Nombre</span>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </label>
              <label className="form-field">
                <span>Apellido</span>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </label>
            </div>

            <div className="form-row">
              <label className="form-field">
                <span>Correo</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </label>
              <label className="form-field">
                <span>Teléfono</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </label>
            </div>

            <div className="form-row">
              <label className="form-field">
                <span>Documento</span>
                <input
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </label>
              <label className="form-field">
                <span>Rol</span>
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleRoleChange}
                  disabled={loading}
                  required
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-row">
              <label className="form-field">
                <span>Fecha de nacimiento (opcional)</span>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  disabled={loading}
                  max={new Date().toISOString().split('T')[0]}
                />
              </label>
              <label className="form-field">
                <span>ID de unidad (opcional)</span>
                <input
                  type="number"
                  name="unitId"
                  value={formData.unitId}
                  onChange={handleChange}
                  disabled={loading}
                  min="1"
                />
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creando usuario...' : 'Crear usuario'}
              </button>
              <p className="helper-text">
                Se creará con contraseña por defecto 1234567890. Pídele que la cambie en su perfil.
              </p>
            </div>
          </form>
        </div>
      </section>
    </ProtectedLayout>
  );
};

export default AdminCreateUser;


