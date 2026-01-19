import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Stage, Layer, Line, Group, Rect, Arrow, Transformer, Text } from 'react-konva';
import { usePlanStore } from '@/lib/store';
import { ElementType } from '@/lib/types';
import Konva from 'konva';
import { SymbolRenderer } from './icons';
import { PropertiesPanel } from './PropertiesPanel';
import { ContextMenu } from './ContextMenu';
import { findPath, findNearestExit } from '@/lib/pathfinding';
import useMeasure from 'react-use-measure';

interface GuideLine {
    points: number[];
    orientation: 'vertical' | 'horizontal';
}

export function PlanCanvas() {
  const { 
    elements, routes, walls, layers, selectedTool, addElement, updateElement,
    selectedElementId, setSelectedElementId, addRoute, addWall, addRoom,
    removeElement, removeRoute, removeWall, setSelectedTool, metadata
  } = usePlanStore();
  
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [guides, setGuides] = useState<GuideLine[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, elementId?: string } | null>(null);

  // Measure parent for responsive size
  const [containerRef, bounds] = useMeasure();

  const gridSize = 20;
  const SNAP_THRESHOLD = 10;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
         e.preventDefault();
         usePlanStore.temporal.getState().undo();
         return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
         e.preventDefault();
         usePlanStore.temporal.getState().redo();
         return;
      }

      // Escape to cancel drawing or deselect
      if (e.key === 'Escape') {
          if (isDrawing) {
              setIsDrawing(false);
              setCurrentPoints([]);
          } else {
              setSelectedElementId(null);
              setSelectedTool('select');
          }
          setContextMenu(null);
          return;
      }

      // Nudge with Arrows
      if (selectedElementId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          const el = elements.find(e => e.id === selectedElementId);
          if (el) {
              const step = e.shiftKey ? 1 : gridSize;
              let dx = 0, dy = 0;
              if (e.key === 'ArrowUp') dy = -step;
              if (e.key === 'ArrowDown') dy = step;
              if (e.key === 'ArrowLeft') dx = -step;
              if (e.key === 'ArrowRight') dx = step;
              updateElement(selectedElementId, { x: el.x + dx, y: el.y + dy });
          }
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        removeElement(selectedElementId);
        removeRoute(selectedElementId);
        removeWall(selectedElementId);
        setSelectedElementId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, elements, isDrawing, selectedTool]);

  useEffect(() => {
    if (selectedElementId && transformerRef.current) {
        const stage = transformerRef.current.getStage();
        const selectedNode = stage?.findOne('.' + selectedElementId);
        if (selectedNode) {
            transformerRef.current.nodes([selectedNode]);
            transformerRef.current.getLayer()?.batchDraw();
        } else { transformerRef.current.nodes([]); }
    } else { transformerRef.current?.nodes([]); }
  }, [selectedElementId, elements, routes, walls]);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;
    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setStageScale(newScale);
    setStagePos({
        x: pointer.x - (pointer.x - stage.x()) / oldScale * newScale,
        y: pointer.y - (pointer.y - stage.y()) / oldScale * newScale,
    });
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Middle click or space + drag for panning?
    // Konva draggable prop on Stage handles dragging.
    // If tool is 'select', draggable is true.
    // We want panning even if not select? No, usually Pan tool or spacebar.
    // For now, keep standard select-drag for stage.

    if (e.evt.button === 2) return; // Ignore right click for drawing
    setContextMenu(null);

    // Check layer locking for creation
    const getLayerId = (t: string) => {
        if (t === 'wall_draw' || t === 'room') return 'walls';
        if (t.startsWith('route')) return 'routes';
        return 'elements';
    };

    if (selectedTool !== 'select') {
         const layerId = getLayerId(selectedTool);
         const layer = layers.find(l => l.id === layerId);
         if (layer && (layer.locked || !layer.visible)) {
             alert(`Слой "${layer.name}" заблокирован или скрыт.`);
             return;
         }
    }

    const stage = e.target.getStage();
    if (!stage) return;

    // Logic for drawing start
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const localPos = transform.point(pos);
    const x = Math.round(localPos.x / gridSize) * gridSize;
    const y = Math.round(localPos.y / gridSize) * gridSize;

    if (selectedTool === 'select') {
      if (e.target === stage.getStage()) setSelectedElementId(null);
      return;
    }

    if (['extinguisher', 'fire_hose', 'phone', 'alarm', 'exit', 'you_are_here', 'text', 'stairs', 'first_aid', 'assembly_point'].includes(selectedTool)) {
      addElement(selectedTool as ElementType, x, y);
      return;
    }

    if (['wall_draw', 'room', 'route_main', 'route_backup'].includes(selectedTool)) {
        if (!isDrawing) {
            setIsDrawing(true);
            setCurrentPoints([x, y, x, y]);
        } else {
             if (selectedTool.startsWith('route')) setCurrentPoints([...currentPoints, x, y]);
        }
    }

    if (selectedTool === 'magic_route') {
        const start = { x, y };
        const exit = findNearestExit(start, elements);
        if (exit) {
            let minX = -5000, maxX = 5000, minY = -5000, maxY = 5000;
            const path = findPath(start, exit, walls, { minX, maxX, minY, maxY });
            if (path && path.length > 0) {
                addRoute(path, 'main');
            } else {
                alert("Не удалось найти маршрут к выходу.");
            }
        } else {
            alert("Нет выходов на плане!");
        }
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const localPos = transform.point(pos);
    const x = Math.round(localPos.x / gridSize) * gridSize;
    const y = Math.round(localPos.y / gridSize) * gridSize;

    if (selectedTool === 'wall_draw' || selectedTool === 'room') {
        setCurrentPoints([currentPoints[0], currentPoints[1], x, y]);
    } else if (selectedTool.startsWith('route')) {
        const newPoints = [...currentPoints];
        newPoints[newPoints.length - 2] = x;
        newPoints[newPoints.length - 1] = y;
        setCurrentPoints(newPoints);
    }
  };

  const handleMouseUp = () => {
    if (selectedTool === 'wall_draw' && isDrawing) {
        if (currentPoints.length === 4) {
            const points = [{x: currentPoints[0], y: currentPoints[1]}, {x: currentPoints[2], y: currentPoints[3]}];
            if (points[0].x !== points[1].x || points[0].y !== points[1].y) addWall(points);
        }
        setIsDrawing(false);
        setCurrentPoints([]);
    } else if (selectedTool === 'room' && isDrawing) {
        const [x1, y1, x2, y2] = currentPoints;
        if (x1 !== x2 || y1 !== y2) {
             const walls = [
                { id: crypto.randomUUID(), points: [{x: x1, y: y1}, {x: x2, y: y1}] },
                { id: crypto.randomUUID(), points: [{x: x2, y: y1}, {x: x2, y: y2}] },
                { id: crypto.randomUUID(), points: [{x: x2, y: y2}, {x: x1, y: y2}] },
                { id: crypto.randomUUID(), points: [{x: x1, y: y2}, {x: x1, y: y1}] }
             ];
             addRoom(walls);
        }
        setIsDrawing(false);
        setCurrentPoints([]);
    }
  };

  const handleDoubleClick = () => {
      if (selectedTool.startsWith('route') && isDrawing) {
          if (currentPoints.length >= 4) {
              const points = [];
              for (let i = 0; i < currentPoints.length; i += 2) points.push({x: currentPoints[i], y: currentPoints[i+1]});
              addRoute(points, selectedTool === 'route_backup' ? 'backup' : 'main');
          }
          setIsDrawing(false);
          setCurrentPoints([]);
      }
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
      // If dragging stage (panning), do nothing
      if (e.target === e.target.getStage()) return;

      setGuides([]);
      const target = e.target;
      const targetId = target.name();
      if (e.evt.ctrlKey) return;

      const stage = target.getStage();
      if (!stage) return;

      const newGuides: GuideLine[] = [];
      let snapX: number | null = null;
      let snapY: number | null = null;

      elements.forEach(el => {
          if (el.id === targetId) return;

          if (Math.abs(target.x() - el.x) < SNAP_THRESHOLD) {
              snapX = el.x;
              newGuides.push({ points: [el.x, -5000, el.x, 5000], orientation: 'vertical' });
          }
          if (Math.abs(target.y() - el.y) < SNAP_THRESHOLD) {
              snapY = el.y;
              newGuides.push({ points: [-5000, el.y, 5000, el.y], orientation: 'horizontal' });
          }
      });

      if (snapX !== null) target.x(snapX);
      if (snapY !== null) target.y(snapY);

      setGuides(newGuides);
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
      setGuides([]);
      const el = elements.find(el => el.id === e.target.name());
      if (el) {
          updateElement(el.id, { x: e.target.x(), y: e.target.y() });
      }
  };

  const handleContextMenu = (e: Konva.KonvaEventObject<PointerEvent>) => {
      e.evt.preventDefault();
      const x = e.evt.clientX;
      const y = e.evt.clientY;
      const stage = e.target.getStage();

      if (stage) {
          const shape = e.target;
          const group = shape.findAncestor('Group') || (shape.nodeType === 'Group' ? shape : null);
          const elementId = group?.name();

          if (elementId) setSelectedElementId(elementId);
          setContextMenu({ x, y, elementId: elementId || undefined });
      }
  };

  // Render Infinite Grid around 0,0 for a reasonable area, or dynamic based on view?
  // Dynamic is better. But static large area is easier.
  // We use -2000 to 2000?
  // Let's make it large enough.
  const gridLines = useMemo(() => {
    const lines = [];
    const min = -2000;
    const max = 2000;
    for (let i = min; i < max; i += gridSize) {
        lines.push(<Line key={`v-${i}`} points={[i, min, i, max]} stroke="#f3f4f6" strokeWidth={1} />);
    }
    for (let j = min; j < max; j += gridSize) {
        lines.push(<Line key={`h-${j}`} points={[min, j, max, j]} stroke="#f3f4f6" strokeWidth={1} />);
    }
    return lines;
  }, [gridSize]);

  // Page Guide (A4 Landscape approx 297mm x 210mm -> converted to px)
  // Let's assume 1m = 50px. A4 is 0.297m x 0.21m? No, that's small scale.
  // Standard plan 1:100.
  // 10m building = 1000cm -> 10cm on paper.
  // Let's just draw a "Page" rectangle that user can reference.
  // e.g. 1000x700 px (approx 20m x 14m at 50px/m)
  const PageGuide = () => (
      <Rect x={0} y={0} width={1000} height={700} stroke="#e2e8f0" strokeWidth={2} dash={[10, 5]} listening={false} />
  );

  return (
    <div
        ref={containerRef}
        className="bg-gray-100 shadow-inner border-l border-border flex-1 relative overflow-hidden"
        onContextMenu={(e) => e.preventDefault()}
    >
      <PropertiesPanel />
      {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            elementId={contextMenu.elementId}
            onClose={() => setContextMenu(null)}
          />
      )}

      <Stage
        width={bounds.width} height={bounds.height}
        draggable={true} // Always draggable for pan (except when interacting?)
        // Actually, if we set draggable=true on Stage, it intercepts all drags.
        // We usually want Pan tool.
        // Let's enable Stage drag ONLY if Middle Mouse or Space held.
        // OR simpler: Always enabled, but we check target in logic?
        // If we drag an element, bubble stops?
        // Konva handles this: clicking on draggable shape drags shape. Clicking on stage drags stage.

        onWheel={handleWheel}
        scaleX={stageScale} scaleY={stageScale}
        x={stagePos.x} y={stagePos.y}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={handleDoubleClick}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onContextMenu={handleContextMenu}
        className="cursor-crosshair"
      >
        <Layer>
          <PageGuide />
          <Group>{gridLines}</Group>

          {/* Walls Layer */}
          <Group visible={layers.find(l => l.id === 'walls')?.visible} listening={!layers.find(l => l.id === 'walls')?.locked}>
              {walls.map((wall) => {
                  const p1 = wall.points[0];
                  const p2 = wall.points[1];
                  // Calculate length
                  const lenPx = Math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2);
                  const ppm = metadata.pixelsPerMeter || 50;
                  const lenM = (lenPx / ppm).toFixed(1);
                  const midX = (p1.x + p2.x) / 2;
                  const midY = (p1.y + p2.y) / 2;

                  return (
                    <Group key={wall.id}>
                        <Line
                            name={wall.id} points={[p1.x, p1.y, p2.x, p2.y]}
                            stroke={selectedElementId === wall.id ? "#2563EB" : "black"} strokeWidth={selectedElementId === wall.id ? 4 : 3}
                            onClick={(e) => { e.cancelBubble = true; if(selectedTool === 'select') setSelectedElementId(wall.id); }}
                        />
                        {/* Dimension Text */}
                        <Text
                            x={midX} y={midY}
                            text={`${lenM}m`}
                            fontSize={10}
                            fill="#666"
                            align="center"
                            offsetX={10}
                            offsetY={10}
                        />
                    </Group>
                  );
              })}
          </Group>

           {/* Routes Layer */}
           <Group visible={layers.find(l => l.id === 'routes')?.visible} listening={!layers.find(l => l.id === 'routes')?.locked}>
               {routes.map((route) => (
                <Arrow
                  key={route.id} name={route.id} points={route.points.flatMap(p => [p.x, p.y])}
                  stroke={selectedElementId === route.id ? "#2563EB" : "#166534"}
                  strokeWidth={selectedElementId === route.id ? 4 : 3}
                  fill={selectedElementId === route.id ? "#2563EB" : "#166534"}
                  dash={route.type === 'backup' ? [10, 5] : []}
                  onClick={(e) => { e.cancelBubble = true; if(selectedTool === 'select') setSelectedElementId(route.id); }}
                />
              ))}
          </Group>

          {isDrawing && (
              <>
                {selectedTool === 'room' ? (
                     <Rect x={Math.min(currentPoints[0], currentPoints[2])} y={Math.min(currentPoints[1], currentPoints[3])}
                        width={Math.abs(currentPoints[2] - currentPoints[0])} height={Math.abs(currentPoints[3] - currentPoints[1])}
                        stroke="black" strokeWidth={3} />
                ) : (
                    <Line points={currentPoints} stroke={selectedTool === 'wall_draw' ? "black" : "#166534"}
                        strokeWidth={3} dash={selectedTool === 'route_backup' ? [10, 5] : []} />
                )}
              </>
          )}

          {/* Elements Layer */}
          <Group visible={layers.find(l => l.id === 'elements')?.visible} listening={!layers.find(l => l.id === 'elements')?.locked}>
              {elements.map((el) => (
                <Group
                  key={el.id} name={el.id} x={el.x} y={el.y} rotation={el.rotation} scaleX={el.scale} scaleY={el.scale}
                  draggable={selectedTool === 'select'}
                  onClick={(e) => { e.cancelBubble = true; if(selectedTool === 'select') setSelectedElementId(el.id); }}
                  onDragEnd={(e) => { updateElement(el.id, { x: e.target.x(), y: e.target.y() }); }}
                  onTransformEnd={(e) => { const node = e.target; updateElement(el.id, { x: node.x(), y: node.y(), rotation: node.rotation(), scale: node.scaleX() }); }}
                >
                   {el.type === 'text' ? (
                       <Text text={el.text || "Текст"} fontSize={14} fill="black" fontStyle="bold" />
                   ) : ( <SymbolRenderer type={el.type} /> )}
                </Group>
              ))}
          </Group>
          <Transformer ref={transformerRef} />

          {guides.map((guide, i) => (
              <Line
                key={i}
                points={guide.points}
                stroke="#ff0000"
                strokeWidth={1}
                dash={[4, 4]}
              />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
