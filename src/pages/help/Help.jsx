import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./Help.module.css";

export default function Help() {
  const { t } = useTranslation("help");
  const { section } = useParams();

  /* 목록 자체를 help.json에서 통째로 가져온다. 항목이 늘거나 줄어도 코드는 그대로다. */
  const faqs = t("faqs", { returnObjects: true });
  const returnSteps = t("returnSteps", { returnObjects: true });

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
        <span className={styles.eyebrow}>{t("hero.eyebrow")}</span>
        <h1>
          {t("hero.titleLine1")}
          <br />
          {t("hero.titleLine2")}
        </h1>
        <p>{t("hero.lead")}</p>

        <nav
          className={styles.quickLinks}
          aria-label={t("hero.quickLinksAria")}
        >
          <Link to="/help/faq">{t("hero.faqLink")}</Link>
          <Link to="/help/return">{t("hero.returnLink")}</Link>
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
            <h2 id="faq-title">{t("faq.title")}</h2>
            <p>{t("faq.lead")}</p>
          </div>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <details key={index} open={index === 0}>
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
            <h2 id="return-title">{t("return.title")}</h2>
            <p>{t("return.lead")}</p>
          </div>
        </div>

        <div className={styles.notice}>
          <strong>{t("return.noticeTitle")}</strong>
          <p>{t("return.noticeLead")}</p>
        </div>

        <ol className={styles.steps}>
          {returnSteps.map((step, index) => (
            <li key={index}>
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
            <dt>{t("policy.periodTerm")}</dt>
            <dd>{t("policy.periodValue")}</dd>
          </div>
          <div>
            <dt>{t("policy.feeTerm")}</dt>
            <dd>{t("policy.feeValue")}</dd>
          </div>
          <div>
            <dt>{t("policy.refundTerm")}</dt>
            <dd>{t("policy.refundValue")}</dd>
          </div>
          <div>
            <dt>{t("policy.excludedTerm")}</dt>
            <dd>{t("policy.excludedValue")}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
