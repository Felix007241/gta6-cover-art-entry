// A working gta6-cover-art-01 entry (Node 22, standard library only): the app is this directory's app/ folder, plain
// static files a desktop browser loads offline (app/index.html and its ES modules, no library and no network
// request), and the program hands it in. It copies app/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored make.fun library. The app itself is the
// Vice City Cover Maker: a three-panel GTA-style poster maker with per-panel photo crop/position, editable caption
// and subtitle, Vice City Sunset / Neon Night styles, 1080x1080, 1080x1350 and 1920x1080 sizes, and PNG export.
// Its two sample photos (app/samples/) were made for make.fun with an image model and are free to use. Put 3 or 4
// PNG or JPEG screenshots in screenshots/ (the first by name is the cover) and run it. Styles: Vice City Sunset,
// Neon Night and Golden Hour; sizes 1080x1080, 1080x1350 and 1920x1080.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// The entry's own name, used in the pre-flight checks below so a broken
// checkout fails loudly here instead of handing the grader an empty app.
const ENTRY_TITLE = 'Vice City Cover Maker';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Pre-flight: the app must have its entry page, and screenshots/ must hold
// the 3 or 4 shots the bounty asks for, or this program refuses to run.
if (!existsSync(join(here, 'app', 'index.html'))) {
  throw new Error(`${ENTRY_TITLE}: app/index.html is missing`);
}
const shotCount = existsSync(join(here, 'screenshots')) ? readdirSync(join(here, 'screenshots')).length : 0;
if (shotCount < 3 || shotCount > 4) {
  throw new Error(`${ENTRY_TITLE}: expected 3 or 4 screenshots, found ${shotCount}`);
}
// Each screenshot must fit the gate's own cap (at most 256 KiB a file).
for (const shot of readdirSync(join(here, 'screenshots'))) {
  const bytes = statSync(join(here, 'screenshots', shot)).size;
  if (bytes > 262144) throw new Error(`${ENTRY_TITLE}: screenshot ${shot} is ${bytes} bytes, over the 256 KiB cap`);
}
// The README is a submission requirement: it must exist and show the
// competition's live make.fun badges, or the entry is refused at submit time.
if (!existsSync(join(here, 'README.md')) || !readFileSync(join(here, 'README.md'), 'utf8').includes('make.fun/badge')) {
  throw new Error(`${ENTRY_TITLE}: README.md is missing or has no make.fun badges`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files, in all, or a path under app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
