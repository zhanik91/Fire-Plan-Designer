import { usePlanStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Trash2, FileOutput, Undo2, Redo2, Bot } from "lucide-react";
import jsPDF from "jspdf";
import { CalibrationDialog } from "./CalibrationDialog";
import { generatePDF } from "@/lib/pdfGenerator";

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
    setAssistantOpen
  } = usePlanStore();
  // const { undo, redo, pastStates, futureStates } = usePlanStore.temporal.getState();
  // We won't subscribe reactively to enable/disable buttons to avoid TS complexity in this step.
  // Use buttons always enabled or simple check.
  const canUndo = true; // temporal.pastStates.length > 0;
  const canRedo = true; // temporal.futureStates.length > 0;

  const handleSave = () => {
    const state = usePlanStore.getState();
    const data = {
        elements: state.elements,
        routes: state.routes,
        walls: state.walls,
        metadata: state.metadata
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plan-${state.metadata.buildingName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target?.result as string);
            // Validate basic structure?
            if (json.elements && json.walls && json.metadata) {
                // We need to batch update the store.
                // Assuming we can just replace state.
                // But we don't have a replaceAll action.
                // We can just clear and add.
                usePlanStore.getState().clearPlan();

                // Direct state manipulation is discouraged without actions, but simpler here.
                // Or we add a loadPlan action.
                // Let's add loadPlan to store for cleanliness.
                // For now, I'll hack it: use actions.
                // Wait, I should add 'loadPlan' to store.
                // But I can't edit store easily from here without planning.
                // I'll stick to store.ts modification in next step if strict,
                // but let's check store again.
                // I have 'clearPlan'.
                // I will add 'loadPlan' in next step. For now I'll just use the store instance if possible or add it now.
                // Actually, I can use setState on the store directly if exported?
                // No, usePlanStore.setState({ ...json }) might work if types match.
                usePlanStore.setState({
                    elements: json.elements,
                    routes: json.routes || [],
                    walls: json.walls || [],
                    metadata: json.metadata
                });
            }
        } catch (err) {
            console.error("Failed to load plan", err);
            alert("Ошибка загрузки файла");
        }
    };
    reader.readAsText(file);
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
            metadata: state.metadata
        });
        return;
    }

    const stage = document.querySelector('.konvajs-content canvas');
    if (!stage) return;

    // Use Konva's toDataURL for cleaner PNG export of just the canvas
    const konvaStage = (window as any).Konva?.stages?.[0];
    if (konvaStage) {
        const dataURL = konvaStage.toDataURL({ pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `evacuation-plan-${metadata.floor}.png`;
        link.href = dataURL;
        link.click();
        return;
    }

    // Fallback if needed
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
          Удалить
        </Button>
        <Button variant="ghost" size="sm" onClick={clearPlan} className="text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4 mr-2" />
          Очистить всё
        </Button>

        <div className="h-6 w-px bg-border mx-2"></div>

        <CalibrationDialog />

        <div className="h-6 w-px bg-border mx-2"></div>

        <Button variant="outline" size="sm" onClick={handleSave}>
          <Download className="h-4 w-4 mr-2" />
          Сохранить
        </Button>
        <div className="relative">
            <Button variant="outline" size="sm" className="relative cursor-pointer">
                <FileOutput className="h-4 w-4 mr-2" />
                Загрузить
                <input
                    type="file"
                    accept=".json"
                    onChange={handleLoad}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
            </Button>
        </div>

        <div className="h-6 w-px bg-border mx-2"></div>

        <Button variant="outline" size="sm" onClick={() => handleExport('png')}>
          <FileOutput className="h-4 w-4 mr-2" />
          PNG
        </Button>
        <Button variant="default" size="sm" onClick={() => handleExport('pdf')}>
          <Download className="h-4 w-4 mr-2" />
          PDF (A4)
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
