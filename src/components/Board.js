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
    
    // case 'r':
    //   // 룩의 움직임 검증
    //   return isValidRookMove(fromX, fromY, toX, toY, board);

    case 'n':
      // 나이트의 움직임 검증
      return isValidKnightMove(fromX, fromY, toX, toY);
    case 'b':
      // 비숍의 움직임 검증
      return isValidBishopMove(fromX, fromY, toX, toY, board);
    /*
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
/*
const isValidRookMove = (fromX, fromY, toX, toY, board) =>{
  // 같은 열에서 수직 이동 검사
  if (fromX === toX) {
    const step = fromY < toY ? 1 : -1;
    for (let y = fromY + step; y !== toY; y += step) {
      if (board[`${fromX},${y}`] !== null) {
        return false; // 중간에 다른 기물이 있으면 유효하지 않음
      }
    }
    return true; // 이동 경로가 모두 비어있으면 유효
  }

  // 같은 행에서 수평 이동 검사
  if (fromY === toY) {
    const step = fromX < toX ? 1 : -1;
    for (let x = fromX + step; x !== toX; x += step) {
      if (board[`${x},${fromY}`] !== null) {
        return false; // 중간에 다른 기물이 있으면 유효하지 않음
      }
    }
    return true; // 이동 경로가 모두 비어있으면 유효
  }

  // 이동 경로가 수직 또는 수평이 아닌 경우는 유효하지 않음
  return false;
};
*/

const isValidKnightMove = (fromX, fromY, toX, toY, board) => {
  // 나이트의 유효한 움직임을 나타내는 모든 가능한 이동 방향
  const knightMoves = [
    { dx: 2, dy: 1 },
    { dx: 2, dy: -1 },
    { dx: -2, dy: 1 },
    { dx: -2, dy: -1 },
    { dx: 1, dy: 2 },
    { dx: 1, dy: -2 },
    { dx: -1, dy: 2 },
    { dx: -1, dy: -2 },
  ];

  // 목표 위치와 일치하는 가능한 움직임을 찾음
  for (let move of knightMoves) {
    if (fromX + move.dx === toX && fromY + move.dy === toY) {
      return true;
    }
  }

  // 모든 가능한 움직임을 검사했지만 일치하는 움직임이 없으면 유효하지 않음
  return false;
};

const isValidBishopMove = (fromX, fromY, toX, toY, board) => {
  // 출발 위치와 목표 위치가 같은 대각선에 있는지 검사
  if (Math.abs(fromX - toX) !== Math.abs(fromY - toY)) {
    return false;
  }

  // 대각선 방향을 결정
  const dx = fromX < toX ? 1 : -1;
  const dy = fromY < toY ? 1 : -1;

  // 대각선 위에 있는 모든 칸을 검사
  let x = fromX + dx;
  let y = fromY + dy;
  while (x !== toX && y !== toY) {
    if (board[`${x},${y}`] !== null) {
      return false; // 중간에 다른 기물이 있으면 유효하지 않음
    }
    x += dx;
    y += dy;
  }

  return true; // 모든 조건을 만족하면 유효
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
