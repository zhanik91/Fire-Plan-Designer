import React from 'react';
import { Group, Rect, Path, Circle, Text } from 'react-konva';
import { ElementType } from '@/lib/types';

// Simplified paths for Lucide icons (extracted or approximated)
export const ICONS = {
  // Door Open
  exit: "M13 4h3a2 2 0 0 1 2 2v14",
  exit_arrow: "M2 20h3",
  exit_door: "M13 20h9",

  // Fire Extinguisher
  extinguisher: "M15 6.5V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3.5l-2.08 2.08a2 2 0 0 0-.58 1.42V19a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-9a2 2 0 0 0-.58-1.42L15 6.5Z",

  // Flame (Fire Hose)
  fire_hose: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3a1 1 0 0 1 1.4-.2c.3.2.5.5.5.8.3 1.2.9 2.2 1.5 2.2Z",

  // Phone
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z",

  // Bell (Alarm)
  alarm: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",

  // Map Pin
  you_are_here: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z",

  // Stairs
  stairs: "M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM15 5v4h-4v4H7v4h4V9h4V5h-4z", // Material stairs-like

  // First Aid
  first_aid: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z",

  // Assembly Point (people group)
  assembly_point: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
};

export const SymbolRenderer = ({ type }: { type: ElementType }) => {
  switch (type) {
    case 'exit':
      return (
        <Group>
          <Rect width={60} height={30} fill="#388E3C" cornerRadius={4} />
          <Text
            text="ВЫХОД"
            fontSize={14}
            fill="white"
            width={60}
            height={30}
            align="center"
            verticalAlign="middle"
            fontStyle="bold"
            fontFamily="sans-serif"
          />
        </Group>
      );

    case 'extinguisher':
      return (
        <Group>
           <Rect width={32} height={32} fill="#D32F2F" cornerRadius={4} />
           <Path
             data={ICONS.extinguisher}
             fill="white"
             scaleX={1}
             scaleY={1}
             x={4}
             y={4}
           />
        </Group>
      );

    case 'fire_hose':
      return (
        <Group>
           <Rect width={32} height={32} fill="#D32F2F" cornerRadius={4} />
           <Path
             data={ICONS.fire_hose}
             fill="white"
             scaleX={1}
             scaleY={1}
             x={4}
             y={4}
           />
        </Group>
      );

    case 'phone':
      return (
        <Group>
           <Rect width={32} height={32} fill="#D32F2F" cornerRadius={4} />
           <Path
             data={ICONS.phone}
             fill="white"
             scaleX={0.8}
             scaleY={0.8}
             x={6}
             y={6}
           />
        </Group>
      );

    case 'alarm':
      return (
        <Group>
           <Rect width={32} height={32} fill="#D32F2F" cornerRadius={4} />
           <Path
             data={ICONS.alarm}
             fill="white"
             stroke="white"
             strokeWidth={2}
             scaleX={0.8}
             scaleY={0.8}
             x={6}
             y={6}
           />
           {/* Clapper */}
           <Path data="M10.3 21a1.94 1.94 0 0 0 3.4 0" stroke="white" strokeWidth={2} scaleX={0.8} scaleY={0.8} x={6} y={6} />
        </Group>
      );

    case 'you_are_here':
       return (
        <Group>
           <Path
             data={ICONS.you_are_here}
             fill="#1976D2"
             scaleX={1.2}
             scaleY={1.2}
             x={-12}
             y={-24}
           />
           <Circle x={0} y={-12} radius={4} fill="white" />
           <Text
             text="Вы здесь"
             fontSize={12}
             fontStyle="bold"
             fill="#1976D2"
             y={4}
             width={100}
             x={-50}
             align="center"
             fontFamily="sans-serif"
           />
        </Group>
      );

    case 'stairs':
        return (
            <Group>
                <Rect width={32} height={32} fill="#9E9E9E" cornerRadius={4} />
                <Path
                    data={ICONS.stairs}
                    fill="white"
                    scaleX={1}
                    scaleY={1}
                    x={4}
                    y={4}
                />
            </Group>
        );

    case 'first_aid':
        return (
            <Group>
                <Rect width={32} height={32} fill="#388E3C" cornerRadius={4} />
                <Path
                    data={ICONS.first_aid}
                    fill="white"
                    scaleX={1}
                    scaleY={1}
                    x={4}
                    y={4}
                />
            </Group>
        );

    case 'assembly_point':
        return (
            <Group>
                <Rect width={32} height={32} fill="#388E3C" cornerRadius={4} />
                <Path
                    data={ICONS.assembly_point}
                    fill="white"
                    scaleX={1}
                    scaleY={1}
                    x={4}
                    y={4}
                />
            </Group>
        );

    default:
      return (
          <Group>
             <Rect width={30} height={30} fill="#9E9E9E" cornerRadius={4} />
             <Text text="?" fontSize={20} fill="white" width={30} height={30} align="center" verticalAlign="middle" />
          </Group>
      );
  }
};
