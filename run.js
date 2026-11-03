// Runs a worker-style game module locally.
// Usage: node run.js [file]   (defaults to blooket.js)  ->  http://localhost:8787
// Works with .js and .ts modules that `export default async (request) => Response`.
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const file = resolve(process.argv[2] ?? 'blooket.js');
const port = Number(process.env.PORT) || 8787;

const { default: handler } = await import(pathToFileURL(file).href);

if (typeof handler !== 'function') {
  console.error(`${file} does not have a default export function`);
  process.exit(1);
}

const server = createServer(async (req, res) => {
  const url = `http://${req.headers.host ?? `localhost:${port}`}${req.url}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else headers.set(key, value);
  }

  const chunks = [];
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    for await (const chunk of req) chunks.push(chunk);
  }

  try {
    const response = await handler(
      new Request(url, {
        method: req.method,
        headers,
        body: chunks.length ? Buffer.concat(chunks) : undefined,
      }),
    );

    const body = Buffer.from(await response.arrayBuffer());
    res.statusCode = response.status;
    for (const [key, value] of response.headers) res.setHeader(key, value);
    res.end(body);
  } catch (error) {
    console.error(`error handling ${req.method} ${req.url}:`, error);
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end(String(error?.stack ?? error));
  }
});

server.listen(port, () => {
  console.log(`running ${file}`);
  console.log(`open http://localhost:${port}/?gameId=YOUR_GAME_ID&name=you`);
});
