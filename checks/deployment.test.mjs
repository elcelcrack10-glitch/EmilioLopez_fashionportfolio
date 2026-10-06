import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

test("project-site build resolves pages, images, fonts, film, CV and metadata under its base path", async () => {
  const output = await mkdtemp(join(tmpdir(), "portfolio-deployment-"));
  const site = "https://example.github.io/post-folio";
  try {
    execFileSync(process.execPath, ["scripts/build.mjs"], {
      env: { ...process.env, SITE_URL: site, OUTPUT_DIR: output },
    });
    const slugs = [
      "",
      "pescadilla/",
      "manuela/",
      "feel-marni/",
      "colores/",
      "sobre-mi/",
    ];
    const pages = slugs
      .flatMap((slug) => [`${slug}index.html`, `en/${slug}index.html`])
      .concat("404.html");
    const resources = new Set();
    for (const file of pages) {
      const html = await readFile(join(output, file), "utf8");
      for (const [, path] of html.matchAll(/(?:href|src|poster)="(\/[^\"]*)"/g))
        resources.add(path);
      for (const [, candidates] of html.matchAll(/srcset="([^\"]*)"/g)) {
        for (const candidate of candidates.split(","))
          resources.add(candidate.trim().split(/\s/)[0]);
      }
      assert.ok(html.includes('href="mailto:e.lopezcastillejos@ied.edu"'));
      assert.ok(html.includes('href="#main"'));
      if (file !== "404.html")
        assert.ok(
          html.includes(
            `rel="canonical" href="${site}/${file.replace(/index.html$/, "")}"`,
          ),
        );
    }
    const marni = await readFile(join(output, "feel-marni/index.html"), "utf8");
    assert.match(
      marni,
      /property="og:image" content="https:\/\/example.github.io\/post-folio\/media\//,
    );
    assert.match(marni, /src="\/post-folio\/media\/feel-marni.mp4"/);
    assert.match(marni, /href="\/post-folio\/en\/feel-marni\/\?v=[a-f0-9]+"/);
    for (const [, path] of (
      await readFile(join(output, "style.css"), "utf8")
    ).matchAll(/url\("([^\"]*)"\)/g))
      resources.add(path);
    for (const resource of resources) {
      assert.ok(
        resource.startsWith("/post-folio/"),
        `Missing base path: ${resource}`,
      );
      const resourceURL = new URL(resource.replaceAll("&amp;", "&"), site);
      if (
        /\.(css|js)$/.test(resourceURL.pathname) ||
        resourceURL.pathname.endsWith("/")
      ) {
        assert.match(
          resourceURL.searchParams.get("v") || "",
          /^[a-f0-9]{12}$/,
          `Unversioned page or stylesheet/script can reuse old cached content: ${resource}`,
        );
      }
      const pathname = new URL(resource, site).pathname.slice(
        "/post-folio/".length,
      );
      const file = join(
        output,
        pathname.endsWith("/") || !pathname
          ? `${pathname}index.html`
          : pathname,
      );
      assert.ok((await stat(file)).isFile(), `Missing output: ${resource}`);
    }
    assert.ok(
      resources.size > 100,
      "Exercise responsive media and all project routes",
    );
    assert.ok((await stat(join(output, ".nojekyll"))).isFile());
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
