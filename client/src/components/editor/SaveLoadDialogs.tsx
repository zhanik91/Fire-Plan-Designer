import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlanStore } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface SaveProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveProjectDialog({ open, onOpenChange }: SaveProjectDialogProps) {
  const { metadata, elements, routes, walls } = usePlanStore();
  const [name, setName] = useState(metadata.buildingName || "Новый план");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const content = { elements, routes, walls, metadata: { ...metadata, buildingName: name } };

      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          content,
          textPart: null
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast({
        title: "Проект сохранен",
        description: `План "${name}" успешно сохранен.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить проект.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Сохранить проект</DialogTitle>
          <DialogDescription>
            Введите название проекта для сохранения в базе данных.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Название
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface LoadProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SavedPlan {
  id: number;
  name: string;
  createdAt: string;
  content: any;
}

export function LoadProjectDialog({ open, onOpenChange }: LoadProjectDialogProps) {
  const { loadPlan } = usePlanStore();
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      fetchPlans();
    }
  }, [open]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.sort((a: SavedPlan, b: SavedPlan) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (plan: SavedPlan) => {
    setLoadingId(plan.id);
    try {
        // Fetch full plan details if needed, but list usually has content
        // If list is light, we might need GET /api/plans/:id
        const res = await fetch(`/api/plans/${plan.id}`);
        if(res.ok) {
            const fullPlan = await res.json();
            loadPlan(fullPlan.content);
            toast({
                title: "Проект загружен",
                description: `План "${fullPlan.name}" успешно загружен.`,
            });
            onOpenChange(false);
        }
    } catch (error) {
        toast({
            title: "Ошибка",
            description: "Не удалось загрузить проект.",
            variant: "destructive",
        });
    } finally {
        setLoadingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Открыть проект</DialogTitle>
          <DialogDescription>
            Выберите сохраненный проект из списка.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] border rounded-md p-4">
          {loading && plans.length === 0 ? (
             <div className="flex justify-center items-center h-full">
                 <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
             </div>
          ) : plans.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                  Нет сохраненных проектов
              </div>
          ) : (
            <div className="space-y-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{plan.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(plan.createdAt), "dd.MM.yyyy HH:mm")}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleLoad(plan)}
                    disabled={loadingId === plan.id}
                  >
                    {loadingId === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Открыть
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
