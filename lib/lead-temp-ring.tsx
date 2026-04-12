import type { LeadTemp } from "@/lib/leads-sample-data";

export const TEMP_RING: Record<
  LeadTemp,
  { ring: string; inner: string; text: string; label: string }
> = {
  NA: {
    ring: "conic-gradient(from -2.39deg, rgb(130, 129, 145) 0deg, rgb(76, 75, 86) 266.82deg, rgb(130, 129, 145) 360deg)",
    inner: "rgb(228, 229, 230)",
    text: "rgba(31, 23, 80, 0.75)",
    label: "NA",
  },
  Warm: {
    ring: "conic-gradient(from 214.42deg, rgb(252, 122, 40) -93.18deg, rgb(255, 174, 98) 149.2deg, rgb(252, 122, 40) 266.82deg, rgb(255, 174, 98) 509.2deg)",
    inner: "rgb(255, 246, 224)",
    text: "rgb(151, 97, 10)",
    label: "Warm",
  },
  Hot: {
    ring: "conic-gradient(from 9.35deg, rgb(255, 162, 170) 0deg, rgb(241, 18, 37) 266.82deg, rgb(230, 101, 111) 313.41deg, rgb(255, 162, 170) 360deg)",
    inner: "rgb(255, 232, 232)",
    text: "rgb(177, 51, 51)",
    label: "Hot",
  },
};

export function LeadTempBadge({ temp, size = "sm" }: { temp: LeadTemp; size?: "sm" | "lg" }) {
  const t = TEMP_RING[temp];
  const outer = size === "lg" ? 50 : 45;
  const inner = size === "lg" ? 46 : 41;
  return (
    <div className="relative flex items-center justify-center" style={{ width: outer, height: outer }}>
      <div
        className="absolute rounded-full"
        style={{ width: outer, height: outer, background: t.ring }}
      />
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{ width: inner, height: inner, backgroundColor: t.inner }}
      >
        <span
          className="text-center text-[13px] font-semibold leading-[35px] tracking-normal"
          style={{ color: t.text }}
        >
          {t.label}
        </span>
      </div>
    </div>
  );
}
