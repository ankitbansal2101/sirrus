import {
  DEFAULT_LEFT_RAIL_FIELD_ORDER,
  type LeftRailFieldId,
  normalizeFullFieldOrder,
  normalizeHiddenIds,
  normalizeLeftRailFieldOrder,
} from "@/lib/left-rail-field-registry";

export const LEFT_RAIL_FIELD_STORAGE_KEY = "sirrus.left-rail-fields.v1";

export const LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT = "sirrus:left-rail-field-config-changed";

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

export function loadLeftRailFieldConfig(): LeftRailFieldPersistedConfig {
  if (typeof window === "undefined") return defaultLeftRailFieldConfig();
  try {
    const raw = window.localStorage.getItem(LEFT_RAIL_FIELD_STORAGE_KEY);
    if (!raw) return defaultLeftRailFieldConfig();
    const parsed = JSON.parse(raw) as {
      orderedIds?: unknown;
      hiddenIds?: unknown;
      orderedVisibleIds?: unknown;
    };
    if (parsed.orderedIds !== undefined) {
      const orderedIds = normalizeFullFieldOrder(parsed.orderedIds);
      const hiddenIds = normalizeHiddenIds(parsed.hiddenIds, orderedIds);
      return { orderedIds, hiddenIds };
    }
    if (parsed.orderedVisibleIds !== undefined) {
      return migrateFromV1(normalizeLeftRailFieldOrder(parsed.orderedVisibleIds));
    }
    return defaultLeftRailFieldConfig();
  } catch {
    return defaultLeftRailFieldConfig();
  }
}

export function saveLeftRailFieldConfig(config: LeftRailFieldPersistedConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LEFT_RAIL_FIELD_STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new CustomEvent(LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT));
}
