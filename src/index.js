import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

/* 모든 페이지의 CSS 모듈이 여기 :root의 색상 · 폰트 · 높이 토큰을 쓴다.
   이 import가 빠지면 var(--...)가 전부 무효가 돼 디자인이 통째로 날아간다. */
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
