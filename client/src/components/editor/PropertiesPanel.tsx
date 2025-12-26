import { usePlanStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ELEMENT_LABELS } from "@/lib/types";

export function PropertiesPanel() {
  const { elements, selectedElementId, updateElement } = usePlanStore();

  const selectedElement = elements.find(el => el.id === selectedElementId);

  if (!selectedElement) return null;

  return (
    <div className="absolute top-20 right-8 bg-white p-4 rounded-lg shadow-lg border border-border w-64 z-20">
      <h3 className="font-semibold text-sm mb-4 border-b pb-2">Свойства</h3>

      <div className="space-y-4">
        <div>
           <Label className="text-xs text-muted-foreground">Тип</Label>
           <div className="text-sm font-medium">{ELEMENT_LABELS[selectedElement.type]}</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
            <div>
                <Label className="text-xs text-muted-foreground">X</Label>
                <Input
                    type="number"
                    value={Math.round(selectedElement.x)}
                    onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                    className="h-8"
                />
            </div>
            <div>
                <Label className="text-xs text-muted-foreground">Y</Label>
                 <Input
                    type="number"
                    value={Math.round(selectedElement.y)}
                    onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                    className="h-8"
                />
            </div>
        </div>

        <div>
             <Label className="text-xs text-muted-foreground">Поворот (град)</Label>
             <Input
                type="number"
                value={Math.round(selectedElement.rotation)}
                onChange={(e) => updateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                className="h-8"
            />
        </div>

        <div>
             <Label className="text-xs text-muted-foreground">Масштаб</Label>
             <Input
                type="number"
                step="0.1"
                value={Number(selectedElement.scale).toFixed(1)}
                onChange={(e) => updateElement(selectedElement.id, { scale: Number(e.target.value) })}
                className="h-8"
            />
        </div>
      </div>
    </div>
  );
}
