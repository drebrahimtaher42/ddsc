import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LECTURES_DIR = path.resolve(__dirname, 'public/lectures');
const VIRTUAL_ID = 'virtual:lecture-posters';
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

const FEATURED_FIRST_POSTER = 'WhatsApp Image 2026-11-22 at 6.23.57 PM.jpeg';

function readLecturePosters() {
  if (!fs.existsSync(LECTURES_DIR)) return [];
  const sorted = fs
    .readdirSync(LECTURES_DIR)
    .filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  const files = [
    ...sorted.filter((name) => name === FEATURED_FIRST_POSTER),
    ...sorted.filter((name) => name !== FEATURED_FIRST_POSTER),
  ];

  return files.map((filename, idx) => ({
    id: `lecture-poster-${idx + 1}`,
    filename,
    src: `/lectures/${encodeURIComponent(filename)}`,
    label: `DDSC 2026 Lecture Poster ${idx + 1}`,
  }));
}

function lecturePostersPlugin() {
  return {
    name: 'ddsc-lecture-posters',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      return null;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        const posters = readLecturePosters();
        return `export default ${JSON.stringify(posters)};`;
      }
      return null;
    },
    configureServer(server) {
      if (fs.existsSync(LECTURES_DIR)) {
        server.watcher.add(LECTURES_DIR);
      }
      const reloadLectures = (filePath) => {
        if (filePath && path.resolve(filePath).startsWith(LECTURES_DIR)) {
          const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID);
          if (mod) server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: 'full-reload' });
        }
      };
      server.watcher.on('add', reloadLectures);
      server.watcher.on('unlink', reloadLectures);
    },
  };
}

export default defineConfig({
  plugins: [react(), lecturePostersPlugin()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
