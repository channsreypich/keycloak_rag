// Draws the email images (hero banners and chip icons) as PNGs.
//
// Email apps cannot show SVG (Gmail) or CSS rings and shadows (Outlook), so
// the art is drawn here once with headless Chrome and saved as images in
// src/email/resources/img/. Run again after changing the art:
//
//   node scripts/render-email-images.mjs
//
// Needs Google Chrome installed (or set CHROME=/path/to/chrome).

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "email", "resources", "img");
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// Lucide icons (same set as the login pages), 24x24 viewBox.
const ICONS = {
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'
};

const icon = (name, size, color, stroke = 2) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

/** Hero banner: lavender panel, rings, white tile with the icon, orange clock badge. */
const hero = name => `
<!doctype html><html><head><style>
  html, body { margin: 0; width: 560px; height: 196px; overflow: hidden; background: #f7f6fe; }
  .c { position: absolute; left: 280px; top: 100px; border-radius: 50%; transform: translate(-50%, -50%); }
  .tile { position: absolute; left: 242px; top: 62px; width: 76px; height: 76px; border-radius: 18px; background: #fff;
          box-shadow: 0 10px 24px rgba(75, 63, 209, 0.14), 0 1px 2px rgba(17, 17, 17, 0.05);
          display: flex; align-items: center; justify-content: center; }
  .badge { position: absolute; left: 296px; top: 116px; width: 26px; height: 26px; border-radius: 50%; background: #f59e0b;
           border: 3px solid #fff; display: flex; align-items: center; justify-content: center;
           box-shadow: 0 2px 6px rgba(224, 161, 0, 0.35); }
</style></head><body>
  <div class="c" style="width:340px;height:340px;border:1px solid #e9e7f6"></div>
  <div class="c" style="width:240px;height:240px;border:1px solid #e6e4f6"></div>
  <div class="c" style="width:150px;height:150px;background:#eeecfd;border:1px solid #e3e0fa"></div>
  <div class="tile">${icon(name, 28, "#4b3fd1")}</div>
  <div class="badge">${icon("clock", 14, "#ffffff", 2.5)}</div>
</body></html>`;

/** Small grey icon for a chip, on a clear background. */
const chipIcon = name => `
<!doctype html><html><head><style>
  html, body { margin: 0; width: 16px; height: 16px; overflow: hidden; background: transparent; }
  svg { display: block; }
</style></head><body>${icon(name, 16, "#3a3a3a", 2)}</body></html>`;

const IMAGES = [
    { file: "hero-mail.png", html: hero("mail"), width: 560, height: 196 },
    { file: "hero-key.png", html: hero("key"), width: 560, height: 196 },
    { file: "chip-clock.png", html: chipIcon("clock"), width: 16, height: 16 },
    { file: "chip-link.png", html: chipIcon("link"), width: 16, height: 16 }
];

const work = mkdtempSync(join(tmpdir(), "rs-email-img-"));
try {
    for (const image of IMAGES) {
        const page = join(work, image.file.replace(/\.png$/, ".html"));
        writeFileSync(page, image.html);
        execFileSync(CHROME, [
            "--headless",
            "--disable-gpu",
            "--hide-scrollbars",
            "--force-device-scale-factor=2", // 2x, so it is sharp on phones and Retina screens
            "--default-background-color=00000000",
            `--window-size=${image.width},${image.height}`,
            `--screenshot=${join(OUT, image.file)}`,
            `file://${page}`
        ], { stdio: "ignore" });
        console.log(`Saved src/email/resources/img/${image.file}`);
    }
} finally {
    rmSync(work, { recursive: true, force: true });
}
