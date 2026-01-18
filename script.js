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
  if (window.__musicSetupDone) return;
  window.__musicSetupDone = true;

  const music = document.getElementById("bgMusic");
  const btn = document.getElementById("musicBtn");
  if (!music || !btn) return;

  const cfg = window.APP_CONFIG || {};
  const autoplay = !!cfg.MUSIC_AUTOPLAY;
  const vol = (typeof cfg.MUSIC_VOLUME === "number") ? cfg.MUSIC_VOLUME : 0.5;

  // Atributos "Safari-friendly"
  music.setAttribute("playsinline", "");
  music.setAttribute("webkit-playsinline", "");
  music.preload = "auto";
  music.volume = vol;

  let playInFlight = false;
  let desiredPlaying = autoplay;
  let unlocked = false;

  function setBtn(playing) {
    btn.textContent = playing ? "❚❚" : "▶";
    btn.setAttribute("aria-label", playing ? "Pausar música" : "Reproducir música");
    btn.setAttribute("aria-pressed", playing ? "true" : "false");
  }

  async function safePlay({ allowMuted } = { allowMuted: false }) {
    if (playInFlight) return;
    playInFlight = true;

    try {
      if (music.readyState === 0) music.load();

      // Si permitimos muted (para intentar autoplay en iOS)
      if (allowMuted) music.muted = true;

      await music.play();
      setBtn(true);

      // Si fue muted autoplay, lo dejamos muted hasta el unlock real
      // (cuando el usuario toque, lo desmuteamos)
    } catch (e) {
      setBtn(false);
      // NO tocamos desiredPlaying: si estaba en true, seguirá intentando al desbloquear
    } finally {
      playInFlight = false;
    }
  }

  function pauseNow() {
    try { music.pause(); } catch {}
    setBtn(false);
  }

  async function applyState() {
    if (!desiredPlaying) {
      pauseNow();
      return;
    }

    // Si todavía no hubo "unlock" real y estamos en mobile,
    // intentamos arrancar muted (iOS lo permite mucho más)
    if (!unlocked) {
      await safePlay({ allowMuted: true });
      return;
    }

    // Ya desbloqueado: desmutea y play normal
    music.muted = false;
    await safePlay({ allowMuted: false });
  }

  // ---------- UNLOCK REAL (primer gesto) ----------
  async function unlock() {
    if (unlocked) return;
    unlocked = true;

    // Si queríamos música, ahora sí: desmutea + play
    if (desiredPlaying) {
      music.muted = false;
      await safePlay({ allowMuted: false });
    }
  }

  // Safari iOS: touchend en el botón es el gesto más confiable
  const onToggle = async (e) => {
    // OJO: en iOS, preventDefault a veces mata el gesto.
    // Así que NO hacemos preventDefault acá.
    desiredPlaying = !desiredPlaying;

    if (!unlocked) await unlock();

    if (!desiredPlaying) {
      pauseNow();
      return;
    }

    music.muted = false;
    await safePlay({ allowMuted: false });
  };

  // Botón (lo más importante)
  btn.addEventListener("touchend", onToggle, { passive: true });
  btn.addEventListener("click", onToggle);

  // Document unlock (por si el usuario toca en cualquier lado primero)
  document.addEventListener("touchend", unlock, { once: true, passive: true });
  document.addEventListener("click", unlock, { once: true });
  document.addEventListener("keydown", unlock, { once: true });

  // Estado inicial
  setBtn(false);

  // Autoplay: web puede arrancar con sonido; iOS normalmente no.
  // Por eso: intentamos muted primero si no está unlocked.
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
