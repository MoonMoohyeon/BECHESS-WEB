import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { createStore } from 'redux';
// import { store } from "./stores/index";

const count = 3;

function reducer(state = count, action){
  switch (action.type){
    case 'DECREASE_COUNT':
      if(state > 0){
        state = state -1;
        return state;
      }
    default:
      return state;
  }
}
let store = createStore(reducer)

// ReactDOM.render(
//   <React.StrictMode>
//     <Provider store={store}>
//       <App />
//     </Provider>
//   </React.StrictMode>,
//   document.getElementById('root')
// )

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      {/* <BrowserRouter> */}
        <App />
        {/*  <ConnectionText/>*/}
      {/* </BrowserRouter> */}
    </Provider>
  </React.StrictMode>,
   document.getElementById('root')
);

reportWebVitals();