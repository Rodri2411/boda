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

// ====== HERO SCROLL (texto + foto) ======
(function () {
  const hero = document.getElementById("hero");
  const heroText = document.getElementById("heroText");
  const heroImage = document.getElementById("heroImage");

  if (!hero || !heroText || !heroImage) return;

  function onScroll() {
    const vh = window.innerHeight || 1;
    const rect = hero.getBoundingClientRect();

    // progreso 0..1 mientras el hero se va yendo hacia arriba
    const progress = Math.min(1, Math.max(0, (-rect.top) / vh));

    // Texto: sube y baja un poquito la opacidad
    const textY = progress * -120;
    const textOpacity = 1 - progress * 0.35;
    heroText.style.transform = `translateY(${textY}px)`;
    heroText.style.opacity = textOpacity.toFixed(3);

    // Foto: sube suave (parallax sutil)
    const imageY = progress * -60;
    heroImage.style.transform = `translateY(${imageY}px)`;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();
