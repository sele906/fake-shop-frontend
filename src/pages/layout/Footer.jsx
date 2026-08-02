import styles from "./Layout.module.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* 가게 소개보다 만든 사람 소개를 먼저 내보내는 줄. 아래 컬럼은 그대로 둔다. */}
      <Link className={styles.hire} to="/careers">
        <div className={styles.hireInfo}>
          <strong>이 사이트를 만든 개발자</strong>
          <span className={styles.hireLead}>기획부터 배포까지 직접 만든 백엔드 개발자의 이야기입니다.</span>
        </div>
        <span className={styles.hireCta} aria-hidden="true">
          이력과 프로젝트 보기 →
        </span>
      </Link>

      <div>
        <strong>안삼 STORE</strong>
        사고 싶은 마음만 정성껏 모았습니다.
        <br />
        결제는 없고, 미련은 무료로 제공됩니다.
      </div>

      <nav>
        <strong><Link to="/help">고객센터</Link></strong>
        <Link to="/help/faq">굳이 자주 묻는 질문</Link>
        <Link to="/help/return">안 산 상품 반품하기</Link>
      </nav>

      <nav>
        <strong><Link to="/company">회사</Link></strong>
        <Link to="/company/about">제법 그럴듯한 회사 소개</Link>
        <Link to="/company/partner">입점 문의만 받아보기</Link>
        <Link to="/careers">채용 공고 구경하기</Link>
      </nav>

      {/* Pexels 방침에 따라 목록 화면에 실린 사진의 출처를 남긴다. */}
      <p className={styles.credit}>
        상품 이미지 출처:{" "}
        <a href="https://www.pexels.com" target="_blank" rel="noreferrer">
          Pexels
        </a>
      </p>
    </footer>
  );
}
