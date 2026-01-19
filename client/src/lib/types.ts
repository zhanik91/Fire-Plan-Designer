export type ElementType = 
  | 'wall' 
  | 'window' 
  | 'door' 
  | 'exit' 
  | 'extinguisher' 
  | 'fire_hose' 
  | 'phone' 
  | 'alarm' 
  | 'you_are_here'
  | 'text'
  | 'stairs'
  | 'first_aid'
  | 'assembly_point';

// 'magic_route' is a tool, not an element type stored in DB, but used in UI state.
// We handle it in store.ts selectedTool type.

export interface PlanElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  text?: string;
}

export interface Point {
  x: number;
  y: number;
}

export type RouteType = 'main' | 'backup';

export interface PlanRoute {
  id: string;
  points: Point[];
  type: RouteType;
}

export interface PlanWall {
  id: string;
  points: Point[];
}

export interface PlanMetadata {
  buildingName: string;
  floor: string;
  responsible: string;
  pixelsPerMeter?: number;
}

export const ELEMENT_LABELS: Record<ElementType, string> = {
  wall: 'Стена',
  window: 'Окно',
  door: 'Дверь',
  exit: 'Эвакуационный выход',
  extinguisher: 'Огнетушитель',
  fire_hose: 'Пожарный кран',
  phone: 'Телефон',
  alarm: 'Кнопка тревоги',
  you_are_here: 'Вы находитесь здесь',
  text: 'Текст',
  stairs: 'Лестница',
  first_aid: 'Аптечка',
  assembly_point: 'Точка сбора'
};
