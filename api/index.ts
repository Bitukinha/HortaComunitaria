// Vercel serverless function (Node.js runtime) entry point.
// Wraps the app's own fetch-style server build (dist/server/server.js,
// produced by `npm run build`) so Vercel can route every request into it.
// Needs the Node.js runtime (not Edge) because the Postgres driver (`pg`)
// requires raw TCP sockets, which the Edge runtime does not provide.
import serverEntry from "../dist/server/server.js";

export default function handler(request: Request) {
  return serverEntry.fetch(request, {}, {});
}
