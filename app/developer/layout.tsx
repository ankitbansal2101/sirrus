import { DeveloperNav } from "@/components/developer/DeveloperNav";
import { DeveloperSidebar } from "@/components/developer/DeveloperSidebar";

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex justify-center"
      style={{
        backgroundColor: "rgb(228, 229, 230)",
        color: "rgb(29, 41, 57)",
      }}
    >
      <div className="flex h-screen w-full flex-col overflow-hidden">
        <DeveloperNav />
        <div
          className="mx-auto flex min-h-0 w-full flex-1"
          style={{ backgroundColor: "rgba(236, 236, 255, 0.314)" }}
        >
          <DeveloperSidebar />
          <div
            className="custom-scrollbar mx-auto max-w-[1840px] min-h-0 flex-1 overflow-y-auto px-8 pb-8"
            style={{
              width: "calc(-5rem + 100vw)",
              backgroundColor: "rgba(236, 236, 255, 0.314)",
              maxHeight: "calc(-5.05rem + 100vh)",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
