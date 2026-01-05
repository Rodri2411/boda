// ======================
// COUNTDOWN
// ======================
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

// ======================
// CLICK: Guardá la fecha -> countdown (suave)
// ======================
const saveBtn = document.querySelector(".save");
if (saveBtn) {
  saveBtn.addEventListener("click", (e) => {
    const el = document.getElementById("countdown");
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth" });
  });
}

// ======================
// Click flecha -> countdown
// ======================
const scrollIndicator = document.getElementById("scrollIndicator");
if (scrollIndicator) {
  scrollIndicator.addEventListener("click", () => {
    const el = document.getElementById("countdown");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  });
}

// ======================
// HERO SCROLL (texto + foto)
// + base offset para que “arranque más arriba” en mobile
// ======================
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

  function getBaseOffset() {
    // MOBILE: lo subimos bastante más (tu pedido)
    if (window.innerWidth <= 480) return -180;
    // TABLET
    if (window.innerWidth <= 900) return -95;
    // DESKTOP
    return -90;
  }

  function update() {
    ticking = false;
    if (prefersReduced) return;

    const vh = window.innerHeight || 1;
    const progress = clamp(window.scrollY / vh, 0, 1);

    const base = getBaseOffset();

    // Más “agresivo” el movimiento del texto al scrollear
    const textY = base + (-340 * progress);
    const textOpacity = 1 - 0.35 * progress;

    // Foto: parallax + micro zoom
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

// ======================
// REVEAL (Secciones 2 y 3)
// Se repite cada vez que entra/sale del viewport
// (sin blur distinto en íconos: ahora todo igual)
// ======================
(function () {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce) {
    items.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // Repite: al salir se apaga, al entrar se prende
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
      else entry.target.classList.remove("is-visible");
    });
  }, {
    threshold: 0.18,
    rootMargin: "0px 0px -10% 0px"
  });

  items.forEach(el => io.observe(el));
})();

// ======================
// MÚSICA: botón play/pausa + intento de autoplay
// (autoplay real en mobile suele requerir gesto sí o sí)
// ======================
(function () {
  const music = document.getElementById("bgMusic");
  const btn = document.getElementById("musicBtn");
  if (!music || !btn) return;

  music.volume = 0.55;

  function setBtnPlaying(isPlaying) {
    btn.textContent = isPlaying ? "⏸" : "▶";
  }

  async function tryPlay() {
    try {
      await music.play();
      setBtnPlaying(true);
    } catch (e) {
      // Bloqueado por el navegador -> queda en play
      setBtnPlaying(false);
    }
  }

  // Intento al cargar
  window.addEventListener("load", () => {
    tryPlay();
  });

  // Botón manual
  btn.addEventListener("click", async () => {
    if (music.paused) {
      await tryPlay();
    } else {
      music.pause();
      setBtnPlaying(false);
    }
  });

  // Primer toque en cualquier lado: asegura que empiece
  document.addEventListener("click", () => {
    if (music.paused) tryPlay();
  }, { once: true });
})();
