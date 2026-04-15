"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT,
  LEFT_RAIL_FIELD_STORAGE_KEY,
  defaultLeftRailFieldConfig,
  getOrderedVisibleIds,
  loadLeftRailFieldConfig,
  type LeftRailFieldPersistedConfig,
} from "@/lib/left-rail-field-config";
export function useLeftRailFieldConfig() {
  const [config, setConfig] = useState<LeftRailFieldPersistedConfig>(defaultLeftRailFieldConfig);

  const refresh = useCallback(() => {
    setConfig(loadLeftRailFieldConfig());
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      refresh();
    });
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === LEFT_RAIL_FIELD_STORAGE_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT, refresh);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT, refresh);
    };
  }, [refresh]);

  return { orderedVisibleIds: getOrderedVisibleIds(config), refresh };
}
