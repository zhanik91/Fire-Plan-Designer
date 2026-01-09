import { usePlanStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  MousePointer2, 
  DoorOpen, 
  FireExtinguisher, 
  Phone, 
  MapPin, 
  Route, 
  Square,
  Flame,
  Bell
} from "lucide-react";
import { ElementType } from "@/lib/types";

const ToolButton = ({ 
  tool, 
  icon: Icon, 
  label 
}: { 
  tool: ElementType | 'select' | 'route' | 'wall_draw' | 'erase'; 
  icon: any; 
  label: string 
}) => {
  const { selectedTool, setSelectedTool } = usePlanStore();
  const isSelected = selectedTool === tool;

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className="w-full justify-start gap-2 mb-2"
      onClick={() => setSelectedTool(tool)}
    >
      <Icon className="h-4 w-4" />
      <span className="text-xs">{label}</span>
    </Button>
  );
};

export function Sidebar() {
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-full p-4 flex flex-col gap-4 overflow-y-auto">
      <div>
        <h3 className="text-sm font-semibold mb-3 text-sidebar-foreground">Инструменты</h3>
        <ToolButton tool="select" icon={MousePointer2} label="Выбрать / Переместить" />
        <ToolButton tool="wall_draw" icon={Square} label="Рисовать стены" />
        <ToolButton tool="route" icon={Route} label="Маршрут эвакуации" />
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-3 text-sidebar-foreground">Объекты</h3>
        <ToolButton tool="exit" icon={DoorOpen} label="Эвакуационный выход" />
        <ToolButton tool="extinguisher" icon={FireExtinguisher} label="Огнетушитель" />
        <ToolButton tool="fire_hose" icon={Flame} label="Пожарный кран" />
        <ToolButton tool="phone" icon={Phone} label="Телефон" />
        <ToolButton tool="alarm" icon={Bell} label="Тревожная кнопка" />
        <ToolButton tool="you_are_here" icon={MapPin} label="Метка 'Вы здесь'" />
      </div>
      
      <div className="mt-auto">
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
            <h4 className="text-xs font-bold text-blue-800 mb-1">Подсказка</h4>
            <p className="text-[10px] text-blue-600">
                1. Выберите инструмент "Стена" чтобы нарисовать план помещения.<br/>
                2. Добавьте значки.<br/>
                3. Проведите стрелками путь эвакуации.
            </p>
        </div>
      </div>
    </div>
  );
}
