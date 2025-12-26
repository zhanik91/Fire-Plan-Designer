import { create } from 'zustand';
import { PlanElement, PlanRoute, PlanMetadata, ElementType, Point, PlanWall } from './types';
import { v4 as uuidv4 } from 'uuid';

interface PlanState {
  elements: PlanElement[];
  routes: PlanRoute[];
  walls: PlanWall[];
  metadata: PlanMetadata;
  selectedTool: ElementType | 'select' | 'route' | 'wall_draw' | 'erase' | 'room';
  selectedElementId: string | null;
  
  // Actions
  addElement: (type: ElementType, x: number, y: number) => void;
  updateElement: (id: string, updates: Partial<PlanElement>) => void;
  removeElement: (id: string) => void;
  
  addRoute: (points: Point[]) => void;
  removeRoute: (id: string) => void;

  addWall: (points: Point[]) => void;
  removeWall: (id: string) => void;
  addRoom: (walls: PlanWall[]) => void;

  setMetadata: (updates: Partial<PlanMetadata>) => void;
  setSelectedTool: (tool: ElementType | 'select' | 'route' | 'wall_draw' | 'erase' | 'room') => void;
  setSelectedElementId: (id: string | null) => void;
  clearPlan: () => void;
}

export const usePlanStore = create<PlanState>((set) => ({
  elements: [],
  routes: [],
  walls: [],
  metadata: {
    buildingName: 'Офисное здание №1',
    floor: '1',
    responsible: 'Иванов И.И.',
  },
  selectedTool: 'select',
  selectedElementId: null,

  addElement: (type, x, y) => set((state) => ({
    elements: [...state.elements, {
      id: uuidv4(),
      type,
      x,
      y,
      rotation: 0,
      scale: 1,
    }]
  })),

  updateElement: (id, updates) => set((state) => ({
    elements: state.elements.map((el) => 
      el.id === id ? { ...el, ...updates } : el
    )
  })),

  removeElement: (id) => set((state) => ({
    elements: state.elements.filter((el) => el.id !== id),
    selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
  })),

  addRoute: (points) => set((state) => ({
    routes: [...state.routes, { id: uuidv4(), points }]
  })),

  removeRoute: (id) => set((state) => ({
    routes: state.routes.filter((r) => r.id !== id),
    selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
  })),

  addWall: (points) => set((state) => ({
    walls: [...state.walls, { id: uuidv4(), points }]
  })),

  removeWall: (id) => set((state) => ({
    walls: state.walls.filter((w) => w.id !== id),
    selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
  })),

  // For Room tool
  addRoom: (walls: PlanWall[]) => set((state) => ({
    walls: [...state.walls, ...walls]
  })),

  setMetadata: (updates) => set((state) => ({
    metadata: { ...state.metadata, ...updates }
  })),

  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  
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
  })
}));
