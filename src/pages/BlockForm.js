import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getBlock, createBlock, updateBlock } from '../services/api';

const BLOCKERS = ['Роскомнадзор', 'Суд', 'ISP', 'Правительство', 'Другой'];
const COUNTRIES = ['Россия', 'Китай', 'Иран', 'Беларусь', 'Турция', 'Другая'];
const STATUSES = [
  { value: 'active', label: 'Активна' },
  { value: 'lifted', label: 'Снята' },
];

function BlockForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    blocker: BLOCKERS[0],
    blockerCountry: COUNTRIES[0],
    reason: '',
    date: new Date().toISOString().split('T')[0],
    status: 'active',
    bypass: '',
    siteId: Number(searchParams.get('siteId')) || 0,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      getBlock(id).then((res) => setForm(res.data)).catch(() => alert('Ошибка загрузки'));
    }
  }, [id, isEdit]);

  const validate = () => {
    const e = {};
    if (!form.reason.trim()) e.reason = 'Причина обязательна';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setLoading(true);
    const payload = { ...form, siteId: Number(form.siteId) };
    const request = isEdit ? updateBlock(id, payload) : createBlock(payload);
    request
      .then(() => navigate('/blocks'))
      .catch(() => alert('Ошибка при сохранении'))
      .finally(() => setLoading(false));
  };

  const handleChange = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: null }));
  };

  return (
    <div style={{ maxWidth: 580 }}>
      <h2>{isEdit ? 'Редактировать блокировку' : '+ Добавить блокировку'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Блокировщик</label>
          <select className="form-control" value={form.blocker} onChange={handleChange('blocker')}>
            {BLOCKERS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Страна блокировки</label>
          <select className="form-control" value={form.blockerCountry} onChange={handleChange('blockerCountry')}>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Дата блокировки</label>
          <input type="date" className="form-control" value={form.date} onChange={handleChange('date')} />
        </div>
        <div className="form-group">
          <label className="form-label">Статус</label>
          <select className="form-control" value={form.status} onChange={handleChange('status')}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">ID сайта</label>
          <input type="number" className="form-control" value={form.siteId} onChange={handleChange('siteId')} />
        </div>
        <div className="form-group">
          <label className="form-label">Причина блокировки</label>
          <textarea className={`form-control${errors.reason ? ' error' : ''}`} rows={3} value={form.reason} onChange={handleChange('reason')} />
          {errors.reason && <div className="form-error">{errors.reason}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Способ обхода</label>
          <input className="form-control" value={form.bypass} onChange={handleChange('bypass')} placeholder="VPN, Tor, зеркало..." />
        </div>
        <div className="actions">
          <button type="submit" className="btn btn-warning" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button type="button" className="btn btn-light" onClick={() => navigate(-1)}>Отмена</button>
        </div>
      </form>
    </div>
  );
}

export default BlockForm;