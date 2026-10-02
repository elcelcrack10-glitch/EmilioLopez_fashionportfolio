document.documentElement.classList.add("js");

// The layout lives in the URL, so both views can be shared and revisited.
const projects = document.querySelector(".projects");
const viewButtons = [...document.querySelectorAll("[data-view]")];
function applyView() {
  if (!projects) return;
  const view =
    new URL(location.href).searchParams.get("view") === "index"
      ? "index"
      : "story";
  projects.dataset.layout = view;
  viewButtons.forEach((button) =>
    button.setAttribute("aria-pressed", String(button.dataset.view === view)),
  );
}
viewButtons.forEach((button) =>
  button.addEventListener("click", () => {
    const url = new URL(location.href);
    if (button.dataset.view === "index") url.searchParams.set("view", "index");
    else url.searchParams.delete("view");
    history.replaceState(null, "", url);
    applyView();
    // A shorter index must not leave the reader stranded below its projects.
    document.querySelector("#trabajos").scrollIntoView({ behavior: "instant" });
  }),
);
window.addEventListener("popstate", applyView);
applyView();

document.querySelectorAll(".languages a").forEach((link) =>
  link.addEventListener("click", () => {
    const url = new URL(link.href);
    url.search = location.search;
    url.hash = location.hash;
    link.href = url.href;
  }),
);

// The chapter links also work without JavaScript; this only marks reading position.
const chapterLinks = [...document.querySelectorAll("[data-reader-link]")];
if (chapterLinks.length) {
  const sections = chapterLinks.map((link) =>
    document.querySelector(link.getAttribute("href")),
  );
  let scheduled = false;
  function markChapter() {
    const threshold = Math.min(window.innerHeight * 0.3, 240);
    const current = sections.findLastIndex(
      (section) => section.getBoundingClientRect().top <= threshold,
    );
    chapterLinks.forEach((link, index) => {
      if (index === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    scheduled = false;
  }
  function scheduleChapter() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(markChapter);
  }
  window.addEventListener("scroll", scheduleChapter, { passive: true });
  window.addEventListener("resize", scheduleChapter);
  markChapter();
}

const dialog = document.querySelector(".lightbox");
const viewerImage = dialog.querySelector(".viewer-image");
const caption = dialog.querySelector(".viewer-caption");
const counter = dialog.querySelector(".viewer-count");
const photoLinks = [...document.querySelectorAll("[data-gallery]")];
let currentGroup = [];
let currentIndex = 0;
let opener;
function showPhoto(index) {
  currentIndex = (index + currentGroup.length) % currentGroup.length;
  const source = currentGroup[currentIndex];
  const originalImage = source.querySelector("img");
  viewerImage.src = source.href;
  viewerImage.alt = originalImage.alt;
  caption.textContent = originalImage.alt;
  counter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(currentGroup.length).padStart(2, "0")}`;
}
photoLinks.forEach((link) =>
  link.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    opener = link;
    currentGroup = photoLinks.filter(
      (item) => item.dataset.gallery === link.dataset.gallery,
    );
    showPhoto(currentGroup.indexOf(link));
    dialog.showModal();
    document.body.classList.add("modal-open");
    dialog.querySelector("[data-close]").focus();
  }),
);
dialog
  .querySelector("[data-close]")
  .addEventListener("click", () => dialog.close());
dialog
  .querySelector("[data-prev]")
  .addEventListener("click", () => showPhoto(currentIndex - 1));
dialog
  .querySelector("[data-next]")
  .addEventListener("click", () => showPhoto(currentIndex + 1));
dialog.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    showPhoto(currentIndex + 1);
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showPhoto(currentIndex - 1);
  }
});
dialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  viewerImage.removeAttribute("src");
  opener?.focus({ preventScroll: true });
});
