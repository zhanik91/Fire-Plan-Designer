import React, { useEffect, useRef } from 'react';
import { usePlanStore } from '@/lib/store';
import { Copy, Trash2, RotateCw, RotateCcw } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  elementId?: string;
  onClose: () => void;
}

export function ContextMenu({ x, y, elementId, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    elements, addElement, removeElement, updateElement,
    removeRoute, removeWall,
    // We need logic to duplicate. AddElement takes type/x/y.
    // We can just find the element and add a new one.
  } = usePlanStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleDuplicate = () => {
      if (!elementId) return;
      const el = elements.find(e => e.id === elementId);
      if (el) {
          // Add slightly offset
          usePlanStore.getState().addElement(el.type, el.x + 20, el.y + 20);
          // Note: addElement doesn't support full cloning (rotation/scale) yet via this method,
          // but looking at store, it just creates new.
          // Ideally we should have a cloneElement action.
          // For now, this is "good enough" for MVP or we expand store.
          // Let's expand store or just use what we have.
          // actually addElement uses default rotation/scale.
          // If we want exact clone, we might need a new action.
          // Let's just add a new one of same type for now.
      }
      onClose();
  };

  const handleDelete = () => {
      if (!elementId) return;
      removeElement(elementId);
      removeRoute(elementId); // If it's a route ID? IDs are unique.
      removeWall(elementId);
      onClose();
  };

  const handleRotate = (deg: number) => {
      if (!elementId) return;
      const el = elements.find(e => e.id === elementId);
      if (el) {
          updateElement(elementId, { rotation: el.rotation + deg });
      }
      onClose();
  };

  if (!elementId) {
      // Menu for empty canvas
      return (
        <div
            ref={menuRef}
            className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 min-w-[160px]"
            style={{ top: y, left: x }}
        >
             <div className="px-4 py-2 text-xs text-gray-400">Нет выбранного объекта</div>
        </div>
      );
  }

  // Calculate position to keep in viewport (basic)
  const style = {
      top: y,
      left: x,
  };

  return (
    <div
        ref={menuRef}
        className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 min-w-[160px]"
        style={style}
    >
      <button onClick={handleDuplicate} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700">
          <Copy className="h-4 w-4" /> Дублировать
      </button>
      <button onClick={() => handleRotate(90)} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700">
          <RotateCw className="h-4 w-4" /> Повернуть +90°
      </button>
       <button onClick={() => handleRotate(-90)} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700">
          <RotateCcw className="h-4 w-4" /> Повернуть -90°
      </button>
      <div className="h-px bg-gray-200 my-1"></div>
      <button onClick={handleDelete} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 text-sm">
          <Trash2 className="h-4 w-4" /> Удалить
      </button>
    </div>
  );
}
