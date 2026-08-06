import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import styles from "./Company.module.css";
import Select from "../../components/Select";
import useHiddenCoupon from "../../coupon/useHiddenCoupon";
import { MISSION } from "../../coupon/hiddenStorage";

/**
 * 브랜드명에 이게 들어가면 숨은 쿠폰이 나온다.
 *
 * 사용자가 입력하는 값이라 locales에 두지 않고, 언어를 가리지 않고 둘 다 받는다.
 * 영어 쪽은 대소문자를 무시한다.
 */
const BRAND_HINTS = ["안삼", "nobuy"];

function hasBrandHint(brandName) {
  const normalized = brandName.toLowerCase();

  return BRAND_HINTS.some((hint) => normalized.includes(hint));
}

/* select의 value로 나가는 값이라 언어를 타지 않는다. 표시할 이름만 company.json에 있다. */
const CATEGORY_IDS = [
  "fashion",
  "beauty",
  "food",
  "living",
  "digital",
  "etc",
];

export default function Company() {
  const { t } = useTranslation("company");
  const { section } = useParams();
  const [brandName, setBrandName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [website, setWebsite] = useState("");
  const [story, setStory] = useState("");
  const { unlock } = useHiddenCoupon();

  /* value는 언어를 타지 않고 보이는 이름만 바뀐다. 언어를 바꾸면 t가 새로 와서
     목록도 새로 만들어진다. */
  const categoryOptions = useMemo(
    () =>
      CATEGORY_IDS.map((categoryId) => ({
        value: categoryId,
        label: t(`partner.categories.${categoryId}`),
      })),
    [t]
  );

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
          <strong>{t("toast.rejectedTitle")}</strong>
          <br />
          {t("toast.emptyReason")}
        </>
      );
      return;
    }

    /* 숨은 쿠폰: 브랜드명에 안삼 · NOBUY를 넣은 사람. 쿠폰이 나오면 반려는 미뤄둔다. */
    if (hasBrandHint(brandName) && unlock(MISSION.PARTNER_BRAND)) return;

    const reasons = t("rejectionReasons", { returnObjects: true });
    const reason = reasons[Math.floor(Math.random() * reasons.length)];

    toast(
      <>
        <strong>{t("toast.rejectedTitle")}</strong>
        <br />
        {reason}
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

        <nav
          className={styles.quickLinks}
          aria-label={t("hero.quickLinksAria")}
        >
          <Link to="/company/about">{t("hero.aboutLink")}</Link>
          <Link to="/company/partner">{t("hero.partnerLink")}</Link>
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
            <h2 id="about-title">{t("about.title")}</h2>
            <p>{t("about.lead")}</p>
          </div>
        </div>

        <div className={styles.story}>
          <strong>
            {t("about.sloganLine1")}
            <br />
            {t("about.sloganLine2")}
          </strong>

          <div>
            <p>{t("about.paragraph1")}</p>
            <p>{t("about.paragraph2")}</p>
          </div>
        </div>

        <dl className={styles.facts}>
          <div>
            <dt>{t("facts.paymentsTerm")}</dt>
            <dd>{t("facts.paymentsValue")}</dd>
          </div>
          <div>
            <dt>{t("facts.shipmentsTerm")}</dt>
            <dd>{t("facts.shipmentsValue")}</dd>
          </div>
          <div>
            <dt>{t("facts.cartTerm")}</dt>
            <dd>{t("facts.cartValue")}</dd>
          </div>
        </dl>

        <div className={styles.values}>
          {t("values", { returnObjects: true }).map((value) => (
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
            <h2 id="partner-title">{t("partner.title")}</h2>
            <p>{t("partner.lead")}</p>
          </div>
        </div>

        <ol className={styles.process}>
          {t("partnerSteps", { returnObjects: true }).map((step, index) => (
            <li key={index}>
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
              <span>{t("partner.formEyebrow")}</span>
              <h3>{t("partner.formTitle")}</h3>
            </div>
            <p>{t("partner.formLead")}</p>
          </div>

          <div className={styles.fields}>
            <label>
              {t("partner.brandLabel")}
              <input value={brandName} onChange={(event) => setBrandName(event.target.value)} placeholder={t("partner.brandPlaceholder")} />
            </label>

            <label>
              {t("partner.emailLabel")}
              <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("partner.emailPlaceholder")} />
            </label>

            {/* <label>이 감싸도 이름이 붙지만, 버튼은 제 글자도 텍스트라
                라벨 이름에 지금 고른 값까지 섞인다. 그래서 따로 가리킨다. */}
            <label>
              <span id="partner-category-label">{t("partner.categoryLabel")}</span>
              <Select
                options={categoryOptions}
                value={category}
                onChange={setCategory}
                placeholder={t("partner.categoryPlaceholder")}
                labelledBy="partner-category-label"
              />
            </label>

            <label>
              {t("partner.websiteLabel")}
              <input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder={t("partner.websitePlaceholder")} />
            </label>

            <label className={styles.message}>
              {t("partner.storyLabel")}
              <textarea
                rows="6"
                placeholder={t("partner.storyPlaceholder")}
                value={story}
                onChange={(event) => setStory(event.target.value)}
              />
            </label>
          </div>

          <div className={styles.formAction}>
            <p>{t("partner.actionNote")}</p>
            <button type="submit">{t("partner.submit")}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
