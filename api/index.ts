import serverEntry from "../dist/server/server.js";

// Na Vercel (runtime Node), uma função default comum recebe (req, res)
// do Node, e não um Request web, então a resposta nunca era enviada (504).
// Exports nomeados por método HTTP recebem um Request web padrão.
function handle(request: Request) {
  return serverEntry.fetch(request, {}, {});
}

export const GET = handle;
export const HEAD = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
