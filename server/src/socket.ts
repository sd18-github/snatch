import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";

const devClientOrigins: string[] = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

export function attachSocketIO(httpServer: HttpServer): Server {
  return new Server(httpServer, {
    cors: {
      origin: devClientOrigins,
      methods: ["GET", "POST"],
    },
  });
}
