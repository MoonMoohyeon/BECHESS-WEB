import React, { useEffect, useRef, useState } from 'react';
import * as StompJs from '@stomp/stompjs';
import Board from './components/Board';
import './styles.css';
import { useDispatch, useSelector } from 'react-redux';
import moveSound from './move.mp3';

const App = () => {

    const client = useRef({});
    const moveSoundRef = useRef(new Audio(moveSound)); // Create an audio instance

    /*타이머*/
    const count = useSelector( (state) => state );
    const dispatch = useDispatch();

    /*보드 반전(방향 상태) 관리*/
    const [isReversed, setIsReversed] = useState(false);

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
          destination: '/app/move',
          body: JSON.stringify(moveData)
        });
        moveSoundRef.current.play(); // Play the move sound
      }
    };

    //count useEfferct
    useEffect(() => {
      //1초마다 count 값 1 감소시킨다.
      const timer = setInterval(() => {
        dispatch({ type: 'DECREASE_COUNT' });
      }, 1000);
  
      return () => clearInterval(timer);
    }, [count]);

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

    useEffect(() => {
      if (count === 0){
        sendTimeUpMessage();
      }
    }, [count]);
    
    return (
      <div className="App">
        <h2>남은시간 : {count}초</h2>
        <button onClick={() => setIsReversed(!isReversed)}>보드 반전</button>
        <Board sendMoveData={sendMoveData} isReversed={isReversed} />
      </div>
    );
};

export default App;

