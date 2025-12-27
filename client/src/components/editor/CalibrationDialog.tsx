import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlanStore } from "@/lib/store";
import { Ruler } from "lucide-react";

export function CalibrationDialog() {
  const { walls, selectedElementId, metadata, setMetadata } = usePlanStore();
  const [isOpen, setIsOpen] = useState(false);
  const [realLength, setRealLength] = useState("5");

  const selectedWall = walls.find(w => w.id === selectedElementId);

  // Calculate current pixel length
  const pixelLength = selectedWall
    ? Math.sqrt(
        Math.pow(selectedWall.points[1].x - selectedWall.points[0].x, 2) +
        Math.pow(selectedWall.points[1].y - selectedWall.points[0].y, 2)
      )
    : 0;

  const handleCalibrate = () => {
    const meters = parseFloat(realLength);
    if (meters > 0 && pixelLength > 0) {
      const newPPM = pixelLength / meters;
      setMetadata({ pixelsPerMeter: newPPM });
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={!selectedWall}
        onClick={() => setIsOpen(true)}
      >
        <Ruler className="h-4 w-4 mr-2" />
        Калибровка
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Калибровка масштаба</DialogTitle>
            <DialogDescription>
              Задайте реальную длину выбранной стены, чтобы настроить масштаб плана.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pixel-len" className="text-right">
                Длина (px)
              </Label>
              <div className="col-span-3 text-sm font-mono">
                {Math.round(pixelLength)} px
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="real-len" className="text-right">
                Реальная длина (м)
              </Label>
              <Input
                id="real-len"
                type="number"
                value={realLength}
                onChange={(e) => setRealLength(e.target.value)}
                className="col-span-3"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Результат
              </Label>
              <div className="col-span-3 text-sm text-muted-foreground">
                1 метр = {realLength ? (pixelLength / parseFloat(realLength)).toFixed(2) : "?"} px
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleCalibrate}>Применить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
