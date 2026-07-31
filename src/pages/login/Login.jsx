import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import styles from "./Login.module.css";

import { BiEnvelope, BiHide, BiLockAlt, BiShow } from "react-icons/bi";

/* 두 가지 로그인 "척" 방식. 탭을 바꾸면 아래 문구가 통째로 갈린다. */
const MODES = {
  pw: {
    tab: "비밀번호인 척",
    label: "비밀번호",
    placeholder: "어차피 아무 의미가 없으니까요",
    autoComplete: "current-password",
    error: "저희도 확인할 방법이 없지만 빈칸은 곤란합니다.",
    forgot: "비밀번호를 잊으셨나요?",
    /* 누를수록 문턱이 낮아진다. 세 번째에는 통과시킨다. */
    submits: ["로그인한 척하기", "그래도 로그인한 척하기", "통과시켜 주기"],
    nudges: [
      "비밀번호가 너무 진지합니다. 조금 더 대충 입력해 주세요.",
      "인증에 실패했지만 저희는 관대합니다.",
    ],
  },
  code: {
    tab: "인증번호인 척",
    label: "인증번호",
    placeholder: "어차피 아무 의미가 없으니까요",
    autoComplete: "one-time-code",
    error: "여섯 자리면 됩니다. 맞고 틀림은 보지 않습니다.",
    forgot: "인증번호를 못 받으셨나요?",
    submits: ["인증된 척하기", "그래도 인증된 척하기", "통과시켜 주기"],
    nudges: [
      "인증번호가 너무 정확합니다. 조금 더 대충 입력해 주세요.",
      "인증에 실패했지만 저희는 관대합니다.",
    ],
  },
};

const SOCIALS = [
  {
    mark: "K",
    name: "카카오",
    label: "카카오로 대충 시작하기",
    message: "카카오에는 아무 연락도 하지 않았습니다.",
  },
  {
    mark: "N",
    name: "네이버",
    label: "네이버 계정인 척하기",
    message: "네이버는 이 일을 모릅니다.",
  },
  {
    mark: "G",
    name: "Google",
    label: "Google에게 알리지 않고 계속하기",
    message: "Google 계정과 전혀 연동되지 않았습니다. 안심하세요.",
  },
  {
    mark: "A",
    name: "Apple",
    label: "Apple로 신원 감추기",
    message: "Apple도 고객님이 누군지 모릅니다.",
  },
];

const FOOT_LINKS = [
  { 
    href: "#copyright", 
    label: "© 2026 안삼 — 아무것도 판매하지 않습니다", 
    message: "안삼은 아무것도 판매하지 않습니다. 그런데 저작권은 제법 진지하게 챙깁니다.",
  },
  { 
    href: "#terms", 
    label: "이용약관", 
    message: "이용약관에 동의하지 않으셔도 됩니다. 이용 중인 서비스가 딱히 없기 때문입니다.",
  },
  { 
    href: "#privacy", 
    label: "개인정보 처리방침", 
    message: "개인정보를 수집하지 않습니다. 저희도 고객님이 누구신지 전혀 모릅니다.", 
  },
  {
    href: "#why",
    label: "안 사도 되는 이유",
    message: "이미 집에 비슷한 게 있습니다. 그게 이유입니다.",
  },
  {
    href: "#cs",
    label: "존재하지 않는 고객센터",
    message: "고객센터 연결을 시도했습니다. 존재하지 않는 상담원이 친절히 부재중입니다.",
  },
];

const ENTER_MS = 1400;
const USER_KEY = "ansam.user.v1";

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("pw");
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [isPeeking, setIsPeeking] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [isEmailBad, setIsEmailBad] = useState(false);
  const [isSecretBad, setIsSecretBad] = useState(false);
  const [tries, setTries] = useState(0);
  const [isEntering, setIsEntering] = useState(false);
  const [isWobbling, setIsWobbling] = useState(false);

  const enterTimer = useRef(null);

  const current = MODES[mode];
  const submitLabel = isEntering
    ? "들여보내는 중…"
    : current.submits[Math.min(tries, current.submits.length - 1)];

  useEffect(() => () => clearTimeout(enterTimer.current), []);

  function changeMode(next) {
    setMode(next);
    setIsSecretBad(false);
    setIsPeeking(false);
  }

  /* 로그인한 "척" 흔적만 남기고 메인으로 보낸다. 이걸 확인하는 화면은 아직 없다. */
  function enter(nickname, provider, message) {
    try {
      window.localStorage.setItem(
        USER_KEY,
        JSON.stringify({
          version: 1,
          nickname,
          provider,
          keepSignedIn,
          loginAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      /* 시크릿 모드 등. 로그인한 척은 계속할 수 있어야 한다. */
      console.error("로그인 흔적을 남기지 못했습니다.", error);
    }

    setIsEntering(true);
    toast(message);

    enterTimer.current = setTimeout(() => navigate("/"), ENTER_MS);
  }

  function submit(event) {
    event.preventDefault();
    if (isEntering) return;

    const id = email.trim();
    const password = secret.trim();

    /* 아무 값이나 받지만, 완전 빈칸은 한 번 붙잡는다. */
    if (!id || !password) {
      setIsEmailBad(!id);
      setIsSecretBad(!password);
      setIsWobbling(true);
      toast("아무거나 좋습니다. 다만 아무것도 아니면 곤란합니다.");
      return;
    }

    const attempt = tries + 1;
    setTries(attempt);

    if (attempt <= current.nudges.length) {
      setIsWobbling(true);
      toast(current.nudges[attempt - 1]);
      return;
    }

    const nickname = `${id.split("@")[0] || "익명"} 고객님`;
    enter(nickname, "self", `${nickname}, 다시 안 사러 오셨군요.`);
  }

  /* 소셜 버튼은 눌리기만 한다. 로그인 흔적도 남기지 않고 어디로 넘어가지도 않는다. */
  function pretendSocial(social) {
    if (isEntering) return;

    toast(social.message);
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.brand} to="/">
          안삼 <span>STORE</span>
        </Link>

        <Link
          className={styles.help}
          to="/help"
        >
          도움은 드릴 수 없습니다
        </Link>
      </header>

      <div className={styles.page}>
        {/* 900px 이상에서만 보이는 왼쪽 패널 */}
        <aside className={styles.aside}>
          <div className={styles.asideTop}>
            <span className={styles.kicker}>안삼 멤버십</span>

            <h2>
              사고 싶은 마음만
              <br />
              가지고 오세요
            </h2>

            <p>
              실제 구매 능력은 확인하지 않습니다. 카드 한도, 잔고, 신용점수 모두
              조회하지 않습니다. 조회할 이유가 없습니다.
            </p>
          </div>
        </aside>

        <div className={styles.pane}>
          <div className={styles.formWrap}>
            <div className={styles.intro}>
              <h1>안삼에 로그인</h1>
              <p>
                사고 싶은 마음만 가지고 오세요. 실제 구매 능력은 확인하지
                않습니다.
              </p>
            </div>

            <div className={styles.tabs} role="tablist" aria-label="로그인 방식">
              {Object.entries(MODES).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={mode === key}
                  onClick={() => changeMode(key)}
                >
                  {item.tab}
                </button>
              ))}
            </div>

            <form className={styles.form} onSubmit={submit} noValidate>
              <div className={`${styles.field} ${isEmailBad ? styles.bad : ""}`}>
                <label htmlFor="email">아이디</label>

                <div className={styles.control}>
                  <BiEnvelope size={16} aria-hidden="true" />
                  <input
                    id="email"
                    type="text"
                    value={email}
                    placeholder="아무거나 입력하세요"
                    autoComplete="email"
                    aria-invalid={isEmailBad || undefined}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setIsEmailBad(false);
                    }}
                  />
                </div>

                <span className={styles.err}>
                  형식은 신경 쓰지 않지만 뭐라도 적어주세요.
                </span>
              </div>

              <div
                className={`${styles.field} ${isSecretBad ? styles.bad : ""}`}
              >
                <label htmlFor="secret">{current.label}</label>

                <div className={styles.control}>
                  <BiLockAlt size={16} aria-hidden="true" />

                  <input
                    id="secret"
                    /* 인증번호 모드에서는 가릴 것이 없다. */
                    type={mode === "pw" && !isPeeking ? "password" : "text"}
                    value={secret}
                    placeholder={current.placeholder}
                    autoComplete={current.autoComplete}
                    aria-invalid={isSecretBad || undefined}
                    onChange={(event) => {
                      setSecret(event.target.value);
                      setIsSecretBad(false);
                    }}
                  />

                  {mode === "pw" && (
                    <button
                      type="button"
                      aria-label={
                        isPeeking ? "비밀번호 숨기기" : "비밀번호 표시"
                      }
                      onClick={() => setIsPeeking((peeking) => !peeking)}
                    >
                      {isPeeking ? (
                        <BiHide size={18} aria-hidden="true" />
                      ) : (
                        <BiShow size={18} aria-hidden="true" />
                      )}
                    </button>
                  )}
                </div>

                <span className={styles.err}>{current.error}</span>
              </div>

              <div className={styles.row}>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(event) => setKeepSignedIn(event.target.checked)}
                  />
                  <span>이 브라우저가 나를 기억하는 것을 허락합니다</span>
                </label>
              </div>

              <button
                type="submit"
                className={`${styles.btn} ${isWobbling ? styles.wob : ""}`}
                onAnimationEnd={() => setIsWobbling(false)}
              >
                {submitLabel}
              </button>

              <div className={`${styles.row} ${styles.links}`}>
                <a
                  href="#forgot-id"
                  onClick={() =>
                    toast("저희도 모릅니다. 새로 만들어 주세요.")
                  }
                >
                  아이디를 잊으셨나요?
                </a>

                <a
                  href="#forgot"
                  onClick={() =>
                    toast("아무거나 입력해도 들어갈 수 있습니다.")
                  }
                >
                  {current.forgot}
                </a>
              </div>
            </form>

            <div className={styles.divide}>또는</div>

            <div className={styles.socials}>
              {SOCIALS.map((social) => (
                <button
                  key={social.name}
                  type="button"
                  className={styles.social}
                  onClick={() => pretendSocial(social)}
                >
                  <i>{social.mark}</i>
                  <span>{social.label}</span>
                </button>
              ))}
            </div>

            <p className={styles.footNote}>
              아직 회원이 아닌가요?{" "}
              <span className={styles.fakeJoin}
                onClick={() =>
                  toast(
                    "가입 절차는 없습니다. 그냥 처음 보는 사람인 척하시면 됩니다."
                  )
                }
              >
                <b>처음 보는 사람인 척하기</b>
              </span>
              <br />
              로그인 시 아무것도 배송하지 않는다는 사실에 동의하게 됩니다.
            </p>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>

        {FOOT_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => link.message && toast(link.message)}
          >
            {link.label}
          </a>
        ))}
      </footer>
    </div>
  );
}
