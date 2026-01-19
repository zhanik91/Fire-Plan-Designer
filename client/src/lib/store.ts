import { create } from 'zustand';
import { temporal } from 'zundo';
import { PlanElement, PlanRoute, PlanMetadata, ElementType, Point, PlanWall, RouteType, PlanLayer } from './types';
import { v4 as uuidv4 } from 'uuid';

interface PlanState {
  elements: PlanElement[];
  routes: PlanRoute[];
  walls: PlanWall[];
  layers: PlanLayer[];
  metadata: PlanMetadata;
  selectedTool: ElementType | 'select' | 'route_main' | 'route_backup' | 'wall_draw' | 'room' | 'erase' | 'magic_route';
  selectedElementId: string | null;
  isAssistantOpen: boolean;
  
  addElement: (type: ElementType, x: number, y: number) => void;
  updateElement: (id: string, updates: Partial<PlanElement>) => void;
  removeElement: (id: string) => void;
  
  addRoute: (points: Point[], type: RouteType) => void;
  removeRoute: (id: string) => void;

  addWall: (points: Point[]) => void;
  addRoom: (walls: {id: string, points: Point[]}[]) => void;
  removeWall: (id: string) => void;

  // Layer Actions
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  
  setMetadata: (updates: Partial<PlanMetadata>) => void;
  setSelectedTool: (tool: PlanState['selectedTool']) => void;
  setSelectedElementId: (id: string | null) => void;
  setAssistantOpen: (isOpen: boolean) => void;
  clearPlan: () => void;
  loadTemplate: (templateData: { elements: PlanElement[], walls: PlanWall[], metadata: Partial<PlanMetadata> }) => void;
}

export const usePlanStore = create<PlanState>()(
  temporal(
    (set) => ({
      elements: [],
      routes: [],
      walls: [],
      layers: [
        { id: 'walls', name: 'Стены', visible: true, locked: false, order: 0 },
        { id: 'elements', name: 'Объекты', visible: true, locked: false, order: 1 },
        { id: 'routes', name: 'Маршруты', visible: true, locked: false, order: 2 },
      ],
      metadata: {
        buildingName: 'Офисное здание №1',
        floor: '1',
        responsible: 'Иванов И.И.',
      },
      selectedTool: 'select',
      selectedElementId: null,
      isAssistantOpen: false,

      addElement: (type, x, y) => set((state) => ({
        elements: [...state.elements, {
          id: uuidv4(),
          type,
          x,
          y,
          rotation: 0,
          scale: 1,
          text: type === 'text' ? 'Текст' : undefined
        }]
      })),

      updateElement: (id, updates) => set((state) => ({
        elements: state.elements.map((el) => 
          el.id === id ? { ...el, ...updates } : el
        )
      })),

      removeElement: (id) => set((state) => ({
        elements: state.elements.filter((el) => el.id !== id)
      })),

      addRoute: (points, type) => set((state) => ({
        routes: [...state.routes, { id: uuidv4(), points, type }]
      })),

      removeRoute: (id) => set((state) => ({
        routes: state.routes.filter((r) => r.id !== id)
      })),

      addWall: (points) => set((state) => ({
        walls: [...state.walls, { id: uuidv4(), points }]
      })),

      addRoom: (newWalls) => set((state) => ({
        walls: [...state.walls, ...newWalls]
      })),

      removeWall: (id) => set((state) => ({
        walls: state.walls.filter((w) => w.id !== id)
      })),

      toggleLayerVisibility: (id) => set((state) => ({
        layers: state.layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l)
      })),

      toggleLayerLock: (id) => set((state) => ({
        layers: state.layers.map(l => l.id === id ? { ...l, locked: !l.locked } : l)
      })),

      setMetadata: (updates) => set((state) => ({
        metadata: { ...state.metadata, ...updates }
      })),

      setSelectedTool: (tool) => set({ selectedTool: tool }),
      setSelectedElementId: (id) => set({ selectedElementId: id }),
      setAssistantOpen: (isOpen) => set({ isAssistantOpen: isOpen }),
      
      clearPlan: () => set({
        elements: [],
        routes: [],
        walls: [],
        metadata: {
            buildingName: 'Офисное здание №1',
            floor: '1',
            responsible: 'Иванов И.И.',
        },
        selectedElementId: null
      }),

      loadTemplate: (data) => set((state) => ({
        routes: [],
        selectedElementId: null,
        walls: data.walls.map(w => ({ ...w, id: uuidv4() })),
        elements: data.elements.map(e => ({ ...e, id: uuidv4() })),
        metadata: { ...state.metadata, ...data.metadata }
      }))
    }),
    {
      partialize: (state) => {
        const { elements, routes, walls, metadata } = state;
        return { elements, routes, walls, metadata };
      },
      limit: 100
    }
  )
);
