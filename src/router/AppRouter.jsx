import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Layout from "../pages/layout/Layout";
import Main from "../pages/main/Main";
import Category from "../pages/ctg/Ctg";
import ProductDetail from "../pages/detail/Detail";
import Login from "../pages/login/Login";
import Cart from "../pages/cart/Cart";
import Checkout from "../pages/checkout/Checkout";

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
        </Route>

        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </>
  );
}

export default AppRouter;
