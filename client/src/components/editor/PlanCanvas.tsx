import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line, Group, Rect, Arrow, Transformer } from 'react-konva';
import { usePlanStore } from '@/lib/store';
import { ElementType } from '@/lib/types';
import Konva from 'konva';
import { SymbolRenderer } from './icons';
import { PropertiesPanel } from './PropertiesPanel';
import { Text as KonvaText } from 'react-konva';

export function PlanCanvas() {
  const { 
    elements, routes, walls, selectedTool, addElement, updateElement, 
    selectedElementId, setSelectedElementId, addRoute, addWall, addRoom,
    removeElement, removeRoute, removeWall, metadata
  } = usePlanStore();
  
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Zoom / Pan State
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

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
  const width = window.innerWidth;
  const height = window.innerHeight; // Infinite canvas view
  const gridSize = 20;

  useEffect(() => {
    if (selectedElementId && transformerRef.current) {
        // We need to find the node.
        // Konva Transformer needs to attach to a Node.
        // Since we render declarative components, we can try to find them by name/id or ref.
        // Or we can manually attach if we have the ref of the selected item.
        // It's easier if we give each item a 'name' prop equal to its ID.
        const stage = transformerRef.current.getStage();
        const selectedNode = stage?.findOne('.' + selectedElementId);

        if (selectedNode) {
            transformerRef.current.nodes([selectedNode]);
            transformerRef.current.getLayer()?.batchDraw();
        } else {
             transformerRef.current.nodes([]);
        }
    } else {
        transformerRef.current?.nodes([]);
    }
  }, [selectedElementId, elements, routes, walls]);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setStageScale(newScale);
    setStagePos({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    // Transform pointer position to relative stage coordinates for drawing
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const localPos = transform.point(pos);

    // Snap to grid
    const x = Math.round(localPos.x / gridSize) * gridSize;
    const y = Math.round(localPos.y / gridSize) * gridSize;

    if (selectedTool === 'select') {
      // If we are in select mode, we are handled by click handlers on objects or stage (for deselect)
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

    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const localPos = transform.point(pos);

    const x = Math.round(localPos.x / gridSize) * gridSize;
    const y = Math.round(localPos.y / gridSize) * gridSize;

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
  const renderGridSize = 2000; // Render a large grid area
  for (let i = 0; i < renderGridSize / gridSize; i++) {
    gridLines.push(
      <Line
        key={`v-${i}`}
        points={[i * gridSize, 0, i * gridSize, renderGridSize]}
        stroke="#e5e7eb"
        strokeWidth={1}
      />
    );
  }
  for (let j = 0; j < renderGridSize / gridSize; j++) {
    gridLines.push(
      <Line
        key={`h-${j}`}
        points={[0, j * gridSize, renderGridSize, j * gridSize]}
        stroke="#e5e7eb"
        strokeWidth={1}
      />
    );
  }

  return (
    <div className="bg-white shadow-sm border border-border rounded-md overflow-hidden flex-1 relative">
      <PropertiesPanel />
      <Stage
        width={width}
        height={height}
        draggable={selectedTool === 'select'}
        onWheel={handleWheel}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={handleDoubleClick}
        className="cursor-crosshair bg-gray-50"
      >
        <Layer>
          <Group>{gridLines}</Group>
          
          {/* Walls */}
          {walls.map((wall) => {
            const isSelected = selectedElementId === wall.id;
            const len = Math.sqrt(
                Math.pow(wall.points[1].x - wall.points[0].x, 2) +
                Math.pow(wall.points[1].y - wall.points[0].y, 2)
            );
            const meters = (len / (metadata.pixelsPerMeter || 20)).toFixed(2);

            return (
            <Group key={wall.id}>
                <Line
                name={wall.id} // Important for Transformer
                points={wall.points.flatMap(p => [p.x, p.y])}
                stroke={isSelected ? "#2563EB" : "black"}
                strokeWidth={isSelected ? 4 : 3}
                lineCap="round"
                lineJoin="round"
                onClick={(e) => {
                    e.cancelBubble = true;
                    if (selectedTool === 'select') setSelectedElementId(wall.id);
                }}
                onTap={(e) => {
                    e.cancelBubble = true;
                    if (selectedTool === 'select') setSelectedElementId(wall.id);
                }}
                />
                {isSelected && (
                    <KonvaText
                        x={(wall.points[0].x + wall.points[1].x) / 2}
                        y={(wall.points[0].y + wall.points[1].y) / 2 - 15}
                        text={`${meters} м`}
                        fontSize={14}
                        fill="#2563EB"
                        align="center"
                    />
                )}
            </Group>
          )})}

           {/* Routes */}
           {routes.map((route) => (
            <Arrow
              key={route.id}
              name={route.id}
              points={route.points.flatMap(p => [p.x, p.y])}
              stroke={selectedElementId === route.id ? "#2563EB" : "#388E3C"}
              strokeWidth={selectedElementId === route.id ? 4 : 3}
              fill={selectedElementId === route.id ? "#2563EB" : "#388E3C"}
              pointerLength={10}
              pointerWidth={10}
              dash={[10, 5]}
              onClick={(e) => {
                 e.cancelBubble = true;
                 if (selectedTool === 'select') setSelectedElementId(route.id);
              }}
              onTap={(e) => {
                 e.cancelBubble = true;
                 if (selectedTool === 'select') setSelectedElementId(route.id);
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
              name={el.id}
              x={el.x}
              y={el.y}
              rotation={el.rotation}
              scaleX={el.scale}
              scaleY={el.scale}
              draggable={selectedTool === 'select'}
              onClick={(e) => {
                e.cancelBubble = true;
                if(selectedTool === 'select') setSelectedElementId(el.id)
              }}
              onDragEnd={(e) => {
                updateElement(el.id, {
                  x: e.target.x(),
                  y: e.target.y()
                });
              }}
              onTransformEnd={(e) => {
                 const node = e.target;
                 updateElement(el.id, {
                    x: node.x(),
                    y: node.y(),
                    rotation: node.rotation(),
                    scale: node.scaleX(), // Assuming uniform scale
                 });
                 // Reset scale to 1 in store if you want, but Konva keeps it.
                 // Usually better to sync.
              }}
            >
               <SymbolRenderer type={el.type} />
            </Group>
          ))}

          <Transformer
             ref={transformerRef}
             boundBoxFunc={(oldBox, newBox) => {
                 // limit resize
                 if (newBox.width < 5 || newBox.height < 5) {
                     return oldBox;
                 }
                 return newBox;
             }}
          />
        </Layer>
      </Stage>
    </div>
  );
}
