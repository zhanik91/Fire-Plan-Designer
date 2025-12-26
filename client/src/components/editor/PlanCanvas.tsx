import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line, Group, Rect, Arrow } from 'react-konva';
import { usePlanStore } from '@/lib/store';
import { ElementType } from '@/lib/types';
import Konva from 'konva';
import { SymbolRenderer } from './icons';

export function PlanCanvas() {
  const { 
    elements, routes, walls, selectedTool, addElement, updateElement, 
    selectedElementId, setSelectedElementId, addRoute, addWall, addRoom,
    removeElement, removeRoute, removeWall
  } = usePlanStore();
  
  const stageRef = useRef<Konva.Stage>(null);
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Keyboard support for delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        // Try to remove from all lists
        removeElement(selectedElementId);
        removeRoute(selectedElementId);
        removeWall(selectedElementId);
        setSelectedElementId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId]);

  // Grid sizing
  const width = 800; // A4 proportional ish
  const height = 600;
  const gridSize = 20;

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Snap to grid
    const x = Math.round(pos.x / gridSize) * gridSize;
    const y = Math.round(pos.y / gridSize) * gridSize;

    if (selectedTool === 'select') {
      const clickedOnEmpty = e.target === stage.getStage();
      if (clickedOnEmpty) {
        setSelectedElementId(null);
      }
      return;
    }

    if (['extinguisher', 'fire_hose', 'phone', 'alarm', 'exit', 'you_are_here'].includes(selectedTool)) {
      addElement(selectedTool as ElementType, x, y);
      return;
    }

    if (selectedTool === 'wall_draw') {
        setIsDrawing(true);
        setCurrentPoints([x, y, x, y]); // Start point and current point
    } else if (selectedTool === 'route') {
        if (!isDrawing) {
            setIsDrawing(true);
            setCurrentPoints([x, y, x, y]);
        } else {
             // Add new point
             const newPoints = [...currentPoints, x, y];
             setCurrentPoints(newPoints);
        }
    } else if (selectedTool === 'room') {
        setIsDrawing(true);
        setCurrentPoints([x, y, x, y]); // Start point and current point
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return;
    
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const x = Math.round(pos.x / gridSize) * gridSize;
    const y = Math.round(pos.y / gridSize) * gridSize;

    if (selectedTool === 'wall_draw' || selectedTool === 'room') {
        // Update the end point
        setCurrentPoints([currentPoints[0], currentPoints[1], x, y]);
    } else if (selectedTool === 'route') {
        // Update the last point
        const newPoints = [...currentPoints];
        newPoints[newPoints.length - 2] = x;
        newPoints[newPoints.length - 1] = y;
        setCurrentPoints(newPoints);
    }
  };

  const handleMouseUp = () => {
    if (selectedTool === 'wall_draw' && isDrawing) {
        if (currentPoints.length === 4) { // x1,y1, x2,y2
            const points = [{x: currentPoints[0], y: currentPoints[1]}, {x: currentPoints[2], y: currentPoints[3]}];
            if (points[0].x !== points[1].x || points[0].y !== points[1].y) {
                 addWall(points);
            }
        }
        setIsDrawing(false);
        setCurrentPoints([]);
    } else if (selectedTool === 'room' && isDrawing) {
        const x1 = currentPoints[0];
        const y1 = currentPoints[1];
        const x2 = currentPoints[2];
        const y2 = currentPoints[3];

        if (x1 !== x2 || y1 !== y2) {
             const walls = [
                { id: crypto.randomUUID(), points: [{x: x1, y: y1}, {x: x2, y: y1}] }, // Top
                { id: crypto.randomUUID(), points: [{x: x2, y: y1}, {x: x2, y: y2}] }, // Right
                { id: crypto.randomUUID(), points: [{x: x2, y: y2}, {x: x1, y: y2}] }, // Bottom
                { id: crypto.randomUUID(), points: [{x: x1, y: y2}, {x: x1, y: y1}] }  // Left
             ];
             addRoom(walls);
        }
        setIsDrawing(false);
        setCurrentPoints([]);
    }
  };

  // Add Double Click for finishing route
  const handleDoubleClick = () => {
      if (selectedTool === 'route' && isDrawing) {
          if (currentPoints.length >= 4) {
              const points = [];
              for (let i = 0; i < currentPoints.length; i += 2) {
                  points.push({x: currentPoints[i], y: currentPoints[i+1]});
              }
              // Remove the last point because it tracks the mouse
              // Actually, we want to keep the clicked point.
              // Logic: Click adds a point. Moving updates the "next" segment.
              // Double click usually signifies "finish here".
              // So we take all points.
              addRoute(points);
          }
          setIsDrawing(false);
          setCurrentPoints([]);
      }
  };

  // Render Grid
  const gridLines = [];
  for (let i = 0; i < width / gridSize; i++) {
    gridLines.push(
      <Line
        key={`v-${i}`}
        points={[i * gridSize, 0, i * gridSize, height]}
        stroke="#e5e7eb"
        strokeWidth={1}
      />
    );
  }
  for (let j = 0; j < height / gridSize; j++) {
    gridLines.push(
      <Line
        key={`h-${j}`}
        points={[0, j * gridSize, width, j * gridSize]}
        stroke="#e5e7eb"
        strokeWidth={1}
      />
    );
  }

  return (
    <div className="bg-white shadow-sm border border-border rounded-md overflow-hidden">
      <Stage
        width={width}
        height={height}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={handleDoubleClick}
        className="cursor-crosshair bg-white"
      >
        <Layer>
          {gridLines}
          
          {/* Walls */}
          {walls.map((wall) => (
            <Line
              key={wall.id}
              points={wall.points.flatMap(p => [p.x, p.y])}
              stroke={selectedElementId === wall.id ? "#2563EB" : "black"}
              strokeWidth={selectedElementId === wall.id ? 4 : 3}
              lineCap="round"
              lineJoin="round"
              onClick={() => {
                if (selectedTool === 'select') {
                  setSelectedElementId(wall.id);
                }
              }}
              onTap={() => {
                if (selectedTool === 'select') {
                  setSelectedElementId(wall.id);
                }
              }}
            />
          ))}

           {/* Routes */}
           {routes.map((route) => (
            <Arrow
              key={route.id}
              points={route.points.flatMap(p => [p.x, p.y])}
              stroke={selectedElementId === route.id ? "#2563EB" : "#388E3C"}
              strokeWidth={selectedElementId === route.id ? 4 : 3}
              fill={selectedElementId === route.id ? "#2563EB" : "#388E3C"}
              pointerLength={10}
              pointerWidth={10}
              dash={[10, 5]}
              onClick={() => {
                if (selectedTool === 'select') {
                  setSelectedElementId(route.id);
                }
              }}
              onTap={() => {
                if (selectedTool === 'select') {
                  setSelectedElementId(route.id);
                }
              }}
            />
          ))}

          {/* Drawing Preview */}
          {isDrawing && (
              <>
                {selectedTool === 'room' ? (
                     <Rect
                        x={Math.min(currentPoints[0], currentPoints[2])}
                        y={Math.min(currentPoints[1], currentPoints[3])}
                        width={Math.abs(currentPoints[2] - currentPoints[0])}
                        height={Math.abs(currentPoints[3] - currentPoints[1])}
                        stroke="black"
                        strokeWidth={3}
                     />
                ) : (
                    <Line
                        points={currentPoints}
                        stroke={selectedTool === 'wall_draw' ? "black" : "#388E3C"}
                        strokeWidth={3}
                        dash={selectedTool === 'route' ? [10, 5] : []}
                    />
                )}
              </>
          )}

          {/* Elements */}
          {elements.map((el) => (
            <Group
              key={el.id}
              x={el.x}
              y={el.y}
              draggable={selectedTool === 'select'}
              onClick={() => {
                if(selectedTool === 'select') setSelectedElementId(el.id)
              }}
              onDragEnd={(e) => {
                updateElement(el.id, {
                  x: e.target.x(),
                  y: e.target.y()
                });
              }}
            >
               <SymbolRenderer type={el.type} />
               {selectedElementId === el.id && (
                 <Rect
                    width={el.type === 'exit' ? 60 : 30}
                    height={30}
                    stroke="#2563EB"
                    strokeWidth={2}
                    dash={[5, 5]}
                 />
               )}
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
