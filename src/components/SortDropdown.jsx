import { useEffect, useRef, useState } from "react";
import styles from "./SortDropdown.module.css";

import { BiCaretDown, BiCheck } from "react-icons/bi";

/**
 * 모바일 전용 정렬 드롭다운. 데스크톱에는 정렬 탭이 따로 있어서 이 컴포넌트는
 * 좁은 화면에서만 나온다. (숨기고 보이는 것은 이 파일의 CSS가 맡는다)
 *
 * 네이티브 select를 쓰지 않는 이유는 목록의 여백을 정할 수 없기 때문이다.
 * 항목마다 손가락이 닿을 높이를 주려고 직접 그린다.
 *
 *   <SortDropdown options={SORTS} value={sortKey} onChange={setSortKey} />
 *
 * options는 [{ key, label }] 모양이다.
 */
export default function SortDropdown({ options, value, onChange, label = "정렬 기준" }) {
  const [isOpen, setIsOpen] = useState(false);

  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);

  const current = options.find((option) => option.key === value) ?? options[0];

  /* 바깥을 누르면 닫는다. click이 아니라 pointerdown으로 듣는 이유는
     스크롤·드래그를 시작한 순간에도 닫히는 편이 자연스럽기 때문이다. */
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event) {
      if (wrapRef.current?.contains(event.target)) return;

      setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  /* 열면 지금 골라둔 항목으로 초점을 옮긴다. 키보드로도 바로 고를 수 있어야 한다. */
  useEffect(() => {
    if (!isOpen) return;

    const items = listRef.current?.querySelectorAll("button");
    const index = options.findIndex((option) => option.key === value);

    items?.[Math.max(0, index)]?.focus();
  }, [isOpen, options, value]);

  function close({ focusTrigger = true } = {}) {
    setIsOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }

  function pick(key) {
    onChange(key);
    close();
  }

  /* 목록 안에서의 위아래 이동. 끝에 닿으면 반대쪽으로 넘어간다. */
  function handleListKeyDown(event) {
    if (event.key === "Escape") {
      close();
      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();

    const items = [...(listRef.current?.querySelectorAll("button") ?? [])];
    if (items.length === 0) return;

    const step = event.key === "ArrowDown" ? 1 : -1;
    const here = items.indexOf(document.activeElement);
    const next = (here + step + items.length) % items.length;

    items[next].focus();
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.trigger}
        ref={triggerRef}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={label}
        onClick={() => setIsOpen((open) => !open)}
      >
        {current?.label}
        <BiCaretDown aria-hidden="true" />
      </button>

      {isOpen && (
        <ul
          className={styles.list}
          ref={listRef}
          role="menu"
          aria-label={label}
          onKeyDown={handleListKeyDown}
        >
          {options.map((option) => (
            <li key={option.key}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={option.key === value}
                onClick={() => pick(option.key)}
              >
                {option.label}
                {option.key === value && <BiCheck aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
