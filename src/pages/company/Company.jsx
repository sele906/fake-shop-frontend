import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "./Company.module.css";

const VALUES = [
  {
    number: "01",
    title: "결제보다 구경",
    description:
      "구매를 재촉하는 대신 충분히 둘러보고 마음껏 담는 경험을 먼저 생각합니다.",
  },
  {
    number: "02",
    title: "배송보다 상상",
    description:
      "실제로 도착하는 상자보다 물건을 고르는 동안 생기는 재미를 중요하게 여깁니다.",
  },
  {
    number: "03",
    title: "소유보다 취향",
    description:
      "무엇을 샀는지보다 무엇에 눈길이 머물렀는지를 기록하는 쇼핑몰을 만듭니다.",
  },
];

const PARTNER_STEPS = [
  {
    title: "문의만 보내기",
    description: "입점하고 싶은 척할 브랜드와 상품 이야기를 가볍게 적습니다.",
  },
  {
    title: "검토하는 척 기다리기",
    description: "담당자가 꽤 진지한 표정으로 내용을 살펴보는 시간을 가집니다.",
  },
  {
    title: "함께 상상하기",
    description: "판매 없이도 재미있게 소개할 방법을 같이 고민한 척합니다.",
  },
];

export default function Company() {
  const { section } = useParams();

  useEffect(() => {
    if (!section) return;

    const sectionId = section === "partner" ? "partner" : "about";

    const frameId = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [section]);

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>ABOUT ANSAM STORE</span>
        <h1>
          아무것도 팔지 않지만
          <br />
          취향은 진지하게 다룹니다
        </h1>
        <p>
          안삼 STORE는 사고 싶은 마음을 안전하게 구경하고, 결제 직전의
          설렘만 오래 즐기기 위해 만든 가짜 쇼핑몰입니다.
        </p>

        <nav className={styles.quickLinks} aria-label="회사 정보 바로가기">
          <Link to="/company/about">회사 소개</Link>
          <Link to="/company/partner">입점 문의</Link>
        </nav>
      </header>

      <section
        id="about"
        className={styles.section}
        aria-labelledby="about-title"
      >
        <div className={styles.sectionHead}>
          <span>01</span>
          <div>
            <h2 id="about-title">제법 그럴듯한 회사 소개</h2>
            <p>안 사는 경험도 좋은 쇼핑 경험이 될 수 있다고 믿습니다.</p>
          </div>
        </div>

        <div className={styles.story}>
          <strong>
            필요한 건 줄이고
            <br />
            보고 싶은 건 늘립니다.
          </strong>

          <div>
            <p>
              안삼 STORE는 상품을 소유하지 않아도 취향을 발견할 수 있는 공간을
              상상하며 시작했습니다. 가격을 비교하고 장바구니에 담는 익숙한
              과정은 그대로지만 마지막 결제만 정중히 생략합니다.
            </p>
            <p>
              실제 주문과 배송은 없지만 상품을 고르는 시간만큼은 꽤
              진지합니다. 필요하지 않은 물건을 사지 않고도 충분히 즐거운
              쇼핑몰을 만드는 것이 우리의 그럴듯한 목표입니다.
            </p>
          </div>
        </div>

        <dl className={styles.facts}>
          <div>
            <dt>실제 결제</dt>
            <dd>0건</dd>
          </div>
          <div>
            <dt>실제 배송</dt>
            <dd>0건</dd>
          </div>
          <div>
            <dt>마음속 장바구니</dt>
            <dd>무제한</dd>
          </div>
        </dl>

        <div className={styles.values}>
          {VALUES.map((value) => (
            <article key={value.number}>
              <span>{value.number}</span>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="partner"
        className={`${styles.section} ${styles.partnerSection}`}
        aria-labelledby="partner-title"
      >
        <div className={styles.sectionHead}>
          <span>02</span>
          <div>
            <h2 id="partner-title">입점 문의만 받아보기</h2>
            <p>실제로 입점되지는 않지만 문의하는 기분은 충분히 제공합니다.</p>
          </div>
        </div>

        <ol className={styles.process}>
          {PARTNER_STEPS.map((step, index) => (
            <li key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <form
          className={styles.inquiry}
          onSubmit={(event) => event.preventDefault()}
        >
          <div className={styles.formHead}>
            <div>
              <span>PARTNERSHIP FORM</span>
              <h3>브랜드 이야기를 들려주세요</h3>
            </div>
            <p>
              입력한 내용은 어디에도 전송되지 않습니다. 안심하고 문의하는
              척만 해주세요.
            </p>
          </div>

          <div className={styles.fields}>
            <label>
              브랜드명
              <input type="text" placeholder="그럴듯한 브랜드명" required />
            </label>

            <label>
              담당자 이메일
              <input type="email" placeholder="partner@example.com" required />
            </label>

            <label>
              상품 분야
              <select defaultValue="">
                <option value="" disabled>
                  분야를 골라주세요
                </option>
                <option>패션</option>
                <option>리빙</option>
                <option>취미·문구</option>
                <option>기타</option>
              </select>
            </label>

            <label>
              브랜드 주소
              <input type="url" placeholder="https://" />
            </label>

            <label className={styles.message}>
              소개하고 싶은 이야기
              <textarea
                rows="6"
                placeholder="판매하지 않아도 소개하고 싶은 이유를 적어주세요."
              />
            </label>
          </div>

          <div className={styles.formAction}>
            <p>제출해도 실제 문의는 접수되지 않습니다.</p>
            <button type="submit">입점 문의한 척하기</button>
          </div>
        </form>
      </section>
    </div>
  );
}
