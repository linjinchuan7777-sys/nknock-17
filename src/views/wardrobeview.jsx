import React, { useState } from 'react';

const WardrobeView = ({
  wardrobeItems = [],
  role = 'visitor',
  onAddWardrobeItem,
  onDeleteWardrobeItem,
  onEditWardrobeItem
}) => {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [activeTab, setActiveTab] = useState('clothes'); // 'clothes', 'shoes', 'accessories'
  const isAdmin = role === 'admin';

  const filteredItems = wardrobeItems.filter(item => item.type === activeTab);
  const selectedItem = wardrobeItems.find(item => item.id === selectedItemId);

  const handleDeleteItem = (itemId) => {
    if (confirm("確定要將此物品從衣櫃移除嗎？")) {
      if (onDeleteWardrobeItem) {
        onDeleteWardrobeItem(itemId);
        setSelectedItemId(null);
      }
    }
  };

  return (
    <div id="wardrobe-view" className="view-panel" style={{ display: 'block' }}>
      {/* 衣櫃過濾分類與新增按鈕 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '8px' }}>
        <div className="wardrobe-filters" style={{ display: 'flex', gap: '6px' }}>
          {[
            { key: 'clothes', label: '衣服收藏' },
            { key: 'shoes', label: '鞋子收藏' },
            { key: 'accessories', label: '飾品收藏' }
          ].map(tab => (
            <button 
              key={tab.key}
              className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveTab(tab.key)}
              style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '15px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {isAdmin && (
          <div className="wardrobe-actions">
            <button className="btn btn-primary btn-sm" onClick={onAddWardrobeItem} style={{ fontSize: '11px', padding: '4px 12px' }}>
              <i className="fa-solid fa-plus"></i> 新增衣物收藏
            </button>
          </div>
        )}
      </div>

      {/* 衣櫃宮格內容 */}
      <div className="wardrobe-tab-content">
        <div className="dvd-rack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px' }}>
          {filteredItems.length > 0 ? (
            filteredItems.map(item => {
              const cover = item.image || (
                activeTab === 'clothes' 
                  ? 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=150' 
                  : activeTab === 'shoes'
                  ? 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=150'
                  : 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=150'
              );
              // Clothes use dvd case style (taller), shoes and accessories use cd case style (square)
              const caseClass = activeTab === 'clothes' ? 'media-case-dvd' : 'media-case-cd';
              
              return (
                <div 
                  key={item.id} 
                  className="media-case-wrapper"
                  onClick={() => setSelectedItemId(item.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`media-case ${caseClass}`} style={{ position: 'relative' }}>
                    {isAdmin && (
                      <button 
                        className="todo-delete-btn" 
                        style={{ 
                          position: 'absolute', 
                          top: '4px', 
                          right: '4px', 
                          zIndex: 10, 
                          background: 'rgba(255,255,255,0.8)', 
                          borderRadius: '50%', 
                          width: '20px', 
                          height: '20px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          border: 'none',
                          cursor: 'pointer'
                        }} 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleDeleteItem(item.id); 
                        }}
                      >
                        <i className="fa-solid fa-trash" style={{ color: 'var(--danger-color)', fontSize: '10px' }}></i>
                      </button>
                    )}
                    <div className="media-box-item">
                      <img src={cover} alt={item.title} title="點選查看詳情" />
                    </div>
                  </div>
                  <div className="media-info-text">
                    <div className="media-item-title">{item.title}</div>
                    <div className="media-item-meta">{item.brand || '無品牌'} · {item.desc || '暫無描述'}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-light)', padding: '40px 0' }}>
              暫無{activeTab === 'clothes' ? '衣服' : activeTab === 'shoes' ? '鞋子' : '飾品'}收藏
            </div>
          )}
        </div>
      </div>

      {/* 衣櫃詳細彈窗 Modal */}
      {selectedItem && (
        <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center' }}>
            <button className="modal-close" onClick={() => setSelectedItemId(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <img 
              src={selectedItem.image || (
                selectedItem.type === 'clothes' 
                  ? 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=150' 
                  : selectedItem.type === 'shoes'
                  ? 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=150'
                  : 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=150'
              )} 
              id="media-info-cover" 
              style={{ 
                width: '120px', 
                aspectRatio: selectedItem.type === 'clothes' ? '13/19' : '1/1', 
                height: selectedItem.type === 'clothes' ? '180px' : '120px',
                objectFit: 'cover', 
                border: '1px solid #ccc', 
                boxShadow: 'var(--shadow-sm)', 
                margin: '0 auto 12px auto', 
                display: 'block' 
              }}
              alt="正面照片"
            />
            <h3 className="modal-title" style={{ marginBottom: '4px' }}>{selectedItem.title}</h3>
            <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '12px' }}>
              品牌分類：<span>{selectedItem.brand || '無品牌'}</span> · {selectedItem.type === 'clothes' ? '衣服' : selectedItem.type === 'shoes' ? '鞋子' : '飾品'}
            </div>
            
            <p style={{ textAlign: 'left', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-dark)', background: '#f9f9f9', padding: '12px', border: '1px solid #e0e0e0', marginBottom: '15px' }}>
              {selectedItem.desc || "暫無備註或搭配建議。"}
            </p>

            {isAdmin && (
              <div className="form-submit-row" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => { onEditWardrobeItem(selectedItem); setSelectedItemId(null); }}
                >
                  <i className="fa-solid fa-edit"></i> 編輯衣物資訊
                </button>
                <button 
                  className="btn btn-danger" 
                  style={{ flex: 1 }}
                  onClick={() => handleDeleteItem(selectedItem.id)}
                >
                  <i className="fa-solid fa-trash"></i> 移除此項收藏
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WardrobeView;
