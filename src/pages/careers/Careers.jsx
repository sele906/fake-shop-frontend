import { Link } from "react-router-dom";
import { toast } from "sonner";
import styles from "./Careers.module.css";
import useHiddenCoupon from "../../coupon/useHiddenCoupon";
import { MISSION } from "../../coupon/hiddenStorage";
import { copyText } from "../../lib/clipboard";

const GITHUB_URL = "https://github.com/sele906";
const EMAIL = "seunga906@gmail.com";

const PROJECTS = [
  {
    name: "Beluo",
    period: "2025.12 ~ 2026.04",
    role: "1인 개발 · 기획부터 배포까지",
    summary:
      "사용자가 직접 AI 캐릭터를 만들고, 원하는 모델을 골라 대화하는 AI 캐릭터 채팅 서비스입니다.",
    points: [
      "메시지 112만 건이 쌓인 환경에서 채팅방 조회가 컬렉션 전체를 훑고 있어, 조회·정렬 패턴에 맞춘 복합 인덱스를 설계해 단일 조회 2,794ms를 1ms로 줄였습니다. 동시 30명 부하에서 p95 30ms · 실패율 0%.",
      "AI 응답 뒤 FCM 푸시를 동기로 보내다 스레드 풀이 고갈되던 구간을 RabbitMQ 비동기 발송으로 분리해 처리량 111 TPS를 1,892 TPS로, 응답 시간 336ms를 19ms로 개선했습니다.",
      "결제 웹훅 서명 검증 실패로 크레딧이 지급되지 않던 문제를 환경별 Secret 분리와 raw body 검증 순서 정리로 해결했습니다.",
      "JWT · Google OAuth2 인증, OpenAI · Claude · Groq 모델 선택, 장기 대화 자동 요약, 크레딧 차감 구조를 구현했습니다.",
    ],
    stack: [
      "Spring Boot",
      "Spring Security",
      "MongoDB",
      "Redis",
      "RabbitMQ",
      "Docker",
      "Render",
    ],
    links: [
      { label: "서비스 바로가기", href: "https://beluo.site" },
      {
        label: "GitHub 바로가기",
        href: "https://github.com/sele906/beluo-backend",
      },
    ],
  },
  {
    name: "도서관리 시스템",
    period: "2024.10 ~ 2024.11",
    role: "개인 프로젝트",
    summary:
      "도서 대출과 좌석 예약을 다루는 도서관 관리 웹 서비스입니다. 문헌정보학 전공에서 배운 분류·검색 방식을 실제 데이터 구조로 옮겨본 프로젝트입니다.",
    points: [
      "Java · Spring Framework로 도서 · 회원 · 대출 도메인을 구현했습니다.",
      "MyBatis · PostgreSQL로 대출 이력과 좌석 예약 데이터를 관리했습니다.",
      "JSP · jQuery · Bootstrap으로 이용자 화면과 관리자 화면을 나눠 구성했습니다.",
      "AWS EC2 · Nginx · DuckDNS로 외부에서 접속 가능한 배포 환경을 만들었습니다.",
    ],
    stack: ["Java", "Spring", "MyBatis", "PostgreSQL", "AWS EC2", "Nginx"],
    links: [{ label: "사이트 바로가기", href: "https://liblio.duckdns.org" }],
  },
];

const STACK = [
  { title: "Language", items: ["Java 17", "JavaScript"] },
  {
    title: "Backend",
    items: [
      "Spring Boot",
      "Spring Security",
      "JWT · OAuth2",
      "OpenAI · Claude · Groq API",
    ],
  },
  {
    title: "Infra · DB",
    items: [
      "MongoDB Atlas",
      "PostgreSQL",
      "Redis · RabbitMQ",
      "Docker",
      "AWS EC2 · Nginx",
      "Render · Vercel",
    ],
  },
  { title: "ETC", items: ["Git · GitHub", "React", "JSP", "IntelliJ"] },
];

export default function Careers() {
  const { unlock } = useHiddenCoupon();

  /* 웹메일만 쓰면 mailto가 아무 반응이 없어서 복사도 함께 열어 둔다. */
  const handleCopy = async () => {
    const copied = await copyText(EMAIL);

    if (!copied) {
      toast(
        <>
          <strong>복사에 실패했습니다</strong>
          <br />
          {EMAIL} 을 직접 옮겨 적어주세요.
        </>
      );
      return;
    }

    /* 숨은 쿠폰. 처음 복사한 그 한 번만 쿠폰이 돌아온다. */
    const coupon = unlock(MISSION.CAREERS_COPY);

    /* 쿠폰 알림이 떴으면 복사 알림은 접는다. 두 장이 겹치면 둘 다 안 읽힌다.
       두 번째 클릭부터는 쿠폰이 없으니 아래 복사 알림이 그대로 뜬다. */
    if (coupon) return;

    toast(
      <>
        <strong>주소를 복사했습니다</strong>
        <br />
        이 쇼핑몰에서 유일하게 실제로 작동하는 기능입니다.
      </>
    );
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>WE ARE NOT HIRING</span>

        <h1>
          저희는 채용하지 않습니다
          <br />
          대신 제가 지원합니다
        </h1>

        <p>
          안삼 STORE에서 유일하게 진짜인 항목입니다. 이 아래는 농담이 아니라
          이력입니다.
        </p>

        <nav className={styles.quickLinks} aria-label="연락처">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub 둘러보기
          </a>
        </nav>
      </header>

      <section className={styles.section} aria-labelledby="intro-title">
        <div className={styles.sectionHead}>
          <span>01</span>
          <div>
            <h2 id="intro-title">이 쇼핑몰을 만든 백엔드 개발자</h2>
            <p>여기서부터는 진지합니다.</p>
          </div>
        </div>

        <div className={styles.intro}>
          <strong>
            한 번 어긋나면
            <br />
            사용자가 먼저 아는 구간을 맡습니다.
          </strong>

          <div>
            <p>
              Spring Boot로 API 서버를 만드는 백엔드 개발자입니다. 인증, 외부 API
              연동, 결제처럼 조용히 실패하면 안 되는 기능을 주로 다뤘고, 문제를
              추측으로 넘기지 않고 로그와 수치로 확인한 뒤 고치는 방식을
              선호합니다.
            </p>
            <p>
              AI 캐릭터 채팅 서비스 Beluo를 기획부터 배포까지 혼자 만들면서
              느려진 조회, 밀리는 알림, 검증에 실패하는 결제 웹훅을 차례로
              수정했습니다. 이 쇼핑몰은 백엔드만 보던 시야를 넓혀보려고 만든
              프론트엔드 연습이고, 그래서 팔 물건이 하나도 없습니다.
            </p>
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.projectSection}`}
        aria-labelledby="project-title"
      >
        <div className={styles.sectionHead}>
          <span>02</span>
          <div>
            <h2 id="project-title">대표 프로젝트</h2>
            <p>실제로 배포되어 있고, 실제로 결제도 됩니다.</p>
          </div>
        </div>

        <div className={styles.projects}>
          {PROJECTS.map((project) => (
            <article key={project.name}>
              <div className={styles.projectHead}>
                <h3>{project.name}</h3>
                <span>{project.period}</span>
              </div>

              <span className={styles.role}>{project.role}</span>
              <p className={styles.summary}>{project.summary}</p>

              <ul className={styles.points}>
                {project.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <ul className={styles.tags}>
                {project.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className={styles.projectLinks}>
                {project.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="stack-title">
        <div className={styles.sectionHead}>
          <span>03</span>
          <div>
            <h2 id="stack-title">기술 스택</h2>
            <p>실제로 프로젝트에 써 본 것만 적었습니다.</p>
          </div>
        </div>

        <div className={styles.stack}>
          {STACK.map((group) => (
            <article key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.contactSection}`}
        aria-labelledby="contact-title"
      >
        <div className={styles.sectionHead}>
          <span>04</span>
          <div>
            <h2 id="contact-title">연락하기</h2>
            <p>입점 문의는 반려되지만 면접 제안에는 성실히 답장합니다.</p>
          </div>
        </div>

        <div className={styles.contactCard}>
          <div>
            <span className={styles.contactLabel}>EMAIL</span>
            <strong className={styles.contactMail}>{EMAIL}</strong>

            <p>
              채용 제안, 과제 전형, 프로젝트 이야기 모두 환영합니다.
            </p>
          </div>

          <div className={styles.contactActions}>
            <a className={styles.goBtn} href={`mailto:${EMAIL}`}>
              이메일 보내기
            </a>

            <button className={styles.goBtn} type="button" onClick={handleCopy}>
              이메일 복사
            </button>
          </div>
        </div>

        <p className={styles.outro}>
          여기까지 읽으셨다면 이미 이 쇼핑몰에서 제일 오래 머무신 겁니다.{" "}
          <Link to="/">돌아가서 마저 구경하기</Link>
        </p>
      </section>
    </div>
  );
}
