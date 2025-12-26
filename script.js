// efecto scroll hero
(function () {
  const hero = document.getElementById('hero');
  const heroText = document.getElementById('heroText');

  function onScroll() {
    const vh = window.innerHeight;
    const rect = hero.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (-rect.top) / vh));

    heroText.style.transform = `translateY(${-progress * 120}px)`;
    heroText.style.opacity = (1 - progress * 0.35).toFixed(2);
  }

  window.addEventListener('scroll', onScroll);
  onScroll();
})();

// countdown
const targetDate = new Date("2026-10-03T00:00:00").getTime();

function updateCountdown() {
  const now = Date.now();
  const diff = targetDate - now;
  if (diff <= 0) return;

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor(diff / (1000 * 60 * 60) % 24);
  const m = Math.floor(diff / (1000 * 60) % 60);
  const s = Math.floor(diff / 1000 % 60);

  d && (document.getElementById("d").textContent = d);
  document.getElementById("h").textContent = String(h).padStart(2, "0");
  document.getElementById("m").textContent = String(m).padStart(2, "0");
  document.getElementById("s").textContent = String(s).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);
