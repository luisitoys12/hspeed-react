import { ReactNode } from "react";
import LeftSidebar from "@/components/LeftSidebar";

interface PageContainerProps {
  children: ReactNode;
  hideSidebar?: boolean;
}

export function PageContainer({ children, hideSidebar = false }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-[#edf2f7] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 pb-16 transition-colors">
      <div className="max-w-[1600px] mx-auto px-2 sm:px-4 py-3 sm:py-4">
        {hideSidebar ? (
          <main className="w-full space-y-4">
            {children}
          </main>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4">
            <LeftSidebar />
            <main className="flex-1 min-w-0 space-y-4">
              {children}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

export default PageContainer;
