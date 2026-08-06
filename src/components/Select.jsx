import { useEffect, useId, useRef, useState } from "react";
import styles from "./Select.module.css";

import { BiCaretDown, BiCheck } from "react-icons/bi";

/**
 * 값을 고르는 드롭다운. 이 프로젝트의 드롭다운은 전부 이걸 쓴다.
 *
 * 네이티브 <select>는 닫힌 모양만 꾸밀 수 있고 펼친 목록은 브라우저가 그린다.
 * 그 목록이 사이트의 각진 디자인과 너무 달라서 목록까지 직접 그린다.
 *
 *   <Select
 *     options={[{ value: "fashion", label: "패션" }]}
 *     value={category}
 *     onChange={setCategory}
 *     placeholder="분야를 골라주세요"
 *     labelledBy="partner-category-label"
 *   />
 *
 * variant는 겉모습만 가른다.
 *   field  폼 입력칸과 같은 모양. 테두리가 있고 칸 너비를 다 쓴다. (기본)
 *   quiet  툴바용. 테두리 없이 글자와 캐럿만. (SortDropdown)
 *
 * align은 목록이 펴지는 방향이다.
 *   stretch  트리거 너비에 맞춘다. (기본)
 *   end      오른쪽 끝을 기준으로 편다. 화면 가장자리에 붙은 트리거용.
 *
 * 이름은 labelledBy(보이는 라벨의 id)나 ariaLabel 중 하나로 준다.
 *
 * 의미는 combobox + listbox 하나로 통일했다. 정렬을 고르는 것도 명령을
 * 실행하는 게 아니라 값을 고르는 일이라, role="menu"보다 이쪽이 맞다.
 * (menu는 스크린리더를 메뉴 모드로 들여보내 필요 이상으로 무겁다)
 *
 * 포커스는 목록이 열려도 트리거에 남고, 지금 짚은 항목은 aria-activedescendant로
 * 알린다. 목록 항목은 눌리는 요소가 아니라 값이라서 포커스를 옮기지 않는다.
 */
export default function Select({
  options,
  value,
  onChange,
  placeholder,
  labelledBy,
  ariaLabel,
  variant = "field",
  align = "stretch",
}) {
  const [isOpen, setIsOpen] = useState(false);

  /* 키보드로 짚고 있는 항목. 고른 값(value)과는 별개다 — 짚기만 하고
     Escape로 닫으면 값은 그대로 남는다. */
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapRef = useRef(null);
  const triggerRef = useRef(null);

  const listId = useId();
  const optionId = (index) => `${listId}-${index}`;

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  /* 바깥을 누르면 닫는다. click이 아니라 pointerdown으로 듣는 이유는
     스크롤·드래그를 시작한 순간에도 닫히는 편이 자연스럽기 때문이다.
     이때는 트리거로 포커스를 돌리지 않는다 — 사용자가 다른 곳을 눌렀다. */
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event) {
      if (wrapRef.current?.contains(event.target)) return;

      setIsOpen(false);
      setActiveIndex(-1);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  /* 열 때는 이미 고른 항목을 짚어 둔다. 고른 적이 없으면 첫 항목. */
  function open(index = selectedIndex) {
    setActiveIndex(index >= 0 ? index : 0);
    setIsOpen(true);
  }

  function close({ focusTrigger = true } = {}) {
    setIsOpen(false);
    setActiveIndex(-1);
    if (focusTrigger) triggerRef.current?.focus();
  }

  function pick(index) {
    onChange(options[index].value);
    close();
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      if (!isOpen) return;

      event.preventDefault();
      close();
      return;
    }

    /* Tab은 막지 않는다. 목록만 닫고 초점은 다음 필드로 넘어가게 둔다. */
    if (event.key === "Tab") {
      if (isOpen) close({ focusTrigger: false });
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (isOpen && activeIndex >= 0) pick(activeIndex);
      else open();

      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();

      const index = event.key === "Home" ? 0 : options.length - 1;

      if (isOpen) setActiveIndex(index);
      else open(index);

      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();

    if (!isOpen) {
      open();
      return;
    }

    /* 끝에 닿으면 반대쪽으로 넘어간다. */
    const step = event.key === "ArrowDown" ? 1 : -1;

    setActiveIndex((here) => (here + step + options.length) % options.length);
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`${styles.trigger} ${styles[variant]}`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-labelledby={labelledBy}
        aria-label={ariaLabel}
        aria-activedescendant={
          isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
      >
        <span className={selected ? undefined : styles.placeholder}>
          {selected ? selected.label : placeholder}
        </span>

        <BiCaretDown aria-hidden="true" />
      </button>

      {isOpen && (
        <ul
          className={`${styles.list} ${styles[align]}`}
          id={listId}
          role="listbox"
          aria-labelledby={labelledBy}
          aria-label={ariaLabel}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={option.value === value}
              className={index === activeIndex ? styles.active : undefined}
              /* 포커스는 트리거에 남아야 한다. mousedown 기본 동작을 막지 않으면
                 항목을 누르는 순간 트리거가 초점을 잃는다. */
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => pick(index)}
            >
              {option.label}
              {option.value === value && <BiCheck aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
