import React, { useState } from 'react';

const TodoView = ({
  todos = [],
  role = 'visitor',
  onToggleTodo,
  onAddTodo,
  onDeleteTodo
}) => {
  const [todoInput, setTodoInput] = useState('');
  const isAdmin = role === 'admin';

  const completedCount = todos.filter(t => t.completed).length;
  const progressPercent = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!todoInput.trim()) return;
    if (onAddTodo) {
      onAddTodo(todoInput.trim());
      setTodoInput('');
    }
  };

  return (
    <div id="todo-view" className="view-panel" style={{ display: 'block' }}>
      <div className="card todo-card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><i className="fa-solid fa-list-check"></i> 待辦清單</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }} id="todo-progress">
            {progressPercent}% 已完成 ({completedCount}/{todos.length})
          </span>
        </div>
        
        {isAdmin && (
          <form className="todo-form" id="todo-form" onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            <input 
              type="text" 
              className="todo-input" 
              id="todo-input" 
              placeholder="請輸入待辦事項..." 
              required
              value={todoInput}
              onChange={(e) => setTodoInput(e.target.value)}
              style={{ flex: 1, padding: '6px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '6px 16px', borderRadius: '6px' }}>
              <i className="fa-solid fa-plus"></i> 新增
            </button>
          </form>
        )}
        
        <ul className="todo-list-container" id="todo-list-box" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {todos.length > 0 ? (
            todos.map(todo => (
              <li 
                key={todo.id} 
                className="todo-item"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '10px 12px', 
                  background: 'rgba(255,255,255,0.5)', 
                  border: '1px solid rgba(255,255,255,0.7)', 
                  borderRadius: '8px', 
                  marginBottom: '8px',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    checked={todo.completed} 
                    onChange={() => onToggleTodo && onToggleTodo(todo.id)}
                    disabled={!isAdmin}
                    style={{ width: '16px', height: '16px', cursor: isAdmin ? 'pointer' : 'default' }}
                  />
                  <span style={{ 
                    fontSize: '13px', 
                    color: todo.completed ? 'var(--text-light)' : 'var(--text-dark)',
                    textDecoration: todo.completed ? 'line-through' : 'none'
                  }}>
                    {todo.text}
                  </span>
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => onDeleteTodo && onDeleteTodo(todo.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}
                    title="刪除事項"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                )}
              </li>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)', fontSize: '12px' }}>
              目前沒有待辦事項，輕鬆一下吧！
            </div>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TodoView;
