const track = document.querySelector(".exhibition-track");
if (track) initExhibition(track);

function initExhibition(track) {
  const panels = [...track.querySelectorAll("[data-rail-panel]")];
  const chapters = [...track.querySelectorAll("[data-rail-chapter]")];
  const links = [...document.querySelectorAll("[data-rail-link]")];
  const previous = document.querySelector("[data-rail-prev]");
  const next = document.querySelector("[data-rail-next]");
  const count = document.querySelector(".rail-counter");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let current = 0;
  let settle;
  let frame;

  function destination(element) {
    const padding = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    return (
      element.getBoundingClientRect().left -
      track.getBoundingClientRect().left +
      track.scrollLeft -
      padding
    );
  }
  function setFragment(id) {
    const url = new URL(location.href);
    url.hash = id;
    history.replaceState(null, "", url);
  }
  function updatePosition(saveFragment = false) {
    current = panels.reduce(
      (best, panel, i) =>
        Math.abs(destination(panel) - track.scrollLeft) <
        Math.abs(destination(panels[best]) - track.scrollLeft)
          ? i
          : best,
      0,
    );
    if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 2)
      current = panels.length - 1;
    count.textContent = `${String(current + 1).padStart(2, "0")} / ${String(panels.length).padStart(2, "0")}`;
    previous.disabled = track.scrollLeft < 2;
    next.disabled =
      track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    const active = chapters.find(
      (chapter) =>
        chapter === panels[current] || chapter.contains(panels[current]),
    );
    links.forEach((link) => {
      if (active && link.hash === `#${active.id}`)
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    if (saveFragment) setFragment(panels[current].id);
    frame = null;
  }
  function moveTo(element, animate = true) {
    track.scrollTo({
      left: destination(element),
      behavior: animate && !reducedMotion.matches ? "smooth" : "instant",
    });
  }
  function moveBy(amount) {
    moveTo(panels[Math.max(0, Math.min(panels.length - 1, current + amount))]);
  }
  function followFragment() {
    const target = document.getElementById(location.hash.slice(1));
    if (target && track.contains(target)) moveTo(target, false);
    updatePosition();
  }
  previous.addEventListener("click", () => moveBy(-1));
  next.addEventListener("click", () => moveBy(1));
  links.forEach((link) =>
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
        return;
      event.preventDefault();
      const target = document.getElementById(link.hash.slice(1));
      setFragment(target.id);
      moveTo(target);
    }),
  );
  track.addEventListener(
    "scroll",
    () => {
      if (!frame) frame = requestAnimationFrame(() => updatePosition());
      clearTimeout(settle);
      settle = setTimeout(() => updatePosition(true), 180);
    },
    { passive: true },
  );
  track.addEventListener("keydown", (event) => {
    if (event.target !== track) return;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") moveTo(panels[0]);
    else if (event.key === "End") moveTo(panels.at(-1));
    else moveBy(event.key === "ArrowRight" ? 1 : -1);
  });
  track.addEventListener(
    "wheel",
    (event) => {
      // Native trackpad/pinch gestures and scrolling inside notes keep their behaviour.
      if (
        event.ctrlKey ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY) ||
        event.target.closest("video")
      )
        return;
      const note = event.target.closest(".rail-note");
      if (
        note &&
        ((event.deltaY > 0 &&
          note.scrollTop + note.clientHeight < note.scrollHeight - 1) ||
          (event.deltaY < 0 && note.scrollTop > 0))
      )
        return;
      const delta =
        event.deltaY *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? track.clientWidth
            : 1);
      if (
        (delta > 0 &&
          track.scrollLeft < track.scrollWidth - track.clientWidth - 1) ||
        (delta < 0 && track.scrollLeft > 1)
      ) {
        event.preventDefault();
        track.scrollLeft += delta;
      }
    },
    { passive: false },
  );
  window.addEventListener("hashchange", followFragment);
  window.addEventListener("resize", () => {
    moveTo(panels[current], false);
    updatePosition();
  });
  window.addEventListener("load", followFragment, { once: true });
  followFragment();
}
