import { SHARED_VERSION } from "@snatch/shared";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export function App() {
  const [socketStatus, setSocketStatus] = useState<
    "connecting" | "open" | "error"
  >("connecting");
  const [welcome, setWelcome] = useState<string | null>(null);

  useEffect(() => {
    const socket = io({
      autoConnect: true,
    });

    const onConnect = () => setSocketStatus("open");
    const onConnectError = () => setSocketStatus("error");

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("welcome", (payload: { message: string }) => {
      setWelcome(payload.message);
    });

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.removeAllListeners("welcome");
      socket.disconnect();
    };
  }, []);

  return (
    <main>
      <h1>Snatch</h1>
      <p>Client scaffold (shared {SHARED_VERSION}).</p>
      <p>
        Socket: {socketStatus}
        {welcome !== null ? ` — server said: ${welcome}` : null}
      </p>
      <p>
        <a href="/api/health">GET /api/health</a> (proxied to the game server in
        dev)
      </p>
    </main>
  );
}
