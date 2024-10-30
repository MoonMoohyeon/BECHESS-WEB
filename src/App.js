import React, { useEffect, useRef, useState } from "react";
import * as StompJs from "@stomp/stompjs";
import Board from "./components/Board";
import "./styles.css";
import moveSound from "./move.mp3";
import "./App.css";

const App = () => {
  const client = useRef({});
  const moveSoundRef = useRef(new Audio(moveSound)); // Create an audio instance
  
  /*팀 선택*/
  const [selectTeam, setSelectTeam] = useState("");

  /*타이머 관련 변수*/
  const initialSeconds = 100000; // 초기 시간 설정
  const [secondsWhite, setSecondsWhite] = useState(initialSeconds); // 현재 시간
  const [secondsBlack, setSecondsBlack] = useState(initialSeconds); // 현재 시간
  const [timeOwner, setTimeOwner] = useState("w"); // 시간 사용중인 팀

  /*보드 상하좌우 반전 여부 관리*/
  const [isReversed, setIsReversed] = useState(false);
  /*게임 시작 여부 관리*/
  const [gameStarted, setGameStarted] = useState(false);

  /*유효하지 않은  기물을 움직일 때 보낼 메시지*/
  const [invalidMoveMessage, setInvalidMoveMessage] = useState("");
  /*기물 움직임 잘못됨 여부를 나타냄*/
  const [invalidMoveFlag, setInvalidMoveFlag] = useState(false);

  /*기물 움직임 유효 여부를 나타냄*/
  const [validMoveFlag, setValidMoveFlag] = useState(false);
  /*보드를 리셋하는데 사용할 변수*/
  const [resetBoardFlag, setResetBoardFlag] = useState(false);
  const [resetButtonPress, setResetButtonPress] = useState(0);
  /*보드 상태 관리*/
  const [boardState, setBoardState] = useState("");

  /*체스 규칙 관련 변수*/
  const [castling, setCastling] = useState(false);
  const [enpassant, setEnpasenpassant] = useState(false);
  const [promotion, setPromotion] = useState(false);
  const [promotionPiece, setPromotionPiece] = useState("");


  /*STOMP 프로토콜을 사용하여 웹소켓 서버에 연결*/
  const connect = () => {
    client.current = new StompJs.Client({
      brokerURL: "ws://localhost:9090/chess", // Updated WebSocket URL
      connectHeaders: {},
      debug: function (str) {
        console.log(str);
      },
      onConnect: () => {
        console.log("onConnect 실행됨...");
        subscribe();
        client.current.publish({
          destination: `/app/Web/join`,
          body: "Web",
        });
      },
      onStompError: (frame) => {
        console.log("Broker reported error: " + frame.headers["message"]);
        console.log("Additional details: " + frame.body);
      },
    });

    client.current.activate();
  };


  /*STOMP 클라이언트를 사용하여 서버로부터 메시지를 구독*/
  const subscribe = () => {
    const subscription = client.current.subscribe(`/topic/Web`, msg_callback);
    return subscription;
  };


  /*STOMP 클라이언트를 사용하여 현재 웹소켓 연결을 끊기*/
  const disConnect = () => {
    if (client.current.connected) client.current.deactivate();
  };


  /*컴포넌트가 처음 마운트될 시 STOMP 클라이언트를 서버에 연결*/
  /*(언마운트 될 시 서버와 연결을 끊음)*/
  useEffect(() => {
    console.log("클라이언트 연결됨", client.current.connected);
    connect();
    return () => disConnect();
  }, []);


  /*broker 가 client 한테 메시지 전송할때마다, 트리거되는 콜백 함수.*/
  const msg_callback = (message) => {
    if (message.body) {
      console.log("받아온 메시지 : " + message.body);
      const action = message.body.split("\n");
      const action2 = message.body.split(" ");
      // gameStart 메시지를 받으면 게임 시작 상태로 업데이트
      if (action[0] === "gameStart") {
        setGameStarted(true);
        console.log("완료");
        return 0;
      }

      // validMove 메시지를 받으면 보드상태 업데이트
      else if (action[0] === "validMove") {
        setBoardState(action[1]); // 옮긴 기물 위치와 색상을 웹에서 서버로 전달
        const pieceInform = action[1].split(" ");
        //console.log(pieceInform);
        //console.log(pieceInform[pieceInform.length-3]);

        if(pieceInform[pieceInform.length-3] === "castle"){
          setCastling(true);
          console.log("caslting!!!");
        }
        else if(pieceInform[pieceInform.length-3] === "enpassant"){
          setEnpasenpassant(true);
          console.log("enpassant!!!");
        }

        // 턴 바뀜 처리
        setTimeOwner((prevOwner) => (prevOwner === "w" ? "b" : "w"));

        if(pieceInform[pieceInform.length-3] === "promotion"){
          setTimeOwner((prevOwner) => (prevOwner === "w" ? "b" : "w"));
          setPromotion(true);
          console.log("promotion!!!");
        }

        setValidMoveFlag(true); // 유효한 이동 플래그

        //console.log("validMove! timeOwner updated to", timeOwner === "w" ? "흑" : "백");
        return 0;
      }
      // 다른 팀의 promotion에 의한 piece 수정
      else if(action[0] === "promotionInfo"){
        if(promotion===true && promotionPiece === ""){
          setPromotionPiece(action[1]);
        }
      }

      // 기물을 잘못 이동했을 경우 에러 메시지 설정
      else if (action[0] === "invalidMove") {
        setInvalidMoveFlag(true); // 유효하지 않은 이동 플래그
        //console.log(action[1]);
        console.log("invalidMove!");
        setInvalidMoveMessage("잘못된 이동입니다."); // 웹에 나타낼 에러 메시지 설정
        setTimeout(() => setInvalidMoveMessage(""), 1500); // 1.5초 후에 메시지 제거
      }
      // 보드 초기화 메시지를 받았을 때
      else if (action[0] === "boardReset") {
        if(resetButtonPress === 0 && resetBoardFlag === false){
          setResetBoardFlag(true);
        }
      }
      

      // 현재 턴이 끝난 팀 정보를 받아 timeOwner 변수에 저장함
      if (action2[0] === "gameOver") {
        if (action2[1] === "w") {
          setTimeOwner("b");
        } 
        else if (action2[1] === "b"){
          setTimeOwner("w");
        }
        else{
          console.log("error!!!!: "+timeOwner);
        }
      } 
      

    } else {
      console.log("메시지 is empty...");
    }
  };


  /*web 정보를 서버로 전달*/
  const sendMoveData = (moveData) => {
    console.log(moveData);
    if (client.current.connected) {
      client.current.publish({
        destination: "/app/Web/move",
        body: JSON.stringify(moveData),
      });
      moveSoundRef.current.play(); // Play the move sound
    }
  };

  
  /*타이머 처리 부분*/
  // 타이머 useEfferct
  useEffect(() => {
    console.log("!!! "+timeOwner+"\n");
    // gameStart 상태이고 seconds가 0이 아닌 경우 1초씩 감소시킴
    if (gameStarted && (timeOwner === selectTeam)){
      let timer;
      if (selectTeam === "w" && secondsWhite > 0) {
        timer = setInterval(() => {
          setSecondsWhite((prevSeconds) => {
            if (timeOwner !== "w") return prevSeconds; // timeOwner가 "w"가 아니면 감소 중지
            if (secondsWhite <= 0){
              sendTimeUpMessage();
              return 0;
            }
            return prevSeconds - 1;
          });
        }, 1000);
      } 
      else if (selectTeam === "b" && secondsBlack > 0) {
        timer = setInterval(() => {
          setSecondsBlack((prevSeconds) => {
            if (timeOwner !== "b") return prevSeconds; // timeOwner가 "b"가 아니면 감소 중지
            if (secondsBlack <= 0){
              sendTimeUpMessage();
              return 0;
            }
            return prevSeconds - 1;
          });
        }, 1000);
      }

      return () => clearInterval(timer);
    }
  }, [selectTeam, timeOwner, secondsWhite, secondsBlack]);

  const sendTimeUpMessage = () => {
    // client가 연결 가능한지 확인
    if (client.current.connected) {
      // 메시지 보내기
      client.current.publish({
        destination: "/app/Web/timeUp", // 스프링 부트 컨트롤러의 엔드포인트
        body: timeOwner, // 전송할 메시지 내용
      });
      /*
      console.log(
        "TimeOver: " + timeOwner + " 메시지를 성공적으로 전송했습니다."
      );
      */
    } else {
      console.log("WebSocket 연결이 되어 있지 않습니다.");
    }
  };


  /*리셋 버튼 관련 부분*/
  // reset버튼 눌렀을 때 서버에 메시지를 보내는 함수
  const resetMessage = () => {
    // client가 연결 가능한지 확인
    if (client.current.connected) {
      // 메시지 보내기
      client.current.publish({
        destination: "/app/Web/reset", // 스프링 부트 컨트롤러의 엔드포인트
        body: "reset!", // 전송할 메시지 내용
      });
      console.log("reset 메시지를 성공적으로 전송했습니다.");
    } else {
      console.log("WebSocket 연결이 되어 있지 않습니다.");
    }
  };
  useEffect(() => {
    //버튼 누를 경우 서버에 reset메시지 전송
    if(resetButtonPress === 1 && resetBoardFlag === true){
      setTimeOwner("w");
      setSecondsWhite(initialSeconds);
      setSecondsBlack(initialSeconds);
      resetMessage();
    }
    //버튼 누르지 않은 경우 보드 초기화만 함
    else if(resetButtonPress === 0 && resetBoardFlag === true){
      setTimeOwner("w");
      setSecondsWhite(initialSeconds);
      setSecondsBlack(initialSeconds);
    }
    //버튼이 눌러져 있는 경우 리셋 후 초기화
    else if(resetButtonPress === 1  && resetBoardFlag ===false){
      setResetButtonPress(0);
    }
  }, [resetBoardFlag]);


  /*흑, 백 팀 선택*/
  //팀 선택 후 결과를 서버로 보냄
  useEffect(() => {
    if (selectTeam !== "") {
      completeChooseTeam();
    }
  }, [selectTeam]);
  const completeChooseTeam = () => {
    // client가 연결 가능한지 확인
    if (client.current.connected) {
      // 메시지 보내기
      client.current.publish({
        destination: "/app/Web/team", // 스프링 부트 컨트롤러의 엔드포인트
        body: selectTeam, // 전송할 메시지 내용
      });
      console.log("selectTeam:" + selectTeam + " 메시지를 성공적으로 전송했습니다.");
    } else {
      console.log("WebSocket 연결이 되어 있지 않습니다.");
    }
  };

  /*Promotion useEffect*/
  //본인 팀이 timeOwner인 경우, promotion 결과를 다른 팀에 전달한다.
  // useEffect(() => {
  //   if(timeOwner === selectTeam && promotion === true && promotionPiece!==""){
  //     sendPromotionInfo();
  //   }
  // }, [promotionPiece]);
  // const sendPromotionInfo = () => {
  //   // client가 연결 가능한지 확인
  //   if (client.current.connected) {
  //     // 메시지 보내기
  //     client.current.publish({
  //       destination: "/app/Web/", // 스프링 부트 컨트롤러의 엔드포인트
  //       body: "promotionPiece : " + promotionPiece, // 전송할 메시지 내용
  //     });
  //     console.log("promotionPiece :" + promotionPiece + " 메시지를 성공적으로 전송했습니다.");
  //   } else {
  //     console.log("WebSocket 연결이 되어 있지 않습니다.");
  //   }
  // };


  return (
    <div className="App">
      {!gameStarted || selectTeam === ""? ( // 게임 대기 또는 팀 선택 전인 경우
        <>
          <h3>대기 중... 게임이 곧 시작됩니다.</h3>
          <button className="button1" onClick={() => setSelectTeam("b")}>
            흑
          </button>
          <button className="button1" onClick={() => setSelectTeam("w")}>
            백
          </button>
        </>
      ) : (
        <>
          <header className="App-header">
          <h3 className="timerText">
            남은시간 :{" "}
            {
              selectTeam === "w"
                ? (secondsWhite <= 0 
                    ? "타임오버 패배" 
                    : (selectTeam !== timeOwner ? `상대 턴 ${secondsWhite}초` : `${secondsWhite}초`))
                : (secondsBlack <= 0 
                    ? "타임오버 패배" 
                    : (selectTeam !== timeOwner ? `상대 턴 ${secondsBlack}초` : `${secondsBlack}초`))
            }
          </h3>
            <h3 className="turn">{timeOwner==="w"? "백 " : "흑 "} 차례</h3>
            <button
              className="button1"
              onClick={() => setIsReversed(!isReversed)}
            >
              보드 반전
            </button>
            <button 
              className="button1" 
              onClick={() => {
                setResetButtonPress(1);
                setResetBoardFlag(true);
              }}
            >
              보드 초기화
            </button>
          </header>

          <main className="App-main">
            <Board
              className="board"
              sendMoveData={sendMoveData}
              isReversed={isReversed}
              resetBoardFlag={resetBoardFlag}
              onResetComplete={() => setResetBoardFlag(false)} // 보드를 초기화 완료 시 플래그 해제
              invalidMoveFlag={invalidMoveFlag}
              onInvalidMoveFlagComplete={() => setInvalidMoveFlag(false)} // 이전 보드 상태로 복구 완료 시 플래그 해제
              validMoveFlag={validMoveFlag}
              onValidMoveFlagComplete={() => setValidMoveFlag(false)} // 유효한 움직임에 대한 보드 상태 변경 완료 시 플래그 해제
              boardState={boardState} // 유효한 움직임에 대해 보드 상태
              selectTeam={selectTeam} // 팀 색상
              timeOwner={timeOwner} // 현재 턴인 색상

              castling={castling}
              onCastlingComplete={() => setCastling(false)}
              enpassant={enpassant}
              onEnpassantComplete={() => setEnpasenpassant(false)}
              
              promotion={promotion}
              onPromotionComplete={() => {
                setPromotion(false);
                setTimeOwner((prevOwner) => (prevOwner === "w" ? "b" : "w"));
              }}
              promotionPiece={promotionPiece}
              onPromotionPieceComplete={() => setPromotionPiece("")}

            />
          </main>

          <footer className="App-footer">
            {invalidMoveMessage && (
              <h3 className="error-message">{invalidMoveMessage}</h3>
            )}
            {selectTeam === timeOwner && promotion && (
              <>
              <p>Choose a piece for promotion:</p>
              <button onClick={() => setPromotionPiece("q")}>Queen</button>
              <button onClick={() => setPromotionPiece("r")}>Rook</button>
              <button onClick={() => setPromotionPiece("b")}>Bishop</button>
              <button onClick={() => setPromotionPiece("n")}>Knight</button>
              </>
            )}
          </footer>
        </>
      )}
    </div>
  );
};

export default App;
