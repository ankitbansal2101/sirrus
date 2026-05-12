import Link from "next/link";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-[#eef0f8]">
      <header className="border-b border-slate-200/90 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-outfit text-sm font-semibold text-[#34369C] hover:underline">
              Sirrus
            </Link>
            <span className="font-outfit text-sm text-[#8b87a8]">Settings</span>
          </div>
          <Link
            href="/developer/widgets-config-v2"
            className="font-outfit text-[11px] font-semibold text-[#5c5878] hover:text-[#34369C]"
          >
            Open in developer console →
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-[1920px] px-4 py-4">{children}</div>
    </div>
  );
}
