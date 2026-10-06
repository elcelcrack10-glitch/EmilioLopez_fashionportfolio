document.documentElement.classList.add("js");

document.querySelectorAll(".languages a").forEach((link) =>
  link.addEventListener("click", () => {
    const url = new URL(link.href);
    url.search = location.search;
    url.hash = location.hash;
    link.href = url.href;
  }),
);

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
