"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadWidgetCanvasV2Document,
  WIDGET_CANVAS_V2_DOCUMENT_CHANGED,
  WIDGET_CANVAS_V2_STORAGE_KEY,
} from "@/lib/widget-canvas-v2-storage";
import type { WidgetCanvasV2Document } from "@/lib/widget-canvas-v2-types";

export function useWidgetCanvasV2Document(enabled: boolean) {
  const [doc, setDoc] = useState<WidgetCanvasV2Document | null>(null);

  const load = useCallback(() => {
    if (!enabled) {
      setDoc(null);
      return;
    }
    setDoc(loadWidgetCanvasV2Document());
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setDoc(null);
      return;
    }
    const id = requestAnimationFrame(load);
    const onChanged = () => load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === WIDGET_CANVAS_V2_STORAGE_KEY) load();
    };
    window.addEventListener(WIDGET_CANVAS_V2_DOCUMENT_CHANGED, onChanged);
    window.addEventListener("storage", onStorage);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener(WIDGET_CANVAS_V2_DOCUMENT_CHANGED, onChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, [enabled, load]);

  return doc;
}
