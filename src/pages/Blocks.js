import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBlocks, deleteBlock } from '../services/api';

const statusLabel = { active: 'Активна', lifted: 'Снята' };

function Blocks() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getBlocks()
      .then((res) => { setItems(res.data); setLoading(false); })
      .catch(() => { setError('Ошибка загрузки'); setLoading(false); });
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm('Удалить блокировку?')) return;
    deleteBlock(id)
      .then(() => setItems(items.filter((i) => i.id !== id)))
      .catch(() => alert('Ошибка при удалении'));
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: 'red' }}> Ошибка. {error}</p>;

  return (
    <div>
      <div className="page-header">
        <h2>Все блокировки</h2>
        <button className="btn btn-warning" onClick={() => navigate('/block/add')}>+ Добавить блокировку</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Блокировщик</th>
            <th>ID сайта</th>
            <th>Страна</th>
            <th>Дата</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>
                <Link to={`/block/${item.id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                  {item.blocker}
                </Link>
              </td>
              <td>
                <Link to={`/detail/${item.siteId}`} style={{ color: '#64748b' }}>#{item.siteId}</Link>
              </td>
              <td>{item.blockerCountry}</td>
              <td>{item.date}</td>
              <td><span className={`badge badge-${item.status}`}>{statusLabel[item.status]}</span></td>
              <td>
                <button className="btn btn-secondary btn-small" onClick={() => navigate(`/block/edit/${item.id}`)}>Редактировать</button>
                <button className="btn btn-danger btn-small" style={{ marginLeft: 8 }} onClick={() => handleDelete(item.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <p className="empty-text">Блокировок не найдено</p>}
    </div>
  );
}

export default Blocks;