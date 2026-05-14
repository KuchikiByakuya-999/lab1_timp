import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const USERS = [
  { username: 'admin', password: 'admin123' },
];

function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = USERS.find(
      (u) => u.username === form.username && u.password === form.password
    );
    if (found) {
      localStorage.setItem('auth_token', btoa(form.username + ':' + Date.now()));
      onLogin();
      navigate('/');
    } else {
      setError('Неверный логин или пароль');
    }
  };

  const handleChange = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f1f5f9'
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 40,
        width: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ margin: '0 0 8px', textAlign: 'center' }}> Вход в систему </h2>
        <p style={{ color: '#64748b', textAlign: 'center', marginBottom: 28, fontSize: 14 }}>
          Мониторинг блокировок медиаресурсов
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Логин</label>
            <input
              className="form-control"
              value={form.username}
              onChange={handleChange('username')}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              type="password"
              className="form-control"
              value={form.password}
              onChange={handleChange('password')}
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div style={{
              background: '#fee2e2', color: '#991b1b', borderRadius: 6,
              padding: '8px 12px', fontSize: 13, marginBottom: 16
            }}>
              Ошибка. {error}
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 10 }}>
            Войти
          </button>
        </form>
        <div style={{
          marginTop: 20, padding: 12, background: '#ffffff',
          borderRadius: 8, fontSize: 12, color: '#64748b'
        }}>
          <strong>Тестовые данные:</strong><br />
          admin / admin123<br />
          user / user123
        </div>
      </div>
    </div>
  );
}

export default Login;