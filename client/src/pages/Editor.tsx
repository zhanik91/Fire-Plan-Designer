import { PlanCanvas } from "@/components/editor/PlanCanvas";
import { Sidebar } from "@/components/editor/Sidebar";
import { Toolbar } from "@/components/editor/Toolbar";
import { Legend } from "@/components/editor/Legend";
import { AIAssistant } from "@/components/editor/AIAssistant";
import { usePlanStore } from "@/lib/store";

export default function Editor() {
  const { metadata, isAssistantOpen } = usePlanStore();

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
      <Toolbar />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 flex flex-col relative overflow-hidden">
            {/* Infinite Canvas */}
            <div className="flex-1 relative">
                <PlanCanvas />
            </div>

            {/* Overlay Elements (Header/Legend for view only, export handles full) */}
            {/* Note: In "Editor" mode, we might want these floating or toggleable.
                For now, let's keep Legend floating bottom-left.
            */}
            <div className="absolute bottom-4 left-4 z-10 w-96">
                <Legend />
            </div>

            <div className="absolute top-4 left-4 z-10 bg-white/90 p-2 rounded shadow backdrop-blur-sm">
                <div className="text-xs font-bold">{metadata.buildingName} - Этаж {metadata.floor}</div>
            </div>
        </main>

        {isAssistantOpen && <AIAssistant />}
      </div>
    </div>
  );
}
