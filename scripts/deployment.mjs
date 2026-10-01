// Paths stay rooted locally; GitHub project sites add a directory in production.
export const siteURL = process.env.SITE_URL?.replace(/\/+$/, "") || "";
export const basePath = siteURL
  ? new URL(siteURL).pathname.replace(/\/+$/, "")
  : "";

export function absoluteSiteURL(path) {
  return new URL(path.replace(/^\//, ""), `${siteURL}/`).href;
}

export function deploymentHTML(html) {
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
