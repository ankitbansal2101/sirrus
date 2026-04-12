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
      <div className="h-screen w-full overflow-hidden">
        <div className="flex flex-col">
          <DeveloperNav />
          <div
            className="mx-auto flex h-full"
            style={{ backgroundColor: "rgba(236, 236, 255, 0.314)" }}
          >
            <DeveloperSidebar />
            <div
              className="custom-scrollbar mx-auto max-w-[1840px] overflow-y-auto px-8 pb-8"
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
    </div>
  );
}
