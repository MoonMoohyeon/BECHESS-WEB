import React, { useEffect, useRef, useState } from 'react';
import * as StompJs from '@stomp/stompjs';
import Board from './components/Board';
import './styles.css';

const App = () => {
    const client = useRef({});

    const connect = () => {
      client.current = new StompJs.Client({
        brokerURL: "ws://124.51.252.25:9090/chess", // Updated WebSocket URL
        connectHeaders: {
        },
        debug: function (str) {
          console.log(str);
        },
        onConnect: () => {
          console.log("onConnect 실행됨...");
          subscribe();
          client.current.publish({
            destination: `/chess-game`,
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
        `/chess-game`,
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
      if (client.current.connected) {
        client.current.publish({
          destination: '/chess-game/move',
          body: JSON.stringify(moveData)
        });
                    moveSound.play();
      }
    };

    // const sendMove = (from, to) => {
    //     if (client) {
    //         client.publish({
    //             destination: '/app/move',
    //             body: JSON.stringify({
    //                 move: { from, to },
    //                 team: currentTeam,
    //                 role: currentRole
    //             })
    //         });
    //         moveSound.play();
    //     }
    // };
    
    return (
      <div className="App">
        <Board sendMoveData={sendMoveData} />
      </div>
    );
};

export default App;
