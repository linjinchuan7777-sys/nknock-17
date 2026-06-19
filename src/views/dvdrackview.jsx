import React, { useState } from 'react';

const DvdRackView = ({
  media = [],
  role = 'visitor',
  mediaTypeFilter = 'all',
  onFilterChange,
  onAddMedia,
  onDeleteMedia,
  onEditMedia
}) => {
  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const isAdmin = role === 'admin';

  // Filter media items
  const filteredMedia = mediaTypeFilter === 'all' 
    ? media 
    : media.filter(m => m.type === mediaTypeFilter);

  const selectedItem = media.find(m => m.id === selectedMediaId);

  const handleDeleteMedia = (mediaId) => {
    if (confirm("確定要刪除這個收藏項目嗎？")) {
      if (onDeleteMedia) {
        onDeleteMedia(mediaId);
        setSelectedMediaId(null);
      }
    }
  };

  // Helper to render stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i 
          key={i} 
          className={i <= rating ? "fa-solid fa-star" : "fa-regular fa-star"}
          style={{ marginRight: '2px' }}
        />
      );
    }
    return stars;
  };

  return (
    <div id="dvd-rack-view" className="view-panel" style={{ display: 'block' }}>
      {/* DVD架過濾與新增按鈕 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '8px' }}>
        <div className="dvd-rack-filters" style={{ display: 'flex', gap: '6px' }}>
          {['all', 'movie', 'game', 'music'].map(type => (
            <button 
              key={type}
              className={`btn ${mediaTypeFilter === type ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => onFilterChange && onFilterChange(type)}
              style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '15px' }}
            >
              {type === 'all' ? '全部' : type === 'movie' ? '電影' : type === 'game' ? '遊戲' : '音樂'}
            </button>
          ))}
        </div>
        
        {isAdmin && (
          <div className="dvd-rack-actions">
            <button className="btn btn-primary btn-sm" onClick={onAddMedia} style={{ fontSize: '11px', padding: '4px 12px' }}>
              <i className="fa-solid fa-plus"></i> 新增收藏 (DVD / CD)
            </button>
          </div>
        )}
      </div>

      <div className="dvd-rack-grid" id="dvd-rack-grid">
        {filteredMedia.length > 0 ? (
          filteredMedia.map(item => {
            const isMusic = item.type === 'music';
            const cover = item.cover || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=150';
            return (
              <div 
                key={item.id} 
                className="media-case-wrapper"
                onClick={() => setSelectedMediaId(item.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className={`media-case ${isMusic ? 'media-case-cd' : 'media-case-dvd'}`}>
                  <div className="media-box-item">
                    <img src={cover} alt={item.title} title="點選查看詳情" />
                  </div>
                </div>
                <div className="media-info-text">
                  <div className="media-item-title">{item.title}</div>
                  <div className="media-item-meta">
                    {item.type === 'movie' ? '電影' : item.type === 'game' ? '遊戲' : '音樂'} · {item.year}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-light)', padding: '40px 0' }}>
            暫無收藏影音項目
          </div>
        )}
      </div>

      {/* 影音詳細彈窗 Modal */}
      {selectedItem && (
        <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center' }}>
            <button className="modal-close" onClick={() => setSelectedMediaId(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <img 
              src={selectedItem.cover || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=150'} 
              id="media-info-cover" 
              style={{ 
                width: '120px', 
                aspectRatio: selectedItem.type === 'music' ? '1/1' : '13/19', 
                height: selectedItem.type === 'music' ? '120px' : '160px',
                objectFit: 'cover', 
                border: '1px solid #ccc', 
                boxShadow: 'var(--shadow-sm)', 
                margin: '0 auto 12px auto', 
                display: 'block' 
              }}
              alt="封面"
            />
            <h3 className="modal-title" id="media-info-title" style={{ marginBottom: '4px' }}>{selectedItem.title}</h3>
            <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '8px' }}>
              發行年份：<span id="media-info-year">{selectedItem.year || '未知'}</span>
            </div>
            
            {/* Stars */}
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center', gap: '4px', fontSize: '18px', color: '#ffaa00' }} id="media-info-stars">
              {renderStars(selectedItem.rating || 0)}
            </div>

            <p id="media-info-desc" style={{ textAlign: 'left', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-dark)', background: '#f9f9f9', padding: '12px', border: '1px solid #e0e0e0', marginBottom: '10px' }}>
              {selectedItem.description || "暫無簡介。"}
            </p>

            <div style={{ textAlign: 'left', marginBottom: '15px' }} id="media-info-comment-box">
              <strong style={{ fontSize: '13px', color: 'var(--accent-dark)' }}>
                <i className="fa-solid fa-comment-dots"></i> 評語項目：
              </strong>
              <p id="media-info-comment" style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-dark)', background: '#fdfefe', padding: '12px', border: '1px dashed var(--accent-color)', borderRadius: '6px', marginTop: '4px', whiteSpace: 'pre-line' }}>
                {selectedItem.comment || "暫無評語。"}
              </p>
            </div>

            {isAdmin && (
              <div className="form-submit-row" id="media-detail-actions" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  id="edit-media-btn" 
                  style={{ flex: 1 }}
                  onClick={() => { onEditMedia(selectedItem); setSelectedMediaId(null); }}
                >
                  <i className="fa-solid fa-edit"></i> 編輯收藏資訊
                </button>
                <button 
                  className="btn btn-danger" 
                  id="delete-media-btn" 
                  style={{ flex: 1 }}
                  onClick={() => handleDeleteMedia(selectedItem.id)}
                >
                  <i className="fa-solid fa-trash"></i> 刪除此影音收藏
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DvdRackView;
