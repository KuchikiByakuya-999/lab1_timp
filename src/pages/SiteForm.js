import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSite, createSite, updateSite } from '../services/api';

const TYPES = ['новостной', 'энциклопедия', 'социальная сеть', 'блог', 'другое'];
const COUNTRIES = ['Россия', 'США', 'Великобритания', 'Германия', 'Латвия', 'Другая'];

function SiteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', url: '', type: TYPES[0], country: COUNTRIES[0], description: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      getSite(id).then((res) => setForm(res.data)).catch(() => alert('Ошибка загрузки'));
    }
  }, [id, isEdit]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Название обязательно';
    if (!form.url.trim()) e.url = 'URL обязателен';
    if (!form.description.trim()) e.description = 'Описание обязательно';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setLoading(true);
    const request = isEdit ? updateSite(id, form) : createSite(form);
    request
      .then(() => navigate('/'))
      .catch(() => alert('Ошибка при сохранении'))
      .finally(() => setLoading(false));
  };

  const handleChange = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: null }));
  };

  return (
    <div style={{ maxWidth: 580 }}>
      <h2>{isEdit ? 'Редактировать медиаресурс' : 'Добавить медиаресурс'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Название</label>
          <input className={`form-control${errors.name ? ' error' : ''}`} value={form.name} onChange={handleChange('name')}/>
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">URL</label>
          <input className={`form-control${errors.url ? ' error' : ''}`} value={form.url} onChange={handleChange('url')}/>
          {errors.url && <div className="form-error">{errors.url}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Тип ресурса</label>
          <select className="form-control" value={form.type} onChange={handleChange('type')}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Страна регистрации</label>
          <select className="form-control" value={form.country} onChange={handleChange('country')}>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Описание</label>
          <textarea className={`form-control${errors.description ? ' error' : ''}`} rows={4} value={form.description} onChange={handleChange('description')} />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>
        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button type="button" className="btn btn-light" onClick={() => navigate('/')}>Отмена</button>
        </div>
      </form>
    </div>
  );
}

export default SiteForm;