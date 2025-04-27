"use client";

import React, { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface InlineComponentProps {
  id: string;
  type: string;
  content: string;
  properties: Record<string, any>;
  onUpdate: (
    id: string,
    updates: { content?: string; properties?: Record<string, any> }
  ) => void;
  onMove: (id: string, targetIndex: number) => void;
}

interface ComponentEditorProps {
  component: {
    id: string;
    type: string;
    content: string;
    properties: Record<string, any>;
  };
  position: { top: number; left: number };
  onClose: () => void;
  onUpdate: (updates: {
    content?: string;
    properties?: Record<string, any>;
  }) => void;
}

const ComponentEditor: React.FC<ComponentEditorProps> = ({
  component,
  position,
  onClose,
  onUpdate,
}) => {
  const [content, setContent] = useState(component.content);
  const [properties, setProperties] = useState(component.properties);

  const handleUpdate = () => {
    onUpdate({ content, properties });
    onClose();
  };

  return createPortal(
    <div
      className="fixed bg-white rounded-lg shadow-xl p-4 min-w-[300px]"
      style={{ top: position.top + window.scrollY, left: position.left }}
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      {Object.entries(properties).map(([key, value]) => (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {key}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) =>
              setProperties((prev) => ({ ...prev, [key]: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      ))}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Update
        </button>
      </div>
    </div>,
    document.body
  );
};

export const InlineComponent: React.FC<InlineComponentProps> = ({
  id,
  type,
  content,
  properties,
  onUpdate,
  onMove,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editorPosition, setEditorPosition] = useState({ top: 0, left: 0 });
  const componentRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = componentRef.current?.getBoundingClientRect();
    if (rect) {
      setEditorPosition({ top: rect.bottom, left: rect.left });
      setIsEditing(true);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    isDragging.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedId = e.dataTransfer.getData("text/plain");
    if (droppedId && droppedId !== id) {
      const rect = componentRef.current?.getBoundingClientRect();
      if (rect) {
        const isAfter = e.clientX > rect.left + rect.width / 2;
        onMove(droppedId, isAfter ? 1 : -1);
      }
    }
  };

  return (
    <>
      <div
        ref={componentRef}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDoubleClick={handleDoubleClick}
        className="inline-block px-2 py-1 bg-blue-100 rounded cursor-move hover:bg-blue-200"
      >
        {content}
      </div>
      {isEditing && (
        <ComponentEditor
          component={{ id, type, content, properties }}
          position={editorPosition}
          onClose={() => setIsEditing(false)}
          onUpdate={(updates) => {
            onUpdate(id, updates);
            setIsEditing(false);
          }}
        />
      )}
    </>
  );
};
