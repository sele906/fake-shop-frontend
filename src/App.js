import { Toaster } from "sonner";
import CartProvider from "./cart/CartProvider";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <CartProvider>
      <AppRouter />

      {/* 토스트는 sonner가 맡는다. 기본 모양이 둥글어서 프로젝트의 각진 스타일로 덮는다.
          모바일에서는 장바구니 · 상세의 하단 고정 바를 가리지 않게 띄워 둔다. */}
      <Toaster
        position="bottom-right"
        duration={2000}
        mobileOffset={{ bottom: "96px", left: "16px", right: "16px" }}
        toastOptions={{
          style: {
            background: "var(--text)",
            color: "#fff",
            border: 0,
            borderRadius: 0,
            boxShadow: "none",
            fontFamily: "var(--font)",
            fontSize: "14px",
            lineHeight: 1.5,
            padding: "14px 16px",
            width: "100%",
          },
        }}
      />
    </CartProvider>
  );
}

export default App;
