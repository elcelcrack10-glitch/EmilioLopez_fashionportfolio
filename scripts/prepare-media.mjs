import {
  mkdir,
  writeFile,
  copyFile,
  stat,
  readFile,
  readdir,
  rm,
  rename,
} from "node:fs/promises";
import { spawnSync } from "node:child_process";
import sharp from "sharp";
import ffmpeg from "ffmpeg-static";
import { allImages } from "../src/content.mjs";

await mkdir(".cache", { recursive: true });
await mkdir("public/media", { recursive: true });
let previous = {};
try {
  previous = JSON.parse(await readFile(".cache/media-signatures.json", "utf8"));
} catch {}
const signatures = {};
for (const image of allImages) {
  const source = await stat(image.source);
  const signature = `${image.source}:${source.size}:${source.mtimeMs}:${image.page || 0}`;
  signatures[image.id] = signature;
  if (previous[image.id] !== signature) {
    await rm(`.cache/media/${image.id}.jpg`, { force: true });
    for (const name of await readdir("public/media")) {
      if (name.startsWith(`${image.id}-`) && /\.(webp|avif)$/.test(name))
        await rm(`public/media/${name}`);
    }
  }
}
const filmSource = "MARNI/marni_emiliolopez2B.mov";
const filmStat = await stat(filmSource);
signatures.film = `${filmStat.size}:${filmStat.mtimeMs}:720p-crf23`;
if (previous.film !== signatures.film) {
  const output = ".cache/feel-marni-optimized.mp4";
  const video = spawnSync(
    ffmpeg,
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      filmSource,
      "-vf",
      "scale=1280:-2",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "23",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      output,
    ],
    { stdio: "inherit" },
  );
  if (video.status !== 0) process.exit(video.status || 1);
  await rename(output, "public/media/feel-marni.mp4");
  await rm(".cache/media/film-poster.jpg", { force: true });
  for (const name of await readdir("public/media"))
    if (name.startsWith("film-poster-")) await rm(`public/media/${name}`);
}
await writeFile(".cache/media-input.json", JSON.stringify(allImages));
const native = spawnSync("swift", ["scripts/export-media.swift"], {
  stdio: "inherit",
});
if (native.status !== 0) process.exit(native.status || 1);
const manifest = {};
for (const image of [...allImages, { id: "film-poster" }]) {
  const source = `.cache/media/${image.id}.jpg`;
  const meta = await sharp(source).metadata();
  const widths = [
    ...new Set([480, 720, 960, 1600].map((w) => Math.min(w, meta.width))),
  ];
  const variants = [];
  for (const width of widths) {
    const file = `${image.id}-${width}.webp`;
    const target = `public/media/${file}`;
    try {
      await stat(target);
    } catch {
      await sharp(source)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: image.page ? 84 : 80 })
        .toFile(target);
    }
    const avif = `${image.id}-${width}.avif`;
    try {
      await stat(`public/media/${avif}`);
    } catch {
      await sharp(source)
        .resize({ width, withoutEnlargement: true })
        .avif({ quality: image.page ? 60 : 52, effort: 4 })
        .toFile(`public/media/${avif}`);
    }
    variants.push({ width, src: `/media/${file}`, avif: `/media/${avif}` });
  }
  manifest[image.id] = {
    width: meta.width,
    height: meta.height,
    variants,
    src: variants.at(-1).src,
  };
}
await writeFile(
  "public/media/manifest.json",
  JSON.stringify(manifest, null, 2),
);
await writeFile(
  ".cache/media-signatures.json",
  JSON.stringify(signatures, null, 2),
);
await copyFile(
  "review/pescadilla/proceso pescadilla/CV emilio Lopez/CV emilio lopez .pdf",
  "public/Emilio-Lopez-CV.pdf",
);
console.log(`Prepared ${allImages.length} images, film and CV.`);
