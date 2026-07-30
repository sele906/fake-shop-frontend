import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Outlet } from "react-router-dom";
import styles from "./Layout.module.css";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const MOBILE_QUERY = "(max-width:900px)";

/* 드로어 상태는 레이아웃이 들고 있다. 본문에서도 열 수 있어야 해서
   (카테고리 페이지의 모바일 "카테고리" 버튼) 컨텍스트로 내려준다. */
const NavContext = createContext({ isNavOpen: false });

export function useNav() {
  return useContext(NavContext);
}

/**
 * 헤더 · 사이드바 · 푸터를 공유하는 화면들의 껍데기.
 *
 * 라우터에서 레이아웃 라우트로 감싸 쓰고, 각 페이지는 본문만 그린다.
 *
 *   <Route element={<Layout />}>
 *     <Route path="/" element={<Main />} />
 *   </Route>
 */
export default function Layout() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const openNav = useCallback(() => setIsNavOpen(true), []);
  const closeNav = useCallback(() => setIsNavOpen(false), []);
  const toggleNav = useCallback(() => setIsNavOpen((open) => !open), []);

  /* 모바일에서만 링크 선택 시 드로어를 닫는다. */
  const closeNavOnMobile = useCallback(() => {
    if (window.matchMedia(MOBILE_QUERY).matches) closeNav();
  }, [closeNav]);

  /* 드로어가 열려 있는 동안 배경 스크롤을 잠근다. */
  useEffect(() => {
    document.body.classList.toggle("navOpen", isNavOpen);

    return () => document.body.classList.remove("navOpen");
  }, [isNavOpen]);

  useEffect(() => {
    if (!isNavOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") closeNav();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isNavOpen, closeNav]);

  const nav = useMemo(
    () => ({ isNavOpen, openNav, closeNav }),
    [isNavOpen, openNav, closeNav]
  );

  return (
    <NavContext.Provider value={nav}>
      <Header isNavOpen={isNavOpen} onToggleNav={toggleNav} />

      <div
        className={`${styles.scrim} ${isNavOpen ? styles.open : ""}`}
        hidden={!isNavOpen}
        onClick={closeNav}
      />

      <div className={styles.shell}>
        <Sidebar
          isOpen={isNavOpen}
          onClose={closeNav}
          onNavigate={closeNavOnMobile}
        />

        <main className={styles.main}>
          <Outlet />
          <Footer />
        </main>
      </div>
    </NavContext.Provider>
  );
}
