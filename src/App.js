import React, { useEffect, useRef, useState } from 'react';
import * as StompJs from '@stomp/stompjs';
import Board from './components/Board';
import './styles.css';
import moveSound from './move.mp3'; // Import the move.mp3 file

const App = () => {
    const client = useRef({});
    const moveSoundRef = useRef(new Audio(moveSound)); // Create an audio instance

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
      connect();
      console.log("클라이언트 연결됨", client.current.connected);
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
    
    return (
      <div className="App">
        <Board sendMoveData={sendMoveData} />
      </div>
    );
};

export default App;
