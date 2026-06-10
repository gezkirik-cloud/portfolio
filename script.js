// ===================== INTRO / ЗАСТАВКА =====================
(function intro() {
  const intro = document.getElementById("intro");
  const video = document.getElementById("introVideo");
  const skip = document.getElementById("introSkip");
  if (!intro) return;

  // Показываем заставку один раз за сессию (вкладку)
  if (sessionStorage.getItem("introSeen")) {
    intro.remove();
    return;
  }

  document.body.classList.add("intro-lock");
  let closed = false;

  function close() {
    if (closed) return;
    closed = true;
    sessionStorage.setItem("introSeen", "1");
    intro.classList.add("is-done");
    document.body.classList.remove("intro-lock");
    setTimeout(() => intro.remove(), 900);
  }

  if (video) {
    // Режим видео: проигрываем и закрываем по окончании
    video.play().catch(() => {});
    video.addEventListener("ended", close);
    let fallback = setTimeout(close, 6000);
    video.addEventListener("loadeddata", () => {
      clearTimeout(fallback);
      const max = (isFinite(video.duration) && video.duration > 0)
        ? (video.duration + 0.4) * 1000
        : 6000;
      setTimeout(close, max);
    });
  } else {
    // Режим логотипа FD: ждём, пока дорисуются F и D, затем закрываем
    setTimeout(close, 5200);
  }

  skip.addEventListener("click", close);
  intro.addEventListener("click", (e) => {
    if (e.target === skip) return;
    close();
  });
})();

// ===================== REVEAL ON SCROLL =====================
const reveals = document.querySelectorAll(".reveal");

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target); // анимируем один раз
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
);

reveals.forEach((el) => io.observe(el));

// ===================== REVEAL LOOP (заголовки появляются/исчезают при скролле) =====================
// В отличие от обычного reveal — переключается в обе стороны: вниз появляется, вверх прячется.
const loopIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-in", entry.isIntersecting);
    });
  },
  { threshold: 0.25, rootMargin: "0px 0px -8% 0px" }
);

document.querySelectorAll(".reveal-loop").forEach((el) => loopIO.observe(el));

// ===================== WORK FILTERS =====================
const chips = document.querySelectorAll(".chip");
const cards = document.querySelectorAll("#workGrid .card");

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("chip--active"));
    chip.classList.add("chip--active");

    const filter = chip.dataset.filter;
    cards.forEach((card) => {
      const show = filter === "all" || card.dataset.cat === filter;
      card.classList.toggle("is-hidden", !show);
    });
  });
});

// ===================== MOBILE MENU =====================
const burger = document.getElementById("navBurger");
const menu = document.getElementById("navMenu");

burger.addEventListener("click", () => {
  burger.classList.toggle("open");
  menu.classList.toggle("open");
});

menu.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    burger.classList.remove("open");
    menu.classList.remove("open");
  })
);

// ===================== HIDE NAV ON SCROLL DOWN =====================
const nav = document.getElementById("nav");
let lastY = window.scrollY;

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  if (y > lastY && y > 200) {
    nav.classList.add("nav--hidden");
  } else {
    nav.classList.remove("nav--hidden");
  }
  lastY = y;
});

// ===================== AUTOPLAY CARD VIDEOS ON HOVER =====================
// Видео в карточках играют при наведении и ставятся на паузу при уходе.
document.querySelectorAll(".card video").forEach((video) => {
  const card = video.closest(".card");
  card.addEventListener("mouseenter", () => video.play().catch(() => {}));
  card.addEventListener("mouseleave", () => video.pause());
});

// ===================== LIGHTBOX: видео почти на весь экран при долгом наведении =====================
(function lightbox() {
  const box = document.getElementById("lightbox");
  const boxVideo = document.getElementById("lightboxVideo");
  const closeBtn = document.getElementById("lightboxClose");
  if (!box) return;

  const HOLD = 1000; // мс удержания курсора до открытия
  let timer = null;

  function open(src) {
    if (!src) return;
    boxVideo.src = src;
    box.classList.add("is-open");
    box.setAttribute("aria-hidden", "false");
    document.body.classList.add("intro-lock");
    boxVideo.play().catch(() => {});
  }

  function close() {
    if (!box.classList.contains("is-open")) return;
    box.classList.remove("is-open");
    box.setAttribute("aria-hidden", "true");
    document.body.classList.remove("intro-lock");
    boxVideo.pause();
    boxVideo.removeAttribute("src");
    boxVideo.load();
  }

  document.querySelectorAll("#workGrid .card").forEach((card) => {
    const source = card.querySelector("video source");
    const src = source ? source.getAttribute("src") : null;
    card.addEventListener("mouseenter", () => {
      clearTimeout(timer);
      timer = setTimeout(() => open(src), HOLD);
    });
    card.addEventListener("mouseleave", () => clearTimeout(timer));
    // долгое наведение открывает превью, обычный клик по ссылке не блокируем
  });

  closeBtn.addEventListener("click", close);
  box.addEventListener("click", close); // клик в любом месте закрывает
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
