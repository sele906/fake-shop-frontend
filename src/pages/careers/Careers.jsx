import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import styles from "./Careers.module.css";
import useHiddenCoupon from "../../coupon/useHiddenCoupon";
import { MISSION } from "../../coupon/hiddenStorage";
import { copyText } from "../../lib/clipboard";

const GITHUB_URL = "https://github.com/sele906";
const EMAIL = "seunga906@gmail.com";

/* 설명 · 링크 이름은 careers.json의 projects가 들고,
   여기엔 주소와 기술 이름처럼 언어를 타지 않는 것만 남긴다. */
const PROJECTS = [
  {
    id: "beluo",
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
      { id: "service", href: "https://beluo.site" },
      { id: "github", href: "https://github.com/sele906/beluo-backend" },
    ],
  },
  {
    id: "library",
    stack: ["Java", "Spring", "MyBatis", "PostgreSQL", "AWS EC2", "Nginx"],
    links: [{ id: "service", href: "https://liblio.duckdns.org" }, { id: "github", href: "https://github.com/sele906/lib" }],
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
  const { t } = useTranslation("careers");
  const { unlock } = useHiddenCoupon();

  /* 웹메일만 쓰면 mailto가 아무 반응이 없어서 복사도 함께 열어 둔다. */
  const handleCopy = async () => {
    const copied = await copyText(EMAIL);

    if (!copied) {
      toast(
        <>
          <strong>{t("toast.copyFailedTitle")}</strong>
          <br />
          {t("toast.copyFailedLead", { email: EMAIL })}
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
        <strong>{t("toast.copiedTitle")}</strong>
        <br />
        {t("toast.copiedLead")}
      </>
    );
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>{t("hero.eyebrow")}</span>

        <h1>
          {t("hero.titleLine1")}
          <br />
          {t("hero.titleLine2")}
        </h1>

        <p>{t("hero.lead")}</p>

        <nav className={styles.quickLinks} aria-label={t("hero.contactAria")}>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            {t("hero.github")}
          </a>
        </nav>
      </header>

      <section className={styles.section} aria-labelledby="intro-title">
        <div className={styles.sectionHead}>
          <span>01</span>
          <div>
            <h2 id="intro-title">{t("intro.title")}</h2>
            <p>{t("intro.lead")}</p>
          </div>
        </div>

        <div className={styles.intro}>
          <strong>
            {t("intro.sloganLine1")}
            <br />
            {t("intro.sloganLine2")}
          </strong>

          <div>
            <p>{t("intro.paragraph1")}</p>
            <p>{t("intro.paragraph2")}</p>
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
            <h2 id="project-title">{t("projectSection.title")}</h2>
            <p>{t("projectSection.lead")}</p>
          </div>
        </div>

        <div className={styles.projects}>
          {PROJECTS.map((project) => (
            <article key={project.id}>
              <div className={styles.projectHead}>
                <h3>{t(`projects.${project.id}.name`)}</h3>
                <span>{t(`projects.${project.id}.period`)}</span>
              </div>

              <span className={styles.role}>
                {t(`projects.${project.id}.role`)}
              </span>
              <p className={styles.summary}>
                {t(`projects.${project.id}.summary`)}
              </p>

              <ul className={styles.points}>
                {t(`projects.${project.id}.points`, {
                  returnObjects: true,
                }).map((point, index) => (
                  <li key={index}>{point}</li>
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
                    {t(`projects.${project.id}.links.${link.id}`)}
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
            <h2 id="stack-title">{t("stackSection.title")}</h2>
            <p>{t("stackSection.lead")}</p>
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
            <h2 id="contact-title">{t("contact.title")}</h2>
            <p>{t("contact.lead")}</p>
          </div>
        </div>

        <div className={styles.contactCard}>
          <div>
            <span className={styles.contactLabel}>{t("contact.label")}</span>
            <strong className={styles.contactMail}>{EMAIL}</strong>

            <p>{t("contact.note")}</p>
          </div>

          <div className={styles.contactActions}>
            <a className={styles.goBtn} href={`mailto:${EMAIL}`}>
              {t("contact.send")}
            </a>

            <button className={styles.goBtn} type="button" onClick={handleCopy}>
              {t("contact.copy")}
            </button>
          </div>
        </div>

        <p className={styles.outro}>
          {t("outro.text")}{" "}
          <Link to="/">{t("outro.link")}</Link>
        </p>
      </section>
    </div>
  );
}
