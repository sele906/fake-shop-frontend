import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "./Help.module.css";

const FAQS = [
  {
    question: "정말 아무것도 살 수 없나요?",
    answer:
      "네. 상품을 담고 구경할 수는 있지만 실제 결제와 배송은 진행되지 않습니다. 마음만 가볍게 들고 오시면 됩니다.",
  },
  {
    question: "장바구니에 담은 상품은 어디에 저장되나요?",
    answer:
      "현재 사용하는 브라우저에만 잠시 저장됩니다. 브라우저 데이터를 지우거나 다른 기기를 사용하면 장바구니 내용이 달라질 수 있습니다.",
  },
  {
    question: "결제 버튼을 눌러도 돈이 빠져나가지 않나요?",
    answer:
      "실제 결제 수단과 연결되어 있지 않아 돈이 빠져나가지 않습니다. 주문하는 기분과 그럴듯한 영수증만 제공됩니다.",
  },
  {
    question: "상품 사진과 설명은 실제 판매 정보인가요?",
    answer:
      "상품 사진은 Pexels 이미지를 활용하고 있으며 상품명, 가격, 설명은 이 가짜 쇼핑몰을 위해 구성한 정보입니다.",
  },
  {
    question: "로그인하면 회원 혜택을 받을 수 있나요?",
    answer:
      "로그인하는 척은 할 수 있지만 실제 회원 계정이나 적립금은 생기지 않습니다. 혜택을 받은 듯한 만족감만 챙겨가세요.",
  },
];

const RETURN_STEPS = [
  {
    title: "안 산 상품 확인하기",
    description:
      "장바구니나 영수증에서 반품하고 싶은 척할 상품을 골라봅니다.",
  },
  {
    title: "구매한 기억 되짚기",
    description:
      "실제로 결제한 적이 없다는 사실을 천천히 확인합니다.",
  },
  {
    title: "반품 완료하기",
    description:
      "보낼 상품도 환불할 금액도 없으므로 확인하는 순간 반품이 완료됩니다.",
  },
];

export default function Help() {
  const { section } = useParams();

  useEffect(() => {
    if (!section) return;

    const sectionId = section === "return" ? "return" : "faq";
    const frameId = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [section]);

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>HELP DESK</span>
        <h1>
          묻기 전에 답했고
          <br />
          사기 전에 반품해드립니다
        </h1>
        <p>
          안삼 STORE 이용 중 굳이 궁금할 수 있는 내용과 안 산 상품을
          반품하는 방법을 한곳에 모았습니다.
        </p>

        <nav className={styles.quickLinks} aria-label="도움말 바로가기">
          <Link to="/help/faq">자주 묻는 질문</Link>
          <Link to="/help/return">반품 안내</Link>
        </nav>
      </header>

      <section
        id="faq"
        className={styles.section}
        aria-labelledby="faq-title"
      >
        <div className={styles.sectionHead}>
          <span className={styles.index}>01</span>
          <div>
            <h2 id="faq-title">굳이 자주 묻는 질문</h2>
            <p>실제로 문의하기 전에 대충 해결할 수 있는 답변입니다.</p>
          </div>
        </div>

        <div className={styles.faqList}>
          {FAQS.map((faq, index) => (
            <details key={faq.question} open={index === 0}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section
        id="return"
        className={`${styles.section} ${styles.returnSection}`}
        aria-labelledby="return-title"
      >
        <div className={styles.sectionHead}>
          <span className={styles.index}>02</span>
          <div>
            <h2 id="return-title">안 산 상품 반품하기</h2>
            <p>구매하지 않았기 때문에 누구보다 빠르고 간단합니다.</p>
          </div>
        </div>

        <div className={styles.notice}>
          <strong>반품 전에 확인해 주세요</strong>
          <p>
            안삼 STORE에는 실제 주문과 배송이 없습니다. 아래 안내는 반품하는
            기분을 완성하기 위한 절차입니다.
          </p>
        </div>

        <ol className={styles.steps}>
          {RETURN_STEPS.map((step, index) => (
            <li key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <dl className={styles.policy}>
          <div>
            <dt>반품 가능 기간</dt>
            <dd>구매한 적이 없으므로 언제든지</dd>
          </div>
          <div>
            <dt>반품 배송비</dt>
            <dd>보낼 상품이 없으므로 0원</dd>
          </div>
          <div>
            <dt>환불 예정 금액</dt>
            <dd>결제한 금액이 없으므로 0원</dd>
          </div>
          <div>
            <dt>반품 불가 대상</dt>
            <dd>다른 쇼핑몰에서 실제로 구매한 상품</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
