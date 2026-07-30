/**
 * 클립보드에 복사하고 성공했는지 돌려준다.
 *
 * navigator.clipboard는 https나 localhost에서만 열린다. LAN 주소(192.168.x.x)로
 * 열어본 경우에는 아예 없으므로, 옛 방식(execCommand)으로 한 번 더 시도한다.
 */
export async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      /* 권한을 막아둔 경우. 아래 대체 경로로 넘어간다. */
      console.error("클립보드 복사가 거부됐습니다.", error);
    }
  }

  try {
    const textarea = document.createElement("textarea");

    textarea.value = text;
    textarea.setAttribute("readonly", "");
    /* 화면 밖에 두되 선택은 되어야 한다. display:none이면 복사되지 않는다. */
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";

    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    return copied;
  } catch (error) {
    console.error("클립보드 복사에 실패했습니다.", error);
    return false;
  }
}
