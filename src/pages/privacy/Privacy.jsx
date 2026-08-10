import { useTranslation } from "react-i18next";
import styles from "./Privacy.module.css";

/**
 * 개인정보 처리방침. 스토어 심사에 걸어 둘 주소이기도 하므로 다른 페이지처럼
 * 농담을 섞지 않는다. 히어로만 이 앱의 말투를 따르고 본문은 사실만 적는다.
 *
 * 문구는 전부 privacy.json에 있고, 절은 순서가 곧 번호라 index로 매긴다.
 */
const SECTIONS = ["stored", "fake", "receipt", "network", "permission", "erase"];

export default function Privacy() {
  const { t } = useTranslation("privacy");

  /* 절마다 문단 수가 달라 목록째 가져온다. stored만 dl이라 따로 뺀다. */
  const storedItems = t("stored.items", { returnObjects: true });

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
        <p className={styles.updated}>{t("hero.updated")}</p>
      </header>

      <section className={styles.summary} aria-labelledby="privacy-summary">
        <strong id="privacy-summary">{t("summary.title")}</strong>
        <p>{t("summary.body")}</p>
      </section>

      {SECTIONS.map((name, index) => (
        <section
          key={name}
          className={styles.section}
          aria-labelledby={`${name}-title`}
        >
          <div className={styles.sectionHead}>
            <span className={styles.index}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 id={`${name}-title`}>{t(`${name}.title`)}</h2>
              {name === "stored" && <p>{t("stored.lead")}</p>}
            </div>
          </div>

          <div className={styles.body}>
            {name === "stored" ? (
              <>
                <dl className={styles.stored}>
                  {storedItems.map((item) => (
                    <div key={item.term}>
                      <dt>{item.term}</dt>
                      <dd>{item.detail}</dd>
                    </div>
                  ))}
                </dl>

                <div className={styles.notice}>
                  <strong>{t("stored.noticeTitle")}</strong>
                  <p>{t("stored.noticeBody")}</p>
                </div>
              </>
            ) : (
              t(`${name}.paragraphs`, { returnObjects: true }).map(
                (paragraph, order) => <p key={order}>{paragraph}</p>
              )
            )}
          </div>
        </section>
      ))}

      <footer className={styles.foot}>
        <dl>
          <div>
            <dt>{t("foot.childrenTitle")}</dt>
            <dd>{t("foot.childrenBody")}</dd>
          </div>
          <div>
            <dt>{t("foot.changeTitle")}</dt>
            <dd>{t("foot.changeBody")}</dd>
          </div>
          <div>
            <dt>{t("foot.contactTitle")}</dt>
            <dd>
              {t("foot.contactBody")}
              <a href={`mailto:${t("foot.contactEmail")}`}>
                {t("foot.contactEmail")}
              </a>
            </dd>
          </div>
        </dl>
      </footer>
    </div>
  );
}
