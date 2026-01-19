import { usePlanStore } from "@/lib/store";
import { Eye, EyeOff, Lock, Unlock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LayersPanel() {
  const { layers, toggleLayerVisibility, toggleLayerLock } = usePlanStore();

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2 px-1">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-sidebar-foreground">Слои</h3>
      </div>
      <div className="space-y-1">
        {layers.map((layer) => (
          <div key={layer.id} className="flex items-center justify-between p-2 bg-white border border-gray-100 rounded text-xs group hover:bg-gray-50">
            <span className="font-medium text-gray-700">{layer.name}</span>
            <div className="flex gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => toggleLayerVisibility(layer.id)}
                    title={layer.visible ? "Скрыть" : "Показать"}
                >
                    {layer.visible ? <Eye className="h-3 w-3 text-gray-500" /> : <EyeOff className="h-3 w-3 text-gray-400" />}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => toggleLayerLock(layer.id)}
                    title={layer.locked ? "Разблокировать" : "Заблокировать"}
                >
                    {layer.locked ? <Lock className="h-3 w-3 text-red-400" /> : <Unlock className="h-3 w-3 text-gray-400" />}
                </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
