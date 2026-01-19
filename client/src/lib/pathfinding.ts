
import { PlanWall, Point, PlanElement } from './types';

// A* Pathfinding logic

const GRID_SIZE = 20; // Match editor grid

interface Node {
    x: number;
    y: number;
    g: number; // Cost from start
    h: number; // Heuristic to end
    f: number; // Total cost
    parent: Node | null;
}

// Heuristic: Manhattan distance (or Euclidean)
const heuristic = (a: Point, b: Point) => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

// Check if a line segment intersects a wall
const intersects = (p1: Point, p2: Point, wall: PlanWall): boolean => {
    const w1 = wall.points[0];
    const w2 = wall.points[1];

    const det = (p2.x - p1.x) * (w2.y - w1.y) - (w2.x - w1.x) * (p2.y - p1.y);
    if (det === 0) return false;

    const lambda = ((w2.y - w1.y) * (w2.x - p1.x) + (w1.x - w2.x) * (w2.y - p1.y)) / det;
    const gamma = ((p1.y - p2.y) * (w2.x - p1.x) + (p2.x - p1.x) * (w2.y - p1.y)) / det;

    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
};

// Check if a point is "safe" (not too close to a wall)
const isWalkable = (p: Point, walls: PlanWall[]): boolean => {
    const buffer = 10; // Clearance
    // Simple check: Is point strictly ON a wall?
    // For grid based, we usually check if the cell is blocked.
    // Here we check if the point is too close to any wall segment.

    // Distance from point to line segment
    for (const wall of walls) {
        const v = wall.points[0];
        const w = wall.points[1];
        const l2 = (v.x - w.x)**2 + (v.y - w.y)**2;
        if (l2 === 0) continue;
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        const projX = v.x + t * (w.x - v.x);
        const projY = v.y + t * (w.y - v.y);
        const dist = Math.sqrt((p.x - projX)**2 + (p.y - projY)**2);

        if (dist < buffer) return false;
    }
    return true;
};

// Intersection check for movement between nodes
const isPathClear = (p1: Point, p2: Point, walls: PlanWall[]): boolean => {
    for (const wall of walls) {
        if (intersects(p1, p2, wall)) return false;
    }
    // Also check clearance?
    // For simplicity, just line intersection.
    return true;
};

export const findPath = (start: Point, end: Point, walls: PlanWall[], bounds: { minX: number, maxX: number, minY: number, maxY: number }): Point[] | null => {
    // Snap start/end to grid
    const s = { x: Math.round(start.x / GRID_SIZE) * GRID_SIZE, y: Math.round(start.y / GRID_SIZE) * GRID_SIZE };
    const e = { x: Math.round(end.x / GRID_SIZE) * GRID_SIZE, y: Math.round(end.y / GRID_SIZE) * GRID_SIZE };

    const openList: Node[] = [];
    const closedList: Set<string> = new Set();
    const nodeMap: Map<string, Node> = new Map();

    const startNode: Node = { x: s.x, y: s.y, g: 0, h: heuristic(s, e), f: 0, parent: null };
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);
    nodeMap.set(`${s.x},${s.y}`, startNode);

    // Safety break
    let iterations = 0;
    const maxIterations = 5000;

    while (openList.length > 0) {
        if (iterations++ > maxIterations) break;

        // Sort by f
        openList.sort((a, b) => a.f - b.f);
        const current = openList.shift()!;
        const key = `${current.x},${current.y}`;

        if (current.x === e.x && current.y === e.y) {
            // Found
            const path: Point[] = [];
            let curr: Node | null = current;
            while (curr) {
                path.push({ x: curr.x, y: curr.y });
                curr = curr.parent;
            }
            return path.reverse();
        }

        closedList.add(key);

        // Neighbors (4 directions + diagonals?)
        // Let's stick to 4 directions for "Hallway" feel.
        const neighbors = [
            { x: current.x + GRID_SIZE, y: current.y },
            { x: current.x - GRID_SIZE, y: current.y },
            { x: current.x, y: current.y + GRID_SIZE },
            { x: current.x, y: current.y - GRID_SIZE },
        ];

        for (const neighborPos of neighbors) {
            // Bounds check
            if (neighborPos.x < bounds.minX || neighborPos.x > bounds.maxX || neighborPos.y < bounds.minY || neighborPos.y > bounds.maxY) continue;

            const neighborKey = `${neighborPos.x},${neighborPos.y}`;
            if (closedList.has(neighborKey)) continue;

            // Collision check
            // Check if walk to neighbor is blocked by wall
            if (!isPathClear(current, neighborPos, walls)) continue;
            // Check if point itself is too close to wall (e.g. inside wall thickness)
            if (!isWalkable(neighborPos, walls)) continue;

            const gScore = current.g + GRID_SIZE; // Distance is grid size

            let neighbor = nodeMap.get(neighborKey);

            if (!neighbor) {
                neighbor = {
                    x: neighborPos.x,
                    y: neighborPos.y,
                    g: gScore,
                    h: heuristic(neighborPos, e),
                    f: 0,
                    parent: current
                };
                neighbor.f = neighbor.g + neighbor.h;
                openList.push(neighbor);
                nodeMap.set(neighborKey, neighbor);
            } else if (gScore < neighbor.g) {
                neighbor.g = gScore;
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
                // Re-sort open list? Usually fine to leave it, it will be picked up later or we duplicate.
                // Simple implementation: Just update.
            }
        }
    }

    return null; // No path found
};

export const findNearestExit = (start: Point, elements: PlanElement[]): Point | null => {
    const exits = elements.filter(e => e.type === 'exit');
    if (exits.length === 0) return null;

    let nearest: Point | null = null;
    let minDist = Infinity;

    for (const exit of exits) {
        const dist = (start.x - exit.x)**2 + (start.y - exit.y)**2;
        if (dist < minDist) {
            minDist = dist;
            nearest = { x: exit.x, y: exit.y };
        }
    }
    return nearest;
};
