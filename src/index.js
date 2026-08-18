import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import App from "./App";

/* 모든 페이지의 CSS 모듈이 여기 :root의 색상 · 폰트 · 높이 토큰을 쓴다.
   이 import가 빠지면 var(--...)가 전부 무효가 돼 디자인이 통째로 날아간다. */
import "./index.css";

/* 화면이 그려지기 전에 사전을 올려 둔다. 이 import가 빠지면
   t()가 키 문자열을 그대로 뱉는다. */
import "./i18n";

/* 같은 코드가 앱으로도 웹사이트로도 돈다. 브라우저 기본 동작을 끄는 일은
   앱에서만 옳아서 — 웹에서 텍스트 선택을 막으면 복사하려는 사람을 막는다 —
   여기서 표시만 해 두고 판단은 index.css가 .native로 한다. */
if (Capacitor.isNativePlatform()) {
  document.documentElement.classList.add("native");
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
