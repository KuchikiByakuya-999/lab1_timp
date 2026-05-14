import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSiteList, deleteSite } from '../services/api';

function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getSiteList()
      .then((res) => { setItems(res.data); setLoading(false); })
      .catch(() => { setError('Ошибка загрузки данных'); setLoading(false); });
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm('Удалить медиаресурс?')) return;
    deleteSite(id)
      .then(() => setItems(items.filter((i) => i.id !== id)))
      .catch(() => alert('Ошибка при удалении'));
  };

  if (loading) return <p> Загрузка...</p>;
  if (error) return <p style={{ color: 'red' }}>Ошибка. {error}</p>;

  return (
    <div>
      <div className="page-header">
        <h2>Список медиаресурсов</h2>
        <button className="btn btn-primary" onClick={() => navigate('/add')}>+ Добавить сайт</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>URL</th>
            <th>Тип</th>
            <th>Страна</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>
                <Link to={`/detail/${item.id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                  {item.name}
                </Link>
              </td>
              <td style={{ color: '#64748b' }}>{item.url}</td>
              <td>{item.type}</td>
              <td>{item.country}</td>
              <td>
                <button className="btn btn-secondary btn-small" onClick={() => navigate(`/edit/${item.id}`)}>Редактировать</button>
                <button className="btn btn-danger btn-small" style={{ marginLeft: 8 }} onClick={() => handleDelete(item.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <p className="empty-text">Сайтов не найдено</p>}
    </div>
  );
}

export default Home;