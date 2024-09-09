import React, { useEffect, useRef, useState } from 'react';
import * as StompJs from '@stomp/stompjs';
import Board from './components/Board';
import './styles.css';
import { useDispatch, useSelector } from 'react-redux';
import moveSound from './move.mp3';
import './App.css';

const App = () => {

    const client = useRef({});
    const moveSoundRef = useRef(new Audio(moveSound)); // Create an audio instance

    /*타이머*/
    const count = useSelector( (state) => state );
    const dispatch = useDispatch();

    /*보드 반전(방향 상태) 관리*/
    const [isReversed, setIsReversed] = useState(false);
    /*게임 시작 상태 관리*/
    const [gameStarted, setGameStarted] = useState(false);
    /*유효하지 않은  기물 움직임 메시지 설정*/
    const [invalidMoveMessage, setInvalidMoveMessage] = useState('');
    /*보드를 이전 상태로 돌리는데 사용할 변수*/
    const [invalidMoveFlag, setInvalidMoveFlag] = useState(false);
    /*보드를 리셋하는데 사용할 변수*/
    const [resetBoardFlag, setResetBoardFlag] = useState(false);
    /*보드 상태 관리*/
    const [boardState, setBoardState] = useState(null);

    const connect = () => {
      client.current = new StompJs.Client({
        brokerURL: "ws://localhost:9090/chess", // Updated WebSocket URL
        connectHeaders: {
        },
        debug: function (str) {
          console.log(str);
        },
        onConnect: () => {
          console.log("onConnect 실행됨...");
          subscribe();
          client.current.publish({
            destination: `/app/join`,
            body: "Hello world",
          });
        },
        onStompError: (frame) => {
          console.log("Broker reported error: " + frame.headers["message"]);
          console.log("Additional details: " + frame.body);
        },
      });
  
      client.current.activate();
    };
  
    const subscribe = () => {
      const subscription = client.current.subscribe(
        `/topic/message`,
        msg_callback
      );
      return subscription;
    };
  
    /*broker 가 client 한테 메시지 전송할때마다, 트리거되는 콜백 함수.*/
    const msg_callback = (message) => {
      if (message.body) {
        console.log("받아온 메시지 : " + message.body);

        // gameStart 메시지를 받으면 게임 시작 상태 업데이트 + 타이머 실행
        if (message.body === 'gameStart') {
          setGameStarted(true);
          //1초마다 count 값 1 감소시킨다.
          const timer = setInterval(() => {
            dispatch({ type: 'DECREASE_COUNT' });
          }, 1000);
      
          return () => clearInterval(timer);
        }

        // move 메시지를 받으면 타이머 실행
        else if (message.body === 'move') {
          setGameStarted(true);
          //1초마다 count 값 1 감소시킨다.
          const timer = setInterval(() => {
            dispatch({ type: 'DECREASE_COUNT' });
          }, 1000);
      
          return () => clearInterval(timer);
        }

        // 기물을 잘못 이동했을 경우 에러 메시지 설정
        else if (message.body === 'invalidMove') {
          setInvalidMoveMessage('잘못된 이동입니다.'); // 에러 메시지 설정
          setTimeout(() => setInvalidMoveMessage(''), 1500); // 1.5초 후에 메시지 제거
          //보드 이전 상태로 리셋
          setInvalidMoveFlag(true);
        }
        // 기물을 제대로 움직인 경우 흑과 백 보드 에 모두 업데이트
        /*
        else {
          try {
              const parsedBoardState = JSON.parse(message.body); // 보드 상태를 JSON으로 파싱
              console.log("현재 보드상태:", parsedBoardState.board);
              //setBoardState(parsedBoardState); // 보드 상태 업데이트
          } catch (error) {
              console.error("Invalid board state received:", error);
          }
        } 
        */ 
      } else {
        console.log("메시지 is empty !!");
      }
    };
  
    const disConnect = () => {
      if (client.current.connected) client.current.deactivate();
    };
  
    useEffect(() => {
      console.log("클라이언트 연결됨", client.current.connected);
      connect();
      return () => disConnect();
    }, []);

    const sendMoveData = (moveData) => {
      console.log(moveData)
      if (client.current.connected) {
        client.current.publish({
          destination: '/app/moveWEB',
          body: JSON.stringify(moveData)
        });
        moveSoundRef.current.play(); // Play the move sound
      }
    };
    /*
    //count useEfferct
    useEffect(() => {
      //1초마다 count 값 1 감소시킨다.
      const timer = setInterval(() => {
        dispatch({ type: 'DECREASE_COUNT' });
      }, 1000);
  
      return () => clearInterval(timer);
    }, [count]);
    */
    //count가 0이 되었을 때 사용할 함수
    const sendTimeUpMessage = () => {
      //client가 연결 가능한지 확인
      if (client.current.connected){
        //메시지 보내기
        client.current.publish({
          destination: '/app/timeUp', // 스프링 부트 컨트롤러의 엔드포인트
          body: "Time is up!", //전송할 메시지 내용
        })
        console.log("메시지를 성공적으로 전송했습니다.");
      } else{
        console.log("WebSocket 연결이 되어 있지 않습니다.")
      }
    }
    
    //reset버튼 눌렀을 때 서버에 메시지 전송하는데 사용할 함수
    const resetMessage = () => {
      //client가 연결 가능한지 확인
      if (client.current.connected){
        //메시지 보내기
        client.current.publish({
          destination: '/app/reset', // 스프링 부트 컨트롤러의 엔드포인트
          body: "reset!", //전송할 메시지 내용
        })
        console.log("메시지를 성공적으로 전송했습니다.");
      } else{
        console.log("WebSocket 연결이 되어 있지 않습니다.")
      }
    }

    useEffect(() => {
      if (count === 0){
        sendTimeUpMessage();
      }
      if (resetBoardFlag === true){
        resetMessage();
      }
    }, [count]);
    
    return (
      <div className="App">
      {!gameStarted ?(
          <h3>대기 중... 게임이 곧 시작됩니다.</h3>
        ) : (
          <>
          <header className="App-header">
            <h3 className="timerText">남은시간 : {count}초</h3>
            <button className="button1" onClick={() => setIsReversed(!isReversed)}>보드 반전</button>
            <button className="button1" onClick={() => setResetBoardFlag(true)}>보드 초기화</button>
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

            //boardState={boardState} //유효한 움직임에 대해 보드 상태 수정
            />
          </main>

          <footer className="App-footer">
            {invalidMoveMessage && <h3 className="error-message">{invalidMoveMessage}</h3>}
          </footer>
          </>
        )
      }
      </div>
      /* <div className="App">
        {!gameStarted ?(
          <h3>대기 중... 게임이 곧 시작됩니다.</h3>
        ) : (
          <>
          <h2>남은시간 : {count}초</h2>
          <Board sendMoveData={sendMoveData} isReversed={isReversed} />
          <button onClick={() => setIsReversed(!isReversed)}>보드 반전</button>
          {errorMessage && <h3 className="error-message">{errorMessage}</h3>}
          </>
        )
        }
      </div> */
    );
};

export default App;

