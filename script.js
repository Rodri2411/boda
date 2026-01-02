// ====== COUNTDOWN ======

const targetDate = new Date("2026-10-03T00:00:00").getTime();
function updateCountdown() {
  const now = new Date().getTime();
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

setInterval(updateCountdown, 1000);

// ====== HERO SCROLL (texto + foto) — suave con rAF ======
(function () {
  const heroText = document.getElementById("heroText");
  const heroImage = document.getElementById("heroImage");
  const scrollIndicator = document.getElementById("scrollIndicator");

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let ticking = false;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function update() {
    ticking = false;
    if (prefersReduced) return;

    const vh = window.innerHeight || 1;
    const progress = clamp(window.scrollY / vh, 0, 1);

    // Ajustes finos (sentimiento "premium")
    const textY = -260 * progress;
    const textOpacity = 1 - 0.35 * progress;

    const imageY = -90 * progress;   // un toque más que antes
    const imageScale = 1 + 0.03 * progress; // micro zoom, muy sutil

    if (heroText) {
      heroText.style.transform = `translate3d(0, ${textY}px, 0)`;
      heroText.style.opacity = textOpacity.toFixed(3);
    }

    if (heroImage) {
      heroImage.style.transform = `translate3d(0, ${imageY}px, 0) scale(${imageScale.toFixed(4)})`;
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();

  // Click en el indicador -> baja al countdown
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", () => {
      const el = document.getElementById("countdown");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    });
  }
})();
