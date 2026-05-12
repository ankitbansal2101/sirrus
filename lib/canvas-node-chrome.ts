import { labelForLeftRailFieldId } from "@/lib/canvas-field-display";
import type { PlacedCanvasNode } from "@/lib/widget-canvas-v2-types";

export function canvasNodeChromeTitle(node: PlacedCanvasNode): string {
  switch (node.type) {
    case "widget":
      return node.title;
    case "field":
      return labelForLeftRailFieldId(node.fieldId);
    case "section":
      return node.label?.trim() ? node.label : "Section";
    case "text":
      return "Text";
    case "line":
      return "Line";
    case "icon":
      return "Icon";
    default:
      return "Item";
  }
}
