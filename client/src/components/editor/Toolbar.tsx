import { usePlanStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Trash2, FileOutput, Undo2, Redo2, Bot, CloudUpload, CloudDownload } from "lucide-react";
import jsPDF from "jspdf";
import { CalibrationDialog } from "./CalibrationDialog";
import { generatePDF } from "@/lib/pdfGenerator";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import Konva from "konva";

export function Toolbar() {
  const {
    metadata,
    setMetadata,
    clearPlan,
    selectedElementId,
    removeElement,
    removeRoute,
    removeWall,
    setSelectedElementId,
    isAssistantOpen,
    setAssistantOpen,
    elements, routes, walls, layers
  } = usePlanStore();
  const { user } = useAuth();
  const { toast } = useToast();

  const canUndo = true; // temporal.pastStates.length > 0;
  const canRedo = true; // temporal.futureStates.length > 0;

  const handleSaveLocal = () => {
    const data = { elements, routes, walls, metadata };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plan-${metadata.buildingName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target?.result as string);
            if (json.elements && json.walls && json.metadata) {
                usePlanStore.getState().clearPlan();
                usePlanStore.setState({
                    elements: json.elements,
                    routes: json.routes || [],
                    walls: json.walls || [],
                    metadata: json.metadata
                });
                toast({ title: "План загружен", description: "Данные успешно восстановлены из файла." });
            }
        } catch (err) {
            console.error("Failed to load plan", err);
            toast({ title: "Ошибка", description: "Не удалось прочитать файл.", variant: "destructive" });
        }
    };
    reader.readAsText(file);
  };

  const handleSaveCloud = async () => {
      if (!user) {
          toast({ title: "Ошибка", description: "Необходимо войти в систему.", variant: "destructive" });
          return;
      }

      try {
          const res = await fetch('/api/plans', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  name: metadata.buildingName,
                  content: { elements, routes, walls, metadata }
              })
          });

          if (res.ok) {
              toast({ title: "Сохранено", description: "План сохранен в облако." });
          } else {
              throw new Error('Failed to save');
          }
      } catch (e) {
          toast({ title: "Ошибка", description: "Не удалось сохранить в облако.", variant: "destructive" });
      }
  };

  const handleDeleteSelected = () => {
    if (selectedElementId) {
      removeElement(selectedElementId);
      removeRoute(selectedElementId);
      removeWall(selectedElementId);
      setSelectedElementId(null);
    }
  };

  const handleExport = async (format: 'png' | 'pdf') => {
    if (format === 'pdf') {
        const state = usePlanStore.getState();
        generatePDF({
            elements: state.elements,
            routes: state.routes,
            walls: state.walls,
            metadata: state.metadata,
            layers: state.layers
        });
        return;
    }

    // Access Konva stage via Konva global since react-konva registers it
    const konvaStage = Konva.stages[0];
    if (konvaStage) {
        const dataURL = konvaStage.toDataURL({ pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `evacuation-plan-${metadata.floor}.png`;
        link.href = dataURL;
        link.click();
    }
  };

  return (
    <div className="h-16 border-b border-border bg-white px-6 flex items-center justify-between shadow-sm z-10 relative">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
           <span className="font-bold text-lg tracking-tight text-primary">План Эвакуации</span>
           <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded font-mono">EDITOR</span>
        </div>
        
        <div className="h-6 w-px bg-border mx-2"></div>
        
        <div className="flex items-center gap-2 border-r border-border pr-4 mr-4">
            <Button variant="ghost" size="icon" onClick={() => usePlanStore.temporal.getState().undo()} disabled={!canUndo}>
                <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => usePlanStore.temporal.getState().redo()} disabled={!canRedo}>
                <Redo2 className="h-4 w-4" />
            </Button>
        </div>

        <div className="flex items-center gap-4">
            <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                <Label htmlFor="building" className="text-xs text-muted-foreground">Объект:</Label>
                <Input 
                    id="building" 
                    value={metadata.buildingName} 
                    onChange={(e) => setMetadata({ buildingName: e.target.value })}
                    className="h-8 w-48 text-xs"
                />
            </div>
             <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                <Label htmlFor="floor" className="text-xs text-muted-foreground">Этаж:</Label>
                <Input 
                    id="floor" 
                    value={metadata.floor} 
                    onChange={(e) => setMetadata({ floor: e.target.value })}
                    className="h-8 w-16 text-xs"
                />
            </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDeleteSelected}
          disabled={!selectedElementId}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
        </Button>

        <div className="h-6 w-px bg-border mx-2"></div>

        <CalibrationDialog />

        <div className="h-6 w-px bg-border mx-2"></div>

        <div className="flex gap-1">
             <Button variant="outline" size="sm" onClick={handleSaveLocal} title="Сохранить файл JSON">
                <Download className="h-4 w-4" />
            </Button>
            <div className="relative">
                <Button variant="outline" size="sm" className="relative cursor-pointer" title="Загрузить файл JSON">
                    <FileOutput className="h-4 w-4" />
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleLoadLocal}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </Button>
            </div>
            {user && (
                 <Button variant="outline" size="sm" onClick={handleSaveCloud} title="Сохранить в облако">
                    <CloudUpload className="h-4 w-4" />
                 </Button>
            )}
        </div>

        <div className="h-6 w-px bg-border mx-2"></div>

        <Button variant="outline" size="sm" onClick={() => handleExport('png')}>
          PNG
        </Button>
        <Button variant="default" size="sm" onClick={() => handleExport('pdf')}>
          PDF
        </Button>

        <div className="h-6 w-px bg-border mx-2"></div>

        <Button
            variant={isAssistantOpen ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setAssistantOpen(!isAssistantOpen)}
            className={isAssistantOpen ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "text-blue-600"}
        >
          <Bot className="h-5 w-5 mr-2" />
          Ассистент
        </Button>
      </div>
    </div>
  );
}
