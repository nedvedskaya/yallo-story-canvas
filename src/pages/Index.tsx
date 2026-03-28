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
    <div className="flex min-h-[100dvh] flex-col bg-gradient-main">
      {/* All content above blobs */}
      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col pb-20">
          <SlideCarousel activeSlide={activeSlide} onSlideChange={setActiveSlide} />
        </main>
      </div>

      <BottomSheet activeTab={activeTab} onClose={() => setActiveTab(null)} />
      <BottomMenu activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
