import styles from "./Layout.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div>
        <strong>안삼 STORE</strong>
        사고 싶은 마음만 정성껏 모았습니다.
        <br />
        결제는 없고, 미련은 무료로 제공됩니다.
      </div>

      <nav>
        <strong>고객센터</strong>
        <a href="#faq">굳이 자주 묻는 질문</a>
        <a href="#delivery">없는 제품 배송 조회</a>
        <a href="#return">안 산 상품 반품하기</a>
      </nav>

      <nav>
        <strong>회사</strong>
        <a href="#about">제법 그럴듯한 회사 소개</a>
        <a href="#partner">입점 문의만 받아보기</a>
        <a href="#careers">채용 공고 구경하기</a>
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
