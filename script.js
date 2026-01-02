// ====== COUNTDOWN ======
const targetDate = new Date("2026-10-03T00:00:00").getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const diff = targetDate - now;

  const elD = document.getElementById("d");
  const elH = document.getElementById("h");
  const elM = document.getElementById("m");
  const elS = document.getElementById("s");

  if (!elD) return;

  if (diff <= 0) {
    document.querySelector(".countdown-line").innerHTML = "<strong>¡LLEGÓ EL DÍA!</strong>";
    return;
  }

  elD.textContent = Math.floor(diff / (1000 * 60 * 60 * 24));
  elH.textContent = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, "0");
  elM.textContent = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0");
  elS.textContent = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ====== HERO PARALLAX OPTIMIZADO ======
(function () {
  const heroText = document.getElementById("heroText");
  const heroImage = document.getElementById("heroImage");
  const scrollIndicator = document.getElementById("scrollIndicator");

  function onScroll() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    
    // Solo ejecutar si el Hero es visible
    if (scrollY > vh) return;

    const progress = scrollY / vh;

    if (heroText) {
      heroText.style.transform = `translateY(${progress * -100}px)`;
      heroText.style.opacity = (1 - progress * 1.2).toFixed(2);
    }

    if (heroImage) {
      heroImage.style.transform = `scale(${1 + progress * 0.1}) translateY(${progress * 50}px)`;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", () => {
      document.getElementById("countdown").scrollIntoView({ behavior: "smooth" });
    });
  }
})();
