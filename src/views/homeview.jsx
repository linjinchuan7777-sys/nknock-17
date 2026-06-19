import React, { useState } from 'react';
import Card from '../components/Card';

const HomeView = ({
  posts = [],
  role = 'visitor',
  currentCategoryFilter = 'all',
  currentSubCategoryFilter = null,
  searchQuery = '',
  searchType = 'all',
  onAddComment,
  onDeleteComment,
  onDeletePost,
  onEditPost,
  ownerProfile = {}
}) => {
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');

  const isAdmin = role === 'admin';
  const isFriend = role === 'friend';
  const isVisitor = role === 'visitor';

  // Filter posts based on category, subcategory, and search query
  const getFilteredPosts = () => {
    let result = [...posts];

    // Category filter
    if (currentCategoryFilter !== 'all') {
      result = result.filter(p => p.category === currentCategoryFilter);
    }
    // Subcategory filter
    if (currentSubCategoryFilter) {
      result = result.filter(p => p.subcategory === currentSubCategoryFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (searchType === 'all') {
        result = result.filter(
          p => p.title.toLowerCase().includes(q) || 
               p.summary.toLowerCase().includes(q) || 
               p.content.toLowerCase().includes(q)
        );
      } else {
        result = result.filter(p => p.category === searchType && (
          p.title.toLowerCase().includes(q) || 
          p.summary.toLowerCase().includes(q) || 
          p.content.toLowerCase().includes(q)
        ));
      }
    }

    return result;
  };

  const filteredPosts = getFilteredPosts();
  const selectedPost = posts.find(p => p.id === selectedPostId);

  const handleOpenPost = (post) => {
    if (post.isPrivate && isVisitor) {
      alert("【權限不足】\n此貼文為私人隱密貼文，僅限空間主人閱讀！");
      return;
    }
    // Increment views locally
    post.views = (post.views || 0) + 1;
    setSelectedPostId(post.id);
    // Preset comment author name if logged in
    if (role !== 'visitor') {
      setCommentAuthor(ownerProfile.name || '');
    } else {
      setCommentAuthor('');
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentAuthor.trim()) {
      alert("請輸入留言暱稱！");
      return;
    }
    if (!commentContent.trim()) {
      alert("請輸入留言內容！");
      return;
    }
    
    if (onAddComment && selectedPostId) {
      onAddComment(selectedPostId, {
        author: commentAuthor,
        content: commentContent,
        avatar: role !== 'visitor' ? ownerProfile.avatar : '',
        role: role
      });
      setCommentContent('');
    }
  };

  const handleDeleteCommentClick = (commentId) => {
    if (onDeleteComment && selectedPostId) {
      onDeleteComment(selectedPostId, commentId);
    }
  };

  // Get Avatar frame class name
  const getAvatarFrameClass = (cRole) => {
    if (cRole === 'admin') return 'admin';
    if (cRole === 'friend') return 'friend';
    return 'visitor';
  };

  return (
    <div id="home-view" className="view-panel" style={{ display: 'block' }}>
      {/* 搜尋/分類提示 Banner */}
      {(currentCategoryFilter !== 'all' || currentSubCategoryFilter || searchQuery) && (
        <div className="search-banner" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid var(--primary-color)', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(5px)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '13px', color: 'var(--primary-dark)', fontWeight: 'bold' }}>
            <i className="fa-solid fa-filter"></i> 正在篩選：
            {currentCategoryFilter !== 'all' && ` [分類：${currentCategoryFilter}]`}
            {currentSubCategoryFilter && ` > [子類別：${currentSubCategoryFilter}]`}
            {searchQuery && ` [搜尋關鍵字：${searchQuery}]`}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
            共尋獲 {filteredPosts.length} 篇貼文
          </span>
        </div>
      )}

      {/* 貼文列表 */}
      <div className="posts-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <Card 
              key={post.id} 
              className={`post-card ${post.isPrivate ? 'private' : ''}`}
              style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s', position: 'relative' }}
            >
              {post.isPrivate && (
                <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--accent-color)', color: '#fff', fontSize: '10px', padding: '3px 8px', borderRadius: '10px', fontWeight: 'bold', boxShadow: 'var(--shadow-xs)' }}>
                  <i className="fa-solid fa-lock"></i> 好友隱密貼文
                </div>
              )}

              {post.image && !post.isPrivate && (
                <div style={{ width: '100%', maxHeight: '200px', overflow: 'hidden', borderRadius: '8px', marginBottom: '15px' }}>
                  <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <h2 style={{ fontSize: '18px', color: 'var(--primary-dark)', marginBottom: '8px', fontWeight: 'bold' }}>{post.title}</h2>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-dark)', marginBottom: '15px' }}>{post.summary}</p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-light)', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span><i className="fa-regular fa-calendar"></i> {post.date}</span>
                  <span><i className="fa-regular fa-folder"></i> {post.category} · {post.subcategory}</span>
                  <span><i className="fa-regular fa-eye"></i> 瀏覽 {post.views || 0} 次</span>
                  <span><i className="fa-regular fa-comment"></i> 留言 {(post.comments || []).length} 條</span>
                </div>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleOpenPost(post)}
                  style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '15px', marginTop: '5px' }}
                >
                  閱讀全文 <i className="fa-solid fa-chevron-right" style={{ fontSize: '9px' }}></i>
                </button>
              </div>
            </Card>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', border: '1px dashed #ccc', color: 'var(--text-light)' }}>
            <i className="fa-regular fa-folder-open" style={{ fontSize: '32px', marginBottom: '10px', color: '#bbb' }}></i>
            <p>目前尚無貼文。歡迎撰寫新貼文或更換篩選條件！</p>
          </div>
        )}
      </div>

      {/* 貼文詳細與留言彈窗 Modal */}
      {selectedPost && (
        <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '640px', width: '90%', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <button className="modal-close" onClick={() => setSelectedPostId(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--primary-dark)', fontSize: '18px', fontWeight: 'bold' }}>{selectedPost.title}</h3>
              <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                分類：{selectedPost.category} · {selectedPost.subcategory} | 發表時間：{selectedPost.date} | 瀏覽：{selectedPost.views} 次
              </div>
            </div>

            <div style={{ padding: '15px 0', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              {selectedPost.image && (
                <div style={{ width: '100%', maxHeight: '250px', overflow: 'hidden', borderRadius: '8px', marginBottom: '15px' }}>
                  <img src={selectedPost.image} alt={selectedPost.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              {/* Render HTML Content safely */}
              <div 
                className="post-content-detail" 
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-dark)', whiteSpace: 'pre-line' }}
              />

              {/* Tags */}
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div style={{ marginTop: '15px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {selectedPost.tags.map(tag => (
                    <span key={tag} style={{ background: 'rgba(0, 168, 232, 0.08)', color: 'var(--primary-color)', fontSize: '10.5px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Admin Actions */}
              {isAdmin && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => { onEditPost(selectedPost); setSelectedPostId(null); }}
                  >
                    <i className="fa-solid fa-edit"></i> 編輯貼文
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => { if (confirm("確定要刪除這篇文章嗎？")) { onDeletePost(selectedPost.id); setSelectedPostId(null); } }}
                  >
                    <i className="fa-solid fa-trash"></i> 刪除貼文
                  </button>
                </div>
              )}
            </div>

            {/* 留言板區塊 */}
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '14px', color: 'var(--primary-dark)', fontWeight: 'bold', marginBottom: '10px' }} id="post-comments-count">
                共 {selectedPost.comments ? selectedPost.comments.length : 0} 條留言
              </h4>

              {/* 留言列表 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px', maxH: '200px', overflowY: 'auto' }}>
                {selectedPost.comments && selectedPost.comments.length > 0 ? (
                  selectedPost.comments.map(comment => (
                    <div 
                      key={comment.id}
                      className="comment-card"
                      style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '8px', padding: '10px', position: 'relative' }}
                    >
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <div className="comment-avatar-wrapper" style={{ width: '32px', height: '32px' }}>
                          <img 
                            src={comment.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
                            alt={comment.author} 
                            className="comment-avatar"
                          />
                          <div className={`avatar-frame ${getAvatarFrameClass(comment.role)}`} style={{ top: '-2px', left: '-2px', right: '-2px', bottom: '-2px' }}></div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-light)', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{comment.author}</span>
                            <span>{comment.date}</span>
                          </div>
                          <div style={{ fontSize: '12.5px', lineHeight: '1.5', color: 'var(--text-dark)', whiteSpace: 'pre-wrap' }}>
                            {comment.content}
                          </div>
                        </div>
                      </div>

                      {/* Delete comment button (only if not visiting / guest, or if admin) */}
                      {isAdmin && (
                        <button 
                          className="comment-delete-btn"
                          onClick={() => handleDeleteCommentClick(comment.id)}
                          style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}
                          title="刪除留言"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '12px', fontSize: '12px' }}>
                    尚無好友留言，快來留下一筆吧！
                  </div>
                )}
              </div>

              {/* 發表新留言表單 */}
              <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,168,232,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,168,232,0.1)' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary-color)' }}>留言者暱稱：</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="請輸入暱稱..."
                    style={{ flex: 1, padding: '4px 8px', fontSize: '12px', borderRadius: '4px', height: '24px' }}
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    disabled={role !== 'visitor'} // Lock username for logged in users
                  />
                </div>
                <div>
                  <textarea 
                    className="form-textarea" 
                    placeholder="請撰寫您的留言內容..."
                    style={{ width: '100%', height: '50px', padding: '6px', fontSize: '12px', borderRadius: '4px', boxSizing: 'border-box' }}
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end', fontSize: '11px', padding: '4px 12px' }}>
                  發表留言
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;
