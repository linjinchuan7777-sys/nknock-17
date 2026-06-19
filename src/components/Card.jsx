import React from 'react';

const Card = ({ title, children, className = '', style = {} }) => {
  return (
    <div className={`card ${className}`} style={style}>
      {title && <div className="card-title">{title}</div>}
      {children}
    </div>
  );
};

export default Card;
