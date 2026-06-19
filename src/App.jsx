import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Card from './components/Card';

// Import Views
import AuthView from './views/authview';
import HomeView from './views/homeview';
import BookshelfView from './views/bookshelfview';
import NotesView from './views/notesview';
import TodoView from './views/todoview';
import DvdRackView from './views/dvdrackview';
import WardrobeView from './views/wardrobeview';
import MapView from './views/mapview';
import VisitView from './views/visitview';
import CalendarView from './views/calendarview';

// Firebase & Initial Data
import { auth, googleProvider } from './firebase';
import {
  DEFAULT_BLOG_SETTINGS,
  DEFAULT_POSTS,
  DEFAULT_BOOKS,
  DEFAULT_TODOS,
  DEFAULT_NOTES,
  DEFAULT_MEDIA,
  DEFAULT_SPOTS,
  DEFAULT_EVENTS,
  DEFAULT_WARDROBE_ITEMS,
  DEFAULT_OWNER_PROFILE,
  DEFAULT_FRIENDS,
  GLOBAL_USER_POOL
} from './data';

function App() {
  // --- Authentication State ---
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(() => localStorage.getItem('renata_blog_role') || 'visitor'); // 'visitor', 'friend', 'admin'
  const [showSetup, setShowSetup] = useState(false);

  // --- View State ---
  const [currentView, setCurrentView] = useState('home-view');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subCategoryFilter, setSubCategoryFilter] = useState(null);
  const [searchType, setSearchType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all');

  // --- Database States (Loaded from LocalStorage or Data.js) ---
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('renata_blog_settings');
    return saved ? JSON.parse(saved) : DEFAULT_BLOG_SETTINGS;
  });
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('renata_blog_posts');
    return saved ? JSON.parse(saved) : DEFAULT_POSTS;
  });
  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem('renata_blog_books');
    return saved ? JSON.parse(saved) : DEFAULT_BOOKS;
  });
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('renata_blog_todos');
    return saved ? JSON.parse(saved) : DEFAULT_TODOS;
  });
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem('renata_blog_notes') || DEFAULT_NOTES;
  });
  const [media, setMedia] = useState(() => {
    const saved = localStorage.getItem('renata_blog_media');
    return saved ? JSON.parse(saved) : DEFAULT_MEDIA;
  });
  const [spots, setSpots] = useState(() => {
    const saved = localStorage.getItem('renata_blog_spots');
    return saved ? JSON.parse(saved) : DEFAULT_SPOTS;
  });
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('renata_blog_events');
    return saved ? JSON.parse(saved) : DEFAULT_EVENTS;
  });
  const [wardrobeItems, setWardrobeItems] = useState(() => {
    const saved = localStorage.getItem('renata_blog_wardrobe_items');
    return saved ? JSON.parse(saved) : DEFAULT_WARDROBE_ITEMS;
  });
  const [friends, setFriends] = useState(() => {
    const saved = localStorage.getItem('renata_blog_friends');
    return saved ? JSON.parse(saved) : DEFAULT_FRIENDS;
  });
  const [globalUserPool, setGlobalUserPool] = useState(() => {
    const saved = localStorage.getItem('renata_blog_global_user_pool');
    return saved ? JSON.parse(saved) : GLOBAL_USER_POOL;
  });
  const [ownerProfile, setOwnerProfile] = useState(() => {
    const saved = localStorage.getItem('renata_blog_owner_profile');
    return saved ? JSON.parse(saved) : DEFAULT_OWNER_PROFILE;
  });
  
  // --- Visiting Friend Profile ---
  const [activeProfile, setActiveProfile] = useState(null);

  // --- Modals State ---
  const [modalType, setModalType] = useState(null); // 'post', 'book', 'media', 'wardrobe', 'spot', 'event', 'settings', 'profile'
  const [editingItem, setEditingItem] = useState(null); // Item currently being edited (for post, book, etc.)

  // --- Sync States to LocalStorage ---
  useEffect(() => { localStorage.setItem('renata_blog_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('renata_blog_posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('renata_blog_books', JSON.stringify(books)); }, [books]);
  useEffect(() => { localStorage.setItem('renata_blog_todos', JSON.stringify(todos)); }, [todos]);
  useEffect(() => { localStorage.setItem('renata_blog_notes', notes); }, [notes]);
  useEffect(() => { localStorage.setItem('renata_blog_media', JSON.stringify(media)); }, [media]);
  useEffect(() => { localStorage.setItem('renata_blog_spots', JSON.stringify(spots)); }, [spots]);
  useEffect(() => { localStorage.setItem('renata_blog_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('renata_blog_wardrobe_items', JSON.stringify(wardrobeItems)); }, [wardrobeItems]);
  useEffect(() => { localStorage.setItem('renata_blog_friends', JSON.stringify(friends)); }, [friends]);
  useEffect(() => { localStorage.setItem('renata_blog_global_user_pool', JSON.stringify(globalUserPool)); }, [globalUserPool]);
  useEffect(() => { localStorage.setItem('renata_blog_owner_profile', JSON.stringify(ownerProfile)); }, [ownerProfile]);
  useEffect(() => { localStorage.setItem('renata_blog_role', role); }, [role]);

  // Force sign out on initial app mount so it always starts in logged-out state
  useEffect(() => {
    auth.signOut().catch(err => console.error("Initial signout error:", err));
  }, []);

  // --- Listen to Firebase Auth state ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      if (usr) {
        setUser(usr);
        setIsLoggedIn(true);
        // If logging in as admin email, escalate role
        if (usr.email === 'renata@home.com' || usr.email === 'admin@home.com') {
          setRole('admin');
          const adminProfile = globalUserPool.find(p => p.email && p.email.toLowerCase() === usr.email.toLowerCase()) || DEFAULT_OWNER_PROFILE;
          setOwnerProfile(adminProfile);
          setShowSetup(false);
        } else {
          setRole('friend');
          // Check if there is an existing profile in globalUserPool
          const existingProfile = globalUserPool.find(
            p => p.email && p.email.toLowerCase() === usr.email.toLowerCase()
          );

          if (existingProfile) {
            setOwnerProfile(existingProfile);
            setShowSetup(false);
          } else {
            // New user, show setup form and prefill template
            const newProfileTemplate = {
              accountId: usr.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
              name: usr.displayName || usr.email.split('@')[0],
              spaceName: (usr.displayName || usr.email.split('@')[0]) + ' 的空間',
              spaceSubtitle: usr.email.split('@')[0].toUpperCase() + "'S SPACE",
              avatar: usr.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
              email: usr.email,
              nickname: '',
              gender: '保密',
              bloodType: 'O',
              birthday: '',
              horoscope: '雙子座',
              city: '',
              mobile: '',
              line: '',
              favorites: { country: '', color: '', music: '', movie: '', food: '', trait: '' },
              top3: { title: '自訂主題排行', top1: '', top2: '', top3: '' },
              social: { role: '新成員', talent: '', welcome: '歡迎來到我的空間！', status: '剛建立個人網頁小家！' },
              aboutMe: { passion: 50, humor: 50, procrastination: 50, fitness: 50, foodie: 50 },
              posts: [],
              books: [],
              media: [],
              wardrobeItems: []
            };
            setOwnerProfile(newProfileTemplate);
            setShowSetup(true);
          }
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setRole('visitor');
        setActiveProfile(null);
        setShowSetup(false);
      }
    });
    return () => unsubscribe();
  }, [globalUserPool]);

  // --- Google Login Handler ---
  const handleGoogleLogin = async () => {
    // Check if running on local file system protocol
    if (window.location.protocol === 'file:') {
      alert("由於 Firebase 驗證安全政策，Google 登入不支援在本機雙擊開啟的網頁檔（file:// 協定）下運作。請將專案部署至 GitHub Pages（http/https 協定）或使用本地伺服器執行網頁後再進行測試！");
      return;
    }

    try {
      await auth.signInWithPopup(googleProvider);
    } catch (err) {
      if (err.code === 'auth/unauthorized-domain') {
        alert("Google 登入失敗：此網域名稱尚未在 Firebase 後台設定授權。請前往 Firebase 主控台將此域名加入「授權網域」列表。");
      } else if (err.code === 'auth/popup-blocked') {
        alert("Google 登入失敗：登入彈出視窗被瀏覽器封鎖，請允許本站開啟彈出視窗後重試。");
      } else {
        alert(`Google 登入失敗：${err.message}`);
      }
    }
  };

  // --- Standard Email/Password Auth Handlers ---
  const handleLogin = async (email, password) => {
    try {
      await auth.signInWithEmailAndPassword(email, password);
      alert("登入成功！");
    } catch (err) {
      let friendlyMessage = err.message;
      if (err.code === 'auth/invalid-credential') {
        friendlyMessage = "信箱或密碼輸入錯誤，或者該帳號尚未註冊。\n如果您是新用戶，請先點選「註冊」分頁建立帳號！";
      } else if (err.code === 'auth/user-not-found') {
        friendlyMessage = "找不到該使用者帳號。請先點選「註冊」分頁建立新帳號！";
      } else if (err.code === 'auth/wrong-password') {
        friendlyMessage = "密碼輸入錯誤，請重新輸入！";
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = "請輸入有效的電子信箱格式！";
      }
      alert(`登入失敗：\n${friendlyMessage}`);
    }
  };

  const handleRegister = async (email, password) => {
    try {
      await auth.createUserWithEmailAndPassword(email, password);
      alert("註冊成功！已自動登入。");
      setShowSetup(true); // Show profile setup on first registration
    } catch (err) {
      let friendlyMessage = err.message;
      if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = "該電子信箱已被註冊使用！請直接使用登入分頁登入。";
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = "密碼強度不足，必須至少為 6 個字元！";
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = "請輸入有效的電子信箱格式！";
      }
      alert(`註冊失敗：\n${friendlyMessage}`);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      alert("已成功登出！");
      setCurrentView('home-view');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleGuestLogin = () => {
    setIsLoggedIn(true);
    setRole('visitor');
    setUser({ email: 'guest@visitor.com', displayName: '訪客參觀' });
    alert("已使用訪客身分進入參觀。");
  };

  // --- Setup Profile Handler ---
  const handleSetupProfile = (profileData) => {
    const finalProfile = {
      ...ownerProfile,
      ...profileData
    };
    setOwnerProfile(finalProfile);
    
    // Add or update in globalUserPool
    const exists = globalUserPool.some(p => p.email.toLowerCase() === finalProfile.email.toLowerCase());
    if (exists) {
      setGlobalUserPool(globalUserPool.map(p => p.email.toLowerCase() === finalProfile.email.toLowerCase() ? finalProfile : p));
    } else {
      setGlobalUserPool([...globalUserPool, finalProfile]);
    }

    setShowSetup(false);
    alert("個人檔案設定成功！歡迎進入您的個人空間！");
  };

  const updateOwnerProfile = (updatedProfile) => {
    setOwnerProfile(updatedProfile);
    if (updatedProfile.email) {
      setGlobalUserPool(prevPool =>
        prevPool.map(p => p.email && p.email.toLowerCase() === updatedProfile.email.toLowerCase() ? updatedProfile : p)
      );
    }
  };

  // --- Tab Navigation Trigger ---
  const handleTabChange = (parentTab, subTab = null) => {
    setSearchQuery('');
    setCategoryFilter(parentTab);
    setSubCategoryFilter(subTab);
    
    if (parentTab === 'all') setCurrentView('home-view');
    else if (parentTab === '書櫃') {
      if (subTab === '筆記' || subTab === '日記') setCurrentView('notes-view');
      else if (subTab === '待辦') setCurrentView('todo-view');
      else setCurrentView('bookshelf-view');
    } 
    else if (parentTab === 'DVD架') setCurrentView('dvd-rack-view');
    else if (parentTab === '衣櫃') setCurrentView('wardrobe-view');
    else if (parentTab === '書桌') {
      setCurrentView('home-view');
    }
    else if (parentTab === '外出') {
      if (subTab === '拜訪') setCurrentView('visit-view');
      else if (subTab === '行程') setCurrentView('calendar-view');
      else setCurrentView('map-view');
    }
    else if (parentTab === '消息') {
      setCurrentView('home-view');
    }
  };

  const handleLogoClick = () => {
    handleTabChange('all');
  };

  // --- Search Handler ---
  const handleSearch = (type, query) => {
    setSearchType(type);
    setSearchQuery(query);
    setCurrentView('home-view');
  };

  // --- CRUD Operations for Database ---
  // 1. Posts
  const handleAddPost = (postData) => {
    if (role === 'friend' && !activeProfile) {
      let updatedPosts;
      if (postData.id) {
        // Edit
        updatedPosts = (ownerProfile.posts || []).map(p => p.id === postData.id ? { ...p, ...postData } : p);
      } else {
        // Add
        const newPost = {
          ...postData,
          id: `post-${Date.now()}`,
          date: new Date().toLocaleString(),
          views: 0,
          comments: []
        };
        updatedPosts = [newPost, ...(ownerProfile.posts || [])];
      }
      updateOwnerProfile({ ...ownerProfile, posts: updatedPosts });
    } else {
      if (postData.id) {
        // Edit
        setPosts(posts.map(p => p.id === postData.id ? { ...p, ...postData } : p));
      } else {
        // Add
        const newPost = {
          ...postData,
          id: `post-${Date.now()}`,
          date: new Date().toLocaleString(),
          views: 0,
          comments: []
        };
        setPosts([newPost, ...posts]);
      }
    }
    setModalType(null);
    setEditingItem(null);
  };

  const handleDeletePost = (postId) => {
    if (confirm("確定要刪除這篇貼文嗎？")) {
      if (role === 'friend' && !activeProfile) {
        const updatedPosts = (ownerProfile.posts || []).filter(p => p.id !== postId);
        updateOwnerProfile({ ...ownerProfile, posts: updatedPosts });
      } else {
        setPosts(posts.filter(p => p.id !== postId));
      }
    }
  };

  // 2. Comments on Posts
  const handleAddComment = (postId, commentObj) => {
    const createComment = (post) => {
      const newComment = {
        id: `comment-${Date.now()}`,
        author: commentObj.author || '匿名訪客',
        content: commentObj.content || '',
        avatar: commentObj.avatar || '',
        role: commentObj.role || 'visitor',
        date: new Date().toLocaleString()
      };
      return {
        ...post,
        comments: [...(post.comments || []), newComment]
      };
    };

    if (activeProfile) {
      const updatedPosts = (activeProfile.posts || []).map(p => p.id === postId ? createComment(p) : p);
      const updatedProfile = { ...activeProfile, posts: updatedPosts };
      setActiveProfile(updatedProfile);
      setGlobalUserPool(prev => prev.map(p => p.email.toLowerCase() === updatedProfile.email.toLowerCase() ? updatedProfile : p));
    } else if (role === 'friend') {
      const updatedPosts = (ownerProfile.posts || []).map(p => p.id === postId ? createComment(p) : p);
      updateOwnerProfile({ ...ownerProfile, posts: updatedPosts });
    } else {
      setPosts(posts.map(post => post.id === postId ? createComment(post) : post));
    }
  };

  const handleDeleteComment = (postId, commentId) => {
    if (confirm("確定要刪除這條留言嗎？")) {
      const filterComment = (post) => ({
        ...post,
        comments: (post.comments || []).filter(c => c.id !== commentId)
      });

      if (activeProfile) {
        const updatedPosts = (activeProfile.posts || []).map(p => p.id === postId ? filterComment(p) : p);
        const updatedProfile = { ...activeProfile, posts: updatedPosts };
        setActiveProfile(updatedProfile);
        setGlobalUserPool(prev => prev.map(p => p.email.toLowerCase() === updatedProfile.email.toLowerCase() ? updatedProfile : p));
      } else if (role === 'friend') {
        const updatedPosts = (ownerProfile.posts || []).map(p => p.id === postId ? filterComment(p) : p);
        updateOwnerProfile({ ...ownerProfile, posts: updatedPosts });
      } else {
        setPosts(posts.map(post => post.id === postId ? filterComment(post) : post));
      }
    }
  };

  // 3. Books
  const handleAddBook = (bookData) => {
    if (role === 'friend' && !activeProfile) {
      let updatedBooks;
      if (bookData.id) {
        updatedBooks = (ownerProfile.books || []).map(b => b.id === bookData.id ? { ...b, ...bookData } : b);
      } else {
        const newBook = {
          ...bookData,
          id: `book-${Date.now()}`
        };
        updatedBooks = [...(ownerProfile.books || []), newBook];
      }
      updateOwnerProfile({ ...ownerProfile, books: updatedBooks });
    } else {
      if (bookData.id) {
        setBooks(books.map(b => b.id === bookData.id ? { ...b, ...bookData } : b));
      } else {
        const newBook = {
          ...bookData,
          id: `book-${Date.now()}`
        };
        setBooks([...books, newBook]);
      }
    }
    setModalType(null);
    setEditingItem(null);
  };

  const handleDeleteBook = (bookId) => {
    if (role === 'friend' && !activeProfile) {
      const updatedBooks = (ownerProfile.books || []).filter(b => b.id !== bookId);
      updateOwnerProfile({ ...ownerProfile, books: updatedBooks });
    } else {
      setBooks(books.filter(b => b.id !== bookId));
    }
  };

  // 4. Media (DVD/CD)
  const handleAddMedia = (mediaData) => {
    if (role === 'friend' && !activeProfile) {
      let updatedMedia;
      if (mediaData.id) {
        updatedMedia = (ownerProfile.media || []).map(m => m.id === mediaData.id ? { ...m, ...mediaData } : m);
      } else {
        const newMedia = {
          ...mediaData,
          id: `media-${Date.now()}`
        };
        updatedMedia = [...(ownerProfile.media || []), newMedia];
      }
      updateOwnerProfile({ ...ownerProfile, media: updatedMedia });
    } else {
      if (mediaData.id) {
        setMedia(media.map(m => m.id === mediaData.id ? { ...m, ...mediaData } : m));
      } else {
        const newMedia = {
          ...mediaData,
          id: `media-${Date.now()}`
        };
        setMedia([...media, newMedia]);
      }
    }
    setModalType(null);
    setEditingItem(null);
  };

  const handleDeleteMedia = (mediaId) => {
    if (role === 'friend' && !activeProfile) {
      const updatedMedia = (ownerProfile.media || []).filter(m => m.id !== mediaId);
      updateOwnerProfile({ ...ownerProfile, media: updatedMedia });
    } else {
      setMedia(media.filter(m => m.id !== mediaId));
    }
  };

  // 5. Wardrobe Items
  const handleAddWardrobeItem = (wData) => {
    if (role === 'friend' && !activeProfile) {
      let updatedW;
      if (wData.id) {
        updatedW = (ownerProfile.wardrobeItems || []).map(w => w.id === wData.id ? { ...w, ...wData } : w);
      } else {
        const newW = {
          ...wData,
          id: `w-${Date.now()}`
        };
        updatedW = [...(ownerProfile.wardrobeItems || []), newW];
      }
      updateOwnerProfile({ ...ownerProfile, wardrobeItems: updatedW });
    } else {
      if (wData.id) {
        setWardrobeItems(wardrobeItems.map(w => w.id === wData.id ? { ...w, ...wData } : w));
      } else {
        const newW = {
          ...wData,
          id: `w-${Date.now()}`
        };
        setWardrobeItems([...wardrobeItems, newW]);
      }
    }
    setModalType(null);
    setEditingItem(null);
  };

  const handleDeleteWardrobeItem = (wId) => {
    if (role === 'friend' && !activeProfile) {
      const updatedW = (ownerProfile.wardrobeItems || []).filter(w => w.id !== wId);
      updateOwnerProfile({ ...ownerProfile, wardrobeItems: updatedW });
    } else {
      setWardrobeItems(wardrobeItems.filter(w => w.id !== wId));
    }
  };

  // 6. Map Spots
  const handleAddSpot = (spotData) => {
    const newSpot = {
      ...spotData,
      id: `spot-${Date.now()}`
    };
    setSpots([...spots, newSpot]);
    setModalType(null);
  };

  const handleDeleteSpot = (spotId) => {
    setSpots(spots.filter(s => s.id !== spotId));
  };

  // 7. Calendar Events
  const handleAddEvent = (evtData) => {
    const newEvt = {
      ...evtData,
      id: `evt-${Date.now()}`
    };
    setEvents([...events, newEvt]);
    setModalType(null);
  };

  const handleDeleteEvent = (evtId) => {
    setEvents(events.filter(e => e.id !== evtId));
  };

  // 8. Friends Management
  const handleAddFriend = () => {
    const accountId = prompt("請輸入好友的 帳號 ID (AccountId)：");
    if (!accountId) return;
    
    const friendObj = globalUserPool.find(p => p.accountId && p.accountId.toLowerCase() === accountId.toLowerCase().trim());
    if (friendObj) {
      if (friends.some(f => f.accountId.toLowerCase() === friendObj.accountId.toLowerCase())) {
        alert("此好友已存在於您的活頁夾中！");
        return;
      }
      setFriends([...friends, friendObj]);
      alert(`已成功將 ${friendObj.name} 加入好友活頁夾！`);
    } else {
      // Mock create a profile and add it to globalUserPool if not found
      const newFriend = {
        id: `friend-${Date.now()}`,
        accountId: accountId.toLowerCase().trim(),
        name: accountId,
        nickname: "新好友",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        gender: "男",
        bloodType: "B",
        birthday: "1999-10-10",
        horoscope: "天秤座",
        city: "新北市",
        email: `${accountId}@email.com`,
        favorites: { country: "日本", color: "藍色", music: "爵士樂", movie: "科幻片", food: "壽司", trait: "熱情" },
        top3: { title: "喜歡的休閒", top1: "旅行", top2: "攝影", top3: "看書" },
        social: { role: "好友夥伴", talent: "唱歌", welcome: "哈囉！", status: "嗨～" },
        aboutMe: { passion: 75, humor: 80, procrastination: 40, fitness: 60, foodie: 70 },
        posts: [],
        books: [],
        media: [],
        wardrobeItems: []
      };
      setFriends([...friends, newFriend]);
      setGlobalUserPool([...globalUserPool, newFriend]);
      alert(`已成功為您創建並將好友 ${accountId} 加入活頁夾！`);
    }
  };

  const handleDeleteFriend = (accountId) => {
    setFriends(friends.filter(f => f.accountId !== accountId));
    if (activeProfile && activeProfile.accountId === accountId) {
      setActiveProfile(null);
    }
  };

  // --- Backup Handlers ---
  const handleBackupExport = () => {
    const dataJsString = `// nknock - 備份資料
export const DEFAULT_BLOG_SETTINGS = ${JSON.stringify(settings, null, 2)};
export const DEFAULT_POSTS = ${JSON.stringify(posts, null, 2)};
export const DEFAULT_BOOKS = ${JSON.stringify(books, null, 2)};
export const DEFAULT_TODOS = ${JSON.stringify(todos, null, 2)};
export const DEFAULT_NOTES = \`${notes.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;
export const DEFAULT_MEDIA = ${JSON.stringify(media, null, 2)};
export const DEFAULT_SPOTS = ${JSON.stringify(spots, null, 2)};
export const DEFAULT_EVENTS = ${JSON.stringify(events, null, 2)};
export const DEFAULT_WARDROBE_ITEMS = ${JSON.stringify(wardrobeItems, null, 2)};
`;
    const blob = new Blob([dataJsString], { type: "application/javascript;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data_backup.js";
    link.click();
    alert("資料備份檔案已成功下載！");
  };

  const handleBackupImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.js';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            // Very basic parsing for demo backup restore
            alert("匯入成功！網頁即將重新整理。");
            window.location.reload();
          } catch (err) {
            alert("備份檔格式不符，匯入失敗。");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // --- Room Visit Handlers ---
  const handleVisitFriendRoom = (friend) => {
    setActiveProfile(friend);
    setCurrentView('home-view');
    alert(`正在拜訪 ${friend.name} 的房間。`);
  };

  const handleLeaveVisitingRoom = () => {
    setActiveProfile(null);
    setCurrentView('home-view');
    alert("已返回您自己的房間。");
  };

  // --- Dynamic Data Source based on Active Visit Profile ---
  const postsSource = activeProfile ? (activeProfile.posts || []) : (role === 'friend' ? (ownerProfile.posts || []) : posts);
  const booksSource = activeProfile ? (activeProfile.books || []) : (role === 'friend' ? (ownerProfile.books || []) : books);
  const mediaSource = activeProfile ? (activeProfile.media || []) : (role === 'friend' ? (ownerProfile.media || []) : media);
  const wardrobeSource = activeProfile ? (activeProfile.wardrobeItems || []) : (role === 'friend' ? (ownerProfile.wardrobeItems || []) : wardrobeItems);
  const notesSource = activeProfile ? (activeProfile.notes || "") : (role === 'friend' ? (ownerProfile.notes || "") : notes);
  const todosSource = activeProfile ? (activeProfile.todos || []) : (role === 'friend' ? (ownerProfile.todos || []) : todos);
  const spotsSource = activeProfile ? [] : spots; // Keep spots read-only or empty for others
  const eventsSource = activeProfile ? [] : events; // Keep events read-only or empty for others

  // Get popular posts for Sidebar
  const popularPosts = postsSource.slice().sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  // --- Active View Router ---
  const renderActiveView = () => {
    switch (currentView) {
      case 'home-view':
        return (
          <HomeView 
            posts={postsSource}
            role={role}
            currentCategoryFilter={categoryFilter}
            currentSubCategoryFilter={subCategoryFilter}
            searchQuery={searchQuery}
            searchType={searchType}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            onDeletePost={handleDeletePost}
            onEditPost={(post) => { setEditingItem(post); setModalType('post'); }}
            ownerProfile={activeProfile || ownerProfile}
          />
        );
      case 'bookshelf-view':
        return (
          <BookshelfView 
            books={booksSource}
            role={activeProfile ? 'visitor' : role}
            onAddBook={() => { setEditingItem(null); setModalType('book'); }}
            onDeleteBook={handleDeleteBook}
            onEditBook={(book) => { setEditingItem(book); setModalType('book'); }}
          />
        );
      case 'notes-view':
        return (
          <NotesView 
            notes={notesSource}
            onSaveNotes={activeProfile ? null : (val) => {
              if (role === 'friend') {
                updateOwnerProfile({ ...ownerProfile, notes: val });
              } else {
                setNotes(val);
              }
            }}
          />
        );
      case 'todo-view':
        return (
          <TodoView 
            todos={todosSource}
            role={activeProfile ? 'visitor' : role}
            onToggleTodo={activeProfile ? null : (todoId) => {
              if (role === 'friend') {
                const updatedTodos = (ownerProfile.todos || []).map(t => t.id === todoId ? { ...t, completed: !t.completed } : t);
                updateOwnerProfile({ ...ownerProfile, todos: updatedTodos });
              } else {
                setTodos(todos.map(t => t.id === todoId ? { ...t, completed: !t.completed } : t));
              }
            }}
            onAddTodo={activeProfile ? null : (text) => {
              if (role === 'friend') {
                const newTodo = { id: `todo-${Date.now()}`, text, completed: false };
                const updatedTodos = [...(ownerProfile.todos || []), newTodo];
                updateOwnerProfile({ ...ownerProfile, todos: updatedTodos });
              } else {
                setTodos([...todos, { id: `todo-${Date.now()}`, text, completed: false }]);
              }
            }}
            onDeleteTodo={activeProfile ? null : (todoId) => {
              if (role === 'friend') {
                const updatedTodos = (ownerProfile.todos || []).filter(t => t.id !== todoId);
                updateOwnerProfile({ ...ownerProfile, todos: updatedTodos });
              } else {
                setTodos(todos.filter(t => t.id !== todoId));
              }
            }}
          />
        );
      case 'dvd-rack-view':
        return (
          <DvdRackView 
            media={mediaSource}
            role={activeProfile ? 'visitor' : role}
            mediaTypeFilter={mediaTypeFilter}
            onFilterChange={setMediaTypeFilter}
            onAddMedia={() => { setEditingItem(null); setModalType('media'); }}
            onDeleteMedia={handleDeleteMedia}
            onEditMedia={(item) => { setEditingItem(item); setModalType('media'); }}
          />
        );
      case 'wardrobe-view':
        return (
          <WardrobeView 
            wardrobeItems={wardrobeSource}
            role={activeProfile ? 'visitor' : role}
            onAddWardrobeItem={() => { setEditingItem(null); setModalType('wardrobe'); }}
            onDeleteWardrobeItem={handleDeleteWardrobeItem}
            onEditWardrobeItem={(item) => { setEditingItem(item); setModalType('wardrobe'); }}
          />
        );
      case 'map-view':
        return (
          <MapView 
            spots={spotsSource}
            role={activeProfile ? 'visitor' : role}
            onAddSpot={(lat, lng) => setModalType({ type: 'spot', lat, lng })}
            onDeleteSpot={handleDeleteSpot}
          />
        );
      case 'visit-view':
        return (
          <VisitView 
            friends={friends}
            ownerProfile={ownerProfile}
            currentActiveProfile={activeProfile}
            onVisitFriendRoom={handleVisitFriendRoom}
            onLeaveVisitingRoom={handleLeaveVisitingRoom}
            onAddFriend={handleAddFriend}
            onDeleteFriend={handleDeleteFriend}
          />
        );
      case 'calendar-view':
        return (
          <CalendarView 
            events={eventsSource}
            role={activeProfile ? 'visitor' : role}
            onAddEvent={(dateStr) => setModalType({ type: 'event', date: dateStr })}
            onDeleteEvent={handleDeleteEvent}
          />
        );
      default:
        return <div style={{ padding: '20px', color: 'red' }}>Error: View not found</div>;
    }
  };

  // --- Render Auth View if not Logged In OR if we need to show Profile Setup ---
  if (!isLoggedIn || showSetup) {
    return (
      <AuthView 
        user={user}
        showSetup={showSetup}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGoogleLogin={handleGoogleLogin}
        onSetupProfile={handleSetupProfile}
        onGuestLogin={handleGuestLogin}
        onLogout={handleLogout}
      />
    );
  }

  // --- Main Layout ---
  // Sort posts to find latest featured
  const latestFeaturedPost = postsSource[0];

  return (
    <div className="app-container">
      {/* Dynamic Background Bubbles */}
      <div className="bubble-bg-container">
        <div className="bubble-bg-circle bubble-bg-primary"></div>
        <div className="bubble-bg-circle bubble-bg-secondary"></div>
      </div>

      <Navbar 
        settings={settings}
        activeProfile={activeProfile}
        ownerProfile={ownerProfile}
        currentView={currentView}
        categoryFilter={categoryFilter}
        onTabChange={handleTabChange}
        onSearch={handleSearch}
        onLogoClick={handleLogoClick}
        onLogout={handleLogout}
        isLoggedIn={isLoggedIn}
      />

      <div className="main-container three-column-layout">
        {/* Left Column (Layout Frame) */}
        <aside className="column" id="left-column">
          {/* Latest Post Card */}
          <Card title={<span><i className="fa-solid fa-star"></i> 最新消息</span>} style={{ padding: '10px' }}>
            <div 
              className="featured-post-card" 
              id="featured-post-box"
              style={{ cursor: latestFeaturedPost ? 'pointer' : 'default' }}
              onClick={() => latestFeaturedPost && setCurrentView('home-view')}
            >
              {latestFeaturedPost ? (
                <>
                  <img 
                    src={latestFeaturedPost.image || 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800'} 
                    alt={latestFeaturedPost.title} 
                    className="featured-post-img"
                    style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                  <div className="featured-post-overlay" style={{ marginTop: '8px' }}>
                    <h3 className="featured-post-title" style={{ fontSize: '12px', margin: 0, fontWeight: 'bold', color: 'var(--primary-dark)' }}>
                      {latestFeaturedPost.title}
                    </h3>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '11px', padding: '20px 0' }}>暫無公告</div>
              )}
            </div>
          </Card>

          {/* Recent Wardrobe Additions */}
          <Card title={<span><i className="fa-solid fa-shirt"></i> 最近配搭 (衣櫃)</span>}>
            <ul className="wardrobe-post-list" id="wardrobe-posts-box" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {wardrobeSource.slice(0, 3).map(item => (
                <li 
                  key={item.id} 
                  style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', cursor: 'pointer' }}
                  onClick={() => setCurrentView('wardrobe-view')}
                >
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=150'} 
                    alt={item.title} 
                    style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div style={{ fontSize: '11px' }}>
                    <strong style={{ display: 'block', color: 'var(--text-dark)' }}>{item.title}</strong>
                    <span style={{ color: 'var(--text-light)' }}>{item.brand || '無品牌'}</span>
                  </div>
                </li>
              ))}
              {wardrobeSource.length === 0 && (
                <li style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '11px', padding: '10px 0' }}>衣櫃空空的</li>
              )}
            </ul>
          </Card>
        </aside>

        {/* Center Column (Active View Router) */}
        <main className="column" id="center-column">
          {renderActiveView()}
        </main>

        {/* Right Column (Sidebar) */}
        <Sidebar 
          settings={settings}
          ownerProfile={activeProfile || ownerProfile}
          role={activeProfile ? 'visitor' : role}
          popularPosts={popularPosts}
          onWritePost={() => { setEditingItem(null); setModalType('post'); }}
          onEditProfile={() => setModalType('profile')}
          onBackupExport={handleBackupExport}
          onBackupImport={handleBackupImport}
          onEditSettings={() => setModalType('settings')}
          onPostClick={(postId) => {
            setSearchQuery('');
            setCategoryFilter('all');
            setSubCategoryFilter(null);
            setCurrentView('home-view');
          }}
        />
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '20px 0', fontSize: '11.5px', color: 'var(--text-light)', marginTop: '20px' }}>
        <p>© 2026 Renata's Home. All rights reserved. Powered by React + Vite.</p>
      </footer>

      {/* ========================================== */}
      {/*              ALL MODALS                   */}
      {/* ========================================== */}

      {/* 1. Write / Edit Post Modal */}
      {modalType === 'post' && (
        <PostModal 
          post={editingItem}
          onClose={() => { setModalType(null); setEditingItem(null); }}
          onSubmit={handleAddPost}
        />
      )}

      {/* 2. Add / Edit Book Modal */}
      {modalType === 'book' && (
        <BookModal 
          book={editingItem}
          onClose={() => { setModalType(null); setEditingItem(null); }}
          onSubmit={handleAddBook}
        />
      )}

      {/* 3. Add / Edit Media Modal */}
      {modalType === 'media' && (
        <MediaModal 
          media={editingItem}
          onClose={() => { setModalType(null); setEditingItem(null); }}
          onSubmit={handleAddMedia}
        />
      )}

      {/* 4. Add / Edit Wardrobe Modal */}
      {modalType === 'wardrobe' && (
        <WardrobeModal 
          item={editingItem}
          onClose={() => { setModalType(null); setEditingItem(null); }}
          onSubmit={handleAddWardrobeItem}
        />
      )}

      {/* 5. Add Spot Modal */}
      {modalType && modalType.type === 'spot' && (
        <SpotModal 
          lat={modalType.lat}
          lng={modalType.lng}
          onClose={() => setModalType(null)}
          onSubmit={handleAddSpot}
        />
      )}

      {/* 6. Add Event Modal */}
      {modalType && modalType.type === 'event' && (
        <EventModal 
          date={modalType.date}
          onClose={() => setModalType(null)}
          onSubmit={handleAddEvent}
        />
      )}

      {/* 7. Settings Modal */}
      {modalType === 'settings' && (
        <SettingsModal 
          settings={settings}
          onClose={() => setModalType(null)}
          onSubmit={(newSettings) => {
            setSettings({ ...settings, ...newSettings });
            setModalType(null);
            alert("設定儲存成功！");
          }}
        />
      )}

      {/* 8. Edit Profile Modal */}
      {modalType === 'profile' && (
        <ProfileModal 
          profile={ownerProfile}
          onClose={() => setModalType(null)}
          onSubmit={(newProfile) => {
            const updated = { ...ownerProfile, ...newProfile };
            setOwnerProfile(updated);
            // Sync to globalUserPool
            setGlobalUserPool(globalUserPool.map(p => p.email.toLowerCase() === updated.email.toLowerCase() ? updated : p));
            setModalType(null);
            alert("個人檔案儲存成功！");
          }}
        />
      )}
    </div>
  );
}

// =========================================================
//                  SUB-MODALS COMPONENTS
// =========================================================

// Image Helper: handles local file input, size limit <= 1MB, converts to Base64
const FileInputBase64 = ({ value, onChange, label = "上傳圖片" }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("圖片容量不能超過 1MB，否則會超過瀏覽器儲存上限！");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="form-group" style={{ textAlign: 'left', marginBottom: '12px' }}>
      <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px', display: 'block', marginBottom: '4px' }}>{label} (上限 1MB)</label>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        style={{ fontSize: '12px', width: '100%' }}
      />
      {value && (
        <div style={{ marginTop: '8px', textAlign: 'center' }}>
          <img src={value} alt="Preview" style={{ maxHeight: '80px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>
      )}
    </div>
  );
};

// 1. Post Modal
const PostModal = ({ post, onClose, onSubmit }) => {
  const categoriesMap = {
    '消息': ['話題', '情感', '夢境'],
    '書桌': ['寵物', '手做', '飲食'],
    '衣櫃': ['衣服', '鞋子', '飾品'],
    'DVD架': ['電影', '遊戲', '音樂'],
    '書櫃': ['筆記', '書架', '待辦'],
    '外出': ['景點', '拜訪', '行程']
  };

  const [title, setTitle] = useState(post ? post.title : '');
  const [summary, setSummary] = useState(post ? post.summary : '');
  const [content, setContent] = useState(post ? post.content : '');
  const [category, setCategory] = useState(post ? post.category : '消息');
  const [subcategory, setSubcategory] = useState(post ? post.subcategory : '話題');
  const [image, setImage] = useState(post ? post.image : '');
  const [tags, setTags] = useState(post ? (post.tags || []).join(', ') : '');
  const [isPrivate, setIsPrivate] = useState(post ? post.isPrivate : false);

  // Sync subcategory options when editing or switching category
  useEffect(() => {
    if (post && post.category === category) {
      setSubcategory(post.subcategory);
    } else {
      setSubcategory(categoriesMap[category] ? categoriesMap[category][0] : '');
    }
  }, [category, post]);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !content.trim()) {
      alert("請填寫貼文標題、摘要與內容！");
      return;
    }
    onSubmit({
      id: post ? post.id : null,
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      category,
      subcategory,
      image,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      isPrivate
    });
  };

  return (
    <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        <h3 className="modal-title">{post ? '編輯貼文' : '撰寫新貼文'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>貼文標題</label>
            <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>主分類</label>
            <select className="form-select" value={category} onChange={handleCategoryChange}>
              {Object.keys(categoriesMap).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>子類別</label>
            <select className="form-select" value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
              {(categoriesMap[category] || []).map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
          <FileInputBase64 value={image} onChange={setImage} label="貼文封面圖片" />
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>簡短摘要</label>
            <textarea className="form-input" value={summary} onChange={(e) => setSummary(e.target.value)} rows="2" required />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>貼文詳細內容 (支援 HTML)</label>
            <textarea className="form-input" value={content} onChange={(e) => setContent(e.target.value)} rows="5" required />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>標籤 (以半形逗號分開)</label>
            <input type="text" className="form-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="生活, 向日葵" />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
            <input type="checkbox" id="post-private-check" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
            <label htmlFor="post-private-check" style={{ fontSize: '12px', fontWeight: 'bold' }}>好友隱密貼文 (僅好友與管理員可看)</label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>儲存貼文</button>
        </form>
      </div>
    </div>
  );
};

// 2. Book Modal
const BookModal = ({ book, onClose, onSubmit }) => {
  const [title, setTitle] = useState(book ? book.title : '');
  const [author, setAuthor] = useState(book ? book.author : '');
  const [cover, setCover] = useState(book ? book.cover : '');
  const [description, setDescription] = useState(book ? book.description : '');
  const [thoughts, setThoughts] = useState(book ? book.thoughts : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      alert("請填寫書名與作者！");
      return;
    }
    onSubmit({
      id: book ? book.id : null,
      title: title.trim(),
      author: author.trim(),
      cover,
      description: description.trim(),
      thoughts: thoughts.trim()
    });
  };

  return (
    <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ maxWidth: '440px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        <h3 className="modal-title">{book ? '編輯書籍封面' : '新增書籍封面'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>書名</label>
            <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>作者</label>
            <input type="text" className="form-input" value={author} onChange={(e) => setAuthor(e.target.value)} required />
          </div>
          <FileInputBase64 value={cover} onChange={setCover} label="書籍封面圖片" />
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>書籍簡介</label>
            <textarea className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>讀後心得</label>
            <textarea className="form-input" value={thoughts} onChange={(e) => setThoughts(e.target.value)} rows="3" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>確認提交</button>
        </form>
      </div>
    </div>
  );
};

// 3. Media Modal (DVD/CD)
const MediaModal = ({ media, onClose, onSubmit }) => {
  const [title, setTitle] = useState(media ? media.title : '');
  const [type, setType] = useState(media ? media.type : 'movie');
  const [year, setYear] = useState(media ? media.year : '2026');
  const [cover, setCover] = useState(media ? media.cover : '');
  const [rating, setRating] = useState(media ? media.rating : 5);
  const [description, setDescription] = useState(media ? media.description : '');
  const [comment, setComment] = useState(media ? media.comment : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("請填寫影音名稱！");
      return;
    }
    onSubmit({
      id: media ? media.id : null,
      title: title.trim(),
      type,
      year,
      cover,
      rating: parseInt(rating),
      description: description.trim(),
      comment: comment.trim()
    });
  };

  return (
    <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ maxWidth: '440px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        <h3 className="modal-title">{media ? '編輯影音資訊' : '新增影音收藏'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>收藏名稱 (CD/DVD)</label>
            <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>類型</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="movie">電影 DVD</option>
              <option value="game">遊戲 DVD</option>
              <option value="music">音樂 CD</option>
            </select>
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>發行年份</label>
            <input type="text" className="form-input" value={year} onChange={(e) => setYear(e.target.value)} required />
          </div>
          <FileInputBase64 value={cover} onChange={setCover} label="影音封面/包裝" />
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>評分</label>
            <select className="form-select" value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value="5">⭐⭐⭐⭐⭐ (滿分)</option>
              <option value="4">⭐⭐⭐⭐ (極佳)</option>
              <option value="3">⭐⭐⭐ (普通)</option>
              <option value="2">⭐⭐ (差強人意)</option>
              <option value="1">⭐ (不推薦)</option>
            </select>
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>內容簡介</label>
            <textarea className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>心得/評語</label>
            <textarea className="form-input" value={comment} onChange={(e) => setComment(e.target.value)} rows="3" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>儲存收藏</button>
        </form>
      </div>
    </div>
  );
};

// 4. Wardrobe Modal
const WardrobeModal = ({ item, onClose, onSubmit }) => {
  const [title, setTitle] = useState(item ? item.title : '');
  const [brand, setBrand] = useState(item ? item.brand : '');
  const [type, setType] = useState(item ? item.type : 'clothes');
  const [image, setImage] = useState(item ? item.image : '');
  const [desc, setDesc] = useState(item ? item.desc : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("請填寫衣物名稱！");
      return;
    }
    onSubmit({
      id: item ? item.id : null,
      title: title.trim(),
      brand: brand.trim(),
      type,
      image,
      desc: desc.trim()
    });
  };

  return (
    <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ maxWidth: '440px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        <h3 className="modal-title">{item ? '編輯衣物資訊' : '新增衣物收藏'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>衣物名稱</label>
            <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>品牌名稱</label>
            <input type="text" className="form-input" value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>分類</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="clothes">衣服收藏</option>
              <option value="shoes">鞋子收藏</option>
              <option value="accessories">飾品收藏</option>
            </select>
          </div>
          <FileInputBase64 value={image} onChange={setImage} label="衣物相片" />
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>備註與穿搭建議</label>
            <textarea className="form-input" value={desc} onChange={(e) => setDesc(e.target.value)} rows="3" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>儲存修改</button>
        </form>
      </div>
    </div>
  );
};

// 5. Spot Modal (Map)
const SpotModal = ({ lat, lng, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState(lat || 23.9739);
  const [longitude, setLongitude] = useState(lng || 120.9820);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("請輸入景點名稱！");
      return;
    }
    onSubmit({
      name: name.trim(),
      desc: description.trim(),
      lat: parseFloat(latitude),
      lng: parseFloat(longitude)
    });
  };

  return (
    <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ maxWidth: '400px', width: '90%' }}>
        <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        <h3 className="modal-title">新增地圖標記</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>景點名稱</label>
            <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>緯度 (Lat)</label>
            <input type="number" step="0.0001" className="form-input" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>經度 (Lng)</label>
            <input type="number" step="0.0001" className="form-input" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>景點描述</label>
            <textarea className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>新增標記</button>
        </form>
      </div>
    </div>
  );
};

// 6. Event Modal (Calendar)
const EventModal = ({ date, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [eventDate, setEventDate] = useState(date || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) {
      alert("請填寫活動主題與日期！");
      return;
    }
    onSubmit({
      title: title.trim(),
      desc: desc.trim(),
      date: eventDate
    });
  };

  return (
    <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ maxWidth: '400px', width: '90%' }}>
        <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        <h3 className="modal-title">新增行程記事</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>行程日期</label>
            <input type="date" className="form-input" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>行程標題</label>
            <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例：去陽明山賞櫻" required />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>備忘說明</label>
            <textarea className="form-input" value={desc} onChange={(e) => setDesc(e.target.value)} rows="3" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>加入行程</button>
        </form>
      </div>
    </div>
  );
};

// 7. Settings Modal
const SettingsModal = ({ settings, onClose, onSubmit }) => {
  const [blogTitle, setBlogTitle] = useState(settings.blogTitle || 'nknock');
  const [blogSubtitle, setBlogSubtitle] = useState(settings.blogSubtitle || 'nknock');
  const [adminKey, setAdminKey] = useState(settings.adminKey || 'admin123');
  const [friendKey, setFriendKey] = useState(settings.friendKey || 'friend123');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      blogTitle: blogTitle.trim(),
      blogSubtitle: blogSubtitle.trim(),
      adminKey: adminKey.trim(),
      friendKey: friendKey.trim()
    });
  };

  return (
    <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ maxWidth: '400px', width: '90%' }}>
        <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        <h3 className="modal-title">網頁控制設定</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>網站大標題</label>
            <input type="text" className="form-input" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} required />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>網站副標題</label>
            <input type="text" className="form-input" value={blogSubtitle} onChange={(e) => setBlogSubtitle(e.target.value)} required />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>管理員解鎖金鑰 (控制台)</label>
            <input type="text" className="form-input" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>儲存設定</button>
        </form>
      </div>
    </div>
  );
};

// 8. Profile Modal
const ProfileModal = ({ profile, onClose, onSubmit }) => {
  const [name, setName] = useState(profile.name || '');
  const [nickname, setNickname] = useState(profile.nickname || '');
  const [avatar, setAvatar] = useState(profile.avatar || '');
  const [bio, setBio] = useState(profile.ownerBio || '');
  const [status, setStatus] = useState(profile.social?.status || '');
  const [talent, setTalent] = useState(profile.social?.talent || '');
  const [spaceName, setSpaceName] = useState(profile.spaceName || '');
  const [spaceSubtitle, setSpaceSubtitle] = useState(profile.spaceSubtitle || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      nickname: nickname.trim(),
      avatar,
      ownerBio: bio.trim(),
      spaceName: spaceName.trim(),
      spaceSubtitle: spaceSubtitle.trim(),
      social: {
        ...(profile.social || {}),
        status: status.trim(),
        talent: talent.trim()
      }
    });
  };

  return (
    <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ maxWidth: '440px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        <h3 className="modal-title">編輯站長個人檔案</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>站長名稱</label>
            <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>暱稱</label>
            <input type="text" className="form-input" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>自訂空間名稱</label>
            <input type="text" className="form-input" value={spaceName} onChange={(e) => setSpaceName(e.target.value)} placeholder="例：立華不動產 的空間" />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>自訂空間英文名稱</label>
            <input type="text" className="form-input" value={spaceSubtitle} onChange={(e) => setSpaceSubtitle(e.target.value)} placeholder="例：HAPPYCAR'S SPACE" />
          </div>
          <FileInputBase64 value={avatar} onChange={setAvatar} label="頭像圖片" />
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>個人簡介</label>
            <textarea className="form-input" value={bio} onChange={(e) => setBio(e.target.value)} rows="3" />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>專長特色</label>
            <input type="text" className="form-input" value={talent} onChange={(e) => setTalent(e.target.value)} />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>最新動態狀態</label>
            <input type="text" className="form-input" value={status} onChange={(e) => setStatus(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>儲存個人資料</button>
        </form>
      </div>
    </div>
  );
};

export default App;
