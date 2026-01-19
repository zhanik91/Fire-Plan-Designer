import { usePlanStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MousePointer2, DoorOpen, FireExtinguisher, Phone,
  MapPin, Route, Square, Flame, Bell, Type,
  Stethoscope, Users, MoveUp, Wand2
} from "lucide-react";
import { ElementType } from "@/lib/types";
import { PLAN_TEMPLATES } from "@/lib/templates";

const ToolButton = ({ tool, icon: Icon, label }: { tool: any; icon: any; label: string }) => {
  const { selectedTool, setSelectedTool } = usePlanStore();
  const isSelected = selectedTool === tool;

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className="w-full justify-start gap-2 mb-2"
      onClick={() => setSelectedTool(tool)}
    >
      <Icon className="h-4 w-4" />
      <span className="text-xs text-left">{label}</span>
    </Button>
  );
};

export function Sidebar() {
  const { loadTemplate } = usePlanStore();

  const handleTemplateSelect = (value: string) => {
    const template = PLAN_TEMPLATES.find(t => t.name === value);
    if (template) {
      if (confirm('Текущий план будет очищен. Загрузить шаблон?')) {
        loadTemplate(template.data);
      }
    }
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-full p-4 flex flex-col gap-4 overflow-y-auto">
      <div>
        <h3 className="text-sm font-semibold mb-3 text-sidebar-foreground">Шаблоны</h3>
        <Select onValueChange={handleTemplateSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выберите шаблон" />
          </SelectTrigger>
          <SelectContent>
            {PLAN_TEMPLATES.map((t) => (
              <SelectItem key={t.name} value={t.name}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-3 text-sidebar-foreground">Инструменты</h3>
        <ToolButton tool="select" icon={MousePointer2} label="Выбрать / Переместить" />
        <ToolButton tool="wall_draw" icon={Square} label="Стена" />
        <ToolButton tool="room" icon={Square} label="Комната" />
        <ToolButton tool="text" icon={Type} label="Текст / Надпись" />
      </div>
      <Separator />
      <div>
        <h3 className="text-sm font-semibold mb-3 text-sidebar-foreground">Пути эвакуации</h3>
        <div className="text-[10px] text-muted-foreground mb-2">Согласно ППБ РК</div>
        <ToolButton tool="route_main" icon={Route} label="Основной (Сплошной)" />
        <ToolButton tool="route_backup" icon={Route} label="Запасной (Пунктир)" />
        <ToolButton tool="magic_route" icon={Wand2} label="Авто-маршрут (Magic)" />
      </div>
      <Separator />
      <div>
        <h3 className="text-sm font-semibold mb-3 text-sidebar-foreground">Объекты</h3>
        <ToolButton tool="exit" icon={DoorOpen} label="Эвакуационный выход" />
        <ToolButton tool="extinguisher" icon={FireExtinguisher} label="Огнетушитель" />
        <ToolButton tool="fire_hose" icon={Flame} label="Пожарный кран" />
        <ToolButton tool="phone" icon={Phone} label="Телефон" />
        <ToolButton tool="alarm" icon={Bell} label="Кнопка тревоги" />
        <ToolButton tool="you_are_here" icon={MapPin} label="Метка 'Вы здесь'" />

        <div className="text-[10px] text-muted-foreground mt-2 mb-2">Дополнительно</div>
        <ToolButton tool="stairs" icon={MoveUp} label="Лестница" />
        <ToolButton tool="first_aid" icon={Stethoscope} label="Аптечка" />
        <ToolButton tool="assembly_point" icon={Users} label="Точка сбора" />
      </div>

      <div className="mt-auto">
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
            <h4 className="text-xs font-bold text-blue-800 mb-1">Подсказка</h4>
            <p className="text-[10px] text-blue-600">
                1. Выберите шаблон или нарисуйте стены.<br/>
                2. Добавьте объекты безопасности.<br/>
                3. Проведите маршруты эвакуации.<br/>
                4. Экспортируйте в PDF.
            </p>
        </div>
      </div>
    </div>
  );
}
