import React, { useState } from 'react';
import Square from './Square';
import Piece from './Piece';
import '../css/app.css';

const initialBoardSetup = {
  '0,0': { type: 'r', color: 'b', position: '0,0' },
  '1,0': { type: 'n', color: 'b', position: '1,0' },
  '2,0': { type: 'b', color: 'b', position: '2,0' },
  '3,0': { type: 'q', color: 'b', position: '3,0' },
  '4,0': { type: 'k', color: 'b', position: '4,0' },
  '5,0': { type: 'b', color: 'b', position: '5,0' },
  '6,0': { type: 'n', color: 'b', position: '6,0' },
  '7,0': { type: 'r', color: 'b', position: '7,0' },
  '0,1': { type: 'p', color: 'b', position: '0,1' },
  '1,1': { type: 'p', color: 'b', position: '1,1' },
  '2,1': { type: 'p', color: 'b', position: '2,1' },
  '3,1': { type: 'p', color: 'b', position: '3,1' },
  '5,1': { type: 'p', color: 'b', position: '5,1' },
  '6,1': { type: 'p', color: 'b', position: '6,1' },
  '7,1': { type: 'p', color: 'b', position: '7,1' },
  '0,6': { type: 'p', color: 'w', position: '0,6' },
  '1,6': { type: 'p', color: 'w', position: '1,6' },
  '2,6': { type: 'p', color: 'w', position: '2,6' },
  '4,1': { type: 'p', color: 'b', position: '4,1' },
  '3,6': { type: 'p', color: 'w', position: '3,6' },
  '4,6': { type: 'p', color: 'w', position: '4,6' },
  '5,6': { type: 'p', color: 'w', position: '5,6' },
  '6,6': { type: 'p', color: 'w', position: '6,6' },
  '7,6': { type: 'p', color: 'w', position: '7,6' },
  '0,7': { type: 'r', color: 'w', position: '0,7' },
  '1,7': { type: 'n', color: 'w', position: '1,7' },
  '2,7': { type: 'b', color: 'w', position: '2,7' },
  '3,7': { type: 'q', color: 'w', position: '3,7' },
  '4,7': { type: 'k', color: 'w', position: '4,7' },
  '5,7': { type: 'b', color: 'w', position: '5,7' },
  '6,7': { type: 'n', color: 'w', position: '6,7' },
  '7,7': { type: 'r', color: 'w', position: '7,7' },
};

const Board = ({ sendMoveData, isReversed }) => {
  const [board, setBoard] = useState(initialBoardSetup);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [draggedOverSquare, setDraggedOverSquare] = useState(null);

  const handleDragStart = (e, piece, position) => {
    setDraggedPiece({ ...piece, position });
  };

  const handleDragOver = (e, square) => {
    e.preventDefault();
    setDraggedOverSquare(square);
  };

  const handleDrop = () => {
    if (draggedPiece && draggedOverSquare) {
      const newBoard = { ...board };
      newBoard[draggedOverSquare] = draggedPiece;
      newBoard[draggedPiece.position] = null;
      const from = draggedPiece.position;
      const to = draggedOverSquare;
      const moveData = {
        eventTime: new Date().toISOString(),
        from,
        to,
        player: {
          color: draggedPiece.color,
          team: draggedPiece.color === 'w' ? 'White' : 'Black'
        }
      };
      sendMoveData(moveData); // Send move data to the server
      draggedPiece.position = draggedOverSquare; // Update the piece's position
      setBoard(newBoard);
      setDraggedPiece(null);
      setDraggedOverSquare(null);
    }
  };

  const renderSquare = (i) => {
    const x = i % 8;
    const y = Math.floor(i / 8);
    const position = `${x},${y}`;
    const piece = board[position];
    return (
      <Square
        key={i}
        x={x}
        y={y}
        piece={piece}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
      >
        {piece && (
          <Piece
            piece={piece}
            handleDragStart={(e) => handleDragStart(e, piece, position)}
          />
        )}
      </Square>
    );
  };

  const squares = [];
  for (let i = 0; i < 64; i++) {
    squares.push(renderSquare(i));
  }

  if (isReversed) {
    squares.reverse();
  }

  return (
    <div className="board">
      {squares}
    </div>
  );
};

export default Board;