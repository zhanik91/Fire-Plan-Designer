import { usePlanStore } from "@/lib/store";
import { ELEMENT_LABELS, ElementType } from "@/lib/types";
import { Users, MoveUp, Stethoscope } from "lucide-react";

export function Legend() {
  const { elements, routes } = usePlanStore();
  
  // Get unique types used in the plan
  const usedTypes = new Set(elements.map(el => el.type));
  
  // Define order and available types for the legend
  const allLegendItems: ElementType[] = [
      'exit', 'extinguisher', 'fire_hose', 'phone', 'alarm',
      'you_are_here', 'stairs', 'first_aid', 'assembly_point'
  ];

  // Filter items: Show if used OR if it's a mandatory/common item that is "good practice" to have on the legend?
  // Usually legend shows what is ON the map.
  // We'll show what is on the map.
  const legendItems = allLegendItems.filter(type => usedTypes.has(type));

  const hasRoutes = routes.length > 0;

  return (
    <div className="bg-white border border-border p-4 rounded-md shadow-sm w-full">
      <h3 className="text-sm font-bold uppercase border-b border-border pb-2 mb-3 text-center">Условные обозначения</h3>

      {legendItems.length === 0 && !hasRoutes && (
          <p className="text-xs text-muted-foreground text-center italic">Элементы не добавлены</p>
      )}

      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {legendItems.map((type) => (
          <div key={type} className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded bg-gray-50 overflow-hidden">
                {/* Render a mini CSS/Icon version of the symbol */}
                {type === 'exit' && <div className="w-6 h-4 bg-green-700 rounded-sm text-[5px] text-white flex items-center justify-center font-bold">ВЫХОД</div>}
                {type === 'extinguisher' && <div className="text-red-600 text-xs">🧯</div>}
                {type === 'fire_hose' && <div className="w-5 h-5 bg-red-600 rounded-sm flex items-center justify-center text-white text-[10px] font-bold">F</div>}
                {type === 'phone' && <div className="w-5 h-5 bg-red-600 rounded-sm flex items-center justify-center text-white text-[10px]">📞</div>}
                {type === 'alarm' && <div className="w-5 h-5 bg-red-600 rounded-sm flex items-center justify-center relative"><div className="w-2 h-2 bg-white rounded-full"></div></div>}
                {type === 'you_are_here' && <div className="w-3 h-3 bg-blue-600 rounded-full border border-white shadow-sm"></div>}

                {/* New Icons */}
                {type === 'stairs' && <MoveUp className="w-4 h-4 text-gray-600" />}
                {type === 'first_aid' && <div className="w-5 h-5 bg-green-600 rounded-sm flex items-center justify-center"><Stethoscope className="w-3 h-3 text-white" /></div>}
                {type === 'assembly_point' && <div className="w-5 h-5 bg-green-600 rounded-sm flex items-center justify-center"><Users className="w-3 h-3 text-white" /></div>}
            </div>
            <span className="text-xs font-medium text-gray-700">{ELEMENT_LABELS[type]}</span>
          </div>
        ))}

        {hasRoutes && (
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded bg-gray-50">
                    <div className="w-6 h-0 border-t-2 border-dashed border-green-600"></div>
                    <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[4px] border-t-transparent border-b-transparent border-l-green-600 ml-[-1px]"></div>
                </div>
                <span className="text-xs font-medium text-gray-700">Направление эвакуации</span>
            </div>
        )}
      </div>
    </div>
  );
}
