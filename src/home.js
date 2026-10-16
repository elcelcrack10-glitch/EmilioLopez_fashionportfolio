// The scattered field drifts a few pixels against the pointer on precise
// devices. Photographs stay reachable and static when that is not appropriate.
const slideshow = document.querySelector(".home-slideshow");
if (slideshow) initSlideshow(slideshow);

function initSlideshow(root) {
  const track = root.querySelector(".home-slides");
  const slides = [...track.children];
  const repeats = slides.map((slide) => {
    const copy = slide.cloneNode(true);
    copy.dataset.repeat = "";
    copy.inert = true;
    copy.setAttribute("aria-hidden", "true");
    track.append(copy);
    return copy;
  });
  let resetTimer;
  const resetLoop = () => {
    if (index < slides.length) return;
    clearTimeout(resetTimer);
    index = 0;
    track.style.transition = "none";
    track.style.transform = "translateX(0)";
    // Both positions show the same image; reset without animating backwards.
    track.getBoundingClientRect();
    track.style.transition = "";
    updateSlides();
  };
  const updateSlides = () => {
    [...slides, ...repeats].forEach((slide, i) => {
      slide.inert = i !== index;
      slide.setAttribute("aria-hidden", String(i !== index));
      if (i === index || i === index + 1) {
        slide.querySelector("img").loading = "eager";
      }
    });
  };

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let index = 0;

  let visible = true;
  let timer;

  const schedule = () => {
    clearTimeout(timer);
    if (reduced.matches || !visible || document.hidden) return;
    timer = setTimeout(() => show(index + 1), 4500);
  };
  const show = (next) => {
    index = next;
    track.style.transform = `translateX(-${index * 100}%)`;
    updateSlides();
    if (index === slides.length) {
      resetTimer = setTimeout(resetLoop, 850);
    }

    schedule();
  };

  track.addEventListener("transitionend", (event) => {
    if (event.target === track && event.propertyName === "transform") resetLoop();
  });
  document.addEventListener("visibilitychange", schedule);
  reduced.addEventListener("change", schedule);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }).observe(root);
  show(0);
}

const field = document.querySelector(".archive-field");
if (field) initField(field);

function initField(field) {
  const pieces = [...field.querySelectorAll(".archive-piece")];
  if (!pieces.length) return;
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const depths = pieces.map((_, index) => 10 + ((index * 7) % 13));
  const clamp = (value) => Math.max(-1, Math.min(1, value));
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;

  const enabled = () => fine.matches && !reduced.matches;
  const render = () => {
    frame = 0;
    pieces.forEach((piece, index) => {
      const depth = depths[index];
      piece.style.setProperty("--px", `${(pointerX * depth).toFixed(1)}px`);
      piece.style.setProperty("--py", `${(pointerY * depth).toFixed(1)}px`);
    });
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };
  const reset = () => {
    pointerX = 0;
    pointerY = 0;
    schedule();
  };

  addEventListener(
    "pointermove",
    (event) => {
      if (!enabled()) return;
      pointerX = clamp((event.clientX / innerWidth - 0.5) * 2);
      pointerY = clamp((event.clientY / innerHeight - 0.5) * 2);
      schedule();
    },
    { passive: true },
  );
  document.addEventListener("mouseout", (event) => {
    if (!event.relatedTarget) reset();
  });
  reduced.addEventListener("change", () => {
    if (!enabled()) reset();
  });
}
