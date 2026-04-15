import Image from "next/image";
import Link from "next/link";

const items: { href: string; src: string; alt: string; active?: boolean }[] = [
  { href: "/developer/home", src: "/assets/images/HomeIcon.svg", alt: "home" },
  {
    href: "/developer/manage-leads",
    src: "/assets/images/EngagementIIntelligenceIcon.svg",
    alt: "manage Leads",
    active: true,
  },
  {
    href: "#",
    src: "/assets/images/relationshipIntelligenceIcon.svg",
    alt: "post sales",
  },
  { href: "#", src: "/assets/images/dashboardIcon.svg", alt: "dashboards" },
  {
    href: "#",
    src: "/assets/images/channelPartnerIcon.svg",
    alt: "channel partner",
  },
  { href: "/developer/widgets-config", src: "/assets/images/SettingsIcon.svg", alt: "widgets configuration" },
  {
    href: "#",
    src: "/assets/images/receptionistSidebarIcon.svg",
    alt: "receptionist forms",
  },
];

export function DeveloperSidebar() {
  return (
    <div
      className="w-[5rem] pl-3 pr-3"
      style={{ backgroundColor: "rgb(250, 250, 250)" }}
    >
      <div className="relative h-[calc(100vh-50px)] overflow-y-scroll noscrollbar py-8 transition-all duration-300">
        {items.map((item) => (
          <div key={item.src} className="relative mb-5">
            <Link href={item.href}>
              <button
                type="button"
                className="group relative mb-0 flex items-left whitespace-nowrap rounded-2xl"
                style={{
                  backgroundColor: item.active
                    ? "rgb(210, 211, 255)"
                    : "rgb(234, 235, 245)",
                }}
              >
                <span className="flex items-center">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={56}
                    height={52}
                    className="object-none"
                    style={{ height: 52, width: 56 }}
                  />
                </span>
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
