import CartProvider from "./cart/CartProvider";
import DataProvider from "./data/DataProvider";
import AppRouter from "./router/AppRouter";
import AppToaster from "./components/AppToaster";
import Onboarding from "./components/Onboarding";
import useBackButton from "./hooks/useBackButton";
import useDeepLink from "./hooks/useDeepLink";

function App() {
  /* 기기 뒤로가기. 화면마다 달지 않고 여기 한 번만 단다 —
     라우터 바깥에서 오는 신호라 어느 화면이 떠 있든 같은 곳이 받는다. */
  useBackButton();

  /* 공유 링크로 열린 경우. 같은 이유로 여기 한 번만 단다. */
  useDeepLink();

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

      {/* 첫 방문 안내도 같은 이유로 밖에 둔다. 상품을 못 받아 온 화면에서도
          "여기서는 결제가 일어나지 않는다"는 말은 그대로 유효하다.
          모바일에서만, 그것도 한 번만 뜬다 — 판단은 컴포넌트 안에 있다. */}
      <Onboarding />
    </>
  );
}

export default App;
