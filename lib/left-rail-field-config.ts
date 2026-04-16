import {
  DEFAULT_LEFT_RAIL_FIELD_ORDER,
  type LeftRailFieldId,
  normalizeFullFieldOrder,
  normalizeHiddenIds,
  normalizeLeftRailFieldOrder,
} from "@/lib/left-rail-field-registry";

export const LEFT_RAIL_FIELD_STORAGE_KEY = "sirrus.left-rail-fields.v1";

export const LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT = "sirrus:left-rail-field-config-changed";

/** Separate from V1 so the widgets canvas V2 + lead-detail preview stay in sync without affecting production manage-leads. */
export const LEFT_RAIL_FIELD_STORAGE_KEY_V2 = "sirrus.left-rail-fields.v2";

export const LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT_V2 = "sirrus:left-rail-field-config-changed-v2";

export type LeftRailFieldPersistedConfig = {
  /** Full order of every configurable field id. */
  orderedIds: LeftRailFieldId[];
  /** Subset of `orderedIds` that are hidden in the left rail. */
  hiddenIds: LeftRailFieldId[];
};

export function defaultLeftRailFieldConfig(): LeftRailFieldPersistedConfig {
  return { orderedIds: [...DEFAULT_LEFT_RAIL_FIELD_ORDER], hiddenIds: [] };
}

function migrateFromV1(orderedVisibleIds: LeftRailFieldId[]): LeftRailFieldPersistedConfig {
  const visibleOrder = normalizeLeftRailFieldOrder(orderedVisibleIds);
  const visibleSet = new Set(visibleOrder);
  const orderedIds = normalizeFullFieldOrder(visibleOrder);
  const hiddenIds = orderedIds.filter((id) => !visibleSet.has(id));
  return { orderedIds, hiddenIds };
}

export function getOrderedVisibleIds(config: LeftRailFieldPersistedConfig): LeftRailFieldId[] {
  const hidden = new Set(config.hiddenIds);
  return config.orderedIds.filter((id) => !hidden.has(id));
}

export function loadLeftRailFieldConfigFromStorage(storageKey: string): LeftRailFieldPersistedConfig {
  if (typeof window === "undefined") return defaultLeftRailFieldConfig();
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return defaultLeftRailFieldConfig();
    const parsed = JSON.parse(raw) as {
      orderedIds?: unknown;
      hiddenIds?: unknown;
      orderedVisibleIds?: unknown;
    };
    if (parsed.orderedIds !== undefined) {
      const orderedIds = normalizeFullFieldOrder(parsed.orderedIds);
      const hiddenIds = normalizeHiddenIds(parsed.hiddenIds, orderedIds);
      const next = { orderedIds, hiddenIds };
      if (getOrderedVisibleIds(next).length === 0 && orderedIds.length > 0) {
        return defaultLeftRailFieldConfig();
      }
      return next;
    }
    if (parsed.orderedVisibleIds !== undefined) {
      return migrateFromV1(normalizeLeftRailFieldOrder(parsed.orderedVisibleIds));
    }
    return defaultLeftRailFieldConfig();
  } catch {
    return defaultLeftRailFieldConfig();
  }
}

export function loadLeftRailFieldConfig(): LeftRailFieldPersistedConfig {
  return loadLeftRailFieldConfigFromStorage(LEFT_RAIL_FIELD_STORAGE_KEY);
}

export function loadLeftRailFieldConfigV2(): LeftRailFieldPersistedConfig {
  return loadLeftRailFieldConfigFromStorage(LEFT_RAIL_FIELD_STORAGE_KEY_V2);
}

export function saveLeftRailFieldConfigToStorage(
  storageKey: string,
  config: LeftRailFieldPersistedConfig,
  changeEvent: string,
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(config));
  window.dispatchEvent(new CustomEvent(changeEvent));
}

export function saveLeftRailFieldConfig(config: LeftRailFieldPersistedConfig) {
  saveLeftRailFieldConfigToStorage(LEFT_RAIL_FIELD_STORAGE_KEY, config, LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT);
}

export function saveLeftRailFieldConfigV2(config: LeftRailFieldPersistedConfig) {
  saveLeftRailFieldConfigToStorage(LEFT_RAIL_FIELD_STORAGE_KEY_V2, config, LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT_V2);
}
