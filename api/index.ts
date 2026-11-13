import serverEntry from "../dist/server/server.js";

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
