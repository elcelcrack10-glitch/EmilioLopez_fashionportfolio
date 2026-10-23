// The reading room is vertical: one panel per screen, top to bottom.
const track = document.querySelector(".exhibition-track");
if (track) initExhibition(track);

function initExhibition(track) {
  const panels = [...track.querySelectorAll("[data-rail-panel]")];
  const chapters = [...track.querySelectorAll("[data-rail-chapter]")];
  const links = [...document.querySelectorAll("[data-rail-link]")];
  const previous = document.querySelector("[data-rail-prev]");
  const next = document.querySelector("[data-rail-next]");
  const count = document.querySelector(".rail-counter");
  const lightbox = document.querySelector(".lightbox");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let current = 0;
  let frame;
  let settle;

  const topOf = (element) => element.getBoundingClientRect().top + scrollY;
  const clamp = (value) => Math.max(0, Math.min(panels.length - 1, value));

  function setFragment(id) {
    const url = new URL(location.href);
    url.hash = id;
    history.replaceState(null, "", url);
  }
  function updatePosition(saveFragment = false) {
    const atEnd =
      scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
    current = panels.reduce(
      (best, panel, i) =>
        Math.abs(topOf(panel) - scrollY) < Math.abs(topOf(panels[best]) - scrollY)
          ? i
          : best,
      0,
    );
    if (atEnd) current = panels.length - 1;
    count.textContent = `${String(current + 1).padStart(2, "0")} / ${String(panels.length).padStart(2, "0")}`;
    previous.disabled = current === 0;
    next.disabled = current === panels.length - 1;
    const active = chapters.find(
      (chapter) =>
        chapter === panels[current] || chapter.contains(panels[current]),
    );
    links.forEach((link) => {
      if (active && link.hash === `#${active.id}`)
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    if (saveFragment && scrollY >= topOf(track) - 2) {
      setFragment(panels[current].id);
    }
    frame = null;
  }
  function moveTo(element, animate = true) {
    scrollTo({
      top: topOf(element),
      behavior: animate && !reducedMotion.matches ? "smooth" : "instant",
    });
  }
  function moveBy(amount) {
    moveTo(panels[clamp(current + amount)]);
  }
  function followFragment() {
    const target = document.getElementById(location.hash.slice(1));
    if (target && track.contains(target))
      requestAnimationFrame(() => moveTo(target, false));
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
  addEventListener(
    "scroll",
    () => {
      if (!frame) frame = requestAnimationFrame(() => updatePosition());
      clearTimeout(settle);
      settle = setTimeout(() => updatePosition(true), 200);
    },
    { passive: true },
  );
  addEventListener("keydown", (event) => {
    // The photo viewer owns the arrow keys while it is open.
    const element = event.target instanceof Element ? event.target : null;
    if (lightbox?.open || element?.closest("input, textarea, select")) return;
    let target = null;
    if (event.key === "ArrowDown" || event.key === "PageDown")
      target = current + 1;
    else if (event.key === "ArrowUp" || event.key === "PageUp")
      target = current - 1;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = panels.length - 1;
    if (target === null) return;
    event.preventDefault();
    moveTo(panels[clamp(target)]);
  });
  addEventListener("hashchange", followFragment);
  addEventListener("resize", () => {
    moveTo(panels[current], false);
    updatePosition();
  });
  addEventListener("load", followFragment, { once: true });
  followFragment();
}
