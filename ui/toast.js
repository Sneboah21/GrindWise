/**
 * Show a temporary toast notification.
 * @param {string} message
 * @param {"info"|"error"|"success"} [type="info"]
 */
export function showToast(message, type = "info") {
  const existing = document.getElementById("lhe-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.id = "lhe-toast";
  toast.className = `lhe-toast lhe-toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("lhe-toast--visible"));
  setTimeout(() => {
    toast.classList.remove("lhe-toast--visible");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, 4000);
}
