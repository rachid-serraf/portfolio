// Usage: npm install && npm run build   ->  output in ./dist
import { readFile, writeFile, rm, mkdir, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';
import { minify as minifyHtml } from 'html-minifier-terser';
import { minify as minifyJs } from 'terser';

const JS_FILES = ['main.js', 'contact-particles.js'];
const out = (f) => `dist/${f}`;
const kb = (n) => (n / 1024).toFixed(1) + ' KB';
const size = async (f) => (await stat(f)).size;

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });

// 1. Tailwind: build only the CSS classes the page uses (replaces the ~300 KB CDN script)
execFileSync('npx', ['tailwindcss', '-c', 'tailwind.config.js', '-i', 'tailwind-input.css', '-o', out('tailwind.css'), '--minify'], { stdio: 'inherit' });

// 2. HTML: swap the CDN for the built CSS, then minify (inline CSS and JS too)
let html = await readFile('index.html', 'utf8');
html = html
  .replace(/<script src="https:\/\/cdn\.tailwindcss\.com[^>]*><\/script>\s*/, '<link rel="stylesheet" href="tailwind.css" />\n')
  .replace(/<script>\s*tailwind\.config=[\s\S]*?<\/script>\s*/, '');
html = await minifyHtml(html, {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  minifyCSS: true,
  minifyJS: true,
});
await writeFile(out('index.html'), html);

// 3. JavaScript: compress and shorten names
for (const f of JS_FILES) {
  const src = await readFile(f, 'utf8');
  const res = await minifyJs(src, { compress: { passes: 2 }, mangle: true, format: { comments: false } });
  await writeFile(out(f), res.code);
}

// 4. Pre-compress for nginx (gzip_static) and for servers with brotli_static
const textFiles = ['index.html', 'tailwind.css', ...JS_FILES];
console.log('\nFile                      original   minified   gzip      brotli');
for (const f of textFiles) {
  const buf = await readFile(out(f));
  const gz = gzipSync(buf, { level: 9 });
  const br = brotliCompressSync(buf, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } });
  await writeFile(out(f) + '.gz', gz);
  await writeFile(out(f) + '.br', br);
  const orig = f === 'tailwind.css' ? null : await size(f);
  console.log(f.padEnd(25), (orig ? kb(orig) : '-').padEnd(10), kb(buf.length).padEnd(10), kb(gz.length).padEnd(9), kb(br.length));
}
console.log('\nDone. Upload the contents of ./dist to your server.');
