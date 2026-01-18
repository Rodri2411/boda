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
// MUSIC (web autoplay + mobile "armado" hasta primer gesto)
// =========================================================
function setupMusic() {
  // evita doble init (por si lo llamás dos veces sin querer)
  if (window.__musicSetupDone) return;
  window.__musicSetupDone = true;

  const music = document.getElementById("bgMusic");
  const btn = document.getElementById("musicBtn");
  if (!music || !btn) return;

  const vol =
    (window.APP_CONFIG && typeof window.APP_CONFIG.MUSIC_VOLUME === "number")
      ? window.APP_CONFIG.MUSIC_VOLUME
      : 0.5;

  const autoplay = !!(window.APP_CONFIG && window.APP_CONFIG.MUSIC_AUTOPLAY);

  music.volume = vol;

  let playInFlight = false;
  let desiredPlaying = autoplay;     // lo que queremos (autoplay o no)
  let needsUnlockRetry = false;      // si falló por política mobile, reintentamos en gesto
  let unlocked = false;

  function setBtn(playing) {
    btn.textContent = playing ? "❚❚" : "▶";
    btn.setAttribute("aria-label", playing ? "Pausar música" : "Reproducir música");
    btn.setAttribute("aria-pressed", playing ? "true" : "false");
  }

  async function tryPlay() {
    if (playInFlight) return;
    playInFlight = true;

    try {
      if (music.readyState === 0) music.load();
      await music.play();
      setBtn(true);
      needsUnlockRetry = false;
    } catch (e) {
      // NO apagamos desiredPlaying (clave para no matar web/flow)
      // En mobile normalmente da NotAllowedError si no hubo gesto.
      setBtn(false);
      needsUnlockRetry = true;
    } finally {
      playInFlight = false;
    }
  }

  function pauseNow() {
    try { music.pause(); } catch {}
    setBtn(false);
    needsUnlockRetry = false;
  }

  function applyState() {
    if (!desiredPlaying) {
      pauseNow();
      return;
    }
    // si queremos sonar, intentamos
    tryPlay();
  }

  // Botón play/pause (este click ya cuenta como "gesto" en mobile)
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    desiredPlaying = !desiredPlaying;
    if (!desiredPlaying) pauseNow();
    else applyState();
  });

  // Unlock: primer gesto del usuario => reintentar si estaba bloqueado
  const unlock = () => {
    if (unlocked) return;
    unlocked = true;

    // si autoplay estaba activo o quedamos esperando por bloqueo, reintentamos
    if (desiredPlaying || needsUnlockRetry) applyState();
  };

  // Importante: NO passive para maximizar compatibilidad iOS
  document.addEventListener("touchstart", unlock, { once: true });
  document.addEventListener("pointerdown", unlock, { once: true });
  document.addEventListener("click", unlock, { once: true });
  document.addEventListener("keydown", unlock, { once: true });
  document.addEventListener("scroll", unlock, { once: true });

  // Estado inicial
  setBtn(false);

  // Intento inicial: en web debería arrancar; en mobile fallará y quedará "armado"
  if (autoplay) applyState();

  music.addEventListener("ended", () => {
    desiredPlaying = false;
    setBtn(false);
  });
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

    setupMusic();
    
  // =========================
  // BOOT
  // =========================
  (async () => {
    const app = document.getElementById("app");
    if (!app) return;

    const stage = ((window.APP_CONFIG && window.APP_CONFIG.STAGE) ? window.APP_CONFIG.STAGE : "save").toLowerCase();
    const stagePath = stage === "full" ? "partials/full.html" : "partials/save.html";

    // 1) Cargar SOLO un partial base (save/full)
    const html = await loadPartial(stagePath);
    app.innerHTML = html;

    // 2) Modo fiesta: NO inyectamos otra página. Solo activamos modo y tweak
    if (isFiesta) {
      document.documentElement.classList.add("mode-fiesta");
    }

    // 3) Esperar paint
    await new Promise(r => requestAnimationFrame(r));

    // 4) Init por stage
    if (stage === "full") window.initFull?.();
    else window.initSave?.();

    // 5) Fiesta tweaks (si aplica)
    if (isFiesta) window.initFiesta?.();

    // 6) Comunes
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
