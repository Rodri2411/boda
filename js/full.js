// js/full.js
window.initFull = function () {
  // Importante: no rompe countdown, solo llama initCommon
  try { window.initCommon?.(); } catch (e) { console.error("initCommon error:", e); }

  // =========================================================
  // MODAL REGALOS + COPIAR
  // =========================================================
  const giftModal = document.getElementById("giftModal");
  const openGiftBtn = document.getElementById("openGiftModal");
  const copyHint = document.getElementById("copyHint");

  function openGiftModalFn(){
    if (!giftModal) return;
    giftModal.classList.add("is-open");
    giftModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeGiftModalFn(){
    if (!giftModal) return;
    giftModal.classList.remove("is-open");
    giftModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (copyHint) copyHint.textContent = "";
  }

  if (openGiftBtn) openGiftBtn.addEventListener("click", openGiftModalFn);

  if (giftModal){
    giftModal.addEventListener("click", (e) => {
      if (e.target.closest("[data-close-modal]")) closeGiftModalFn();
    });
  }

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const selector = btn.getAttribute("data-copy");
      const el = selector ? document.querySelector(selector) : null;
      if (!el) return;

      const text = (el.textContent || "").trim();
      if (!text) return;

      try{
        await navigator.clipboard.writeText(text);
        if (copyHint) copyHint.textContent = "Copiado ✅";
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        if (copyHint) copyHint.textContent = "Copiado ✅";
      }

      setTimeout(() => { if (copyHint) copyHint.textContent = ""; }, 1800);
    });
  });

  // =========================================================
  // RSVP MODAL + SUBMIT (Apps Script) + UI + CONFETI
  // =========================================================
  // =========================================================
  // RSVP MODAL + FIX BOTÓN X
  // =========================================================
  const rsvpModal = document.getElementById("rsvpModal");
  const openRsvpBtn = document.getElementById("openRsvpModal");
  const rsvpCloseEls = document.querySelectorAll("[data-rsvp-close]");
  const rsvpForm = document.getElementById("rsvpUiForm");
  const rsvpStatus = document.getElementById("rsvpUiStatus");
  const rsvpThanks = document.getElementById("rsvpThanks");
  const rsvpFormContainer = document.getElementById("rsvpFormContainer");
  const rsvpSendBtn = document.getElementById("rsvpSendBtn");
  const asisteSel = document.getElementById("rsvpAsiste");

  const fldCantidad = document.getElementById("rsvpCantidad")?.closest(".rsvp-field");
  const fldRestr = document.getElementById("rsvpRestricciones")?.closest(".rsvp-field");
  const fldCancion = document.getElementById("rsvpCancion")?.closest(".rsvp-field");
  const fldMensaje = document.getElementById("rsvpMensaje")?.closest(".rsvp-field");
  const extraFields = [fldCantidad, fldRestr, fldCancion, fldMensaje].filter(Boolean);

  function setStatus(msg){
    if (rsvpStatus) rsvpStatus.textContent = msg || "";
  }

  function setExtraVisible(visible){
    extraFields.forEach((el) => {
      el.style.display = visible ? "" : "none";
      el.querySelectorAll("input,select,textarea").forEach((inp) => {
        inp.disabled = !visible;
      });
    });
  }

  function syncUI(){
    const v = (asisteSel?.value || "").toUpperCase();
    const isNo = v === "NO";
    setExtraVisible(!isNo);

    if (isNo){
      const cant = document.getElementById("rsvpCantidad");
      if (cant) cant.value = "0";
    } else {
      const cant = document.getElementById("rsvpCantidad");
      if (cant && (!cant.value || cant.value === "0")) cant.value = "1";
    }
  }

function openRsvpModalFn() {
    if (!rsvpModal) return;
    
    // 1. OCULTAR MÚSICA CON CLASE FORZADA
    if (musicBtn) {
        musicBtn.classList.add("hidden-music");
    }

    rsvpModal.classList.add("is-open");
    rsvpModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (rsvpFormContainer) {
        rsvpFormContainer.style.display = "block";
        rsvpFormContainer.hidden = false;
    }
    if (rsvpThanks) {
        rsvpThanks.style.display = "none";
        rsvpThanks.hidden = true;
    }
    
    setStatus("");
    if (rsvpSendBtn) rsvpSendBtn.disabled = false;
    if (typeof syncUI === "function") syncUI();
  }

  function closeRsvpModalFn(){
    if (!rsvpModal) return;

    // 2. MOSTRAR MÚSICA QUITANDO LA CLASE
    if (musicBtn) {
        musicBtn.classList.remove("hidden-music");
    }

    rsvpModal.classList.remove("is-open");
    rsvpModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    setStatus("");
    if (rsvpForm) rsvpForm.reset();
  }

  // Abrir
  if (openRsvpBtn){
    openRsvpBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openRsvpModalFn();
    });
  }

  // CERRAR: Listener para todos los elementos con data-rsvp-close (INCLUYE LA X)
  rsvpCloseEls.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); // Detiene el rebote del click
      closeRsvpModalFn();
    });
  });

  // CERRAR: Click en el fondo oscuro
  if (rsvpModal) {
    rsvpModal.addEventListener("click", (e) => {
      // Si el click fue exactamente en el fondo y no en la caja blanca
      if (e.target.classList.contains('rsvp-modal__backdrop') || e.target === rsvpModal) {
        closeRsvpModalFn();
      }
    });
  }

  if (asisteSel) asisteSel.addEventListener("change", syncUI);

  // ESC Key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (rsvpModal?.classList.contains("is-open")) closeRsvpModalFn();
      if (typeof closeGiftModalFn === "function") closeGiftModalFn();
    }
  });

  // ------------- Confetti (simple, sin libs) -------------
  function confettiBurst(){
    const canvas = document.getElementById("rsvpConfetti");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const parent = canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;

    canvas.width = Math.floor(w * devicePixelRatio);
    canvas.height = Math.floor(h * devicePixelRatio);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    const pieces = [];
    const N = 140;

    for (let i = 0; i < N; i++){
      pieces.push({
        x: Math.random() * w,
        y: -20 - Math.random() * h * 0.2,
        size: 4 + Math.random() * 5,
        vx: -1.6 + Math.random() * 3.2,
        vy: 2.4 + Math.random() * 4.2,
        rot: Math.random() * Math.PI,
        vr: -0.15 + Math.random() * 0.3,
        life: 0,
        max: 170 + Math.random() * 90
      });
    }

    let raf = 0;
    function tick(){
      ctx.clearRect(0, 0, w, h);

      pieces.forEach(p => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.vy += 0.02;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = `hsl(${(p.life * 4 + p.x) % 360} 80% 60%)`;
        ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 1.2);
        ctx.restore();
      });

      for (let i = pieces.length - 1; i >= 0; i--){
        const p = pieces[i];
        if (p.life > p.max || p.y > h + 30) pieces.splice(i, 1);
      }

      if (pieces.length) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0,0,w,h);
    }

    cancelAnimationFrame(raf);
    tick();
  }

// ------------- Submit directo a Google Forms -------------
  if (rsvpForm){
    rsvpForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = (document.getElementById("rsvpNombre")?.value || "").trim();
      const asiste = (document.getElementById("rsvpAsiste")?.value || "").trim().toUpperCase();

      if (!nombre || !asiste){
        setStatus("Te falta completar nombre y si asistís 🙂");
        return;
      }

      const isNo = asiste === "NO";

      const formData = new URLSearchParams();
      formData.append("entry.353256803", nombre);
      formData.append("entry.1072622370", asiste);
      formData.append("entry.502337972", isNo ? "0" : (document.getElementById("rsvpCantidad")?.value || "1"));
      formData.append("entry.187555452", isNo ? "" : (document.getElementById("rsvpRestricciones")?.value || ""));
      formData.append("entry.1335692519", isNo ? "" : (document.getElementById("rsvpCancion")?.value || ""));
      formData.append("entry.1321536216", isNo ? "" : (document.getElementById("rsvpMensaje")?.value || ""));

      setStatus("Enviando...");
      if (rsvpSendBtn) rsvpSendBtn.disabled = true;

      try {
        await fetch("https://docs.google.com/forms/d/e/1FAIpQLScNthBOggwAEGSEHQ0M3IWbH9Ubcetm-vKsyBYxjLKxbLA7KQ/formResponse", {
          method: "POST",
          mode: "no-cors",
          body: formData
        });

        // UI: Transición al Gracias
        setStatus("");
        
        if (rsvpFormContainer) rsvpFormContainer.style.display = "none";
        
        if (rsvpThanks) {
            rsvpThanks.hidden = false;
            rsvpThanks.style.display = "flex"; // El CSS ahora se encarga de que mida 450px
            confettiBurst();
        }

        setTimeout(() => {
          closeRsvpModalFn();
        }, 4000); // Un poquito más de tiempo para ver el confeti

      } catch (err){
        console.error(err);
        setStatus("Error al enviar. Probá de nuevo.");
        if (rsvpSendBtn) rsvpSendBtn.disabled = false;
      }
    });
  }
};
