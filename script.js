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

// ====== Scroll suave a countdown (save + flecha) ======
function scrollToCountdown(e) {
  const el = document.getElementById("countdown");
  if (!el) return;
  if (e) e.preventDefault();
  el.scrollIntoView({ behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.querySelector(".save");
  if (saveBtn) saveBtn.addEventListener("click", scrollToCountdown);

  const scrollIndicator = document.getElementById("scrollIndicator");
  if (scrollIndicator) scrollIndicator.addEventListener("click", scrollToCountdown);
});

// ====== HERO SCROLL (texto + foto) — más agresivo ======
(function () {
  const heroText = document.getElementById("heroText");
  const heroImage = document.getElementById("heroImage");

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

    // MÁS agresivo (sube más)
    const textY = -340 * progress;
    const textOpacity = 1 - 0.40 * progress;

    const imageY = -110 * progress;
    const imageScale = 1 + 0.035 * progress;

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
})();

// ====== MÚSICA ======
(function () {
  const music = document.getElementById("bgMusic");
  const toggle = document.getElementById("musicToggle");

  if (!music || !toggle) return;

  // Estado visual del botón
  function setToggleState() {
    toggle.textContent = music.paused ? "▶" : "❚❚";
    toggle.setAttribute("aria-label", music.paused ? "Reproducir música" : "Pausar música");
  }

  // Intento de autoplay al cargar (puede fallar por políticas del navegador)
  function tryAutoplay() {
    music.volume = 0.5;
    const p = music.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        // Si bloquea autoplay, se habilita al primer click/tap
        document.addEventListener("click", unlockOnce, { once: true });
        document.addEventListener("touchstart", unlockOnce, { once: true });
        setToggleState();
      });
    }
  }

  function unlockOnce() {
    music.volume = 0.5;
    music.play().catch(() => {});
    setToggleState();
  }

  // Toggle manual
  toggle.addEventListener("click", () => {
    if (music.paused) {
      music.volume = 0.5;
      music.play().catch(() => {});
    } else {
      music.pause();
    }
    setToggleState();
  });

  // Sincroniza estado al inicio
  music.addEventListener("play", setToggleState);
  music.addEventListener("pause", setToggleState);
  setToggleState();

  // Vamos a intentar sonar “apenas carga”
  window.addEventListener("load", tryAutoplay);
})();
