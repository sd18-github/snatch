import http from "node:http";
import { SHARED_VERSION } from "@snatch/shared";
import { createApp } from "./app.js";
import { attachSocketIO } from "./socket.js";

const port = Number(process.env.PORT) || 3000;

const app = createApp();
const httpServer = http.createServer(app);
const io = attachSocketIO(httpServer);

io.on("connection", (socket) => {
  socket.emit("welcome", { message: `hello from server (shared ${SHARED_VERSION})` });
});

httpServer.listen(port, () => {
  console.log(`@snatch/server listening on http://localhost:${port}`);
});
