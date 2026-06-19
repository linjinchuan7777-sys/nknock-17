import React, { useState } from 'react';

const CalendarView = ({
  events = [],
  role = 'visitor',
  onAddEvent,
  onDeleteEvent
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const isAdmin = role === 'admin';

  const monthNames = ["1 月", "2 月", "3 月", "4 月", "5 月", "6 月", "7 月", "8 月", "9 月", "10 月", "11 月", "12 月"];
  const dayLabels = ["日", "一", "二", "三", "四", "五", "六"];

  // Navigate Months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Helper to format date as YYYY-MM-DD
  const formatDateStr = (y, m, d) => {
    const formattedMonth = String(m + 1).padStart(2, '0');
    const formattedDay = String(d).padStart(2, '0');
    return `${y}-${formattedMonth}-${formattedDay}`;
  };

  // Calendar cells calculation
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

  const cells = [];

  // Trailing days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const prevMonthVal = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYearVal = currentMonth === 0 ? currentYear - 1 : currentYear;
    cells.push({
      day: dayNum,
      dateStr: formatDateStr(prevYearVal, prevMonthVal, dayNum),
      isOtherMonth: true,
      key: `prev-${dayNum}`
    });
  }

  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day;
    cells.push({
      day,
      dateStr: formatDateStr(currentYear, currentMonth, day),
      isOtherMonth: false,
      isToday,
      key: `curr-${day}`
    });
  }

  // Leading days from next month
  const filledCells = firstDayIndex + totalDays;
  const remainingCells = 42 - filledCells;
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonthVal = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYearVal = currentMonth === 11 ? currentYear + 1 : currentYear;
    cells.push({
      day,
      dateStr: formatDateStr(nextYearVal, nextMonthVal, day),
      isOtherMonth: true,
      key: `next-${day}`
    });
  }

  // Handle cell click
  const handleCellClick = (cell) => {
    const dayEvents = events.filter(e => e.date === cell.dateStr);
    
    if (isAdmin) {
      if (onAddEvent) {
        onAddEvent(cell.dateStr);
      }
    } else {
      if (dayEvents.length > 0) {
        const listStr = dayEvents.map(e => `【${e.title}】\n${e.desc || '無備忘描述'}`).join('\n\n');
        alert(`${cell.dateStr} 的活動行程：\n\n${listStr}`);
      } else {
        alert(`${cell.dateStr} 暫無安排任何行程。`);
      }
    }
  };

  // Get upcoming events list (today onwards)
  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const upcomingEvents = events
    .filter(e => e.date >= todayStr)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleDeleteEventClick = (eventId) => {
    if (confirm("確定要刪除這個行程安排嗎？")) {
      if (onDeleteEvent) {
        onDeleteEvent(eventId);
      }
    }
  };

  return (
    <div id="calendar-view" className="view-panel" style={{ display: 'block' }}>
      <div className="calendar-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
        {/* Calendar Grid Section */}
        <div className="calendar-main-card card">
          <div className="calendar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--primary-dark)', fontWeight: 'bold' }}>
              <i className="fa-regular fa-calendar-days"></i> 行事曆
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button className="btn btn-secondary btn-sm" onClick={handlePrevMonth} style={{ padding: '4px 8px' }}>
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <span id="calendar-month-year" style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary-dark)', minWidth: '90px', textAlign: 'center' }}>
                {currentYear} 年 {monthNames[currentMonth]}
              </span>
              <button className="btn btn-secondary btn-sm" onClick={handleNextMonth} style={{ padding: '4px 8px' }}>
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div 
            className="calendar-grid" 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: '4px',
              borderTop: '1px solid rgba(0,0,0,0.05)',
              paddingTop: '8px'
            }}
          >
            {/* Day Labels */}
            {dayLabels.map(label => (
              <div 
                key={label} 
                className="calendar-day-label"
                style={{ 
                  textAlign: 'center', 
                  fontSize: '11.5px', 
                  fontWeight: 'bold', 
                  color: 'var(--text-light)', 
                  padding: '6px 0',
                  background: 'rgba(0,168,232,0.03)',
                  borderRadius: '4px'
                }}
              >
                {label}
              </div>
            ))}

            {/* Grid Cells */}
            {cells.map(cell => {
              const dayEvents = events.filter(e => e.date === cell.dateStr);
              return (
                <div 
                  key={cell.key}
                  className={`calendar-cell ${cell.isOtherMonth ? 'other-month' : ''} ${cell.isToday ? 'today' : ''}`}
                  onClick={() => handleCellClick(cell)}
                  style={{ 
                    minHeight: '64px',
                    padding: '4px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: cell.isToday 
                      ? 'linear-gradient(135deg, rgba(0,168,232,0.1) 0%, rgba(126,189,38,0.1) 100%)' 
                      : cell.isOtherMonth 
                      ? 'rgba(0,0,0,0.02)' 
                      : 'rgba(255,255,255,0.4)',
                    border: cell.isToday 
                      ? '1px solid rgba(0,168,232,0.3)' 
                      : '1px solid rgba(0,0,0,0.03)',
                    transition: 'background 0.2s',
                    position: 'relative',
                    opacity: cell.isOtherMonth ? 0.5 : 1
                  }}
                >
                  <span 
                    className="calendar-cell-num"
                    style={{ 
                      fontSize: '11.5px', 
                      fontWeight: cell.isToday ? 'bold' : 'normal',
                      color: cell.isToday ? 'var(--primary-dark)' : 'var(--text-dark)',
                      display: 'block',
                      marginBottom: '4px'
                    }}
                  >
                    {cell.day}
                  </span>
                  
                  {/* Event Dots */}
                  <div className="calendar-cell-events" style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                    {dayEvents.slice(0, 2).map(evt => (
                      <div 
                        key={evt.id}
                        className="calendar-event-dot"
                        title={`${evt.title}: ${evt.desc || ''}`}
                        style={{ 
                          fontSize: '9.5px', 
                          padding: '1px 4px', 
                          background: 'linear-gradient(to right, #00a8e8, #7ebd26)', 
                          color: '#fff', 
                          borderRadius: '3px',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          fontWeight: 'bold',
                          boxShadow: 'var(--shadow-xs)'
                        }}
                      >
                        {evt.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div style={{ fontSize: '9px', color: 'var(--text-light)', paddingLeft: '2px' }}>
                        +{dayEvents.length - 2} 項...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel: Upcoming Events */}
        <div className="upcoming-events-card card" style={{ maxHeight: '490px', overflowY: 'auto' }}>
          <div className="card-title">
            <span><i className="fa-regular fa-clock"></i> 近期行程</span>
          </div>
          <div className="upcoming-events-list" id="upcoming-events-list">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(evt => (
                <div 
                  key={evt.id} 
                  className="event-item"
                  style={{ 
                    padding: '10px', 
                    background: 'rgba(255,255,255,0.4)', 
                    border: '1px solid rgba(255,255,255,0.6)', 
                    borderRadius: '8px', 
                    marginBottom: '8px',
                    position: 'relative'
                  }}
                >
                  {isAdmin && (
                    <button 
                      className="todo-delete-btn" 
                      onClick={() => handleDeleteEventClick(evt.id)}
                      style={{ 
                        float: 'right', 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'var(--danger-color)', 
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                      title="刪除行程"
                    >
                      <i className="fa-solid fa-trash" style={{ fontSize: '11px' }}></i>
                    </button>
                  )}
                  <span className="event-date" style={{ fontSize: '10px', color: 'var(--primary-dark)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                    <i className="fa-regular fa-clock"></i> {evt.date}
                  </span>
                  <h4 className="event-title" style={{ margin: 0, fontSize: '13px', color: 'var(--text-dark)' }}>{evt.title}</h4>
                  {evt.desc && (
                    <p style={{ fontSize: '11px', color: 'var(--text-light)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                      {evt.desc}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px', fontSize: '12px' }}>
                近期沒有安排行程。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
