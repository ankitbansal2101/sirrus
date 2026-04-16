"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT,
  LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT_V2,
  LEFT_RAIL_FIELD_STORAGE_KEY,
  LEFT_RAIL_FIELD_STORAGE_KEY_V2,
  defaultLeftRailFieldConfig,
  getOrderedVisibleIds,
  loadLeftRailFieldConfigFromStorage,
  type LeftRailFieldPersistedConfig,
} from "@/lib/left-rail-field-config";

function useLeftRailFieldConfigStorage(opts: { storageKey: string; changeEvent: string }) {
  const { storageKey, changeEvent } = opts;
  const [config, setConfig] = useState<LeftRailFieldPersistedConfig>(defaultLeftRailFieldConfig);

  const refresh = useCallback(() => {
    setConfig(loadLeftRailFieldConfigFromStorage(storageKey));
  }, [storageKey]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      refresh();
    });
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === storageKey) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(changeEvent, refresh);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(changeEvent, refresh);
    };
  }, [refresh, storageKey, changeEvent]);

  return { orderedVisibleIds: getOrderedVisibleIds(config), refresh };
}

export function useLeftRailFieldConfig() {
  return useLeftRailFieldConfigStorage({
    storageKey: LEFT_RAIL_FIELD_STORAGE_KEY,
    changeEvent: LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT,
  });
}

/** Left-rail field order/visibility for widgets configurator V2 and `/developer/lead-detail`. */
export function useLeftRailFieldConfigV2() {
  return useLeftRailFieldConfigStorage({
    storageKey: LEFT_RAIL_FIELD_STORAGE_KEY_V2,
    changeEvent: LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT_V2,
  });
}
