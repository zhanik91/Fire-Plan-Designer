import jsPDF from "jspdf";
import { PlanElement, PlanRoute, PlanWall, PlanMetadata, ELEMENT_LABELS, ElementType } from "./types";
import Konva from "konva";

interface StoreData {
    elements: PlanElement[];
    routes: PlanRoute[];
    walls: PlanWall[];
    metadata: PlanMetadata;
}

export const generatePDF = async (data: StoreData) => {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

    doc.setLineWidth(0.3);
    doc.rect(margin + 2, margin + 2, pageWidth - margin * 2 - 4, pageHeight - margin * 2 - 4);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text("ПЛАН ЭВАКУАЦИИ", pageWidth / 2, margin + 12, { align: "center" });

    doc.setFontSize(12);
    doc.text("ПРИ ПОЖАРЕ", pageWidth / 2, margin + 18, { align: "center" });

    doc.setLineWidth(0.5);
    doc.line(margin + 10, margin + 22, pageWidth - margin - 10, margin + 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const metaY = margin + 28;
    doc.text(`Объект: ${data.metadata.buildingName}`, margin + 10, metaY);
    doc.text(`Этаж: ${data.metadata.floor}`, pageWidth / 2, metaY);

    const drawX = margin + 5;
    const drawY = metaY + 5;
    const drawW = pageWidth - margin * 2 - 10;
    const drawH = pageHeight - metaY - 55;

    doc.setDrawColor(100);
    doc.setLineWidth(0.2);
    doc.rect(drawX, drawY, drawW, drawH);

    const stage = Konva.stages[0];
    if (stage) {
        try {
            const oldScale = stage.scaleX();
            const oldPos = { x: stage.x(), y: stage.y() };

            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            const allPoints = [
                ...data.walls.flatMap(w => w.points),
                ...data.routes.flatMap(r => r.points),
                ...data.elements.map(e => ({ x: e.x, y: e.y }))
            ];

            if (allPoints.length > 0) {
                allPoints.forEach(p => {
                    if (p.x < minX) minX = p.x;
                    if (p.y < minY) minY = p.y;
                    if (p.x > maxX) maxX = p.x;
                    if (p.y > maxY) maxY = p.y;
                });

                const padding = 50;
                minX = Math.max(0, minX - padding);
                minY = Math.max(0, minY - padding);
                maxX += padding;
                maxY += padding;

                const contentW = maxX - minX;
                const contentH = maxY - minY;

                const pixelRatio = 3;
                const dataURL = stage.toDataURL({
                    x: minX,
                    y: minY,
                    width: contentW,
                    height: contentH,
                    pixelRatio: pixelRatio
                });

                const imgAspect = contentW / contentH;
                const boxAspect = drawW / drawH;

                let imgW, imgH;
                if (imgAspect > boxAspect) {
                    imgW = drawW - 4;
                    imgH = imgW / imgAspect;
                } else {
                    imgH = drawH - 4;
                    imgW = imgH * imgAspect;
                }

                const imgX = drawX + (drawW - imgW) / 2;
                const imgY = drawY + (drawH - imgH) / 2;

                doc.addImage(dataURL, 'PNG', imgX, imgY, imgW, imgH);
            }

            stage.scale({ x: oldScale, y: oldScale });
            stage.position(oldPos);
        } catch (err) {
            console.error("Failed to capture canvas:", err);
            doc.setFontSize(12);
            doc.text("Ошибка захвата плана", drawX + drawW/2, drawY + drawH/2, { align: "center" });
        }
    } else {
        doc.setFontSize(12);
        doc.text("Нет данных для отображения", drawX + drawW/2, drawY + drawH/2, { align: "center" });
    }

    const legendY = pageHeight - margin - 38;
    doc.setLineWidth(0.5);
    doc.line(margin + 10, legendY, pageWidth - margin - 10, legendY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("УСЛОВНЫЕ ОБОЗНАЧЕНИЯ:", margin + 10, legendY + 6);

    const usedTypes = new Set(data.elements.map(e => e.type));
    const hasRoutes = data.routes.length > 0;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    let legendX = margin + 10;
    const legendItemY = legendY + 14;
    const spacing = 45;

    if (hasRoutes) {
        doc.setDrawColor(22, 101, 52);
        doc.setLineWidth(0.8);
        doc.line(legendX, legendItemY, legendX + 15, legendItemY);
        
        doc.setFillColor(22, 101, 52);
        doc.triangle(legendX + 15, legendItemY, legendX + 12, legendItemY - 2, legendX + 12, legendItemY + 2, 'F');
        
        doc.setTextColor(0);
        doc.text("Путь эвакуации", legendX + 18, legendItemY + 1);
        legendX += spacing;
    }

    const legendItems: { type: ElementType; color: [number, number, number]; symbol: string }[] = [
        { type: 'exit', color: [22, 163, 74], symbol: '■' },
        { type: 'extinguisher', color: [220, 38, 38], symbol: '●' },
        { type: 'fire_hose', color: [220, 38, 38], symbol: '◆' },
        { type: 'phone', color: [37, 99, 235], symbol: '☎' },
        { type: 'alarm', color: [220, 38, 38], symbol: '▲' },
        { type: 'you_are_here', color: [37, 99, 235], symbol: '★' },
    ];

    legendItems.forEach(item => {
        if (usedTypes.has(item.type)) {
            doc.setFillColor(...item.color);
            doc.circle(legendX + 2, legendItemY, 2, 'F');
            doc.setTextColor(0);
            doc.text(ELEMENT_LABELS[item.type], legendX + 6, legendItemY + 1);
            legendX += spacing;
            
            if (legendX > pageWidth - margin - spacing) {
                legendX = margin + 10;
            }
        }
    });

    const footerY = pageHeight - margin - 8;
    doc.setLineWidth(0.3);
    doc.line(margin + 10, footerY - 4, pageWidth - margin - 10, footerY - 4);

    doc.setFontSize(8);
    doc.text(`Ответственный: ${data.metadata.responsible}`, margin + 10, footerY);
    doc.text("Подпись: _________________", margin + 80, footerY);
    
    const date = new Date().toLocaleDateString('ru-RU');
    doc.text(`Дата: ${date}`, pageWidth - margin - 40, footerY);

    doc.save(`План_эвакуации_${data.metadata.buildingName}_этаж_${data.metadata.floor}.pdf`);
};
