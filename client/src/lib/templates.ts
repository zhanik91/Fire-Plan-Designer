import { PlanElement, PlanWall, PlanMetadata } from './types';

export interface PlanTemplate {
  name: string;
  label: string;
  data: {
    walls: PlanWall[];
    elements: PlanElement[];
    metadata: Partial<PlanMetadata>;
  };
}

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    name: 'office',
    label: 'Офис (малый)',
    data: {
      metadata: { buildingName: 'Офисный центр', floor: '3' },
      walls: [
        { id: 'w1', points: [{ x: 100, y: 100 }, { x: 100, y: 400 }] },
        { id: 'w2', points: [{ x: 100, y: 400 }, { x: 500, y: 400 }] },
        { id: 'w3', points: [{ x: 500, y: 400 }, { x: 500, y: 100 }] },
        { id: 'w4', points: [{ x: 500, y: 100 }, { x: 100, y: 100 }] },
        // Перегородка
        { id: 'w5', points: [{ x: 300, y: 100 }, { x: 300, y: 300 }] },
      ],
      elements: [
        { id: 'e1', type: 'door', x: 100, y: 250, rotation: 90, scale: 1 },
        { id: 'e2', type: 'extinguisher', x: 450, y: 150, rotation: 0, scale: 1 },
        { id: 'e3', type: 'exit', x: 100, y: 220, rotation: 270, scale: 1 },
      ]
    }
  },
  {
    name: 'classroom',
    label: 'Учебный класс',
    data: {
      metadata: { buildingName: 'Школа №1', floor: '2' },
      walls: [
        { id: 'w1', points: [{ x: 50, y: 50 }, { x: 50, y: 450 }] },
        { id: 'w2', points: [{ x: 50, y: 450 }, { x: 650, y: 450 }] },
        { id: 'w3', points: [{ x: 650, y: 450 }, { x: 650, y: 50 }] },
        { id: 'w4', points: [{ x: 650, y: 50 }, { x: 50, y: 50 }] },
      ],
      elements: [
        { id: 'd1', type: 'door', x: 50, y: 400, rotation: 90, scale: 1 },
        { id: 'd2', type: 'door', x: 650, y: 400, rotation: 90, scale: 1 },
        { id: 'al1', type: 'alarm', x: 600, y: 60, rotation: 0, scale: 1 },
      ]
    }
  }
];
