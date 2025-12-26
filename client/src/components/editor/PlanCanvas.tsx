import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line, Group, Rect, Text, Circle, Arrow } from 'react-konva';
import { usePlanStore } from '@/lib/store';
import { ElementType, PlanElement } from '@/lib/types';
import Konva from 'konva';

// Symbol Components
const SymbolRenderer = ({ type }: { type: ElementType }) => {
  switch (type) {
    case 'exit':
      return (
        <Group>
          <Rect width={60} height={30} fill="#388E3C" cornerRadius={2} />
          <Text text="ВЫХОД" fontSize={14} fill="white" width={60} height={30} align="center" verticalAlign="middle" fontStyle="bold" fontFamily="Roboto" />
        </Group>
      );
    case 'extinguisher':
      return (
        <Group>
          <Rect width={30} height={30} fill="#D32F2F" cornerRadius={2} />
          <Text text="🧯" fontSize={20} width={30} height={30} align="center" verticalAlign="middle" />
        </Group>
      );
    case 'fire_hose':
      return (
        <Group>
          <Rect width={30} height={30} fill="#D32F2F" cornerRadius={2} />
          <Text text="F" fontSize={20} fill="white" width={30} height={30} align="center" verticalAlign="middle" fontStyle="bold" />
        </Group>
      );
    case 'phone':
      return (
        <Group>
          <Rect width={30} height={30} fill="#D32F2F" cornerRadius={2} />
          <Text text="📞" fontSize={20} width={30} height={30} align="center" verticalAlign="middle" />
        </Group>
      );
    case 'alarm':
      return (
        <Group>
            <Rect width={30} height={30} fill="#D32F2F" cornerRadius={2} />
            <Circle x={15} y={15} radius={8} fill="white" />
            <Circle x={15} y={15} radius={4} fill="#D32F2F" />
        </Group>
        );
    case 'you_are_here':
      return (
        <Group>
          <Circle radius={15} fill="#1976D2" />
          <Circle radius={5} fill="white" />
          <Text text="Вы здесь" fontSize={12} fill="black" y={20} width={80} x={-40} align="center" fontFamily="Roboto"/>
        </Group>
      );
    default:
      return null;
  }
};

export function PlanCanvas() {
  const { 
    elements, routes, walls, selectedTool, addElement, updateElement, 
    selectedElementId, setSelectedElementId, addRoute, addWall 
  } = usePlanStore();
  
  const stageRef = useRef<Konva.Stage>(null);
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

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

    if (selectedTool === 'route' || selectedTool === 'wall_draw') {
        setIsDrawing(true);
        setCurrentPoints([x, y]);
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

    // For line drawing, we just update the last point to preview
    // But typically for click-to-click polyline we might want different behavior
    // Here let's do simple drag-to-draw or click-click. 
    // Let's implement: Click to start, drag to preview line, release to finish segment?
    // Actually, simpler: Mouse down starts, Mouse Move updates end, Mouse Up finishes.
    
    // Let's do simple 2-point lines for now per drag for walls, or polyline for routes.
    // For MVP robustness: Click-Drag-Release creates a segment.
    
    if (currentPoints.length >= 2) {
        const newPoints = [...currentPoints];
        newPoints[newPoints.length - 2] = currentPoints[0]; // Start
        newPoints[newPoints.length - 1] = x; // Update End x
        newPoints.push(y); // Update End y - wait, flat array [x1, y1, x2, y2]
        
        setCurrentPoints([currentPoints[0], currentPoints[1], x, y]);
    } else {
        setCurrentPoints([...currentPoints, x, y]);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
        if (currentPoints.length === 4) { // x1,y1, x2,y2
            const points = [{x: currentPoints[0], y: currentPoints[1]}, {x: currentPoints[2], y: currentPoints[3]}];
            if (selectedTool === 'route') {
                addRoute(points);
            } else if (selectedTool === 'wall_draw') {
                addWall(points);
            }
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
        className="cursor-crosshair bg-white"
      >
        <Layer>
          {gridLines}
          
          {/* Walls */}
          {walls.map((wall) => (
            <Line
              key={wall.id}
              points={wall.points.flatMap(p => [p.x, p.y])}
              stroke="black"
              strokeWidth={3}
              lineCap="round"
              lineJoin="round"
            />
          ))}

           {/* Routes */}
           {routes.map((route) => (
            <Arrow
              key={route.id}
              points={route.points.flatMap(p => [p.x, p.y])}
              stroke="#388E3C"
              strokeWidth={3}
              fill="#388E3C"
              pointerLength={10}
              pointerWidth={10}
              dash={[10, 5]}
            />
          ))}

          {/* Drawing Preview */}
          {isDrawing && (
              <Line
                points={currentPoints}
                stroke={selectedTool === 'wall_draw' ? "black" : "#388E3C"}
                strokeWidth={3}
                dash={selectedTool === 'route' ? [10, 5] : []}
              />
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
