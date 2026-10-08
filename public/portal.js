// Small enhancements for the account and admin pages. Everything works
// without this script; it only adds confirm prompts and copy buttons.
document.addEventListener("submit", event => {
  const form = event.target.closest("form[data-confirm]");
  if (form && !window.confirm(form.dataset.confirm)) event.preventDefault();
});

document.addEventListener("click", async event => {
  const button = event.target.closest("[data-copy]");
  if (!button) return;
  const source = document.getElementById(button.dataset.copy);
  if (!source) return;
  try {
    await navigator.clipboard.writeText(source.value ?? source.textContent);
    const label = button.textContent;
    button.textContent = "Copied";
    setTimeout(() => (button.textContent = label), 1800);
  } catch {
    source.select?.();
  }
});
