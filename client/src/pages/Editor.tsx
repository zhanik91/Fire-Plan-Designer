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
        
        <main className="flex-1 p-8 overflow-auto flex flex-col items-center">
            {/* The Printable Area Wrapper */}
            <div 
                id="printable-area" 
                className="bg-white shadow-2xl p-8 min-w-[880px] min-h-[700px] flex flex-col gap-6"
                style={{ width: '297mm', minHeight: '210mm' }} // A4 Landscape roughly
            >
                {/* Header of the document */}
                <div className="text-center border-b-2 border-black pb-4 mb-2">
                    <h1 className="text-2xl font-bold font-serif uppercase tracking-widest text-black mb-1">План эвакуации</h1>
                    <div className="flex justify-between px-12 text-sm font-mono mt-2">
                         <span>ОБЪЕКТ: {metadata.buildingName}</span>
                         <span>ЭТАЖ: {metadata.floor}</span>
                    </div>
                </div>

                <div className="flex-1 relative border border-gray-200">
                    {/* The Canvas */}
                    <PlanCanvas />
                </div>

                {/* Footer / Legend */}
                <div className="mt-auto pt-4 border-t-2 border-black">
                    <div className="flex gap-8">
                        <div className="flex-1">
                            <Legend />
                        </div>
                        <div className="w-64 flex flex-col justify-end text-xs font-mono">
                            <div className="border-b border-black mb-2 pb-1 flex justify-between">
                                <span>Ответственный:</span>
                                <span>{metadata.responsible}</span>
                            </div>
                            <div className="border-b border-black mb-2 pb-1 flex justify-between">
                                <span>Подпись:</span>
                                <span>_________________</span>
                            </div>
                            <div className="text-right text-[10px] text-gray-400 mt-2">
                                Сформировано автоматически
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        {isAssistantOpen && <AIAssistant />}
      </div>
    </div>
  );
}
