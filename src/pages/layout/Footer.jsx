import styles from "./Layout.module.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation(["layout", "common"]);

  return (
    <footer className={styles.footer}>
      {/* 가게 소개보다 만든 사람 소개를 먼저 내보내는 줄. 아래 컬럼은 그대로 둔다. */}
      <Link className={styles.hire} to="/careers">
        <div className={styles.hireInfo}>
          <strong>{t("footer.hireTitle")}</strong>
          <span className={styles.hireLead}>{t("footer.hireLead")}</span>
        </div>
        <span className={styles.hireCta} aria-hidden="true">
          {t("footer.hireCta")}
        </span>
      </Link>

      <div>
        <strong>{t("common:brand.full")}</strong>
        {t("footer.storeLead1")}
        <br />
        {t("footer.storeLead2")}
      </div>

      <nav>
        <strong><Link to="/help">{t("footer.helpTitle")}</Link></strong>
        <Link to="/help/faq">{t("footer.helpFaq")}</Link>
        <Link to="/help/return">{t("footer.helpReturn")}</Link>
        {/* 스토어에 걸어 둘 주소라 여기만 농담 없이 이름 그대로 적는다. */}
        <Link to="/privacy">{t("footer.helpPrivacy")}</Link>
      </nav>

      <nav>
        <strong><Link to="/company">{t("footer.companyTitle")}</Link></strong>
        <Link to="/company/about">{t("footer.companyAbout")}</Link>
        <Link to="/company/partner">{t("footer.companyPartner")}</Link>
        <Link to="/careers">{t("footer.companyCareers")}</Link>
      </nav>

      {/* Pexels 방침에 따라 목록 화면에 실린 사진의 출처를 남긴다. */}
      <p className={styles.credit}>
        {t("footer.imageCredit")}{" "}
        <a href="https://www.pexels.com" target="_blank" rel="noreferrer">
          Pexels
        </a>
      </p>
    </footer>
  );
}
