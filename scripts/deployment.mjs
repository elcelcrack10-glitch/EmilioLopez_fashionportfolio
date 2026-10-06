// Paths stay rooted locally; GitHub project sites add a directory in production.
export const siteURL = process.env.SITE_URL?.replace(/\/+$/, "") || "";
export const basePath = siteURL
  ? new URL(siteURL).pathname.replace(/\/+$/, "")
  : "";

export function absoluteSiteURL(path) {
  return new URL(path.replace(/^\//, ""), `${siteURL}/`).href;
}

export function deploymentHTML(html, revision = "") {
  if (revision) {
    html = html.replace(/<(a|link|script)\b[^>]*>/g, (tag, element) => {
      if (element === "link" && !tag.includes('rel="stylesheet"')) return tag;
      return tag.replace(
        /\b(href|src)="(\/(?!\/)[^"]*)"/g,
        (attribute, name, path) => {
          const url = new URL(
            path.replaceAll("&amp;", "&"),
            "https://portfolio.invalid",
          );
          const isAsset = /\.(css|js)$/.test(url.pathname);
          const isPage = element === "a" && url.pathname.endsWith("/");
          if (!isAsset && !isPage) return attribute;
          url.searchParams.set("v", revision);
          return `${name}="${(url.pathname + url.search + url.hash).replaceAll("&", "&amp;")}"`;
        },
      );
    });
  }
  if (!basePath) return html;
  return html
    .replace(
      /\b(href|src|poster|content)="\/(?!\/)([^"]*)"/g,
      (_, attr, path) => `${attr}="${basePath}/${path}"`,
    )
    .replace(
      /\bsrcset="([^"]*)"/g,
      (_, candidates) =>
        `srcset="${candidates.replace(/(^|,\s*)\/(?!\/)/g, `$1${basePath}/`)}"`,
    );
}

export function deploymentCSS(css) {
  return css.replace(/url\("\/(?!\/)/g, `url("${basePath}/`);
}
