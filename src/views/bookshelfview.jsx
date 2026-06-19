import React, { useState } from 'react';

const BookshelfView = ({
  books = [],
  role = 'visitor',
  onAddBook,
  onDeleteBook,
  onEditBook
}) => {
  const [selectedBookId, setSelectedBookId] = useState(null);
  const isAdmin = role === 'admin';

  const booksPerRow = 4;
  const rowsCount = Math.max(2, Math.ceil(books.length / booksPerRow));
  
  const selectedBook = books.find(b => b.id === selectedBookId);

  const handleBookClick = (bookId) => {
    setSelectedBookId(bookId);
  };

  const handleDeleteBook = (bookId) => {
    if (confirm("確定要把這本書從書架移除嗎？")) {
      if (onDeleteBook) {
        onDeleteBook(bookId);
        setSelectedBookId(null);
      }
    }
  };

  return (
    <div id="bookshelf-view" className="view-panel" style={{ display: 'block' }}>
      {isAdmin && (
        <div className="bookshelf-actions" style={{ marginBottom: '12px' }}>
          <button className="btn btn-primary" onClick={onAddBook}>
            <i className="fa-solid fa-plus"></i> 新增書籍封面
          </button>
        </div>
      )}

      <div className="bookshelf-room" id="bookshelf-room">
        {Array.from({ length: rowsCount }).map((_, r) => {
          const rowBooks = books.slice(r * booksPerRow, (r + 1) * booksPerRow);
          return (
            <div key={r} className="shelf-row">
              {rowBooks.map(book => (
                <div 
                  key={book.id} 
                  className="shelf-book"
                  onClick={() => handleBookClick(book.id)}
                >
                  <img 
                    src={book.cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=150'} 
                    className="shelf-book-cover" 
                    alt={book.title} 
                    title={book.title} 
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* 書籍詳細彈窗 Modal */}
      {selectedBook && (
        <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center' }}>
            <button className="modal-close" onClick={() => setSelectedBookId(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <img 
              src={selectedBook.cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=150'} 
              id="book-info-cover" 
              style={{ width: '120px', height: '160px', objectFit: 'cover', border: '1px solid #ccc', boxShadow: 'var(--shadow-sm)', margin: '0 auto 12px auto', display: 'block' }}
              alt="封面"
            />
            <h3 className="modal-title" id="book-info-title" style={{ marginBottom: '4px' }}>{selectedBook.title}</h3>
            <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '12px' }}>
              作者：<span id="book-info-author">{selectedBook.author}</span>
            </div>
            
            <p id="book-info-desc" style={{ textAlign: 'left', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-dark)', background: '#f9f9f9', padding: '12px', border: '1px solid #e0e0e0', marginBottom: '10px' }}>
              {selectedBook.description || "暫無簡介。"}
            </p>

            <div style={{ textAlign: 'left', marginBottom: '15px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--primary-dark)' }}>
                <i className="fa-solid fa-heart"></i> 讀後心得：
              </strong>
              <p id="book-info-thoughts" style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-dark)', background: '#fdfefe', padding: '12px', border: '1px dashed var(--primary-color)', borderRadius: '6px', marginTop: '4px', whiteSpace: 'pre-line' }}>
                {selectedBook.thoughts || "暫無心得。"}
              </p>
            </div>

            {isAdmin && (
              <div className="form-submit-row" id="book-detail-actions" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  id="edit-book-btn" 
                  style={{ flex: 1 }}
                  onClick={() => { onEditBook(selectedBook); setSelectedBookId(null); }}
                >
                  <i className="fa-solid fa-edit"></i> 編輯書籍資訊
                </button>
                <button 
                  className="btn btn-danger" 
                  id="delete-book-btn" 
                  style={{ flex: 1 }}
                  onClick={() => handleDeleteBook(selectedBook.id)}
                >
                  <i className="fa-solid fa-trash"></i> 移除這本書
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookshelfView;
