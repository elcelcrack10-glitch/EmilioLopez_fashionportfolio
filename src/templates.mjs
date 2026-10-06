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
    `<footer id="contacto"><div class="footer-top"><p class="eyebrow">${words("¿Hablamos?", "Let’s talk")}</p><a class="contact-heading" href="mailto:${contact.email}">${words("Contacto", "Contact")} ${arrow}</a></div><div class="footer-bottom"><a href="mailto:${contact.email}">${contact.email}</a><div class="socials">${socials()}</div><span>© ${new Date().getFullYear()} Emilio Lopez</span><a href="#top">${words("Volver arriba", "Back to top")} ↑</a></div>${isAbout ? '<p class="persona-signature" aria-hidden="true">EMILIO LOPEZ</p>' : ""}</footer>`;
  function shell(slug, title, description, content, cover) {
    const isAbout = slug === "sobre-mi";
    const isProject = projects.some((project) => project.slug === slug);
    const isHome = slug === "" && content.includes('class="image-archive"');
    const otherLang = lang === "es" ? "en" : "es";
    const canonical = siteURL ? absoluteSiteURL(pathFor(slug, lang)) : null;
    const languageLinks = siteURL
      ? `<link rel="canonical" href="${escape(canonical)}"><link rel="alternate" hreflang="${otherLang}" href="${escape(absoluteSiteURL(pathFor(slug, otherLang)))}">`
      : "";
    return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="theme-color" content="${isAbout ? "#c2c7a8" : "#f3f1ec"}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="website">${cover ? `<meta property="og:image" content="${escape(siteURL ? absoluteSiteURL(manifest[cover.id].src) : manifest[cover.id].src)}">` : ""}<link rel="icon" type="image/svg+xml" href="/favicon.svg">${languageLinks}<link rel="preload" href="/fonts/albert-sans-latin-variable.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/style.css">${isProject || isHome ? '<link rel="stylesheet" href="/exhibition.css">' : ""}${isProject ? '<script src="/exhibition.js" defer></script>' : ""}${isAbout ? '<link rel="stylesheet" href="/persona.css">' : ""}<script src="/app.js" defer></script></head><body id="top"${isProject ? ` class="exhibition-page" data-project="${slug}"` : isHome ? ' class="archive-page"' : isAbout ? ' class="persona-page"' : ""}><a class="skip-link" href="#main">${words("Saltar al contenido", "Skip to content")}</a><header class="site-header"><a class="wordmark" href="${href("")}">Emilio Lopez<span>${words("Diseñador de moda", "Fashion designer")}</span></a><nav aria-label="${words("Navegación principal", "Main navigation")}"><a href="${href("")}#trabajos" ${slug !== "sobre-mi" ? 'aria-current="page"' : ""}>${words("Trabajo", "Work")}</a><a href="${href("sobre-mi")}" ${slug === "sobre-mi" ? 'aria-current="page"' : ""}>${words("Sobre mí", "About")}</a><a href="#contacto">${words("Contacto", "Contact")}</a></nav><div class="languages" aria-label="${words("Idioma", "Language")}"><a href="${pathFor(slug, "es")}" lang="es" ${lang === "es" ? 'aria-current="true"' : ""}>ES</a><span aria-hidden="true">/</span><a href="${pathFor(slug, "en")}" lang="en" ${lang === "en" ? 'aria-current="true"' : ""}>EN</a></div></header><main id="main">${content}</main>${footer(isAbout)}<dialog class="lightbox" aria-label="${words("Visor de fotografías", "Photo viewer")}"><div class="viewer-toolbar"><span class="viewer-count" aria-live="polite"></span><button type="button" data-close>${words("Cerrar", "Close")} <span aria-hidden="true">×</span></button></div><div class="viewer-stage"><button type="button" data-prev aria-label="${words("Foto anterior", "Previous photo")}">←</button><img class="viewer-image" alt=""><button type="button" data-next aria-label="${words("Foto siguiente", "Next photo")}">→</button></div><p class="viewer-caption" aria-live="polite"></p></dialog></body></html>`;
  }
  function home() {
    const rows = projects
      .map((p, projectIndex) => {
        const cover = p.photos[p.cover || 0];
        const rest = p.photos.filter((photo) => photo !== cover);
        const selection = [cover, rest[0], rest[1], rest[3], rest[5]];
        const photos = selection
          .map((photo, i) => {
            const media = manifest[photo.id];
            return `<figure class="archive-image" style="--image-ratio:${media.width / media.height}"><a href="${href(p.slug)}#photo-${photo.id}" aria-label="${words("Ver", "View")} ${p.title} — ${words("imagen", "image")} ${i + 1}">${img(photo, projectIndex === 0, "(max-width: 700px) 260px, 340px")}</a></figure>`;
          })
          .join("");
        return `<div class="archive-row" data-project="${p.slug}" role="region" aria-label="${p.title}" tabindex="0">${photos}</div>`;
      })
      .join("");
    const content = `<section class="image-archive" id="trabajos" aria-labelledby="home-title"><h1 class="sr-only" id="home-title">${words("Portfolio de Emilio Lopez", "Emilio Lopez portfolio")}</h1>${rows}</section>`;
    return shell(
      "",
      "Emilio Lopez — Fashion portfolio",
      words(
        "Diseño de moda, dirección creativa y editoriales. Una selección de proyectos de Emilio Lopez, Madrid.",
        "Fashion design, creative direction and editorials. Selected projects by Emilio Lopez, Madrid.",
      ),
      content,
      projects[0].photos[0],
    );
  }
  function railPhoto(photo, group, index, { eager = false } = {}) {
    const m = manifest[photo.id];
    return `<figure id="photo-${photo.id}" class="rail-image${m.width > m.height ? " rail-landscape" : ""}" data-rail-panel style="--image-ratio:${m.width / m.height}"><a class="gallery-link" href="${m.src}" data-gallery="${group}" aria-label="${words("Ampliar:", "Enlarge:")} ${escape(t(photo.alt))}">${img(photo, eager, "(max-width: 700px) 85vw, 65vw")}<span class="rail-zoom" aria-hidden="true">+</span></a><figcaption><span>${number(index)}</span><span>${escape(t(photo.alt))}</span></figcaption></figure>`;
  }
  function project(p) {
    const index = projects.indexOf(p);
    const cover = p.photos[p.cover || 0];
    const next = projects[(index + 1) % projects.length];
    const editorial = [cover, ...p.photos.filter((photo) => photo !== cover)];
    const readerLinks = [
      ["editorial", "Editorial"],
      ["concepto", words("Concepto", "Concept")],
      ...(p.film ? [["film", "Film"]] : []),
    ];
    const film = p.film
      ? `<section id="film" class="rail-chapter" data-rail-chapter aria-label="Fashion film"><div class="rail-film" id="fashion-film" data-rail-panel><video controls playsinline preload="none" width="1280" height="720" poster="${manifest["film-poster"].src}" aria-label="Feel Marni — fashion film"><source src="/media/feel-marni.mp4" type="video/mp4"><a href="/media/feel-marni.mp4">${words("Descargar el vídeo", "Download the film")}</a></video><p>Fashion film / ${p.year}</p></div><div class="rail-note" id="film-credits" data-rail-panel><h2>Fashion film</h2><p>${escape(t(p.film.text))}</p><details><summary>${words("Créditos", "Credits")}</summary>${creditList(p.film.credits)}</details></div></section>`
      : "";
    const content = `<div class="project-exhibition"><aside class="project-margin"><a class="archive-return" href="${href("")}#trabajos"><span aria-hidden="true">←</span> ${words("Índice", "Index")}</a><div class="project-identity"><p class="project-date">${p.year} / ${number(index)}</p><h1>${p.title}</h1><p>${escape(t(p.subtitle))}</p></div><nav class="rail-navigation" aria-label="${words("Dentro del proyecto", "Inside the project")}">${readerLinks.map(([id, label]) => `<a href="#${id}" data-rail-link>${label}</a>`).join("")}</nav><p class="rail-instruction" id="rail-instruction">${words("Explora hacia los lados", "Explore sideways")} ↔</p><div class="rail-controls"><button type="button" data-rail-prev aria-label="${words("Anterior", "Previous")}">←</button><span class="rail-counter" aria-live="polite" aria-atomic="true"></span><button type="button" data-rail-next aria-label="${words("Siguiente", "Next")}">→</button></div></aside><div class="exhibition-track" tabindex="0" role="region" aria-label="${words("Recorrido horizontal", "Horizontal gallery")}: ${p.title}" aria-describedby="rail-instruction"><section class="rail-chapter" id="editorial" data-rail-chapter aria-label="Editorial">${editorial.map((photo, i) => railPhoto(photo, "editorial", i, { eager: i === 0 })).join("")}</section><section class="rail-note" id="concepto" data-rail-panel data-rail-chapter aria-labelledby="concept-title"><p class="rail-kicker">${words("El concepto", "The concept")}</p><h2 id="concept-title">${escape(t(p.lead))}</h2><p>${escape(t(p.description))}</p><p>${escape(t(p.note))}</p><details><summary>${words("Créditos", "Credits")}</summary>${creditList(p.credits)}</details></section>${film}<nav class="rail-note rail-next-project" id="siguiente" data-rail-panel aria-label="${words("Siguiente proyecto", "Next project")}"><p class="rail-kicker">${words("Siguiente proyecto", "Next project")}</p><a href="${href(next.slug)}">${next.title} ↗</a><a class="archive-return" href="${href("")}#trabajos">${words("Volver al índice", "Back to index")}</a></nav></div></div>`;
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
        )}</div></section><section class="experience"><div class="section-heading"><p class="eyebrow">${words("En el camino", "Along the way")}</p><h2>${words("Trayectoria", "Experience")}</h2></div>${milestones.map(([year, title, place]) => `<div class="experience-row"><span>${year}</span><h3>${title}</h3><span>${place}</span></div>`).join("")}</section>`,
    );
  }
  return { home, project, about, shell };
}
