(function () {
  const params = new URLSearchParams(location.search);
  const isFiesta = params.has("fiesta");

  // =========================
  // Loader de partials (cache-bust para local)
  // =========================
  async function loadPartial(path) {
    const res = await fetch(`${path}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`No pude cargar ${path} (HTTP ${res.status})`);
    return res.text();
  }

// =========================================================
// MUSIC (iOS-safe)
// - Autoplay: intenta muted (mobile) y normal (web)
// - Primer gesto real: desmutea + play
// - Botón: responde a touchend + click
// =========================================================
function setupMusic() {
  // evita doble init
  if (window.__musicSetupDone) return;
  window.__musicSetupDone = true;

  const music = document.getElementById("bgMusic");
  const btn = document.getElementById("musicBtn");
  if (!music || !btn) return;

  music.volume = (window.APP_CONFIG && window.APP_CONFIG.MUSIC_VOLUME != null)
    ? window.APP_CONFIG.MUSIC_VOLUME
    : 0.5;

  const setBtn = () => {
    const playing = !music.paused;
    btn.textContent = playing ? "⏸" : "▶";
    btn.setAttribute("aria-label", playing ? "Pausar música" : "Reproducir música");
    btn.setAttribute("aria-pressed", playing ? "true" : "false");
  };

  btn.addEventListener("click", async () => {
    try {
      if (music.paused) await music.play();
      else music.pause();
    } catch (_) {
      // iOS puede bloquear si no fue gesto válido
    }
    setBtn();
  });

  const tryAuto = async () => {
    if (!(window.APP_CONFIG && window.APP_CONFIG.MUSIC_AUTOPLAY)) { setBtn(); return; }
    try { await music.play(); } catch (_) {}
    setBtn();
  };

  const unlock = async () => {
    if (!(window.APP_CONFIG && window.APP_CONFIG.MUSIC_AUTOPLAY)) return;
    try { await music.play(); } catch (_) {}
    setBtn();
  };

  // El primer gesto real
  document.addEventListener("click", unlock, { once: true });
  document.addEventListener("touchstart", unlock, { once: true });

  tryAuto();
}

  // =========================================================
  // 2) RSVP (CORREGIDO: OCULTA MÚSICA SIN ROMPERLA)
  // =========================================================
  const musicBtn = document.getElementById("musicBtn"); 
  const rsvpModal = document.getElementById("rsvpModal");

  function openRsvpModalFn() {
    if (!rsvpModal) return;
    
    // Usamos la clase forzada que definimos antes
    if (musicBtn) musicBtn.classList.add("hidden-music");

    rsvpModal.classList.add("is-open");
    rsvpModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (rsvpFormContainer) { rsvpFormContainer.style.display = "block"; rsvpFormContainer.hidden = false; }
    if (rsvpThanks) { rsvpThanks.style.display = "none"; rsvpThanks.hidden = true; }
    
    setStatus("");
    if (rsvpSendBtn) rsvpSendBtn.disabled = false;
    if (typeof syncUI === "function") syncUI();
  }

  function closeRsvpModalFn(){
    if (!rsvpModal) return;

    if (musicBtn) musicBtn.classList.remove("hidden-music");

    rsvpModal.classList.remove("is-open");
    rsvpModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (rsvpForm) rsvpForm.reset();
  }

  // =========================
  // REVEAL (repetible)
  // =========================
  function setupReveal() {
    const els = Array.from(document.querySelectorAll(".reveal"));
    if (!els.length) return;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach(el => el.classList.add("is-visible"));
      return;
    }

    if (!("IntersectionObserver" in window)) {
      els.forEach(el => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
        else entry.target.classList.remove("is-visible");
      }
    }, {
      threshold: 0.15,
      rootMargin: "0px 0px 120px 0px"
    });

    els.forEach(el => io.observe(el));

    requestAnimationFrame(() => {
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        const inView = r.top < window.innerHeight * 0.95 && r.bottom > 0;
        if (inView) el.classList.add("is-visible");
      });
    });
  }
   
  // =========================
  // BOOT
  // =========================
(async () => {
  const app = document.getElementById("app");
  if (!app) return;

  const stage = ((window.APP_CONFIG && window.APP_CONFIG.STAGE) ? window.APP_CONFIG.STAGE : "save").toLowerCase();
  const stagePath = stage === "full" ? "partials/full.html" : "partials/save.html";

  const html = await loadPartial(stagePath);
  app.innerHTML = html;

  if (isFiesta) {
    document.documentElement.classList.add("mode-fiesta");
    // si fiesta inyecta otro partial, hacelo ACÁ (antes de init)
    // const fiestaHtml = await loadPartial("partials/fiesta.html");
    // app.insertAdjacentHTML("beforeend", fiestaHtml);
  }

  await new Promise(r => requestAnimationFrame(r));

  // init por stage
  if (stage === "full") window.initFull?.();
  else window.initSave?.();
  if (isFiesta) window.initFiesta?.();

  // ✅ COMUNES (AHORA SÍ EXISTE #musicBtn)
  setupMusic();
  setupReveal();

})().catch(err => {
  console.error(err);
  const app = document.getElementById("app");
  if (app) {
    app.innerHTML = `
      <div style="padding:24px;color:#fff;font-family:Raleway">
        Error cargando la página 😅<br><br>
        <small>${String(err.message || err)}</small>
      </div>`;
  }
});
})();
