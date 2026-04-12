import { useSyncExternalStore } from "react";

/** True on the client after hydration; false on the server (safe for portals). */
export function useClientMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
