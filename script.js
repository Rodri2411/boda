// ====== 1) PARALLAX tipo "parallax-mirror" ======
const slider = document.querySelector(".parallax-slider");

// intensidad: a mayor valor, más se mueve
const PARALLAX_STRENGTH = 0.18;

function onScroll(){
  const y = window.scrollY || 0;
  // mueve la imagen un poco hacia arriba al bajar (estilo translate3d)
  const offset = Math.round(y * PARALLAX_STRENGTH);
  if (slider) {
    slider.style.transform = `translate3d(0px, ${-offset}px, 0px) scale(1.06)`;
  }
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();


// ====== 2) COUNTDOWN ======
const target = new Date("2026-10-03T00:00:00-03:00").getTime();

const dd = document.getElementById("dd");
const hh = document.getElementById("hh");
const mm = document.getElementById("mm");
const ss = document.getElementById("ss");

function pad(n){ return String(n).padStart(2, "0"); }

function tick(){
  const now = Date.now();
  let diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000*60*60*24));
  diff -= days * (1000*60*60*24);

  const hours = Math.floor(diff / (1000*60*60));
  diff -= hours * (1000*60*60);

  const mins = Math.floor(diff / (1000*60));
  diff -= mins * (1000*60);

  const secs = Math.floor(diff / 1000);

  dd.textContent = days;
  hh.textContent = pad(hours);
  mm.textContent = pad(mins);
  ss.textContent = pad(secs);
}

tick();
setInterval(tick, 1000);
