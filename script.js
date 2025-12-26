document.addEventListener("DOMContentLoaded", () => {

  // 1) Efecto: texto del hero sube un poco mientras scrolleás (y se desvanece suave)
  const heroText = document.getElementById("heroText");

  function onScroll() {
    const y = window.scrollY;
    const vh = window.innerHeight || 1;

    // progreso 0..1 durante el primer viewport de scroll
    const progress = Math.min(1, Math.max(0, y / vh));

    const translate = -progress * 140;     // sube hasta 140px
    const opacity = 1 - progress * 0.35;   // baja un poco la opacidad

    heroText.style.transform = `translateY(${translate}px)`;
    heroText.style.opacity = opacity.toFixed(3);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();


  // 2) Countdown (SIEMPRE asigna números)
  const targetDate = new Date("2026-10-03T00:00:00").getTime();

  const elD = document.getElementById("d");
  const elH = document.getElementById("h");
  const elM = document.getElementById("m");
  const elS = document.getElementById("s");

  function pad2(n) { return String(n).padStart(2, "0"); }

  function updateCountdown() {
    const now = Date.now();
    let diff = targetDate - now;

    if (diff < 0) diff = 0;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    elD.textContent = d;
    elH.textContent = pad2(h);
    elM.textContent = pad2(m);
    elS.textContent = pad2(s);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
});
