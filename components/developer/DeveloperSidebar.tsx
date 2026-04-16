"use client";

import type { ElementType } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdOutlineContactPage } from "react-icons/md";
import { RiSettings2Line } from "react-icons/ri";

type SidebarItem =
  | { href: string; kind: "image"; src: string; alt: string }
  | { href: string; kind: "icon"; alt: string; Icon: ElementType };

const items: SidebarItem[] = [
  { href: "/developer/home", kind: "image", src: "/assets/images/HomeIcon.svg", alt: "home" },
  {
    href: "/developer/manage-leads",
    kind: "image",
    src: "/assets/images/EngagementIIntelligenceIcon.svg",
    alt: "manage Leads",
  },
  {
    href: "#",
    kind: "image",
    src: "/assets/images/relationshipIntelligenceIcon.svg",
    alt: "post sales",
  },
  { href: "#", kind: "image", src: "/assets/images/dashboardIcon.svg", alt: "dashboards" },
  {
    href: "#",
    kind: "image",
    src: "/assets/images/channelPartnerIcon.svg",
    alt: "channel partner",
  },
  { href: "/developer/widgets-config", kind: "image", src: "/assets/images/SettingsIcon.svg", alt: "widgets configuration" },
  {
    href: "/developer/widgets-config-v2",
    kind: "icon",
    alt: "Widgets canvas configurator V2",
    Icon: RiSettings2Line,
  },
  {
    href: "/developer/lead-detail",
    kind: "icon",
    alt: "Lead detail preview (V2 left rail)",
    Icon: MdOutlineContactPage,
  },
  {
    href: "#",
    kind: "image",
    src: "/assets/images/receptionistSidebarIcon.svg",
    alt: "receptionist forms",
  },
];

export function DeveloperSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-[5rem] pl-3 pr-3" style={{ backgroundColor: "rgb(250, 250, 250)" }}>
      <div className="relative h-[calc(100vh-50px)] overflow-y-scroll noscrollbar py-8 transition-all duration-300">
        {items.map((item, index) => {
          const active = item.href !== "#" && pathname === item.href;
          return (
            <div key={`${item.kind}-${item.href}-${index}`} className="relative mb-5">
              <Link href={item.href} aria-label={item.alt} title={item.alt}>
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
