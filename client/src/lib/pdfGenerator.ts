import jsPDF from "jspdf";
import { PlanElement, PlanRoute, PlanWall, PlanMetadata, ELEMENT_LABELS } from "./types";
import { ICONS } from "@/components/editor/icons";

interface StoreData {
    elements: PlanElement[];
    routes: PlanRoute[];
    walls: PlanWall[];
    metadata: PlanMetadata;
}

export const generatePDF = (data: StoreData) => {
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
    doc.text(`Ответственный: ${data.metadata.responsible}`, margin, metaY + 10);

    // 3. Define drawing area
    const drawX = margin;
    const drawY = metaY + 15;
    const drawW = contentWidth;
    const drawH = contentHeight - 40; // leave space for legend

    // 4. Calculate Scale to fit A4
    // Find bounds of the drawing
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    const allPoints = [
        ...data.walls.flatMap(w => w.points),
        ...data.routes.flatMap(r => r.points),
        ...data.elements.map(e => ({ x: e.x, y: e.y }))
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
    doc.setDrawColor(0, 0, 0); // Black
    doc.setLineWidth(0.5); // Thin line for PDF (0.5mm is decent)

    data.walls.forEach(wall => {
        const start = toPDF(wall.points[0].x, wall.points[0].y);
        const end = toPDF(wall.points[1].x, wall.points[1].y);
        doc.line(start.x, start.y, end.x, end.y);
    });

    // 6. Draw Routes
    doc.setDrawColor(56, 142, 60); // Green #388E3C
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([2, 1], 0); // Dashed

    data.routes.forEach(route => {
        // Draw polyline
        for (let i = 0; i < route.points.length - 1; i++) {
            const p1 = toPDF(route.points[i].x, route.points[i].y);
            const p2 = toPDF(route.points[i+1].x, route.points[i+1].y);
            doc.line(p1.x, p1.y, p2.x, p2.y);

            // Draw arrowhead at end of segment? Too many.
            // Just at the very end of route.
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
            // doc.translate and rotate are standard in recent jsPDF but types often lag or need specific import
            (doc as any).translate(pLast.x, pLast.y);
            (doc as any).rotate(angle * 180 / Math.PI);
            doc.setLineDashPattern([], 0); // Solid for arrow
            doc.triangle(0, 0, -arrowSize, -arrowSize/2, -arrowSize, arrowSize/2, 'FD'); // Filled Triangle
            doc.restoreGraphicsState();
        }
    });

    doc.setLineDashPattern([], 0); // Reset dash

    // 7. Draw Elements (Icons)
    // This is hard with Paths. jsPDF works best with primitive operations.
    // We can try to emulate the paths. Most of our ICONS are simple strings.
    // jsPDF has `path` method but it expects segments.
    // For MVP Vector Export, we will use simplified drawing or text fallback if paths are too hard.
    // Actually, let's use the 'text' representation or simple shapes for now if path parsing is complex,
    // OR we can implement a basic SVG path drawer if we want true vector.
    // BUT we have `doc.addSvgAsImage`? No, that requires valid SVG XML string and canvas context shim.

    // Simplest Robust Approach: Draw a colored rectangle + Text label for icons.
    // This guarantees vector quality and readability, even if it's not the fancy icon.
    // Legend will explain it.

    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255);

    data.elements.forEach(el => {
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
        } else {
             doc.setFillColor(211, 47, 47); // Red
             doc.rect(p.x - w/2, p.y - h/2, w, h, 'F');
             // Simple letter
             let symbol = "?";
             if (el.type === 'extinguisher') symbol = "Ex";
             if (el.type === 'fire_hose') symbol = "F";
             if (el.type === 'phone') symbol = "T";
             if (el.type === 'alarm') symbol = "A";

             doc.text(symbol, p.x, p.y + 1, { align: "center", baseline: "middle" });
        }
    });

    // 8. Legend
    const legendY = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(0,0,0);

    // Simple row of legend items
    let legendX = margin;
    const items = ['exit', 'extinguisher', 'fire_hose', 'phone', 'alarm', 'you_are_here'] as const;

    items.forEach(type => {
        const label = ELEMENT_LABELS[type];
        // Draw symbol
        if (type === 'exit') {
            doc.setFillColor(56, 142, 60);
            doc.rect(legendX, legendY, 8, 4, 'F');
        } else if (type === 'you_are_here') {
            doc.setFillColor(25, 118, 210);
            doc.circle(legendX + 2, legendY + 2, 2, 'F');
        } else {
            doc.setFillColor(211, 47, 47);
            doc.rect(legendX, legendY, 4, 4, 'F');
        }

        doc.text(label, legendX + 10, legendY + 3);
        legendX += 40; // spacing
    });

    doc.save(`plan-${data.metadata.floor}.pdf`);
};
