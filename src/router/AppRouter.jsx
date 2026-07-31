import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Layout from "../pages/layout/Layout";
import Main from "../pages/main/Main";
import Category from "../pages/ctg/Ctg";
import ProductDetail from "../pages/detail/Detail";
import Login from "../pages/login/Login";
import Promo from "../pages/promo/Promo";
import Receipt from "../pages/receipt/Receipt";
import Cart from "../pages/cart/Cart";
import Checkout from "../pages/checkout/Checkout";
import Help from "../pages/help/Help";
import Company from "../pages/company/Company";

/* 화면을 옮기면 스크롤은 맨 위에서 시작한다.
   목록을 한참 내려보다 상세로 들어갔을 때 중간부터 보이는 걸 막는다. */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppRouter() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* 헤더 · 사이드바 · 푸터를 함께 쓰는 화면들 */}
        <Route element={<Layout />}>
          <Route path="/" element={<Main />} />
          <Route path="/category/:categoryCode" element={<Category />} />
          <Route path="/promo/:promoId" element={<Promo />} />

          <Route path="/help/:section?" element={<Help />} />
          <Route path="/company/:section?" element={<Company />} />
        </Route>

        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        {/* 공유 링크로 열리는 영수증. 내용은 ?d= 안에 들어 있다. */}
        <Route path="/receipt" element={<Receipt />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        
      </Routes>
    </>
  );
}

export default AppRouter;
