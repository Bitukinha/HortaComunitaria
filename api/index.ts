// Vercel serverless function (Node.js runtime) entry point.
// Wraps the app's own fetch-style server build (dist/server/server.js,
// produced by `npm run build`) so Vercel can route every request into it.
// Needs the Node.js runtime (not Edge) because the Postgres driver (`pg`)
// requires raw TCP sockets, which the Edge runtime does not provide.
import serverEntry from "../dist/server/server.js";

// Buffer the full response before returning it. TanStack Start's SSR
// response streams progressively; Vercel's Node.js function runtime has not
// reliably drained that kind of streaming body in testing (the request just
// hangs), so awaiting it fully here trades a little streaming perf for
// guaranteed completion.
export default async function handler(request: Request) {
  const response = await serverEntry.fetch(request, {}, {});
  const body = await response.arrayBuffer();
  return new Response(body, {
    status: response.status,
    headers: response.headers,
  });
}
