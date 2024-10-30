import React, { useEffect, useRef, useState } from "react";
import Square from "./Square";
import Piece from "./Piece";
import "../css/app.css";

// 시작 보드 상태
const initialBoardSetup = {
  "0,0": { type: "r", color: "w", position: "0,0" },
  "1,0": { type: "n", color: "w", position: "1,0" },
  "2,0": { type: "b", color: "w", position: "2,0" },
  "3,0": { type: "k", color: "w", position: "3,0" },
  "4,0": { type: "q", color: "w", position: "4,0" },
  "5,0": { type: "b", color: "w", position: "5,0" },
  "6,0": { type: "n", color: "w", position: "6,0" },
  "7,0": { type: "r", color: "w", position: "7,0" },
  "0,1": { type: "p", color: "w", position: "0,1" },
  "1,1": { type: "p", color: "w", position: "1,1" },
  "2,1": { type: "p", color: "w", position: "2,1" },
  "3,1": { type: "p", color: "w", position: "3,1" },
  "4,1": { type: "p", color: "w", position: "4,1" },
  "5,1": { type: "p", color: "w", position: "5,1" },
  "6,1": { type: "p", color: "w", position: "6,1" },
  "7,1": { type: "p", color: "w", position: "7,1" },
  "0,6": { type: "p", color: "b", position: "0,6" },
  "1,6": { type: "p", color: "b", position: "1,6" },
  "2,6": { type: "p", color: "b", position: "2,6" },
  "3,6": { type: "p", color: "b", position: "3,6" },
  "4,6": { type: "p", color: "b", position: "4,6" },
  "5,6": { type: "p", color: "b", position: "5,6" },
  "6,6": { type: "p", color: "b", position: "6,6" },
  "7,6": { type: "p", color: "b", position: "7,6" },
  "0,7": { type: "r", color: "b", position: "0,7" },
  "1,7": { type: "n", color: "b", position: "1,7" },
  "2,7": { type: "b", color: "b", position: "2,7" },
  "3,7": { type: "k", color: "b", position: "3,7" },
  "4,7": { type: "q", color: "b", position: "4,7" },
  "5,7": { type: "b", color: "b", position: "5,7" },
  "6,7": { type: "n", color: "b", position: "6,7" },
  "7,7": { type: "r", color: "b", position: "7,7" },
};

const Board = ({
  sendMoveData,                     // 서버에 보낼 데이터
  isReversed,                       // 보드 상하좌우 반전에 사용될 변수
  resetBoardFlag,                   // 보드 초기화에 사용될 변수
  onResetComplete,                  // 보드가 초기화 됨을 확인할 때 사용할 변수
  invalidMoveFlag,                  // 잘못된 움직임 여부를 나타내는 플래그
  onInvalidMoveFlagComplete,        // 잘못된 움직임 수정 완료됨을 확인할 때 사용할 변수
  validMoveFlag,                    // 유효한 움직임 여부를 나타내는 플래그
  onValidMoveFlagComplete,          // 유효한 움직임 완료됨을 확인할 때 사용할 변수
  boardState,                       // 유효한 움직임 이후 보드 정보를 갖고 있는 변수
  selectTeam,                       // 팀 색상
  timeOwner,                        // 현재 턴인 색상

  castling,
  onCastlingComplete,

  enpassant,
  onEnpassantComplete,

  promotion,
  onPromotionComplete,
  promotionPiece,
  onPromotionPieceComplete
}) => {
  const [board, setBoard] = useState(initialBoardSetup);             // 현재 보드 상태를 나타냄
  const [draggedPiece, setDraggedPiece] = useState(null);            // 마우스로 드래그한 기물 정보 저장
  const [draggedOverSquare, setDraggedOverSquare] = useState(null);  // 사용자가 드래그한 기물을 놓을(드롭할) 위치를 저장
  //이전 보드 상태 저장
  const [boardStore, setBoardStore] = useState(initialBoardSetup); 

  useEffect(() => {
    if (resetBoardFlag) {
      //보드 초기화
      setBoard(initialBoardSetup);
      //보드 초기화를 완료했음을 알림
      onResetComplete();
    }
    if (invalidMoveFlag) {
      setBoard(boardStore); // 이전 보드 상태로 복구
      onInvalidMoveFlagComplete(); // 이전 보드 상태로 복구 완료 시 플래그 해제
    }
    if (validMoveFlag) {
      const pieceInform = boardState.split(" ");

      const from = pieceInform[2];
      const to = pieceInform[5];
      const type = pieceInform[11];
      const color = pieceInform[8];
      const position = to;
      
      console.log(
        "from:", from, "\n",
        "to:", to, "\n",
        "type:", type, "\n",
        "color:", color, "\n", 
        "position:", position, "\n"
      );

      const upDatedBoard = { ...board };
      upDatedBoard[from] = null;
      upDatedBoard[to] = { type: type, color: color, position: position };

      if(castling===true){
        const clastlingRook = pieceInform[pieceInform.length-1];

        if(clastlingRook === "2,7"){
          upDatedBoard["0,7"] = null;
          upDatedBoard[clastlingRook] = {type: "r", color: color, position: clastlingRook};
        }
        else if(clastlingRook === "4,7"){
          upDatedBoard["7,7"] = null;
          upDatedBoard[clastlingRook] = {type: "r", color: color, position: clastlingRook};
        }
        else if(clastlingRook === "2,0"){
          upDatedBoard["0,0"] = null;
          upDatedBoard[clastlingRook] = {type: "r", color: color, position: clastlingRook};
        }
        else{
          upDatedBoard["7,0"] = null;
          upDatedBoard[clastlingRook] = {type: "r", color: color, position: clastlingRook};
        }

        onCastlingComplete();
      }
      else if(enpassant===true){
        const enpassantPawn = pieceInform[pieceInform.length-1];
        const [col, row] = enpassantPawn.split(",").map(Number);

        if(color === "w"){ 
          const new_row = row - 1;
          const removePawnPosition = String(col)+","+String(new_row);
          console.log("removePawnPosition: "+removePawnPosition);
          upDatedBoard[removePawnPosition] = null;
        }
        else{
          const new_row = row + 1;
          const removePawnPosition = String(col)+","+String(new_row);
          console.log("removePawnPosition: "+removePawnPosition);
          upDatedBoard[removePawnPosition] = null;
        }
        onEnpassantComplete();
      }
      else if(promotion===true){
        if(promotionPiece !==""){
          upDatedBoard[to] = { type: promotionPiece, color: color, position: position };
          onPromotionComplete();
          onPromotionPieceComplete();
        }
        else{
          setBoard(upDatedBoard);
          setBoardStore(upDatedBoard); //다음 기물을 옮기기 전 보드상태 저장
          return;
        }
      }
      

      setBoard(upDatedBoard);
      setBoardStore(upDatedBoard); //다음 기물을 옮기기 전 보드상태 저장

      onValidMoveFlagComplete();
    }
  }, [resetBoardFlag, invalidMoveFlag, validMoveFlag, castling, enpassant, promotion, promotionPiece]);

  const handleDragStart = (e, piece, position) => {
    // 본인 차례일 때 드래그 가능 + promotion 중일 때 드래그 못함
    if(timeOwner !== selectTeam || promotion === true){
      return;
    }
    //본인 팀 기물만 드래그 할 수 있음
    if(
      (selectTeam === "b" && piece.color === "w") ||
      (selectTeam === "w" && piece.color === "b")
    ) {
      return;
    }

    setDraggedPiece({ ...piece, position });
  };

  const handleDragOver = (e, square) => {
    e.preventDefault();
    setDraggedOverSquare(square);
  };

  const handleDrop = () => {
    if (draggedPiece && draggedOverSquare) {
      const newBoard = { ...board };
      newBoard[draggedOverSquare] = { ...draggedPiece };
      newBoard[draggedPiece.position] = null;
      const from = draggedPiece.position;
      const to = draggedOverSquare;
      const color = draggedPiece.color;
      const team = draggedPiece.color === "w" ? "White" : "Black";
      const type = draggedPiece.type;

      const moveData = {
        eventTime: new Date().toISOString(),
        from,
        to,
        color,
        team,
        type,
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

  return <div className="board">{squares}</div>;
};

export default Board;