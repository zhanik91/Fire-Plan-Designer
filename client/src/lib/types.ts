export type ElementType = 
  | 'wall' 
  | 'window' 
  | 'door' 
  | 'exit' 
  | 'extinguisher' 
  | 'fire_hose' 
  | 'phone' 
  | 'alarm' 
  | 'you_are_here';

export interface PlanElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface PlanRoute {
  id: string;
  points: Point[];
}

export interface PlanWall {
    id: string;
    points: Point[];
}

export interface PlanMetadata {
  buildingName: string;
  floor: string;
  responsible: string;
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
  you_are_here: 'Вы находитесь здесь'
};
