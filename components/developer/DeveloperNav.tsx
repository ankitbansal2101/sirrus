import Image from "next/image";
import Link from "next/link";
import { IoMdNotifications } from "react-icons/io";

export function DeveloperNav() {
  return (
    <nav
      className="w-full border-b-2 py-2.5 shadow-sm"
      style={{
        backgroundColor: "rgb(250, 250, 250)",
        borderColor: "rgb(193, 192, 203)",
      }}
    >
      <div className="mx-auto flex items-center justify-between px-8">
        <div className="flex items-center">
          <Link href="/developer/home">
            <Image
              src="/assets/images/blackLogo.svg"
              alt="Logo"
              width={130}
              height={42}
              className="max-w-32 cursor-pointer object-contain transition-all"
              priority
            />
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button
                type="button"
                className="relative rounded-full p-2 transition-all hover:bg-black/5"
              >
                <IoMdNotifications
                  size={24}
                  style={{ color: "#1F1750" }}
                />
                <span
                  className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-[2px] text-[10px] font-bold text-white"
                  style={{ backgroundColor: "rgb(255, 102, 120)" }}
                >
                  4
                </span>
              </button>
            </div>
            <div className="relative">
              <button
                type="button"
                className="flex items-center rounded-xl border"
                style={{ borderColor: "rgb(235, 234, 247)" }}
              >
                <div
                  className="h-14 w-14 overflow-hidden rounded-full"
                  style={{ background: "rgba(203, 210, 250, 0.5)" }}
                >
                  <Image
                    src="/assets/images/userPlaceholder.svg"
                    alt="Profile"
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="pl-3 text-left">
                  <p className="text-base font-bold" title="Ankit Bansal">
                    Ankit Bansal
                  </p>
                  <p
                    className="text-sm font-bold"
                    style={{ color: "rgb(126, 122, 149)" }}
                    title="Pre Sales Head"
                  >
                    Pre Sales Head
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
