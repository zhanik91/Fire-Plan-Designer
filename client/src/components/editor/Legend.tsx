import { usePlanStore } from "@/lib/store";
import { ELEMENT_LABELS, ElementType } from "@/lib/types";

export function Legend() {
  const { elements } = usePlanStore();
  
  // Get unique types used in the plan
  const usedTypes = Array.from(new Set(elements.map(el => el.type)));
  
  // Always show route arrow in legend if routes exist? Or just static list of common symbols.
  // Standard plan usually lists everything available or everything relevant.
  // Let's show a static list of the most important ones for the "Official" look.
  
  const legendItems: ElementType[] = ['exit', 'extinguisher', 'fire_hose', 'phone', 'alarm', 'you_are_here'];

  return (
    <div className="bg-white border border-border p-4 rounded-md shadow-sm w-full">
      <h3 className="text-sm font-bold uppercase border-b border-border pb-2 mb-3 text-center">Условные обозначения</h3>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {legendItems.map((type) => (
          <div key={type} className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded bg-gray-50">
                {/* Render a mini CSS version of the symbol */}
                {type === 'exit' && <div className="w-6 h-4 bg-green-700 rounded-sm text-[5px] text-white flex items-center justify-center">ВЫХОД</div>}
                {type === 'extinguisher' && <div className="text-red-600 text-xs">🧯</div>}
                {type === 'fire_hose' && <div className="w-5 h-5 bg-red-600 rounded-sm flex items-center justify-center text-white text-[10px] font-bold">F</div>}
                {type === 'phone' && <div className="w-5 h-5 bg-red-600 rounded-sm flex items-center justify-center text-white text-[10px]">📞</div>}
                {type === 'alarm' && <div className="w-5 h-5 bg-red-600 rounded-sm flex items-center justify-center relative"><div className="w-2 h-2 bg-white rounded-full"></div></div>}
                {type === 'you_are_here' && <div className="w-3 h-3 bg-blue-600 rounded-full border border-white shadow-sm"></div>}
            </div>
            <span className="text-xs font-medium text-gray-700">{ELEMENT_LABELS[type]}</span>
          </div>
        ))}
        <div className="flex items-center gap-3">
             <div className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded bg-gray-50">
                <div className="w-6 h-0 border-t-2 border-dashed border-green-600"></div>
                <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[4px] border-t-transparent border-b-transparent border-l-green-600 ml-[-1px]"></div>
             </div>
             <span className="text-xs font-medium text-gray-700">Направление эвакуации</span>
        </div>
      </div>
    </div>
  );
}
