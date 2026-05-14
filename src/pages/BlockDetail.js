import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBlock, deleteBlock } from '../services/api';

const statusLabel = { active: 'Активна', lifted: 'Снята' };

function BlockDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlock(id)
      .then((res) => { setBlock(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleDelete = () => {
    if (!window.confirm('Удалить блокировку?')) return;
    deleteBlock(id).then(() => navigate('/blocks'));
  };

  if (loading) return <p>Загрузка...</p>;
  if (!block) return <p style={{ color: 'red' }}>Не найдено</p>;

  return (
    <div>
      <button className="back-btn" onClick={() => navigate(-1)}>← Назад</button>
      <div className="card">
        <div className="card-header">
          <h2 style={{ margin: 0 }}>Блокировка от {block.blocker}</h2>
          <span className={`badge badge-${block.status}`}>{statusLabel[block.status]}</span>
        </div>
        <div className="info-grid" style={{ marginTop: 20 }}>
          <div><div className="info-label">Блокировщик</div><div className="info-value">{block.blocker}</div></div>
          <div><div className="info-label">Страна</div><div className="info-value">{block.blockerCountry}</div></div>
          <div><div className="info-label">Дата</div><div className="info-value">{block.date}</div></div>
          <div>
            <div className="info-label">ID сайта</div>
            <div className="info-value">
              <Link to={`/detail/${block.siteId}`} style={{ color: '#2563eb' }}>#{block.siteId}</Link>
            </div>
          </div>
          <div>
            <div className="info-label">Способ обхода</div>
            <div className="info-value" style={{ color: '#16a34a' }}>{block.bypass || '—'}</div>
          </div>
        </div>
        <p style={{ marginTop: 20, color: '#475569', lineHeight: 1.7 }}>{block.reason}</p>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => navigate(`/block/edit/${id}`)}>Редактировать</button>
          <button className="btn btn-danger" onClick={handleDelete}>Удалить</button>
        </div>
      </div>
    </div>
  );
}

export default BlockDetail;