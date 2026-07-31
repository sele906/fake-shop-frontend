import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
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
    description: "내용은 전송되지 않지만 작성의 기분은 제공합니다.",
  },
  {
    title: "검토하는 척 기다리기",
    description: "담당자가 진지한 표정으로 아무것도 하지 않습니다.",
  },
  {
    title: "정중하게 반려되기",
    description: "어떤 브랜드든 공평하게 입점하지 못합니다.",
  },
];

const rejectionReasons = [
  "브랜드가 너무 실제로 존재하는 것 같아 안삼의 운영 방향과 맞지 않습니다.",
  "상품성이 충분하여 저희가 감당하기 어렵습니다.",
  "판매 가능성이 발견되어 내부 규정에 따라 반려되었습니다.",
  "담당자가 긍정적으로 검토하려다 정신을 차렸습니다.",
  "입점할 경우 실제 쇼핑몰처럼 보일 위험이 있습니다.",
  "브랜드 소개가 지나치게 설득력 있어 경계 대상이 되었습니다.",
  "판매할 상품이 있다는 점이 당사의 핵심 가치와 충돌합니다.",
  "상품보다 고객님의 열정이 더 부담스러워 반려되었습니다.",
  "검토 결과, 다른 정상적인 쇼핑몰에 입점하는 편이 낫겠습니다.",
  "서류는 완벽하지만 저희에게는 물류센터가 없습니다.",
];

export default function Company() {
  const { section } = useParams();
  const [brandName, setBrandName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [website, setWebsite] = useState("");
  const [story, setStory] = useState("");

  useEffect(() => {
    if (!section) return;

    const sectionId = section === "partner" ? "partner" : "about";

    const frameId = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [section]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const hasContent =
      brandName.trim() ||
      email.trim() ||
      category ||
      website.trim() ||
      story.trim();

    if (!hasContent) {
      toast(
        <>
          <strong>입점 심사 결과: 반려</strong>
          <br />
          검토할 내용이 없어 놀라울 정도로 빠르게 반려되었습니다.
        </>
      );
      return;
    }

    const reason =
      rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)];

    toast(
      <>
        <strong>입점 심사 결과: 반려</strong>
        <br />
        {reason}
      </>
    );
  };

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
          onSubmit={handleSubmit}
        >
          <div className={styles.formHead}>
            <div>
              <span>PARTNERSHIP FORM</span>
              <h3>브랜드 이야기를 일단 들어드립니다</h3>
            </div>
            <p>
              입력한 내용은 어디에도 전송되지 않습니다. 안심하고 입점하는 척만 해주세요.
            </p>
          </div>

          <div className={styles.fields}>
            <label>
              브랜드라고 부르는 것
              <input value={brandName} onChange={(event) => setBrandName(event.target.value)} placeholder="제법 그럴듯한 브랜드명" />
            </label>

            <label>
              답장을 기다릴 이메일
              <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="답장은 오지않습니다" />
            </label>

            <label>
              상품 분야
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="" disabled>
                  가장 덜 어색한 분야를 골라주세요
                </option>
                <option value="fashion">입을 수 있는 것</option>
                <option value="beauty">바를 수 있는 것</option>
                <option value="food">먹을 수 있을 것 같은 것</option>
                <option value="living">집에 두면 그럴듯한 것</option>
                <option value="digital">충전이 필요할 것 같은 것</option>
                <option value="etc">분류를 포기한 것</option>
              </select>
            </label>

            <label>
              존재를 주장하는 링크
              <input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://정말로-있다면" />
            </label>

            <label className={styles.message}>
              굳이 입점해야 하는 이유
              <textarea
                rows="6"
                placeholder="팔 수 없다는 사실을 감수하고 소개해주세요."
                value={story}
                onChange={(event) => setStory(event.target.value)}
              />
            </label>
          </div>

          <div className={styles.formAction}>
            <p>제출해도 문의는 접수되지 않습니다. 반려만큼은 신속하게 처리해드립니다.</p>
            <button type="submit">입점 심사받는 척하기</button>
          </div>
        </form>
      </section>
    </div>
  );
}
