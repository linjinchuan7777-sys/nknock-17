import React, { useState, useEffect } from 'react';

const NotesView = ({ notes, onSaveNotes }) => {
  const [notesList, setNotesList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState(null); // Note being edited or created
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('#fff9db'); // Default pastel yellow

  const colors = [
    { name: '粉黃', hex: '#fff9db', border: '#ffe066' },
    { name: '粉紅', hex: '#fff0f6', border: '#ffdeeb' },
    { name: '粉藍', hex: '#e7f5ff', border: '#a5d8ff' },
    { name: '粉綠', hex: '#ebfbee', border: '#b2f2bb' },
    { name: '粉紫', hex: '#f8f0fc', border: '#eebefa' }
  ];

  // Load notes list with backward compatibility
  useEffect(() => {
    if (!notes) {
      setNotesList([]);
      return;
    }
    try {
      const parsed = JSON.parse(notes);
      if (Array.isArray(parsed)) {
        setNotesList(parsed);
      } else {
        setNotesList([{
          id: 'note-default',
          content: notes,
          color: '#fff9db',
          date: new Date().toLocaleString()
        }]);
      }
    } catch (e) {
      setNotesList([{
        id: 'note-default',
        content: notes,
        color: '#fff9db',
        date: new Date().toLocaleString()
      }]);
    }
  }, [notes]);

  const saveNotes = (updatedList) => {
    setNotesList(updatedList);
    if (onSaveNotes) {
      onSaveNotes(JSON.stringify(updatedList));
    }
  };

  const handleOpenCreate = () => {
    setCurrentNote(null);
    setNoteContent('');
    setNoteColor('#fff9db');
    setIsEditing(true);
  };

  const handleOpenEdit = (note) => {
    setCurrentNote(note);
    setNoteContent(note.content);
    setNoteColor(note.color);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (confirm('確定要刪除這張便利貼嗎？')) {
      const updated = notesList.filter(n => n.id !== id);
      saveNotes(updated);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!noteContent.trim()) {
      alert('請輸入便利貼內容！');
      return;
    }

    let updated;
    if (currentNote) {
      // Edit
      updated = notesList.map(n => n.id === currentNote.id ? {
        ...n,
        content: noteContent,
        color: noteColor,
        date: new Date().toLocaleString()
      } : n);
    } else {
      // Add new
      const newNote = {
        id: `note-${Date.now()}`,
        content: noteContent,
        color: noteColor,
        date: new Date().toLocaleString()
      };
      updated = [...notesList, newNote];
    }
    saveNotes(updated);
    setIsEditing(false);
  };

  return (
    <div id="notes-view" className="view-panel" style={{ display: 'block' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--primary-dark)', fontWeight: 'bold', margin: 0 }}>
          <i className="fa-regular fa-sticky-note" style={{ marginRight: '6px' }}></i> 我的便利貼板
        </h3>
        <button className="btn btn-primary" onClick={handleOpenCreate} style={{ fontSize: '12px', padding: '6px 16px' }}>
          <i className="fa-solid fa-plus"></i> 新增便利貼
        </button>
      </div>

      {/* Sticky Notes Grid */}
      <div className="sticky-notes-board" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '20px',
        padding: '10px 0'
      }}>
        {notesList.map((note, index) => {
          // Playful rotation based on index
          const rotation = (index % 3 - 1) * 1.5; // -1.5, 0, or 1.5 deg
          const borderStyle = colors.find(c => c.hex === note.color)?.border || '#ffe066';
          
          return (
            <div 
              key={note.id}
              className="sticky-note-card"
              style={{
                background: note.color,
                border: `1.5px solid ${borderStyle}`,
                borderRadius: '8px',
                padding: '16px',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '2px 4px 10px rgba(0,0,0,0.06)',
                transform: `rotate(${rotation}deg)`,
                transition: 'all 0.25s',
                position: 'relative'
              }}
            >
              {/* Pin/Tape Decoration */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '45px',
                height: '14px',
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(2px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
              }}></div>

              {/* Note Content */}
              <div style={{ 
                fontSize: '13px', 
                color: '#4a473e', 
                whiteSpace: 'pre-wrap', 
                lineHeight: '1.6',
                wordBreak: 'break-word',
                marginTop: '6px',
                flex: 1
              }}>
                {note.content}
              </div>

              {/* Note Footer */}
              <div style={{ 
                borderTop: '1px dashed rgba(0,0,0,0.06)', 
                paddingTop: '8px', 
                marginTop: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '9px', color: '#908c7e' }}>
                  {note.date ? note.date.split(' ')[0] : ''}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleOpenEdit(note)} 
                    style={{ background: 'transparent', border: 'none', color: '#cc9900', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                    title="編輯"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button 
                    onClick={() => handleDelete(note.id)} 
                    style={{ background: 'transparent', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                    title="刪除"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {notesList.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '50px 0',
            border: '2px dashed #ffe066',
            borderRadius: '12px',
            background: 'rgba(255, 253, 240, 0.5)',
            color: '#807b6b'
          }}>
            <i className="fa-regular fa-sticky-note" style={{ fontSize: '32px', marginBottom: '10px', color: '#cc9900' }}></i>
            <p style={{ margin: 0, fontSize: '13px' }}>還沒有任何便利貼，點擊右上角新增一張吧！</p>
          </div>
        )}
      </div>

      {/* Write / Edit Sticky Note Modal */}
      {isEditing && (
        <div className="modal-overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '400px', width: '90%' }}>
            <button className="modal-close" onClick={() => setIsEditing(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {currentNote ? '編輯便利貼' : '新增便利貼'}
            </h3>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px' }}>便利貼內容</label>
                <textarea 
                  className="form-input" 
                  value={noteContent} 
                  onChange={(e) => setNoteContent(e.target.value)} 
                  rows="5" 
                  style={{ width: '100%', resize: 'none' }}
                  placeholder="寫下您的想法、備忘或待辦..."
                  required 
                />
              </div>

              {/* Color Picker */}
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label" style={{ fontWeight: 'bold', fontSize: '12px', display: 'block', marginBottom: '6px' }}>選擇顏色</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {colors.map(color => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setNoteColor(color.hex)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: color.hex,
                        border: noteColor === color.hex ? '2px solid #555' : `1.5px solid ${color.border}`,
                        cursor: 'pointer',
                        transform: noteColor === color.hex ? 'scale(1.15)' : 'none',
                        transition: 'transform 0.15s'
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', width: '100%' }}>
                儲存便利貼
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesView;
