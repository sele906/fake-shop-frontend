import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 트리거로 여닫는 겹침 요소의 "닫히는 규칙"만 담는다.
 *
 * 바깥을 누르거나 Escape를 누르면 닫히고, 닫힐 때 초점이 트리거로 돌아온다.
 * 이 셋은 드롭다운이든 설정 패널이든 똑같아야 하는데, 안에 무엇이 들어가는지는
 * 제각각이라 여기서는 다루지 않는다. Select의 화살표 · Home/End ·
 * aria-activedescendant는 listbox에만 있는 것이라 Select에 남아 있다.
 *
 *   const { isOpen, open, close, wrapRef, triggerRef, onKeyDown } =
 *     useDismissable({ onClose: () => setActiveIndex(-1) });
 *
 *   <div ref={wrapRef} onKeyDown={onKeyDown}>
 *     <button ref={triggerRef} aria-expanded={isOpen} onClick={...}>
 *
 * onKeyDown은 트리거가 아니라 감싸는 요소에 건다. 설정 패널처럼 초점이 안으로
 * 들어가는 경우에도 Escape가 들려야 하기 때문이다. 트리거에만 걸면 패널 안에서
 * 누른 Escape를 놓친다.
 */
export default function useDismissable({ onClose } = {}) {
  const [isOpen, setIsOpen] = useState(false);

  const wrapRef = useRef(null);
  const triggerRef = useRef(null);

  /* close가 매번 새로 만들어지면 아래 useEffect가 열려 있는 동안 계속 다시
     붙는다. onClose는 ref에 담아 close를 고정한다. */
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const close = useCallback(({ focusTrigger = true } = {}) => {
    setIsOpen(false);
    onCloseRef.current?.();
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  const open = useCallback(() => setIsOpen(true), []);

  /* 바깥을 누르면 닫는다. click이 아니라 pointerdown으로 듣는 이유는
     스크롤·드래그를 시작한 순간에도 닫히는 편이 자연스럽기 때문이다.
     이때는 트리거로 포커스를 돌리지 않는다 — 사용자가 다른 곳을 눌렀다. */
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event) {
      if (wrapRef.current?.contains(event.target)) return;
      close({ focusTrigger: false });
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, close]);

  const onKeyDown = useCallback(
    (event) => {
      if (event.key !== "Escape" || !isOpen) return;

      /* 기기 뒤로가기(useBackButton)가 Escape를 대신 보내므로, 여기서 닫히면
         안드로이드 뒤로가기도 저절로 따라온다. */
      event.preventDefault();
      close();
    },
    [isOpen, close],
  );

  return { isOpen, open, close, wrapRef, triggerRef, onKeyDown };
}
