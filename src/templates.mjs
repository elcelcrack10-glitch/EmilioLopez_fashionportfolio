import { siteURL, absoluteSiteURL } from "../scripts/deployment.mjs";
import { projects, biography, contact } from "./content.mjs";

export const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
export const pathFor = (slug, lang) =>
  `${lang === "en" ? "/en" : ""}/${slug ? `${slug}/` : ""}`;
const arrow = '<span aria-hidden="true">↗</span>';
const number = (i) => String(i + 1).padStart(2, "0");
export function renderer(lang, manifest) {
  const t = (value) => (typeof value === "string" ? value : value[lang]);
  const words = (es, en) => (lang === "es" ? es : en);
  const href = (slug) => pathFor(slug, lang);
  const img = (
    image,
    eager = false,
    sizes = "(max-width: 700px) 100vw, 65vw",
  ) => {
    const m = manifest[image.id];
    return `<picture><source type="image/avif" srcset="${m.variants.map((v) => `${v.avif} ${v.width}w`).join(", ")}" sizes="${sizes}"><img src="${m.src}" srcset="${m.variants.map((v) => `${v.src} ${v.width}w`).join(", ")}" sizes="${sizes}" width="${m.width}" height="${m.height}" alt="${escape(t(image.alt))}" ${eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async"></picture>`;
  };
  const creditList = (credits) =>
    `<dl class="credits">${credits.map(([role, name]) => `<div><dt>${escape(t(role))}</dt><dd>${escape(name)}</dd></div>`).join("")}</dl>`;
  const socials = () =>
    contact.instagram
      .map(
        (name) =>
          `<a href="https://www.instagram.com/${name}/" target="_blank" rel="noopener noreferrer">@${name} ${arrow}<span class="sr-only">${words(" (nueva pestaña)", " (new tab)")}</span></a>`,
      )
      .join("");
  const footer = (isAbout = false) =>
    `<footer id="contacto"><div class="footer-top"><p class="eyebrow">${words("¿Hablamos?", "Let’s talk")}</p><a class="contact-heading" href="mailto:${contact.email}">${words("Hagamos algo.", "Let’s make something.")} ${arrow}</a></div><div class="footer-bottom"><a href="mailto:${contact.email}">${contact.email}</a><div class="socials">${socials()}</div><span>© ${new Date().getFullYear()} Emilio Lopez</span><a href="#top">${words("Volver arriba", "Back to top")} ↑</a></div>${isAbout ? '<p class="persona-signature" aria-hidden="true">EMILIO LOPEZ</p>' : ""}</footer>`;
  function shell(slug, title, description, content, cover) {
    const isAbout = slug === "sobre-mi";
    const isProject = projects.some((project) => project.slug === slug);
    const isHome = slug === "" && content.includes('class="archive-intro"');
    const otherLang = lang === "es" ? "en" : "es";
    const canonical = siteURL ? absoluteSiteURL(pathFor(slug, lang)) : null;
    const languageLinks = siteURL
      ? `<link rel="canonical" href="${escape(canonical)}"><link rel="alternate" hreflang="${otherLang}" href="${escape(absoluteSiteURL(pathFor(slug, otherLang)))}">`
      : "";
    return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="theme-color" content="${isAbout ? "#c2c7a8" : "#f3f1ec"}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="website">${cover ? `<meta property="og:image" content="${escape(siteURL ? absoluteSiteURL(manifest[cover.id].src) : manifest[cover.id].src)}">` : ""}<link rel="icon" type="image/svg+xml" href="/favicon.svg">${languageLinks}<link rel="preload" href="/fonts/albert-sans-latin-variable.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/style.css">${isProject || isHome ? '<link rel="stylesheet" href="/project-worlds.css">' : ""}${isHome ? '<link rel="stylesheet" href="/archive.css">' : ""}${isAbout ? '<link rel="stylesheet" href="/persona.css">' : ""}<script src="/app.js" defer></script></head><body id="top"${isProject ? ` class="project-page" data-project="${slug}"` : isHome ? ' class="home-page"' : isAbout ? ' class="persona-page"' : ""}><a class="skip-link" href="#main">${words("Saltar al contenido", "Skip to content")}</a><header class="site-header"><a class="wordmark" href="${href("")}">Emilio Lopez<span>${words("Diseñador de moda", "Fashion designer")}</span></a><nav aria-label="${words("Navegación principal", "Main navigation")}"><a href="${href("")}#trabajos" ${slug !== "sobre-mi" ? 'aria-current="page"' : ""}>${words("Trabajo", "Work")}</a><a href="${href("sobre-mi")}" ${slug === "sobre-mi" ? 'aria-current="page"' : ""}>${words("Sobre mí", "About")}</a><a href="#contacto">${words("Contacto", "Contact")}</a></nav><div class="languages" aria-label="${words("Idioma", "Language")}"><a href="${pathFor(slug, "es")}" lang="es" ${lang === "es" ? 'aria-current="true"' : ""}>ES</a><span aria-hidden="true">/</span><a href="${pathFor(slug, "en")}" lang="en" ${lang === "en" ? 'aria-current="true"' : ""}>EN</a></div></header><main id="main">${content}</main>${footer(isAbout)}<dialog class="lightbox" aria-label="${words("Visor de fotografías", "Photo viewer")}"><div class="viewer-toolbar"><span class="viewer-count" aria-live="polite"></span><button type="button" data-close>${words("Cerrar", "Close")} <span aria-hidden="true">×</span></button></div><div class="viewer-stage"><button type="button" data-prev aria-label="${words("Foto anterior", "Previous photo")}">←</button><img class="viewer-image" alt=""><button type="button" data-next aria-label="${words("Foto siguiente", "Next photo")}">→</button></div><p class="viewer-caption" aria-live="polite"></p></dialog></body></html>`;
  }
  function home() {
    const cards = projects
      .map((p, i) => {
        const cover = p.photos[p.cover || 0];
        const supporting = p.photos.filter((photo) => photo !== cover);
        const previews = [supporting[1], supporting[4], cover];
        const study = p.process[p.slug === "pescadilla" ? 1 : 0].images[0];
        return `<article class="project-card" data-project="${p.slug}">
        <div class="project-meta"><span class="eyebrow">${number(i)} / ${p.year}</span><h2><a href="${href(p.slug)}">${p.title}</a></h2><p class="project-subtitle">${escape(t(p.subtitle))}</p><p class="preview-lead">${escape(t(p.lead))}</p><p class="category">${escape(t(p.category))}</p><a class="text-link" href="${href(p.slug)}">${words("Explorar proyecto", "Explore project")} ${arrow}</a></div>
        <a class="project-art" href="${href(p.slug)}" aria-label="${words("Ver", "View")} ${p.title}">${previews.map((photo, position) => `<span class="stack-photo stack-photo-${position + 1}${manifest[photo.id].width > manifest[photo.id].height ? " is-landscape" : ""}" style="--photo-ratio: ${manifest[photo.id].width / manifest[photo.id].height}">${img(photo, false, "(max-width: 700px) 65vw, 40vw")}</span>`).join("")}<span class="stack-label" aria-hidden="true">${p.title} ↗</span></a>
        <figure class="story-study">${img(study, false, "(max-width: 700px) 35vw, 16vw")}<figcaption>${words("Del cuaderno", "From the sketchbook")} / ${p.title}</figcaption></figure>
        <div class="project-chapter-end"><span>${words("Colección", "Collection")} ${number(i)} / 04</span><span>${escape(t(p.subtitle))}</span></div>
      </article>`;
      })
      .join("");
    const featured = projects.find((p) => p.slug === "feel-marni");
    const content = `<section class="archive-intro" aria-labelledby="home-title"><div class="archive-heading"><p class="eyebrow">${words("Diseño de moda · Dirección creativa", "Fashion design · Creative direction")}</p><span class="eyebrow">MADRID / 2024—2026</span></div><h1 id="home-title">Emilio Lopez</h1><div class="archive-description"><p>${words("Una selección de proyectos.<br>Del concepto a la prenda y la imagen.", "Selected projects.<br>From concept to garment and image.")}</p><a class="text-link" href="${href("sobre-mi")}">${words("Conocer a la persona", "Meet the person")} ↗</a></div></section>
    <section id="trabajos" class="work-section" aria-label="${words("Proyectos seleccionados", "Selected projects")}"><div class="work-toolbar"><h2 class="eyebrow">${words("Proyectos seleccionados", "Selected projects")} <span>(04)</span></h2><div class="view-switch" role="group" aria-label="${words("Vista de proyectos", "Project view")}"><button data-view="story" type="button" aria-pressed="true"><span class="view-icon view-story" aria-hidden="true"></span>${words("Recorrido", "Journal")}</button><button data-view="index" type="button" aria-pressed="false"><span class="view-icon view-grid" aria-hidden="true"></span>${words("Índice", "Index")}</button></div></div><div class="projects" data-layout="story">${cards}</div></section>
    <section class="archive-persona"><p class="eyebrow">${words("Detrás de los proyectos", "Behind the projects")}</p><a href="${href("sobre-mi")}">${words("persona", "person")} <span aria-hidden="true">↗</span></a><p>${words("Investigar, escribir y conversar.<br>Encontrar una idea y empezar a crear.", "Research, write and talk.<br>Find an idea and start creating.")}</p></section>`;
    return shell(
      "",
      "Emilio Lopez — Fashion portfolio",
      words(
        "Diseño de moda, dirección creativa y editoriales. Una selección de proyectos de Emilio Lopez, Madrid.",
        "Fashion design, creative direction and editorials. Selected projects by Emilio Lopez, Madrid.",
      ),
      content,
      featured.photos[featured.cover || 0],
    );
  }
  function gallery(images, group, process = false) {
    return `<div class="${process ? "process-gallery" : "editorial-gallery"}">${images.map((im, i) => `<figure class="gallery-item ${manifest[im.id].width > manifest[im.id].height ? "wide" : "portrait"}"><a class="zoom-link" href="${manifest[im.id].src}" data-gallery="${group}" aria-label="${words("Ampliar:", "Enlarge:")} ${escape(t(im.alt))}">${img(im, false, process ? "(max-width: 700px) 92vw, 45vw" : "(max-width: 700px) 92vw, 65vw")}<span class="zoom-mark" aria-hidden="true">+</span></a><figcaption><span>${number(i)}</span>${escape(t(im.alt))}</figcaption></figure>`).join("")}</div>`;
  }
  function project(p) {
    const index = projects.indexOf(p);
    const cover = p.photos[p.cover || 0];
    const next = projects[(index + 1) % projects.length];
    const film = p.film
      ? `<section id="film" class="film-section reader-section" aria-labelledby="film-title"><div class="section-heading"><span class="eyebrow">${words("La colección en movimiento", "The collection in motion")}</span><h2 id="film-title">Fashion film</h2></div><video controls playsinline preload="none" width="1280" height="720" poster="${manifest["film-poster"].src}" aria-label="Feel Marni — fashion film"><source src="/media/feel-marni.mp4" type="video/mp4"><p><a href="/media/feel-marni.mp4">${words("Descargar el vídeo", "Download the film")}</a></p></video><div class="film-description"><p>${escape(t(p.film.text))}</p>${creditList(p.film.credits)}</div></section>`
      : "";
    const process = p.process
      .map(
        (section) =>
          `<section class="process-chapter"><div class="chapter-heading"><h3>${escape(t(section.title))}</h3><p>${escape(t(section.text))}</p></div>${gallery(section.images, `process-${section.images[0].id}`, true)}</section>`,
      )
      .join("");
    const readerLinks = [
      ["editorial", words("Editorial", "Editorial")],
      ["concepto", words("Concepto", "Concept")],
      ...(p.film ? [["film", "Film"]] : []),
      ["proceso", words("Proceso", "Process")],
    ];
    const content = `<section class="project-opening" aria-labelledby="project-title">
      <div class="project-heading">
        <a class="text-link back-link" href="${href("")}#trabajos">← ${words("Proyectos", "Projects")}</a>
        <div class="project-title-group"><h1 id="project-title">${p.title}</h1><p>${escape(t(p.subtitle))}</p></div>
        <span class="project-edition eyebrow">${p.year}<span>${number(index)} / 04</span></span>
      </div>
      <div class="project-hero ${manifest[cover.id].width > manifest[cover.id].height ? "landscape" : ""}"><a href="${manifest[cover.id].src}" data-gallery="editorial" class="zoom-link" aria-label="${words("Ampliar portada de", "Enlarge cover of")} ${p.title}">${img(cover, true, "(max-width: 700px) calc(100vw - 32px), 75vw")}<span class="zoom-mark" aria-hidden="true">+</span></a></div>
    </section>
    <nav class="project-reader" aria-label="${words("Dentro del proyecto", "Inside the project")}"><a class="reader-title" href="#top">${p.title} ↑</a><div class="reader-chapters">${readerLinks.map(([id, label]) => `<a href="#${id}" data-reader-link>${label}</a>`).join("")}</div><a class="reader-next" href="${href(next.slug)}" aria-label="${words("Siguiente proyecto", "Next project")}: ${next.title}">↗</a></nav>
    <section id="editorial" class="editorial-section reader-section" aria-labelledby="editorial-title"><div class="editorial-heading"><h2 id="editorial-title" class="eyebrow">${words("La editorial", "The editorial")}</h2><p>${String(p.photos.length).padStart(2, "0")} ${words("fotografías", "photographs")} / ${p.year}</p></div>${gallery(
      p.photos.filter((im) => im !== cover),
      "editorial",
    )}</section>
    <section id="concepto" class="project-introduction reader-section"><div><p class="eyebrow">${words("El concepto", "The concept")}</p><h2>${escape(t(p.lead))}</h2></div><div class="project-copy"><p>${escape(t(p.description))}</p><p class="project-note">${escape(t(p.note))}</p>${creditList(p.credits)}</div></section>
    ${film}<section id="proceso" class="process-section reader-section"><div class="section-heading"><span class="eyebrow">${words("Detrás de la imagen", "Behind the image")}</span><h2>${words("El proceso", "The process")}<span aria-hidden="true"> ↙</span></h2></div>${process}</section>
    <nav class="next-project" aria-label="${words("Siguiente proyecto", "Next project")}"><span class="eyebrow">${words("Siguiente proyecto", "Next project")} / ${number((index + 1) % projects.length)}</span><a href="${href(next.slug)}"><span class="next-project-title">${next.title} ${arrow}</span>${img(next.photos[next.cover || 0], false, "(max-width: 700px) 120px, 200px")}</a><a class="next-project-index text-link" href="${href("")}?view=index#trabajos">${words("Volver al índice", "Back to index")} ↗</a></nav>`;
    return shell(
      p.slug,
      `${p.title} — Emilio Lopez`,
      t(p.description),
      content,
      cover,
    );
  }
  function about() {
    const milestones = [
      ["2023—", words("Diseño de Moda", "Fashion Design"), "IED Madrid"],
      [
        "2023—2025",
        words(
          "Proyectos editoriales y de comunicación",
          "Editorial & communication projects",
        ),
        "IED Madrid",
      ],
      [
        "2024",
        words(
          "Apoyo a proyectos de fin de estudios",
          "Support for graduation projects",
        ),
        "IED Madrid",
      ],
      [
        "2022—2023",
        words("Colaboración en sastrería", "Tailoring collaboration"),
        "Sartoria Pardi",
      ],
    ];
    return shell(
      "sobre-mi",
      `${words("Sobre mí", "About")} — Emilio Lopez`,
      words(
        "La práctica, la trayectoria y el contacto de Emilio Lopez, diseñador de moda y estudiante en IED Madrid.",
        "Practice, experience and contact details of Emilio Lopez, fashion designer and student at IED Madrid.",
      ),
      `<section class="about-heading" aria-labelledby="persona-title"><p class="eyebrow">Emilio Lopez / Madrid</p><h1 id="persona-title">${words("persona", "person")}</h1><div class="persona-intro"><p>${words("Diseñador de moda.<br>Estudiante en IED Madrid.", "Fashion designer.<br>Student at IED Madrid.")}</p><a class="persona-read" href="#biografia">${words("Un poco sobre mí", "A little about me")} <span aria-hidden="true">↓</span></a><p>${words("Concepto, prenda<br>e imagen.", "Concept, garment<br>and image.")}</p></div></section><section id="biografia" class="biography" aria-label="${words("Biografía", "Biography")}"><div class="bio-label"><p class="eyebrow">Emilio Lopez</p><p>${words("Diseñador de moda.<br>Estudiante en IED Madrid.", "Fashion designer.<br>Student at IED Madrid.")}</p><a class="text-link" href="/Emilio-Lopez-CV.pdf" download>${words("Descargar CV", "Download CV")} <span class="file-label">PDF · EN</span> ↓</a></div><div class="bio-copy">${t(
        biography,
      )
        .map((p) => `<p>${escape(p)}</p>`)
        .join(
          "",
        )}</div></section><section class="persona-studio" aria-labelledby="persona-studio-title"><div class="persona-studio-label"><h2 id="persona-studio-title" class="eyebrow">${words("Entre la idea y la prenda", "Between the idea and the garment")}</h2><a class="text-link" href="${href("pescadilla")}#proceso">Pescadilla / ${words("El proceso", "The process")} ↗</a></div><figure class="persona-study persona-study-toile">${img(projects[0].process[2].images[0], false, "(max-width: 700px) 68vw, 32vw")}<figcaption>${words("01 / Forma · Una primera toile", "01 / Form · An initial toile")}</figcaption></figure><figure class="persona-study persona-study-print">${img(projects[0].process[2].images[7], false, "(max-width: 700px) 68vw, 28vw")}<figcaption>${words("02 / Materia · Estampación sobre tejido", "02 / Material · Printing on fabric")}</figcaption></figure></section><section class="experience"><div class="section-heading"><p class="eyebrow">${words("En el camino", "Along the way")}</p><h2>${words("Trayectoria", "Experience")}</h2></div>${milestones.map(([year, title, place]) => `<div class="experience-row"><span>${year}</span><h3>${title}</h3><span>${place}</span></div>`).join("")}</section>`,
    );
  }
  return { home, project, about, shell };
}
