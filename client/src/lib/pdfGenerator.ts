import jsPDF from "jspdf";
import { PlanElement, PlanRoute, PlanWall, PlanMetadata, ELEMENT_LABELS, PlanLayer } from "./types";
import { ICONS } from "@/components/editor/icons";

interface StoreData {
    elements: PlanElement[];
    routes: PlanRoute[];
    walls: PlanWall[];
    metadata: PlanMetadata;
    layers?: PlanLayer[];
}

export const generatePDF = (data: StoreData) => {
    // Check layer visibility if provided
    const isLayerVisible = (id: string) => {
        if (!data.layers) return true;
        const layer = data.layers.find(l => l.id === id);
        return layer ? layer.visible : true;
    };

    const visibleWalls = isLayerVisible('walls') ? data.walls : [];
    const visibleRoutes = isLayerVisible('routes') ? data.routes : [];
    const visibleElements = isLayerVisible('elements') ? data.elements : [];

    // 1. Setup PDF in Landscape A4
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    // 2. Draw Metadata / Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("ПЛАН ЭВАКУАЦИИ", pageWidth / 2, margin + 5, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const metaY = margin + 15;
    doc.text(`Объект: ${data.metadata.buildingName}`, margin, metaY);
    doc.text(`Этаж: ${data.metadata.floor}`, margin, metaY + 5);
    doc.text(`Ответственный: ${data.metadata.responsible || ""}`, margin, metaY + 10);

    // 3. Define drawing area
    const drawX = margin;
    const drawY = metaY + 15;
    const drawW = contentWidth;
    const drawH = contentHeight - 40; // leave space for legend

    // 4. Calculate Scale to fit A4
    // Find bounds of the drawing
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    const allPoints = [
        ...visibleWalls.flatMap(w => w.points),
        ...visibleRoutes.flatMap(r => r.points),
        ...visibleElements.map(e => ({ x: e.x, y: e.y }))
    ];

    if (allPoints.length === 0) {
        // Empty plan
        doc.text("Нет данных для отображения", pageWidth / 2, pageHeight / 2, { align: "center" });
        doc.save(`plan-${data.metadata.floor}.pdf`);
        return;
    }

    allPoints.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    });

    // Add some padding to bounds
    const padding = 20; // pixels
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const planWidth = maxX - minX;
    const planHeight = maxY - minY;

    // Scale to fit draw area (mm vs pixels)
    // mm / pixels
    const scaleX = drawW / planWidth;
    const scaleY = drawH / planHeight;
    const scale = Math.min(scaleX, scaleY);

    // Coordinate conversion function: Plan (px) -> PDF (mm)
    const toPDF = (x: number, y: number) => {
        return {
            x: drawX + (x - minX) * scale,
            y: drawY + (y - minY) * scale
        };
    };

    // 5. Draw Walls
    if (visibleWalls.length > 0) {
        doc.setDrawColor(0, 0, 0); // Black
        doc.setLineWidth(0.5); // Thin line for PDF (0.5mm is decent)

        visibleWalls.forEach(wall => {
            const start = toPDF(wall.points[0].x, wall.points[0].y);
            const end = toPDF(wall.points[1].x, wall.points[1].y);
            doc.line(start.x, start.y, end.x, end.y);
        });
    }

    // 6. Draw Routes
    if (visibleRoutes.length > 0) {
        doc.setDrawColor(56, 142, 60); // Green #388E3C
        doc.setLineWidth(0.3);

        visibleRoutes.forEach(route => {
            if (route.type === 'backup') {
                 doc.setLineDashPattern([2, 1], 0); // Dashed
            } else {
                 doc.setLineDashPattern([], 0); // Solid
            }

            // Draw polyline
            for (let i = 0; i < route.points.length - 1; i++) {
                const p1 = toPDF(route.points[i].x, route.points[i].y);
                const p2 = toPDF(route.points[i+1].x, route.points[i+1].y);
                doc.line(p1.x, p1.y, p2.x, p2.y);
            }

            // Arrowhead at the last point
            if (route.points.length > 1) {
                const last = route.points[route.points.length - 1];
                const prev = route.points[route.points.length - 2];
                const pLast = toPDF(last.x, last.y);
                const pPrev = toPDF(prev.x, prev.y);

                // Calculate angle
                const angle = Math.atan2(pLast.y - pPrev.y, pLast.x - pPrev.x);
                const arrowSize = 3; // mm

                doc.saveGraphicsState();
                // jsPDF types might be incomplete for advanced graphics API, using any cast or alternative
                (doc as any).translate(pLast.x, pLast.y);
                (doc as any).rotate(angle * 180 / Math.PI);
                doc.setLineDashPattern([], 0); // Solid for arrow
                doc.triangle(0, 0, -arrowSize, -arrowSize/2, -arrowSize, arrowSize/2, 'FD'); // Filled Triangle
                doc.restoreGraphicsState();
            }
        });
    }

    doc.setLineDashPattern([], 0); // Reset dash

    // 7. Draw Elements (Icons)
    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255);

    visibleElements.forEach(el => {
        const p = toPDF(el.x, el.y);
        const w = 6; // mm
        const h = 6; // mm

        // Color based on type
        if (el.type === 'exit') {
             doc.setFillColor(56, 142, 60); // Green
             doc.rect(p.x - 5, p.y - 2.5, 10, 5, 'F');
             doc.text("ВЫХОД", p.x, p.y + 1, { align: "center", baseline: "middle" });
        } else if (el.type === 'you_are_here') {
             doc.setFillColor(25, 118, 210); // Blue
             doc.circle(p.x, p.y, 2, 'F');
             doc.setTextColor(0,0,0);
             doc.text("Вы здесь", p.x, p.y + 4, { align: "center" });
             doc.setTextColor(255,255,255);
        } else if (el.type === 'text') {
             doc.setTextColor(0,0,0);
             doc.setFontSize(10);
             doc.text(el.text || "Текст", p.x, p.y, { align: "center" });
             doc.setFontSize(6);
             doc.setTextColor(255,255,255);
        } else {
             doc.setFillColor(211, 47, 47); // Red
             doc.rect(p.x - w/2, p.y - h/2, w, h, 'F');
             // Simple letter
             let symbol = "?";
             if (el.type === 'extinguisher') symbol = "Ex";
             if (el.type === 'fire_hose') symbol = "F";
             if (el.type === 'phone') symbol = "T";
             if (el.type === 'alarm') symbol = "A";
             if (el.type === 'first_aid') symbol = "+";
             if (el.type === 'stairs') symbol = "St";
             if (el.type === 'assembly_point') symbol = "AP";

             doc.text(symbol, p.x, p.y + 1, { align: "center", baseline: "middle" });
        }
    });

    // 8. Legend
    let legendY = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(0,0,0);

    // Simple row of legend items
    let legendX = margin;
    // const items = ['exit', 'extinguisher', 'fire_hose', 'phone', 'alarm', 'you_are_here'] as const;
    const items = Object.keys(ELEMENT_LABELS) as (keyof typeof ELEMENT_LABELS)[];

    items.forEach(type => {
        // Skip non-icon items and items not present in the type union or that don't need a legend icon
        if (type === 'text' || type === 'wall' || type === 'window') return;

        // We cast type to string for comparison if needed, or rely on TS knowing it is a key
        // Actually ELEMENT_LABELS keys include 'wall' and 'window' but not 'wall_draw' or 'room'.
        // 'wall_draw' and 'room' are tool names, not element types in ELEMENT_LABELS usually.
        // Let's check ELEMENT_LABELS definition in types.ts if possible, but based on error,
        // ELEMENT_LABELS keys are "wall" | "window" | "exit" ...
        // So 'wall_draw' and 'room' checks were redundant and caused TS error.

        const label = ELEMENT_LABELS[type];
        // Draw symbol
        if (type === 'exit') {
            doc.setFillColor(56, 142, 60);
            doc.rect(legendX, legendY, 8, 4, 'F');
        } else if (type === 'you_are_here') {
            doc.setFillColor(25, 118, 210);
            doc.circle(legendX + 2, legendY + 2, 2, 'F');
        } else if (type === 'assembly_point') {
             doc.setFillColor(56, 142, 60);
             doc.rect(legendX, legendY, 4, 4, 'F');
        } else {
            doc.setFillColor(211, 47, 47);
            doc.rect(legendX, legendY, 4, 4, 'F');
        }

        doc.text(label, legendX + 10, legendY + 3);
        legendX += 40; // spacing

        // Wrap if too wide?
        if (legendX > pageWidth - margin - 40) {
            legendX = margin;
            legendY += 5;
        }
    });

    doc.save(`plan-${data.metadata.floor}.pdf`);
};
