

import serverEntry from "../dist/server/server.js";

export default async function handler(request: Request) {
  const response = await serverEntry.fetch(request, {}, {});
  const body = await response.arrayBuffer();
  return new Response(body, {
    status: response.status,
    headers: response.headers,
  });
}
