import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SocketteOptions } from "sockette";
import Sockette from "sockette";

export type UseWebSocketOpts = {
  enabled?: boolean;
  onClose?: (
    socket: Sockette,
    ...args: Parameters<NonNullable<WebSocket["onclose"]>>
  ) => void;
  onError?: (
    socket: Sockette,
    ...args: Parameters<NonNullable<WebSocket["onerror"]>>
  ) => void;
  onMessage: (
    socket: Sockette,
    ...args: Parameters<NonNullable<WebSocket["onmessage"]>>
  ) => void;
  onOpen?: (
    socket: Sockette,
    ...args: Parameters<NonNullable<WebSocket["onopen"]>>
  ) => void;
  onReconnect?: (
    socket: Sockette,
    ...args: Parameters<NonNullable<SocketteOptions["onreconnect"]>>
  ) => void;
};

export function useWebSocket(
  url: string,
  { enabled = true, ...opts }: UseWebSocketOpts,
) {
  /** state */
  const [status, setStatus] = useState<
    "closed" | "connecting" | "connected" | "reconnecting"
  >("closed");

  /** refs */
  const wsRef = useRef<Sockette | undefined>(undefined);
  const onCloseRef = useRef(opts.onClose);
  const onErrorRef = useRef(opts.onError);
  const onMessageRef = useRef(opts.onMessage);
  const onOpenRef = useRef(opts.onOpen);
  const onReconnectRef = useRef(opts.onReconnect);

  /** callbacks */
  const connectSocket = useCallback(() => {
    if (!enabled) return;

    const w = new Sockette(url, {
      onclose: (...args) => {
        setStatus("closed");
        onCloseRef.current?.(w, ...args);
      },
      onerror: (...args) => {
        setStatus("closed");
        onErrorRef.current?.(w, ...args);
      },
      onmessage: (...args) => {
        onMessageRef.current(w, ...args);
      },
      onopen: (...args) => {
        setStatus("connected");
        onOpenRef.current?.(w, ...args);
      },
      onreconnect: (...args) => {
        setStatus("reconnecting");
        onReconnectRef.current?.(w, ...args);
      },
    });

    wsRef.current = w;
  }, [url]);

  const closeSocket = useCallback(() => {
    wsRef.current?.close();
    setStatus("closed");
  }, []);

  /** effects */
  useEffect(() => {
    onCloseRef.current = opts.onClose;
    onErrorRef.current = opts.onError;
    onMessageRef.current = opts.onMessage;
    onOpenRef.current = opts.onOpen;
    onReconnectRef.current = opts.onReconnect;
  });

  useEffect(() => {
    closeSocket();
    connectSocket();

    return () => {
      closeSocket();
    };
  }, [closeSocket, connectSocket]);

  return useMemo(
    () => ({
      close: closeSocket,
      reconnect: () => {
        setStatus("reconnecting");
        wsRef.current?.reconnect();
      },
      send: (content: unknown) => {
        wsRef.current?.send(content);
      },
      sendJson: (json: object) => {
        wsRef.current?.json(json);
      },
      status,
    }),
    [closeSocket, status],
  );
}
