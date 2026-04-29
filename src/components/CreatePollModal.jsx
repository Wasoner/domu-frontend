import { useState, useEffect } from 'react';

import Button from './Button';
import FormField from './FormField';
import Icon from './Icon';
import './CreatePollModal.scss';

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

const CreatePollModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (!isOpen) setFormData(defaultForm);
  }, [isOpen]);

  if (!isOpen) return null;

  const updateOption = (id, label) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt) => (opt.id === id ? { ...opt, label } : opt)),
    }));
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { id: buildOptionId(), label: '' }],
    }));
  };

  const removeOption = (id) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((opt) => opt.id !== id),
    }));
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      closesAt: formData.closesAt,
      options: formData.options
        .map((opt) => opt.label.trim())
        .filter((opt) => opt.length > 0),
    };
    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content poll-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>Nueva votación</h3>
          <button type="button" className="close-button" onClick={handleClose}>
            <Icon name="close" size={24} />
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="poll-modal__body">
            <FormField
              label="Título"
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              maxLength={180}
              placeholder="Título de la votación"
            />

            <FormField
              label="Descripción"
              as="textarea"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción opcional..."
              rows={3}
            />

            <FormField
              label="Cierre"
              type="datetime-local"
              name="closesAt"
              value={formData.closesAt}
              onChange={(e) => setFormData({ ...formData, closesAt: e.target.value })}
              required
            />

            <div className="form-group form-group--options">
              <div className="form-group__header">
                <label className="form-label">Opciones (mínimo 2)</label>
                <button type="button" className="add-option-btn" onClick={addOption}>
                  <Icon name="plus" size={16} /> Agregar opción
                </button>
              </div>
              <div className="options-list">
                {formData.options.map((opt, index) => (
                  <div key={opt.id} className="option-row">
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) => updateOption(opt.id, e.target.value)}
                      placeholder={`Opción ${index + 1}`}
                      required={index < 2}
                      className="form-field__input"
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        className="icon-btn remove-option-btn"
                        onClick={() => removeOption(opt.id)}
                        title="Eliminar opción"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <Button variant="ghost" onClick={handleClose} type="button" disabled={loading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              Crear votación
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePollModal;
