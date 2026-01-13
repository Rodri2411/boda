(function () {
  const params = new URLSearchParams(location.search);
  const isFiesta = params.has("fiesta");

  function qs(sel, root = document) { return root.querySelector(sel); }

  async function loadPartial(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`No pude cargar ${path}`);
    return res.text();
  }

  // ===== Música =====
  function setupMusic() {
    const music = document.getElementById("bgMusic");
    const btn = document.getElementById("musicBtn");
    if (!music || !btn) return;

    music.volume = APP_CONFIG.MUSIC_VOLUME ?? 0.5;

    const setBtn = () => {
      const playing = !music.paused;
      btn.textContent = playing ? "⏸" : "▶";
      btn.setAttribute("aria-label", playing ? "Pausar música" : "Reproducir música");
    };

    btn.addEventListener("click", async () => {
      try {
        if (music.paused) await music.play();
        else music.pause();
      } catch (_) {}
      setBtn();
    });

    // Intento autoplay
    const tryAuto = async () => {
      if (!APP_CONFIG.MUSIC_AUTOPLAY) { setBtn(); return; }
      try {
        await music.play();
      } catch (_) {
        // si el browser lo bloquea, queda el botón para el usuario
      }
      setBtn();
    };

    // Algunos browsers requieren un gesto: escuchamos el primero
    const unlock = async () => {
      if (!APP_CONFIG.MUSIC_AUTOPLAY) return;
      try { await music.play(); } catch (_) {}
      setBtn();
      document.removeEventListener("click", unlock);
      document.removeEventListener("touchstart", unlock);
    };

    document.addEventListener("click", unlock, { once: true });
    document.addEventListener("touchstart", unlock, { once: true });

    tryAuto();
  }

  // ===== Reveal repetible (secciones 2 y 3) =====
  function setupReveal() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
        } else {
          // 👇 repetible: cuando sale de pantalla, lo reseteamos
          e.target.classList.remove("is-visible");
        }
      }
    }, { threshold: 0.18 });

    els.forEach(el => io.observe(el));
  }

  // ===== Boot =====
  (async () => {
    const app = document.getElementById("app");
    if (!app) return;

    // stage
    const stage = (APP_CONFIG.STAGE || "save").toLowerCase();
    const stagePath = stage === "full" ? "/partials/full.html" : "/partials/save.html";
    app.innerHTML = await loadPartial(stagePath);

    // fiesta mode
    if (isFiesta) {
      document.documentElement.classList.add("mode-fiesta");
      const fiestaHtml = await loadPartial("/partials/fiesta.html");
      app.insertAdjacentHTML("beforeend", fiestaHtml);
    }

    // init per stage
    if (stage === "full") window.initFull?.();
    else window.initSave?.();

    if (isFiesta) window.initFiesta?.();

    // common
    setupMusic();
    setupReveal();
  })().catch(err => {
    console.error(err);
    const app = document.getElementById("app");
    if (app) app.innerHTML = `<div style="padding:24px;color:#fff;font-family:Raleway">Error cargando la página 😅</div>`;
  });
})();
