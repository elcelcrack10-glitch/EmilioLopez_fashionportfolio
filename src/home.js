// The scattered field drifts a few pixels against the pointer on precise
// devices. Photographs stay reachable and static when that is not appropriate.
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
