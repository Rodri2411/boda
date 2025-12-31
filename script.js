// ====== COUNTDOWN ======
const targetDate = new Date("2026-10-03T00:00:00").getTime();

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
setInterval(updateCountdown, 1000);

// ====== HERO SCROLL (texto + foto) ======
(function () {
  const heroText = document.getElementById("heroText");
  const heroImage = document.getElementById("heroImage");

  function onScroll() {
    const vh = window.innerHeight || 1;
    const progress = Math.min(1, Math.max(0, window.scrollY / vh));

    // Texto: sube + baja opacidad
    const textY = progress * -120;
    const textOpacity = 1 - progress * 0.35;
    if (heroText) {
      heroText.style.transform = `translateY(${textY}px)`;
      heroText.style.opacity = textOpacity.toFixed(3);
    }

    // Foto: parallax sutil
    const imageY = progress * -80;
    if (heroImage) {
      heroImage.style.transform = `translate3d(0, ${imageY}px, 0)`;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();

// ====== Click en indicador para bajar a la sección 2 ======
(function () {
  const btn = document.getElementById("scrollIndicator");
  const target = document.getElementById("countdown");
  if (!btn || !target) return;

  btn.addEventListener("click", () => {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
