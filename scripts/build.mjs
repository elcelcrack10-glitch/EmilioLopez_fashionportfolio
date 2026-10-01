import { readFile, mkdir, cp, writeFile } from "node:fs/promises";
import { deploymentHTML, deploymentCSS } from "./deployment.mjs";
import { projects } from "../src/content.mjs";
import { renderer, pathFor } from "../src/templates.mjs";

const output = process.env.OUTPUT_DIR || "dist";
let manifest;
try {
  manifest = JSON.parse(await readFile("public/media/manifest.json", "utf8"));
} catch {
  console.error("Run npm run media before building.");
  process.exit(1);
}
await mkdir(output, { recursive: true });
await cp("public", output, { recursive: true });
for (const name of ["style.css", "project-worlds.css", "persona.css"]) {
  await writeFile(
    `${output}/${name}`,
    deploymentCSS(await readFile(`src/${name}`, "utf8")),
  );
}
await cp("src/app.js", `${output}/app.js`);
await writeFile(`${output}/.nojekyll`, "");
for (const lang of ["es", "en"]) {
  const render = renderer(lang, manifest);
  const pages = [
    ["", render.home()],
    ...projects.map((p) => [p.slug, render.project(p)]),
    ["sobre-mi", render.about()],
  ];
  for (const [slug, html] of pages) {
    const dir = `${output}${pathFor(slug, lang)}`;
    await mkdir(dir, { recursive: true });
    await writeFile(`${dir}index.html`, deploymentHTML(html));
  }
}
await writeFile(
  `${output}/404.html`,
  deploymentHTML(
    renderer("es", manifest).shell(
      "",
      "Página no encontrada — Emilio Lopez",
      "Volver al portfolio de Emilio Lopez.",
      '<section class="not-found"><p class="eyebrow">404</p><h1>Esta página no está aquí.</h1><a class="text-link" href="/">Volver a los proyectos ↗</a></section>',
    ),
  ),
);
console.log(`Built 12 static pages, media and 404 page in ${output}/.`);
