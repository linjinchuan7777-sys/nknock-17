import React, { useState } from 'react';

// Radar Chart Component using SVG + Absolute HTML Labels
const RadarChart = ({ stats = {} }) => {
  const width = 140;
  const height = 140;
  const center = 70;
  const R = 50; // Maximum radius

  // Angles for the 5 vertices: 熱情, 幽默, 拖延, 健身, 美食
  const getVertexCoords = (radius, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  };

  // 1. Pentagon background lines (5 levels)
  const pentagons = [];
  for (let level = 1; level <= 5; level++) {
    const radius = R * (level / 5);
    const points = [];
    for (let i = 0; i < 5; i++) {
      const coords = getVertexCoords(radius, i);
      points.push(`${coords.x},${coords.y}`);
    }
    pentagons.push(points.join(" "));
  }

  // 2. Skeleton lines (radii lines)
  const skeletonLines = [];
  for (let i = 0; i < 5; i++) {
    const coords = getVertexCoords(R, i);
    skeletonLines.push(coords);
  }

  // 3. Values mapping
  const values = [
    stats.passion ?? 50,
    stats.humor ?? 50,
    stats.procrastination ?? 50,
    stats.fitness ?? 50,
    stats.foodie ?? 50
  ];

  const valuePoints = [];
  const valueDots = [];
  for (let i = 0; i < 5; i++) {
    const val = values[i];
    const radius = R * (val / 100);
    const coords = getVertexCoords(radius, i);
    valuePoints.push(`${coords.x},${coords.y}`);
    valueDots.push(coords);
  }

  return (
    <div className="radar-chart" id="bf-radar" style={{ position: 'relative', width: '140px', height: '140px', margin: '20px auto 0 auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        {/* pentagons grid */}
        {pentagons.map((points, index) => (
          <polygon 
            key={index}
            points={points}
            fill="none"
            stroke="rgba(0, 168, 232, 0.15)"
            strokeWidth="1"
          />
        ))}
        {/* skeleton lines */}
        {skeletonLines.map((line, index) => (
          <line 
            key={index}
            x1={center}
            y1={center}
            x2={line.x}
            y2={line.y}
            stroke="rgba(0, 168, 232, 0.15)"
            strokeDasharray="2,2"
          />
        ))}
        {/* value polygon area */}
        {valuePoints.length > 0 && (
          <polygon 
            points={valuePoints.join(" ")}
            fill="rgba(0, 168, 232, 0.35)"
            stroke="rgba(0, 119, 182, 0.75)"
            strokeWidth="2"
            style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 168, 232, 0.3))' }}
          />
        )}
        {/* value dots */}
        {valueDots.map((dot, index) => (
          <circle 
            key={index}
            cx={dot.x}
            cy={dot.y}
            r="3"
            fill="#ffffff"
            stroke="rgba(0, 119, 182, 0.75)"
            strokeWidth="1.5"
          />
        ))}
      </svg>
      {/* HTML Absolute Labels */}
      <span className="radar-label label-passion" style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translate(-50%, -100%)', fontSize: '11px', color: 'var(--primary-dark)', fontWeight: 'bold' }}>熱情</span>
      <span className="radar-label label-humor" style={{ position: 'absolute', top: '35%', right: '-10%', transform: 'translate(0%, -50%)', fontSize: '11px', color: 'var(--primary-dark)', fontWeight: 'bold' }}>幽默</span>
      <span className="radar-label label-procrastination" style={{ position: 'absolute', bottom: '-5%', right: '10%', transform: 'translate(0%, 0%)', fontSize: '11px', color: 'var(--primary-dark)', fontWeight: 'bold' }}>拖延</span>
      <span className="radar-label label-fitness" style={{ position: 'absolute', bottom: '-5%', left: '10%', transform: 'translate(0%, 0%)', fontSize: '11px', color: 'var(--primary-dark)', fontWeight: 'bold' }}>健身</span>
      <span className="radar-label label-foodie" style={{ position: 'absolute', top: '35%', left: '-10%', transform: 'translate(0%, -50%)', fontSize: '11px', color: 'var(--primary-dark)', fontWeight: 'bold' }}>美食</span>
    </div>
  );
};

const VisitView = ({
  friends = [],
  ownerProfile = {},
  currentActiveProfile = null,
  onVisitFriendRoom,
  onLeaveVisitingRoom,
  onAddFriend,
  onDeleteFriend
}) => {
  const [viewMode, setViewMode] = useState('list'); // 'list', 'book'
  const [currentIndex, setCurrentIndex] = useState(0);

  // Combine owner and friends to show in the book list if needed
  // In vanilla code, profiles includes owner at index 0 or as part of list
  const ownerObj = {
    accountId: ownerProfile.accountId || 'renata123',
    name: ownerProfile.name || '雷娜塔',
    nickname: ownerProfile.nickname || '小娜',
    avatar: ownerProfile.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
    gender: ownerProfile.gender || '女',
    bloodType: ownerProfile.bloodType || 'O',
    birthday: ownerProfile.birthday || '2000-06-05',
    horoscope: ownerProfile.horoscope || '雙子座',
    city: ownerProfile.city || '台北市',
    email: ownerProfile.email || 'renata@home.com',
    mobile: ownerProfile.mobile || '0912-345678',
    line: ownerProfile.line || 'renata_line',
    favorites: ownerProfile.favorites || {
      country: '日本',
      color: '天空藍',
      music: '輕音樂',
      movie: '奇幻冒險',
      food: '草莓蛋糕',
      trait: '溫柔善良'
    },
    top3: ownerProfile.top3 || {
      title: '我最喜歡的休閒活動',
      top1: '閱讀小說',
      top2: '聽古典樂',
      top3: '烘焙甜點'
    },
    social: ownerProfile.social || {
      role: '網站主人',
      talent: '網頁設計 / 繪畫',
      welcome: '歡迎光臨我的個人小窩！',
      status: '努力生活，探索美好事物 ✨'
    },
    aboutMe: ownerProfile.aboutMe || {
      passion: 85,
      humor: 70,
      procrastination: 40,
      fitness: 60,
      foodie: 80
    }
  };

  // Profiles list for binder: Owner is always index 0, followed by friends
  const profiles = [ownerObj, ...friends];
  const activeFriend = profiles[currentIndex];
  
  const handleSelectFriend = (index) => {
    setCurrentIndex(index);
    setViewMode('book');
  };

  const handlePrevPage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDeleteFriendClick = (friend) => {
    if (confirm(`確定要將 ${friend.name} 從好友名單中刪除嗎？`)) {
      if (onDeleteFriend) {
        onDeleteFriend(friend.accountId);
        setViewMode('list');
      }
    }
  };

  const isOwner = activeFriend.accountId === (ownerProfile.accountId || "renata123");
  const hostId = currentActiveProfile ? currentActiveProfile.accountId : (ownerProfile.accountId || "renata123");
  const isCurrentHost = activeFriend.accountId === hostId;

  return (
    <div id="visit-view" className="view-panel" style={{ display: 'block' }}>
      {viewMode === 'list' ? (
        /* 好友清單列表模式 */
        <div id="friends-list-container" className="card">
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><i className="fa-solid fa-users"></i> 好友名冊</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ fontSize: '11px', padding: '4px 12px' }}
                onClick={() => { setCurrentIndex(0); setViewMode('book'); }}
              >
                <i className="fa-solid fa-book-open"></i> 打開活頁夾
              </button>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={onAddFriend}
                style={{ fontSize: '11px', padding: '4px 12px' }}
              >
                <i className="fa-solid fa-user-plus"></i> 新增好友
              </button>
            </div>
          </div>
          
          <div className="friends-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px', padding: '10px 0' }}>
            {/* Show owner first as a special profile */}
            <div 
              className="friend-grid-card owner-card" 
              onClick={() => handleSelectFriend(0)}
              style={{ cursor: 'pointer', textAlign: 'center', background: 'rgba(0,168,232,0.06)', border: '1px dashed rgba(0,168,232,0.3)', borderRadius: '12px', padding: '15px', position: 'relative', transition: 'transform 0.2s' }}
            >
              <img 
                src={ownerObj.avatar} 
                alt={ownerObj.name} 
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: 'var(--shadow-sm)', marginBottom: '8px' }}
              />
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary-dark)' }}>{ownerObj.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>[ 站長主人 ]</div>
            </div>

            {/* Friends list */}
            {friends.map((friend, idx) => (
              <div 
                key={friend.accountId} 
                className="friend-grid-card" 
                onClick={() => handleSelectFriend(idx + 1)}
                style={{ cursor: 'pointer', textAlign: 'center', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '12px', padding: '15px', position: 'relative', transition: 'transform 0.2s' }}
              >
                <img 
                  src={friend.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"} 
                  alt={friend.name} 
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: 'var(--shadow-sm)', marginBottom: '8px' }}
                />
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-dark)' }}>{friend.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>@{friend.accountId}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 好友活頁夾 Binder 模式 */
        <div id="friend-profile-book" className="friend-profile-book" style={{ display: 'block' }}>
          {/* Controls Bar */}
          <div className="book-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setViewMode('list')}>
              <i className="fa-solid fa-arrow-left"></i> 返回列表
            </button>
            
            <div className="page-nav" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary btn-sm" 
                disabled={currentIndex === 0} 
                onClick={handlePrevPage}
                style={{ padding: '4px 10px' }}
              >
                <i className="fa-solid fa-chevron-left"></i> 上一頁
              </button>
              
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-dark)', margin: '0 6px' }}>
                {currentIndex + 1} / {profiles.length}
              </span>
              
              <button 
                className="btn btn-secondary btn-sm" 
                disabled={currentIndex === profiles.length - 1} 
                onClick={handleNextPage}
                style={{ padding: '4px 10px' }}
              >
                下一頁 <i className="fa-solid fa-chevron-right"></i>
              </button>

              {!isOwner && (
                <button 
                  className="btn btn-danger btn-sm" 
                  onClick={() => handleDeleteFriendClick(activeFriend)}
                  style={{ marginLeft: '10px', background: 'linear-gradient(to bottom, #ff5e62 0%, #ff1e27 100%)', borderColor: '#ff1e27' }}
                >
                  <i className="fa-solid fa-user-minus"></i> 刪除好友
                </button>
              )}
            </div>
          </div>

          {/* Double-page notebook (Binder Book) */}
          <div className="binder-book" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', position: 'relative', background: '#fdfbfa', border: '1px solid #e5d5c5', borderRadius: '16px', padding: '25px', boxShadow: 'var(--shadow-md)' }}>
            {/* Left Page */}
            <div className="binder-page left-page" style={{ borderRight: '1px dashed rgba(0,0,0,0.1)', paddingRight: '20px' }}>
              {/* Profile Card Summary */}
              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', marginBottom: '20px' }}>
                <img 
                  src={activeFriend.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"} 
                  alt="Avatar" 
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: 'var(--shadow-sm)' }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'var(--primary-dark)', fontWeight: 'bold' }}>{activeFriend.name}</h3>
                  <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>帳號 ID: @{activeFriend.accountId}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <span style={{ background: 'rgba(0,168,232,0.08)', color: 'var(--primary-dark)', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                      {activeFriend.gender || '保密'}
                    </span>
                    <span style={{ background: 'rgba(126,189,38,0.08)', color: 'var(--success-dark)', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                      {activeFriend.bloodType || 'O'} 型
                    </span>
                    <span style={{ background: 'rgba(238,98,98,0.08)', color: 'var(--danger-color)', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                      {activeFriend.horoscope || '雙子座'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Details Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <td style={{ padding: '6px 0', fontWeight: 'bold', color: 'var(--text-light)', width: '60px' }}>暱稱</td>
                    <td style={{ padding: '6px 0', color: 'var(--text-dark)' }}>{activeFriend.nickname || '無'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <td style={{ padding: '6px 0', fontWeight: 'bold', color: 'var(--text-light)' }}>生日</td>
                    <td style={{ padding: '6px 0', color: 'var(--text-dark)' }}>{activeFriend.birthday || '未填寫'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <td style={{ padding: '6px 0', fontWeight: 'bold', color: 'var(--text-light)' }}>城市</td>
                    <td style={{ padding: '6px 0', color: 'var(--text-dark)' }}>{activeFriend.city || '未填寫'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <td style={{ padding: '6px 0', fontWeight: 'bold', color: 'var(--text-light)' }}>Email</td>
                    <td style={{ padding: '6px 0', color: 'var(--text-dark)' }}>{activeFriend.email || '未填寫'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <td style={{ padding: '6px 0', fontWeight: 'bold', color: 'var(--text-light)' }}>手機</td>
                    <td style={{ padding: '6px 0', color: 'var(--text-dark)' }}>{activeFriend.mobile || '未填寫'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <td style={{ padding: '6px 0', fontWeight: 'bold', color: 'var(--text-light)' }}>LINE</td>
                    <td style={{ padding: '6px 0', color: 'var(--text-dark)' }}>{activeFriend.line || '未填寫'}</td>
                  </tr>
                </tbody>
              </table>

              {/* Radar Chart */}
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <strong style={{ fontSize: '12.5px', color: 'var(--primary-dark)' }}>個人屬性分析：</strong>
                <RadarChart stats={activeFriend.aboutMe || {}} />
              </div>
            </div>

            {/* Right Page */}
            <div className="binder-page right-page" style={{ paddingLeft: '10px' }}>
              {/* Favorites Section */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 'bold', color: 'var(--primary-dark)', marginBottom: '8px', borderBottom: '2px solid rgba(0,168,232,0.15)', paddingBottom: '4px' }}>
                  <i className="fa-solid fa-heart"></i> 我的最愛 (My Favorites)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div><strong>國家：</strong><span>{activeFriend.favorites?.country || '未填寫'}</span></div>
                  <div><strong>顏色：</strong><span>{activeFriend.favorites?.color || '未填寫'}</span></div>
                  <div><strong>音樂：</strong><span>{activeFriend.favorites?.music || '未填寫'}</span></div>
                  <div><strong>電影：</strong><span>{activeFriend.favorites?.movie || '未填寫'}</span></div>
                  <div><strong>食物：</strong><span>{activeFriend.favorites?.food || '未填寫'}</span></div>
                  <div><strong>特質：</strong><span>{activeFriend.favorites?.trait || '未填寫'}</span></div>
                </div>
              </div>

              {/* Top 3 Section */}
              <div style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.04)', borderRadius: '10px', padding: '12px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#d35400', marginBottom: '8px' }}>
                  <i className="fa-solid fa-trophy"></i> {activeFriend.top3?.title || '我的前三名'}
                </h4>
                <ol style={{ fontSize: '12px', margin: 0, paddingLeft: '20px', lineHeight: 1.6 }}>
                  <li>{activeFriend.top3?.top1 || '未填寫'}</li>
                  <li>{activeFriend.top3?.top2 || '未填寫'}</li>
                  <li>{activeFriend.top3?.top3 || '未填寫'}</li>
                </ol>
              </div>

              {/* Social Status Section */}
              <div style={{ marginBottom: '20px', fontSize: '12px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 'bold', color: 'var(--success-dark)', marginBottom: '8px', borderBottom: '2px solid rgba(126,189,38,0.15)', paddingBottom: '4px' }}>
                  <i className="fa-solid fa-comment"></i> 自我介紹與動態
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong>身份配角：</strong><span>{activeFriend.social?.role || '保密'}</span></div>
                  <div><strong>得意專長：</strong><span>{activeFriend.social?.talent || '未填寫'}</span></div>
                  <div><strong>歡迎寄語：</strong><span>{activeFriend.social?.welcome || '無'}</span></div>
                  <div style={{ marginTop: '5px', padding: '8px', background: 'rgba(0,168,232,0.04)', borderRadius: '6px', borderLeft: '3px solid var(--primary-color)' }}>
                    <strong>最新狀態：</strong><br />
                    <span style={{ fontStyle: 'italic' }}>{activeFriend.social?.status || '暫無最新狀態。'}</span>
                  </div>
                </div>
              </div>

              {/* Visit Button Actions */}
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                {isCurrentHost ? (
                  <button 
                    className="btn btn-secondary" 
                    disabled 
                    style={{ width: '100%', opacity: 0.7, cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <i className="fa-solid fa-house-user"></i> 目前正在此房間參觀
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      if (isOwner) {
                        onLeaveVisitingRoom();
                      } else {
                        onVisitFriendRoom(activeFriend);
                      }
                    }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    {isOwner ? (
                      <>
                        <i className="fa-solid fa-house"></i> 返回我的個人房間
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-door-open"></i> 拜訪這位好友的房間
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitView;
