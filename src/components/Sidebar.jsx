import React from 'react';
import Card from './Card';

const Sidebar = ({
  settings = {},
  ownerProfile = {},
  role = 'visitor',
  popularPosts = [],
  onWritePost,
  onEditProfile,
  onBackupExport,
  onBackupImport,
  onEditSettings,
  onPostClick
}) => {
  const isAdmin = role === 'admin';
  const isFriend = role === 'friend';

  const getRoleBadge = () => {
    if (isAdmin) return '管理員';
    if (isFriend) return '會員';
    return '訪客';
  };

  const getRoleClass = () => {
    if (isAdmin) return 'admin';
    if (isFriend) return 'friend';
    return 'visitor';
  };

  return (
    <aside className="column" id="right-column">
      {/* 個人頭像名片 */}
      <Card className="profile-card">
        <div className="comment-avatar-wrapper" style={{ margin: '0 auto 10px auto', width: '80px', height: '80px' }}>
          <img 
            src={ownerProfile.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300"} 
            alt="雷娜塔頭像" 
            className="profile-avatar comment-avatar" 
            id="blog-owner-avatar"
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div className={`avatar-frame ${getRoleClass()}`} style={{ top: '-4px', left: '-4px', right: '-4px', bottom: '-4px' }}></div>
        </div>
        
        <h3 className="profile-name" id="blog-owner-name">
          {ownerProfile.name || settings.ownerName || '雷娜塔'}
          <span className={`role-badge ${getRoleClass()}`} style={{ fontSize: '10px', marginLeft: '6px', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle', fontWeight: 'bold' }}>
            {getRoleBadge()}
          </span>
        </h3>
        
        <div 
          className="profile-account-id" 
          id="blog-owner-id" 
          style={{ 
            fontSize: '11.5px', 
            color: 'var(--primary-dark)', 
            fontWeight: 700, 
            marginTop: '-4px', 
            marginBottom: '6px', 
            background: 'rgba(0, 168, 232, 0.08)', 
            padding: '2px 8px', 
            borderRadius: '10px', 
            display: 'inline-block' 
          }}
        >
          @{ownerProfile.accountId || 'renata123'}
        </div>
        
        <p className="profile-bio" id="blog-owner-bio">
          {ownerProfile.social?.status || settings.ownerBio || '歡迎來到我的小角落。'}
        </p>
        
        <div className="profile-quick-actions" style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center', width: '100%' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            id="sidebar-edit-profile-btn" 
            style={{ flex: 1, fontSize: '11px' }} 
            title="編輯個人資料"
            onClick={onEditProfile}
          >
            <i className="fa-solid fa-edit"></i> 編輯資訊
          </button>
          {(isAdmin || isFriend) && (
            <button 
              className="btn btn-primary btn-sm" 
              id="sidebar-write-post-btn" 
              style={{ flex: 1, fontSize: '11px' }} 
              title="撰寫新文章"
              onClick={onWritePost}
            >
              <i className="fa-solid fa-pen-to-square"></i> 寫文章
            </button>
          )}
        </div>
      </Card>

      {/* 管理員控制台 (管理員或特權好友模式才顯示) */}
      {(isAdmin || isFriend) && (
        <Card 
          className="admin-card admin-only" 
          id="admin-control-card" 
          style={{ display: 'block' }}
          title={<span><i className="fa-solid fa-screwdriver-wrench"></i> {isAdmin ? '管理員控制台' : '會員控制台'}</span>}
        >
          {(isAdmin || isFriend) && (
            <button className="admin-card-btn" onClick={onWritePost}>
              <i className="fa-solid fa-pen-to-square"></i> 撰寫新貼文
            </button>
          )}
          <button className="admin-card-btn sec" onClick={onBackupExport}>
            <i className="fa-solid fa-file-export"></i> 匯出與備份資料
          </button>
          {isAdmin && (
            <button className="admin-card-btn sec" onClick={onBackupImport}>
              <i className="fa-solid fa-file-import"></i> 匯入與復原資料
            </button>
          )}
          <button className="admin-card-btn sec" onClick={onEditSettings}>
            <i className="fa-solid fa-cog"></i> 網頁設定 / 修改密碼
          </button>
        </Card>
      )}

      {/* 熱門推薦 */}
      <Card 
        className="hot-card"
        title={<span>熱門信息 (今日推薦)</span>}
      >
        <ul className="hot-list" id="popular-posts-box">
          {popularPosts.length > 0 ? (
            popularPosts.map((post, index) => (
              <li key={post.id}>
                <span className={`hot-num ${index < 3 ? 'top3' : ''}`}>{index + 1}</span>
                <a 
                  href="#" 
                  className="hot-link"
                  onClick={(e) => { e.preventDefault(); onPostClick(post.id); }}
                >
                  {post.title}
                </a>
                <span className="hot-views"><i className="fa-regular fa-eye"></i> {post.views || 0}</span>
              </li>
            ))
          ) : (
            <li style={{ color: 'var(--text-light)', fontSize: '12px' }}>暫無推薦文章</li>
          )}
        </ul>
      </Card>
    </aside>
  );
};

export default Sidebar;
