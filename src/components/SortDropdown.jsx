import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SortDropdown.module.css";
import Select from "./Select";

/**
 * 모바일 전용 정렬 드롭다운. 데스크톱에는 정렬 탭이 따로 있어서 이 컴포넌트는
 * 좁은 화면에서만 나온다. (숨기고 보이는 것은 이 파일의 CSS가 맡는다)
 *
 *   <SortDropdown options={sorts} value={sortKey} onChange={setSortKey} />
 *
 * options는 useSortOptions가 주는 [{ key, label }] 모양이다. 정렬 탭도 같은
 * 목록을 쓰기 때문에 그쪽 모양을 바꾸지 않고 여기서 Select의 value로 옮긴다.
 *
 * 여닫는 동작·키보드·의미는 전부 Select가 맡는다. 이 파일에 남은 것은
 * "툴바에 놓는 정렬용"이라는 설정뿐이다.
 */
export default function SortDropdown({ options, value, onChange, label }) {
  const { t } = useTranslation("common");

  /* 부르는 쪽이 따로 주지 않으면 공용 문구를 쓴다. */
  const menuLabel = label ?? t("sortLabel");

  const selectOptions = useMemo(
    () => options.map((option) => ({ value: option.key, label: option.label })),
    [options]
  );

  return (
    /* Select의 바깥 요소는 목록 위치의 기준이라 건드리지 않는다.
       보이고 숨기는 것은 이 껍데기가 맡는다. */
    <div className={styles.wrap}>
      <Select
        variant="quiet"
        align="end"
        options={selectOptions}
        value={value}
        onChange={onChange}
        /* 정렬은 늘 골라진 상태다. 목록에 없는 값이 들어와도 빈칸으로 두지 않는다. */
        placeholder={selectOptions[0]?.label}
        ariaLabel={menuLabel}
      />
    </div>
  );
}
