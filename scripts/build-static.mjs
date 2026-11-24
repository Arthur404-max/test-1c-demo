import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'docs');
const modules = ['demo-data.js', 'knowledge.js', 'llm.js', 'tools.js', 'static-api.js'];

await rm(output, { recursive: true, force: true });
await cp(path.join(root, 'public'), output, { recursive: true });
await mkdir(path.join(output, 'src'), { recursive: true });

for (const module of modules) {
  await cp(path.join(root, 'src', module), path.join(output, 'src', module));
}

const htmlPath = path.join(output, 'index.html');
const html = await readFile(htmlPath, 'utf8');
const staticHtml = html
  .replace('<body>', '<body data-static-demo="true">')
  .replace('href="/styles.css"', 'href="./styles.css"')
  .replace('src="/app.js"', 'src="./app.js"');

await writeFile(htmlPath, staticHtml);
await writeFile(path.join(output, '.nojekyll'), '');
console.log(`Static site built in ${output}`);
