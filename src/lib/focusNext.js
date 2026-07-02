// Enter/return on a text field jumps to the next field instead of doing
// nothing — mirrors the "Tab" behavior users expect from a real form. If
// there's no next field in the same screen, it dismisses the keyboard.
export function focusNext(e) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  const scope = e.target.closest(".content") || document;
  const fields = Array.from(scope.querySelectorAll("input, textarea"));
  const next = fields[fields.indexOf(e.target) + 1];
  if (next) next.focus();
  else e.target.blur();
}
