import type { PlacedCanvasNode } from "@/lib/widget-canvas-v2-types";

/** Widgets stay as large cards; fields and layout primitives use compact chrome. */
export function canvasNodeIsCompactLayout(node: PlacedCanvasNode): boolean {
  return node.type !== "widget";
}

/**
 * Field blocks show label + value in the body (Zoho-style). Omit the extra canvas chrome row
 * so we do not duplicate the label or waste vertical space.
 */
export function canvasNodeOmitsChromeHeader(node: PlacedCanvasNode): boolean {
  return node.type === "field";
}

/** Minimum fractional size on canvas (fraction of canvas width/height). */
export function canvasNodeMinBounds(node: PlacedCanvasNode): { minW: number; minH: number } {
  switch (node.type) {
    case "field":
      return { minW: 0.14, minH: 0.04 };
    case "line":
      return { minW: 0.05, minH: 0.015 };
    case "icon":
      return { minW: 0.04, minH: 0.045 };
    case "text":
      return { minW: 0.12, minH: 0.04 };
    case "section":
      return { minW: 0.2, minH: 0.07 };
    default:
      return { minW: 0.12, minH: 0.1 };
  }
}
