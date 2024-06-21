import React from 'react';
import '../css/square.css';

const Square = ({ x, y, piece, handleDragOver, handleDrop, children }) => {
  const black = (x + y) % 2 === 1;
  const className = black ? 'square black' : 'square white';

  return (
    <div
      className={className}
      onDragOver={(e) => handleDragOver(e, `${x},${y}`)}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
};

export default Square;