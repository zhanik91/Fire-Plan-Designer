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
        { id: 'e4', type: 'you_are_here', x: 350, y: 250, rotation: 0, scale: 1 },
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
        { id: 'fa1', type: 'first_aid', x: 600, y: 100, rotation: 0, scale: 1 },
      ]
    }
  },
  {
    name: 'warehouse',
    label: 'Склад (Большой)',
    data: {
      metadata: { buildingName: 'Складской комплекс', floor: '1' },
      walls: [
        // External
        { id: 'w1', points: [{ x: 50, y: 50 }, { x: 750, y: 50 }] },
        { id: 'w2', points: [{ x: 750, y: 50 }, { x: 750, y: 550 }] },
        { id: 'w3', points: [{ x: 750, y: 550 }, { x: 50, y: 550 }] },
        { id: 'w4', points: [{ x: 50, y: 550 }, { x: 50, y: 50 }] },
        // Racks/Inner partitions
        { id: 'w5', points: [{ x: 150, y: 150 }, { x: 150, y: 450 }] },
        { id: 'w6', points: [{ x: 300, y: 150 }, { x: 300, y: 450 }] },
        { id: 'w7', points: [{ x: 450, y: 150 }, { x: 450, y: 450 }] },
        { id: 'w8', points: [{ x: 600, y: 150 }, { x: 600, y: 450 }] },
      ],
      elements: [
        { id: 'ex1', type: 'exit', x: 50, y: 300, rotation: 270, scale: 1 },
        { id: 'ex2', type: 'exit', x: 750, y: 300, rotation: 90, scale: 1 },
        { id: 'ex3', type: 'exit', x: 400, y: 550, rotation: 180, scale: 1 },
        { id: 'ext1', type: 'extinguisher', x: 100, y: 100, rotation: 0, scale: 1 },
        { id: 'ext2', type: 'extinguisher', x: 700, y: 100, rotation: 0, scale: 1 },
        { id: 'ext3', type: 'extinguisher', x: 100, y: 500, rotation: 0, scale: 1 },
        { id: 'ext4', type: 'extinguisher', x: 700, y: 500, rotation: 0, scale: 1 },
        { id: 'fh1', type: 'fire_hose', x: 400, y: 50, rotation: 0, scale: 1 },
        { id: 'al1', type: 'alarm', x: 60, y: 280, rotation: 0, scale: 1 },
        { id: 'st1', type: 'stairs', x: 720, y: 520, rotation: 0, scale: 1 },
      ]
    }
  },
  {
      name: 'school_floor',
      label: 'Этаж школы',
      data: {
          metadata: { buildingName: 'Школа №5', floor: '2' },
          walls: [
              // Corridor
              { id: 'w1', points: [{ x: 50, y: 200 }, { x: 750, y: 200 }] },
              { id: 'w2', points: [{ x: 50, y: 300 }, { x: 750, y: 300 }] },
              // Classrooms Top
              { id: 'w3', points: [{ x: 50, y: 50 }, { x: 750, y: 50 }] },
              { id: 'w4', points: [{ x: 50, y: 50 }, { x: 50, y: 200 }] },
              { id: 'w5', points: [{ x: 250, y: 50 }, { x: 250, y: 200 }] },
              { id: 'w6', points: [{ x: 500, y: 50 }, { x: 500, y: 200 }] },
              { id: 'w7', points: [{ x: 750, y: 50 }, { x: 750, y: 200 }] },
              // Classrooms Bottom
              { id: 'w8', points: [{ x: 50, y: 300 }, { x: 50, y: 450 }] },
              { id: 'w9', points: [{ x: 250, y: 300 }, { x: 250, y: 450 }] },
              { id: 'w10', points: [{ x: 500, y: 300 }, { x: 500, y: 450 }] },
              { id: 'w11', points: [{ x: 750, y: 300 }, { x: 750, y: 450 }] },
              { id: 'w12', points: [{ x: 50, y: 450 }, { x: 750, y: 450 }] },
          ],
          elements: [
              { id: 'st1', type: 'stairs', x: 60, y: 210, rotation: 0, scale: 1 },
              { id: 'st2', type: 'stairs', x: 740, y: 210, rotation: 0, scale: 1 },
              { id: 'ex1', type: 'exit', x: 10, y: 250, rotation: 270, scale: 1 }, // Left exit
              { id: 'ex2', type: 'exit', x: 790, y: 250, rotation: 90, scale: 1 }, // Right exit
              { id: 'ext1', type: 'extinguisher', x: 400, y: 210, rotation: 0, scale: 1 },
              { id: 'fa1', type: 'first_aid', x: 420, y: 210, rotation: 0, scale: 1 },
              { id: 'ap1', type: 'assembly_point', x: 400, y: 500, rotation: 0, scale: 1 }, // Outside?
          ]
      }
  }
];
