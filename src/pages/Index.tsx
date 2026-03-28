import { useState } from "react";
import TopBar from "@/components/editor/TopBar";
import SlideCarousel from "@/components/editor/SlideCarousel";
import BottomMenu from "@/components/editor/BottomMenu";
import BottomSheet from "@/components/editor/BottomSheet";
import type { MenuId } from "@/components/editor/BottomMenu";

const Index = () => {
  const [activeTab, setActiveTab] = useState<MenuId | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <div className="flex h-[100dvh] flex-col bg-gradient-main overflow-hidden">
      {/* All content above blobs */}
      <div className="relative z-10 flex h-[100dvh] flex-col pt-[env(safe-area-inset-top)]">
        <TopBar />
        <main className="flex flex-1 flex-col min-h-0 pb-[calc(72px+env(safe-area-inset-bottom))]">
          <SlideCarousel activeSlide={activeSlide} onSlideChange={setActiveSlide} />
        </main>
      </div>

      <BottomSheet activeTab={activeTab} onClose={() => setActiveTab(null)} />
      <BottomMenu activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
