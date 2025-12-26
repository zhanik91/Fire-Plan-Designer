import { usePlanStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Trash2, FileOutput } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export function Toolbar() {
  const { metadata, setMetadata, clearPlan, selectedElementId, removeElement, removeRoute, removeWall, setSelectedElementId } = usePlanStore();

  const handleDeleteSelected = () => {
    if (selectedElementId) {
      removeElement(selectedElementId);
      removeRoute(selectedElementId);
      removeWall(selectedElementId);
      setSelectedElementId(null);
    }
  };

  const handleExport = async (format: 'png' | 'pdf') => {
    const stage = document.querySelector('.konvajs-content canvas');
    if (!stage) return;

    // We capture the container div to get the legend and title too if we wanted, 
    // but typically plans are just the drawing. 
    // Let's capture the whole "Canvas" area wrapper if possible, or build a specific report.
    // For now, let's export the canvas stage + metadata overlaid on a temp canvas or similar.
    // Actually simpler: Capture the parent div of the stage which we can style to look like A4 paper.
    
    // NOTE: Konva has .toDataURL(), but that only gets the canvas content.
    // The requirement says "Export to PNG/PDF A4".
    
    // Approach: Create a temporary HTML layout that looks like the final document, render it off-screen (or visible), html2canvas it.
    // For MVP: Just snapshot the working area for now.
    
    // Better: snapshot the stage using Konva's method, then put it into PDF.
    
    const konvaStage = (window as any).Konva?.stages?.[0]; // Hacky access or passed ref
    // Since we don't have easy ref access from here without Context passing, 
    // let's assume we use html2canvas on the "printable-area" div.
    
    const element = document.getElementById('printable-area');
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 }); // High res
    const imgData = canvas.toDataURL('image/png');

    if (format === 'png') {
      const link = document.createElement('a');
      link.download = `evacuation-plan-${metadata.floor}.png`;
      link.href = imgData;
      link.click();
    } else {
      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape A4
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`evacuation-plan-${metadata.floor}.pdf`);
    }
  };

  return (
    <div className="h-16 border-b border-border bg-white px-6 flex items-center justify-between shadow-sm z-10 relative">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
           <span className="font-bold text-lg tracking-tight text-primary">FireSafety</span>
           <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded font-mono">EDITOR</span>
        </div>
        
        <div className="h-6 w-px bg-border mx-2"></div>
        
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
        <Button variant="outline" size="sm" onClick={() => handleExport('png')}>
          <FileOutput className="h-4 w-4 mr-2" />
          PNG
        </Button>
        <Button variant="default" size="sm" onClick={() => handleExport('pdf')}>
          <Download className="h-4 w-4 mr-2" />
          PDF (A4)
        </Button>
      </div>
    </div>
  );
}
