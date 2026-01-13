import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Stage, Layer, Line, Group, Rect, Arrow, Transformer, Text } from 'react-konva';
import { usePlanStore } from '@/lib/store';
import { ElementType } from '@/lib/types';
import Konva from 'konva';
import { SymbolRenderer } from './icons';
import { PropertiesPanel } from './PropertiesPanel';
import { ContextMenu } from './ContextMenu';

interface GuideLine {
    points: number[];
    orientation: 'vertical' | 'horizontal';
}

export function PlanCanvas() {
  const { 
    elements, routes, walls, selectedTool, addElement, updateElement, 
    selectedElementId, setSelectedElementId, addRoute, addWall, addRoom,
    removeElement, removeRoute, removeWall, setSelectedTool
  } = usePlanStore();
  
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [guides, setGuides] = useState<GuideLine[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, elementId?: string } | null>(null);

  const gridSize = 20;
  const SNAP_THRESHOLD = 10;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  const width = window.innerWidth;
  const height = window.innerHeight;

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
    if (e.evt.button === 2) return; // Ignore right click for drawing
    setContextMenu(null);

    const stage = e.target.getStage();
    if (!stage) return;
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
      // Clear guides initially
      setGuides([]);

      const target = e.target;
      const targetId = target.name(); // Element ID

      // We only snap if "select" tool and CTRL is NOT pressed (or IS pressed? Standard is snap ON by default)
      // Let's implement snap ON by default, hold CTRL to disable.
      if (e.evt.ctrlKey) return;

      const stage = target.getStage();
      if (!stage) return;

      const targetRect = target.getClientRect();
      const targetCenterX = targetRect.x + targetRect.width / 2;
      const targetCenterY = targetRect.y + targetRect.height / 2;

      // Find possible snap lines
      const newGuides: GuideLine[] = [];
      let snapX: number | null = null;
      let snapY: number | null = null;

      // Collect all interesting points (centers of other elements)
      // Optimization: In a real large app, use a spatial index (QuadTree). Here, array iteration is fine for <100 elements.
      elements.forEach(el => {
          if (el.id === targetId) return; // Skip self

          // Get screen coords (approximate since we store logical coords, but elements are simple)
          // Actually, we should compare logical coords (el.x, el.y) directly since elements are grouped and transformed.
          // The dragged element (e.target) position is updated in real-time.
          // But Konva DragMove updates the Node position.

          // Let's keep it simple: Snap to grid AND align with others X/Y
          if (Math.abs(target.x() - el.x) < SNAP_THRESHOLD) {
              snapX = el.x;
              newGuides.push({ points: [el.x, -5000, el.x, 5000], orientation: 'vertical' });
          }
          if (Math.abs(target.y() - el.y) < SNAP_THRESHOLD) {
              snapY = el.y;
              newGuides.push({ points: [-5000, el.y, 5000, el.y], orientation: 'horizontal' });
          }
      });

      // Also snap to grid if no object snap
      if (snapX === null && Math.abs(target.x() % gridSize) < 5) {
          // snapX = Math.round(target.x() / gridSize) * gridSize;
      }

      if (snapX !== null) {
          target.x(snapX);
      }
      if (snapY !== null) {
          target.y(snapY);
      }

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
      const stage = e.target.getStage();
      // Use client coordinates for the fixed-position menu
      const x = e.evt.clientX;
      const y = e.evt.clientY;

      if (stage) {
          const shape = e.target;
          const group = shape.findAncestor('Group') || (shape.nodeType === 'Group' ? shape : null);
          const elementId = group?.name();

          if (elementId) {
              setSelectedElementId(elementId);
          }

          setContextMenu({
              x: x,
              y: y,
              elementId: elementId || undefined
          });
      }
  };

  const gridLines = useMemo(() => {
    const lines = [];
    const renderGridSize = 3000;
    for (let i = 0; i < renderGridSize / gridSize; i++) {
        lines.push(<Line key={`v-${i}`} points={[i * gridSize, 0, i * gridSize, renderGridSize]} stroke="#f3f4f6" strokeWidth={1} />);
    }
    for (let j = 0; j < renderGridSize / gridSize; j++) {
        lines.push(<Line key={`h-${j}`} points={[0, j * gridSize, renderGridSize, j * gridSize]} stroke="#f3f4f6" strokeWidth={1} />);
    }
    return lines;
  }, [gridSize]);

  return (
    <div className="bg-white shadow-sm border border-border rounded-md overflow-hidden flex-1 relative"
         onContextMenu={(e) => e.preventDefault()}>
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
        width={width} height={height} draggable={selectedTool === 'select'}
        onWheel={handleWheel} scaleX={stageScale} scaleY={stageScale} x={stagePos.x} y={stagePos.y}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={handleDoubleClick}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onContextMenu={handleContextMenu}
        className="cursor-crosshair bg-gray-50"
      >
        <Layer>
          <Group>{gridLines}</Group>
          {walls.map((wall) => (
            <Line
              key={wall.id} name={wall.id} points={wall.points.flatMap(p => [p.x, p.y])}
              stroke={selectedElementId === wall.id ? "#2563EB" : "black"} strokeWidth={selectedElementId === wall.id ? 4 : 3}
              onClick={(e) => { e.cancelBubble = true; if(selectedTool === 'select') setSelectedElementId(wall.id); }}
            />
          ))}
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
          {elements.map((el) => (
            <Group
              key={el.id} name={el.id} x={el.x} y={el.y} rotation={el.rotation} scaleX={el.scale} scaleY={el.scale}
              draggable={selectedTool === 'select'}
              onClick={(e) => { e.cancelBubble = true; if(selectedTool === 'select') setSelectedElementId(el.id); }}
              onDragEnd={(e) => { updateElement(el.id, { x: e.target.x(), y: e.target.y() }); }}
              // We use onDragMove for snapping, but we also need to update React state eventually or trust Konva's internal state during drag
              // onDragMove logic is in the Stage prop
              onTransformEnd={(e) => { const node = e.target; updateElement(el.id, { x: node.x(), y: node.y(), rotation: node.rotation(), scale: node.scaleX() }); }}
            >
               {el.type === 'text' ? (
                   <Text text={el.text || "Текст"} fontSize={14} fill="black" fontStyle="bold" />
               ) : ( <SymbolRenderer type={el.type} /> )}
            </Group>
          ))}
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
