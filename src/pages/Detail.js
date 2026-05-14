import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSite, deleteSite, getBlocksBySite, deleteBlock } from '../services/api';

const statusLabel = { active: 'Активна', lifted: 'Снята' };

function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getSite(id), getBlocksBySite(id)])
      .then(([sRes, bRes]) => {
        setSite(sRes.data);
        setBlocks(bRes.data);
        setLoading(false);
      })
      .catch(() => { setError('Не найдено'); setLoading(false); });
  }, [id]);

  const handleDelete = () => {
    if (!window.confirm('Удалить медиаресурс?')) return;
    deleteSite(id).then(() => navigate('/'));
  };

  const handleDeleteBlock = (bid) => {
    if (!window.confirm('Удалить блокировку?')) return;
    deleteBlock(bid).then(() => setBlocks(blocks.filter((b) => b.id !== bid)));
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: 'red' }}> Ошибка. {error}</p>;

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/')}>← Назад</button>
      <div className="card">
        <div className="card-header">
          <h2 style={{ margin: 0 }}>{site.name}</h2>
          <span style={{ color: '#64748b', fontSize: 14 }}>{site.url}</span>
        </div>
        <div className="info-grid">
          <div><div className="info-label">Тип</div><div className="info-value">{site.type}</div></div>
          <div><div className="info-label">Страна</div><div className="info-value">{site.country}</div></div>
        </div>
        <p style={{ marginTop: 16, color: '#475569', lineHeight: 1.7 }}>{site.description}</p>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => navigate(`/edit/${id}`)}>Редактировать</button>
          <button className="btn btn-danger" onClick={handleDelete}>Удалить</button>
        </div>
      </div>

      <div className="page-header">
        <h3>Блокировки ({blocks.length})</h3>
        <Link to={`/block/add?siteId=${id}`} className="btn btn-warning" style={{ textDecoration: 'none' }}>
          + Добавить блокировку
        </Link>
      </div>

      {blocks.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Блокировок не зафиксировано</p>
      ) : (
        blocks.map((block) => (
          <div key={block.id} className="block-item">
            <div className="block-item-header">
              <div>
                <Link to={`/block/${block.id}`} style={{ fontWeight: 600, color: '#1e293b', textDecoration: 'none' }}>
                  {block.blocker}
                </Link>
                <span style={{ marginLeft: 12, fontSize: 12, color: '#64748b' }}>{block.date}</span>
                <span style={{ marginLeft: 12 }}>
                  <span className={`badge badge-${block.status}`}>{statusLabel[block.status]}</span>
                </span>
              </div>
              <div>
                <button className="btn btn-secondary btn-small" onClick={() => navigate(`/block/edit/${block.id}`)}>Редактировать</button>
                <button className="btn btn-danger btn-small" style={{ marginLeft: 8 }} onClick={() => handleDeleteBlock(block.id)}>Удалить</button>
              </div>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 13, color: '#475569' }}>{block.reason}</p>
            {block.bypass && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#16a34a' }}>Обход: {block.bypass}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Detail;