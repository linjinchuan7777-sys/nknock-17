import React, { useState, useEffect } from 'react';

const AuthView = ({
  user,
  showSetup,
  onLogin,
  onRegister,
  onGoogleLogin,
  onSetupProfile,
  onGuestLogin,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');

  // Setup profile fields
  const [accountId, setAccountId] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [birthday, setBirthday] = useState('');
  const [horoscope, setHoroscope] = useState('');
  const [city, setCity] = useState('');
  const [spaceName, setSpaceName] = useState('');
  const [spaceSubtitle, setSpaceSubtitle] = useState('');

  // Pre-fill setup fields if user changes
  useEffect(() => {
    if (user && showSetup) {
      const defaultName = user.displayName || user.email.split('@')[0];
      setName(defaultName);
      setAvatar(user.photoURL || '');
      const defaultAccountId = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      setAccountId(defaultAccountId);
      setSpaceName(defaultName + ' 的空間');
      setSpaceSubtitle(defaultAccountId.toUpperCase() + "'S SPACE");
    }
  }, [user, showSetup]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Get values directly from the DOM to prevent browser autofill state mismatch
    const emailInput = e.target.querySelector('input[type="email"]');
    const passwordInput = e.target.querySelector('input[type="password"]');
    const emailValue = emailInput ? emailInput.value : loginEmail;
    const passwordValue = passwordInput ? passwordInput.value : loginPassword;
    
    if (onLogin) onLogin(emailValue.trim(), passwordValue);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    const passwordInput = e.target.querySelector('input[type="password"]');
    const confirmInput = e.target.querySelectorAll('input[type="password"]')[1];
    const emailValue = emailInput ? emailInput.value : regEmail;
    const passwordValue = passwordInput ? passwordInput.value : regPassword;
    const confirmValue = confirmInput ? confirmInput.value : regPasswordConfirm;

    if (passwordValue.length < 6) {
      alert("密碼長度必須至少為 6 個字元！");
      return;
    }
    if (passwordValue !== confirmValue) {
      alert("密碼與確認密碼不一致！");
      return;
    }
    if (onRegister) onRegister(emailValue.trim(), passwordValue);
  };

  const handleSetupSubmit = (e) => {
    e.preventDefault();
    if (!accountId.trim()) {
      alert("請輸入個人帳號 ID！");
      return;
    }
    if (!name.trim()) {
      alert("請輸入站長名稱！");
      return;
    }
    if (onSetupProfile) {
      onSetupProfile({
        accountId,
        name,
        avatar,
        nickname,
        spaceName,
        spaceSubtitle,
        gender,
        bloodType,
        birthday,
        horoscope,
        city
      });
    }
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("圖片大小不能超過 1MB，以避免瀏覽器儲存空間不足！");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="auth-view" className="auth-container" style={{ display: 'flex' }}>
      <div className="auth-card">
        <div className="auth-logo">
          <svg viewBox="0 0 100 100" style={{ width: '48px', height: '48px', marginBottom: '8px' }}>
            <rect width="100" height="100" fill="none" />
            <g>
              {Array.from({ length: 180 }).map((_, n) => {
                const theta = n * 137.5 * (Math.PI / 180);
                const r = 3.2 * Math.sqrt(n);
                const x = 50 + r * Math.cos(theta);
                const y = 50 + r * Math.sin(theta);
                const hue = Math.floor(25 + (n / 180) * 23);
                const sat = Math.floor(65 + (n / 180) * 25);
                const lit = Math.floor(10 + (n / 180) * 45);
                const dotRadius = 0.8 + 1.2 * Math.sqrt(n / 180);
                return (
                  <circle 
                    key={n} 
                    cx={x.toFixed(3)} 
                    cy={y.toFixed(3)} 
                    r={dotRadius.toFixed(2)} 
                    fill={`hsl(${hue}, ${sat}%, ${lit}%)`} 
                  />
                );
              })}
            </g>
          </svg>
          <h2>nknock</h2>
          <p>nknock</p>
        </div>
        
        {!showSetup ? (
          <>
            <div className="auth-tabs">
              <button 
                className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                登入
              </button>
              <button 
                className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => setActiveTab('register')}
              >
                註冊
              </button>
            </div>
            
            {activeTab === 'login' && (
              <form className="auth-form" onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }} autoComplete="off">
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', display: 'block' }}>電子信箱 (Email)</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    required 
                    placeholder="example@email.com" 
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', display: 'block' }}>密碼 (Password)</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    required 
                    placeholder="請輸入密碼" 
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" style={{ width: '100%', marginTop: '10px' }}>立即登入</button>
              </form>
            )}

            {/* 註冊表單 */}
            {activeTab === 'register' && (
              <form className="auth-form" onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', display: 'block' }}>電子信箱 (Email)</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    required 
                    placeholder="example@email.com" 
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', display: 'block' }}>密碼 (Password)</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    required 
                    placeholder="密碼需大於 6 位數" 
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', display: 'block' }}>確認密碼</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    required 
                    placeholder="請再次輸入密碼" 
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={regPasswordConfirm}
                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" style={{ background: 'linear-gradient(to bottom, #ffd23f 0%, #ffaa00 100%)', borderColor: '#ffaa00', width: '100%', marginTop: '10px' }}>註冊帳號</button>
              </form>
            )}

            <div className="auth-divider" style={{ margin: '20px 0', position: 'relative', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <span style={{ position: 'absolute', top: '-9px', left: '50%', transform: 'translateX(-50%)', background: 'rgb(228, 241, 248)', padding: '0 10px', fontSize: '10.5px', color: 'var(--text-light)' }}>或使用以下方式</span>
            </div>
            
            <button 
              type="button" 
              className="btn btn-secondary btn-lg google-auth-btn" 
              onClick={onGoogleLogin}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg> 
              使用 Google 帳號登入
            </button>

            <div className="auth-guest-link" style={{ marginTop: '20px', fontSize: '11.5px' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); onGuestLogin(); }} style={{ color: 'var(--primary-dark)', decoration: 'none', fontWeight: 600 }}>
                先以訪客身分參觀 <i className="fa-solid fa-angle-right"></i>
              </a>
            </div>
          </>
        ) : (
          /* 個人檔案設定表單 (註冊成功後顯示) */
          <form className="auth-form" onSubmit={handleSetupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px', maxHeight: '350px', overflowY: 'auto', paddingRight: '5px', scrollbarWidth: 'thin' }}>
            <h3 style={{ color: 'var(--primary-dark)', fontWeight: 700, fontSize: '14px', marginBottom: '5px', textAlign: 'center' }}>
              <i className="fa-solid fa-user-gear"></i> 建立您的個人檔案
            </h3>
            
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', display: 'block' }}>個人帳號 ID (不可重複) *</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                placeholder="例如：renata123" 
                style={{ width: '100%', boxSizing: 'border-box' }}
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              />
            </div>
            
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', display: 'block' }}>站長名稱 *</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                placeholder="您的名字或稱呼" 
                style={{ width: '100%', boxSizing: 'border-box' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', display: 'block' }}>自訂空間名稱</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="例如：小明 的空間" 
                style={{ width: '100%', boxSizing: 'border-box' }}
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', display: 'block' }}>自訂空間英文名稱</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="例如：MING'S SPACE" 
                style={{ width: '100%', boxSizing: 'border-box' }}
                value={spaceSubtitle}
                onChange={(e) => setSpaceSubtitle(e.target.value)}
              />
            </div>
            
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', display: 'block' }}>個人頭像</label>
              <div className="image-upload-wrapper">
                <div className="image-preview-box" id="setup-avatar-preview-box">
                  {avatar ? (
                    <img id="setup-avatar-preview" src={avatar} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} alt="頭像預覽" />
                  ) : (
                    <span id="setup-avatar-placeholder">選擇圖片</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label className="btn btn-secondary" style={{ margin: 0, cursor: 'pointer', whiteSpace: 'nowrap', height: '32px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: '6px' }}>
                    <i className="fa-solid fa-cloud-arrow-up"></i> 上傳頭像
                    <input type="file" accept="image/*" onChange={handleAvatarFileChange} style={{ display: 'none' }} />
                  </label>
                  {avatar && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => setAvatar('')} style={{ height: '32px', fontSize: '11px', padding: '0 10px', borderRadius: '6px' }}>
                      清除
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', display: 'block' }}>暱稱</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="例如：小娜" 
                style={{ width: '100%', boxSizing: 'border-box' }}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>

            <div className="form-group row" style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', display: 'block' }}>性別</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="例如：女" 
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', display: 'block' }}>血型</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="例如：A" 
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group row" style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', display: 'block' }}>生日</label>
                <input 
                  type="date" 
                  className="form-input" 
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', display: 'block' }}>星座</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="例如：雙子座" 
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  value={horoscope}
                  onChange={(e) => setHoroscope(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '11px', marginBottom: '4px', display: 'block' }}>居住城市</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="例如：台北市" 
                style={{ width: '100%', boxSizing: 'border-box' }}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" style={{ width: '100%', marginTop: '10px', background: 'linear-gradient(to bottom, #ffd23f 0%, #ffaa00 100%)', borderColor: '#ffaa00' }}>
              儲存並建立個人空間
            </button>
            <button 
              type="button" 
              className="btn btn-secondary btn-lg" 
              onClick={onLogout} 
              style={{ width: '100%', marginTop: '8px' }}
            >
              返回登入 / 註冊頁面
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthView;
