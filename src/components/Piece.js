import React from 'react';
import '../css/piece.css';

const Piece = ({ piece, handleDragStart }) => {
  const pieceImage = require(`../images/${piece.color}_${piece.type}.png`);

  return (
    <img
      src={pieceImage}
      alt={`${piece.color} ${piece.type}`}
      sizes='30'
      draggable
      onDragStart={(e) => handleDragStart(e, piece)}
      className="piece"
    />
  );
};

export default Piece;
