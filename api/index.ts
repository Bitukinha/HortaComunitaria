import serverEntry from "../dist/server/server.js";

// Vercel (runtime Node) só entrega um Request web quando a função
// é exportada no formato `{ fetch }`. Uma função default comum
// recebe (req, res) do Node e a resposta nunca é enviada.
export default {
  fetch(request: Request) {
    return serverEntry.fetch(request, {}, {});
  },
};
