import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { GuestBanner } from "@/components/layout/GuestBanner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-8">
        <GuestBanner />
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
