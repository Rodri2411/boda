// js/common.js
window.initCommon = function () {
  // =========================
  // COUNTDOWN (común)
  // =========================
  const targetISO =
    (window.APP_CONFIG && window.APP_CONFIG.COUNTDOWN_DATE_ISO) ||
    "2026-10-03T00:00:00";

  const targetDate = new Date(targetISO).getTime();

  function updateCountdown() {
    const now = Date.now();
    const diff = targetDate - now;
    if (diff <= 0) return;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    const elD = document.getElementById("d");
    const elH = document.getElementById("h");
    const elM = document.getElementById("m");
    const elS = document.getElementById("s");
    if (!elD || !elH || !elM || !elS) return;

    elD.textContent = d;
    elH.textContent = String(h).padStart(2, "0");
    elM.textContent = String(m).padStart(2, "0");
    elS.textContent = String(s).padStart(2, "0");
  }

  updateCountdown();
  window.__countdownTimer && clearInterval(window.__countdownTimer);
  window.__countdownTimer = setInterval(updateCountdown, 1000);

  // =========================
  // HERO SCROLL (común)
  // - Usa data-target o href
  // - Si no hay, cae a #countdown
  // =========================
  function resolveTarget(el) {
    if (!el) return "#countdown";
    return (
      el.getAttribute("data-target") ||
      el.getAttribute("href") ||
      "#countdown"
    );
  }

  function goTarget(e) {
    const trigger = e?.currentTarget;
    const targetSel = resolveTarget(trigger);
    const targetEl = document.querySelector(targetSel);
    if (!targetEl) return;

    e?.preventDefault?.();
    targetEl.scrollIntoView({ behavior: "smooth" });
  }

  const scrollIndicator = document.getElementById("scrollIndicator");
  const heroPill = document.querySelector(".save");

  if (scrollIndicator) scrollIndicator.addEventListener("click", goTarget);
  if (heroPill) heroPill.addEventListener("click", goTarget);
};
