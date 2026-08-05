import CartProvider from "./cart/CartProvider";
import DataProvider from "./data/DataProvider";
import AppRouter from "./router/AppRouter";
import AppToaster from "./components/AppToaster";

function App() {
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
