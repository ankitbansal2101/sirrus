"use client";

import type { ElementType } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdOutlineContactPage } from "react-icons/md";
import { RiSettings2Line } from "react-icons/ri";

type SidebarItem =
  | { href: string; kind: "image"; src: string; alt: string; title: string }
  | { href: string; kind: "icon"; alt: string; title: string; Icon: ElementType };

/** Track 1 = manage-leads + widgets V1. Track 2 = lead preview + widgets V2 (V2 config drives track 2). */
const items: SidebarItem[] = [
  {
    href: "/developer/manage-leads",
    kind: "image",
    src: "/assets/images/EngagementIIntelligenceIcon.svg",
    alt: "Manage leads",
    title: "Manage leads (track 1)",
  },
  {
    href: "/developer/widgets-config",
    kind: "image",
    src: "/assets/images/SettingsIcon.svg",
    alt: "Widget layout",
    title: "Widget layout (track 1)",
  },
  {
    href: "/developer/lead-detail",
    kind: "icon",
    alt: "Lead detail track 2",
    title: "Lead detail (track 2 — V2 layout from configurator)",
    Icon: MdOutlineContactPage,
  },
  {
    href: "/developer/widgets-config-v2",
    kind: "icon",
    alt: "Widget canvas",
    title: "Widget canvas (track 2 — affects track 2 preview)",
    Icon: RiSettings2Line,
  },
];

export function DeveloperSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-[5rem] pl-3 pr-3" style={{ backgroundColor: "rgb(250, 250, 250)" }}>
      <div className="relative h-[calc(100vh-50px)] overflow-y-scroll noscrollbar py-8 transition-all duration-300">
        {items.map((item, index) => {
          const active = pathname === item.href;
          return (
            <div key={`${item.kind}-${item.href}-${index}`} className="relative mb-5">
              <Link href={item.href} aria-label={item.alt} title={item.title}>
                <button
                  type="button"
                  className="group relative mb-0 flex items-left whitespace-nowrap rounded-2xl"
                  style={{
                    backgroundColor: active ? "rgb(210, 211, 255)" : "rgb(234, 235, 245)",
                  }}
                >
                  <span className="flex items-center justify-center" style={{ height: 52, width: 56 }}>
                    {item.kind === "image" ? (
                      <Image
                        src={item.src}
                        alt={item.alt}
                        width={56}
                        height={52}
                        className="object-none"
                        style={{ height: 52, width: 56 }}
                      />
                    ) : (
                      <item.Icon size={26} style={{ color: "#34369C" }} aria-hidden />
                    )}
                  </span>
                </button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
