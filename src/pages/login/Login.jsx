import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import styles from "./Login.module.css";
import useHiddenCoupon from "../../coupon/useHiddenCoupon";
import { MISSION } from "../../coupon/hiddenStorage";
import LanguageToggle from "../../components/LanguageToggle";

import { BiEnvelope, BiHide, BiLockAlt, BiShow } from "react-icons/bi";

/* 두 가지 로그인 "척" 방식. 탭을 바꾸면 아래 문구가 통째로 갈린다.
   문구는 login.json의 modes가 들고, 여기엔 입력칸 속성만 남긴다. */
const MODES = {
  pw: { autoComplete: "current-password" },
  code: { autoComplete: "one-time-code" },
};

/* login.json의 modes.*.submits · nudges 길이와 맞춰 둔다.
   누를수록 문턱이 낮아져 세 번째에는 통과시킨다. */
const SUBMIT_COUNT = 3;
const NUDGE_COUNT = 2;

/* 아이콘 글자는 로고에서 따온 것이라 언어를 타지 않는다. */
const SOCIALS = [
  { id: "kakao", mark: "K" },
  { id: "naver", mark: "N" },
  { id: "google", mark: "G" },
  { id: "apple", mark: "A" },
];

const FOOT_LINK_IDS = ["copyright", "terms", "privacy", "why", "cs"];

const ENTER_MS = 1400;
const USER_KEY = "ansam.user.v1";

export default function Login() {
  const { t } = useTranslation(["login", "common"]);
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
  const { unlock } = useHiddenCoupon();

  const enterTimer = useRef(null);

  const current = MODES[mode];
  const submitLabel = isEntering
    ? t("entering")
    : t(`modes.${mode}.submits.${Math.min(tries, SUBMIT_COUNT - 1)}`);

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
      toast(t("toast.emptyFields"));
      return;
    }

    const attempt = tries + 1;
    setTries(attempt);

    if (attempt <= NUDGE_COUNT) {
      setIsWobbling(true);
      toast(t(`modes.${mode}.nudges.${attempt - 1}`));
      return;
    }

    const nickname = t("nickname", {
      name: id.split("@")[0] || t("anonymous"),
    });
    enter(nickname, "self", t("toast.welcome", { nickname }));
  }

  /* 비밀번호 찾기에는 숨은 쿠폰이 걸려 있다. 처음 눌렀을 때만 쿠폰이 온다. */
  function forgetSecret() {
    if (unlock(MISSION.LOGIN_ID)) return;

    toast(t("toast.forgotSecret"));
  }

  /* 소셜 버튼은 눌리기만 한다. 로그인 흔적도 남기지 않고 어디로 넘어가지도 않는다. */
  function pretendSocial(socialId) {
    if (isEntering) return;

    toast(t(`socials.${socialId}.message`));
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.brand} to="/">
          {t("common:brand.name")} <span>{t("common:brand.suffix")}</span>
        </Link>

        <div className={styles.headerRight}>
          <LanguageToggle />

          <Link className={styles.help} to="/help">
            {t("help")}
          </Link>
        </div>
      </header>

      <div className={styles.page}>
        {/* 900px 이상에서만 보이는 왼쪽 패널 */}
        <aside className={styles.aside}>
          <div className={styles.asideTop}>
            <span className={styles.kicker}>{t("aside.kicker")}</span>

            <h2>
              {t("aside.titleLine1")}
              <br />
              {t("aside.titleLine2")}
            </h2>

            <p>{t("aside.lead")}</p>
          </div>
        </aside>

        <div className={styles.pane}>
          <div className={styles.formWrap}>
            <div className={styles.intro}>
              <h1>{t("intro.title")}</h1>
              <p>{t("intro.lead")}</p>
            </div>

            <div
              className={styles.tabs}
              role="tablist"
              aria-label={t("tablistAria")}
            >
              {Object.keys(MODES).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={mode === key}
                  onClick={() => changeMode(key)}
                >
                  {t(`modes.${key}.tab`)}
                </button>
              ))}
            </div>

            <form className={styles.form} onSubmit={submit} noValidate>
              <div className={`${styles.field} ${isEmailBad ? styles.bad : ""}`}>
                <label htmlFor="email">{t("idLabel")}</label>

                <div className={styles.control}>
                  <BiEnvelope size={16} aria-hidden="true" />
                  <input
                    id="email"
                    type="text"
                    value={email}
                    placeholder={t("idPlaceholder")}
                    autoComplete="email"
                    aria-invalid={isEmailBad || undefined}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setIsEmailBad(false);
                    }}
                  />
                </div>

                <span className={styles.err}>{t("idError")}</span>
              </div>

              <div
                className={`${styles.field} ${isSecretBad ? styles.bad : ""}`}
              >
                <label htmlFor="secret">{t(`modes.${mode}.label`)}</label>

                <div className={styles.control}>
                  <BiLockAlt size={16} aria-hidden="true" />

                  <input
                    id="secret"
                    /* 인증번호 모드에서는 가릴 것이 없다. */
                    type={mode === "pw" && !isPeeking ? "password" : "text"}
                    value={secret}
                    placeholder={t(`modes.${mode}.placeholder`)}
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
                        isPeeking ? t("hideSecret") : t("showSecret")
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

                <span className={styles.err}>{t(`modes.${mode}.error`)}</span>
              </div>

              <div className={styles.row}>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(event) => setKeepSignedIn(event.target.checked)}
                  />
                  <span>{t("keepSignedIn")}</span>
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
                  onClick={() => toast(t("toast.forgotId"))}
                >
                  {t("forgotId")}
                </a>

                <a href="#forgot" onClick={forgetSecret}>
                  {t(`modes.${mode}.forgot`)}
                </a>
              </div>
            </form>

            <div className={styles.divide}>{t("divider")}</div>

            <div className={styles.socials}>
              {SOCIALS.map((social) => (
                <button
                  key={social.id}
                  type="button"
                  className={styles.social}
                  onClick={() => pretendSocial(social.id)}
                >
                  <i>{social.mark}</i>
                  <span>{t(`socials.${social.id}.label`)}</span>
                </button>
              ))}
            </div>

            <p className={styles.footNote}>
              {t("footNote.notMember")}{" "}
              <span className={styles.fakeJoin}
                onClick={() => toast(t("toast.join"))}
              >
                <b>{t("footNote.join")}</b>
              </span>
              <br />
              {t("footNote.agree")}
            </p>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>

        {FOOT_LINK_IDS.map((linkId) => (
          <a
            key={linkId}
            href={`#${linkId}`}
            onClick={() => toast(t(`footLinks.${linkId}.message`))}
          >
            {t(`footLinks.${linkId}.label`)}
          </a>
        ))}
      </footer>
    </div>
  );
}
