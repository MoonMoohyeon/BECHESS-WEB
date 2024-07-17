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

//각 기물이 움직일 수 있는지 여부를 나타내는 함수
const isValidMove = (piece, from, to, board) => {
  const [fromX, fromY] = from.split(',').map(Number);
  const [toX, toY] = to.split(',').map(Number);

  switch (piece.type) {
    case 'p':
      // 폰의 움직임 검증
      return isValidPawnMove(piece, fromX, fromY, toX, toY, board);
    /*
    case 'r':
      // 룩의 움직임 검증
      return isValidRookMove(fromX, fromY, toX, toY, board);
    case 'n':
      // 나이트의 움직임 검증
      return isValidKnightMove(fromX, fromY, toX, toY);
    case 'b':
      // 비숍의 움직임 검증
      return isValidBishopMove(fromX, fromY, toX, toY, board);
    case 'q':
      // 퀸의 움직임 검증
      return isValidQueenMove(fromX, fromY, toX, toY, board);
    case 'k':
      // 킹의 움직임 검증
      return isValidKingMove(fromX, fromY, toX, toY, board);
    
    default:
      return false;
    */
  }
};

const isValidPawnMove = (piece, fromX, fromY, toX, toY, board) => {
  const direction = piece.color === 'w' ? -1 : 1; // 백은 위로, 흑은 아래로 이동
  const startRow = piece.color === 'w' ? 6 : 1;

  // 앞으로 한 칸 이동
  if (toX === fromX && toY === fromY + direction && !board[`${toX},${toY}`]) {
    return true;
  }

  // 처음 두 칸 이동
  if (fromY === startRow && toX === fromX && toY === fromY + 2 * direction &&
    !board[`${toX},${toY}`] && !board[`${toX},${fromY + direction}`]) {
    return true;
  }

  // 대각선 공격
  if (Math.abs(toX - fromX) === 1 && toY === fromY + direction &&
    board[`${toX},${toY}`] && board[`${toX},${toY}`].color !== piece.color) {
    return true;
  }

  // 이 외의 경우는 유효하지 않음
  return false;
};

const Board = ({ sendMoveData }) => {
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

      if (isValidMove(draggedPiece, from, to, board)) {
        const newBoard = { ...board };
        newBoard[draggedOverSquare] = draggedPiece;
        delete newBoard[draggedPiece.position];

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
      }

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

  return (
    <div className="board">
      {squares}
    </div>
  );
};

export default Board;
