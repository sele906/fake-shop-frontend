import CartProvider from "./cart/CartProvider";
import DataProvider from "./data/DataProvider";
import AppRouter from "./router/AppRouter";
import AppToaster from "./components/AppToaster";
import useBackButton from "./hooks/useBackButton";

function App() {
  /* 기기 뒤로가기. 화면마다 달지 않고 여기 한 번만 단다 —
     라우터 바깥에서 오는 신호라 어느 화면이 떠 있든 같은 곳이 받는다. */
  useBackButton();

  return (
    <>
      {/* 장바구니는 상품 정보를 붙여 쓰므로 데이터가 준비된 뒤에 열린다. */}
      <DataProvider>
        <CartProvider>
          <AppRouter />
        </CartProvider>
      </DataProvider>

      {/* 토스트는 데이터와 무관하다. 로딩 중에도 살아 있도록 밖에 둔다. */}
      <AppToaster />
    </>
  );
}

export default App;
