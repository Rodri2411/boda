window.initFiesta = function () {
  // EDITÁS ACÁ y listo
  const FIESTA = {
    heroImage: "assets/20251005_184407.jpg",   // 👈 foto hero para fiesta
    pillText: "Fiesta • Luna India",
    pillTarget: "#details",                   // 👈 a dónde scrollea la pill
    fecha: "Sábado 3 de Octubre de 2026",
    hora: "23:30 hs",
    lugar: "Luna India",
    direccion: "Castro Barros S/N, M5513, Maipú, Mendoza",
    maps: "https://maps.app.goo.gl/TzdwhKubkQDngHw57",
    dresscode: "Formal Elegante"
  };

  // =========================
  // 0) Cambiar foto del HERO
  // =========================
  const heroImg = document.getElementById("heroImage");
  if (heroImg && FIESTA.heroImage) {
    heroImg.src = FIESTA.heroImage;

    // cache-bust suave por si el navegador se pone gede
    const hasQuery = heroImg.src.includes("?");
    heroImg.src = heroImg.src + (hasQuery ? "&" : "?") + "v=" + Date.now();
  }

  // =========================
  // 1) HERO PILL: mantener look “transparente” + click scroll suave
  // =========================
  const heroText = document.getElementById("heroText");
  if (heroText) {
    const oldPill = heroText.querySelector(".save");
    if (oldPill) {
      // Lo dejamos como <a> (misma vibra), pero lo “tuneamos” para fiesta
      oldPill.textContent = FIESTA.pillText;
      oldPill.setAttribute("href", FIESTA.pillTarget);
      oldPill.setAttribute("aria-label", "Ver información de la fiesta");
      oldPill.classList.add("hero-pill"); // 👈 para estilo fiesta (css)
      oldPill.classList.remove("pulse");  // si no querés pulso en fiesta (si lo querés, borrá esta línea)

      // Scroll suave controlado (sin “redirecciones raras”)
      oldPill.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(FIESTA.pillTarget);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  // =========================
  // 2) SECCIÓN 3: Fiesta + Dresscode (2 cards)
  // =========================
  const details = document.getElementById("details");
  if (details) {
    details.innerHTML = `
      <div class="details-wrap">

        <div class="detail-item reveal" id="fiestaCard">
          <img src="assets/icono-fiesta.svg" alt="Fiesta" class="detail-icon">
          <h3>FIESTA</h3>
          <p>
            <span id="fiestaFecha">${FIESTA.fecha}</span><br>
            <span id="fiestaHora">${FIESTA.hora}</span><br>
            <strong id="fiestaLugar">${FIESTA.lugar}</strong><br>
            <i id="fiestaDir">${FIESTA.direccion}</i>
          </p>
          <a id="fiestaMaps" href="${FIESTA.maps}" class="detail-link">LLEGAR A LA FIESTA</a>
        </div>

        <div class="detail-item reveal" id="dresscode">
          <img src="assets/icono-dresscode.svg" alt="Dress code" class="detail-icon">
          <h3>CÓDIGO DE VESTIMENTA</h3>
          <p><strong>${FIESTA.dresscode}</strong>.</p>
        </div>

      </div>
    `;
  }
};
