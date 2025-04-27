/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface TextSelectionProps {
  onCreateComponent: (type: string, content: string) => void;
}

const componentTypes = [
  { label: "Mention", value: "mention" },
  { label: "Link", value: "link" },
  { label: "Tag", value: "tag" },
  { label: "Code", value: "code" },
];

export const TextSelection: React.FC<TextSelectionProps> = ({
  onCreateComponent,
}) => {
  const [selection, setSelection] = useState<{
    text: string;
    position: { top: number; left: number };
  } | null>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const currentSelection = window.getSelection();
      if (!currentSelection || currentSelection.isCollapsed) {
        setSelection(null);
        return;
      }

      const text = currentSelection.toString().trim();
      if (!text) {
        setSelection(null);
        return;
      }

      const range = currentSelection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelection({
        text,
        position: {
          top: rect.bottom + window.scrollY,
          left: rect.left + (rect.width - 200) / 2, // Center the dropdown
        },
      });
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  if (!selection) return null;

  return createPortal(
    <div
      className="fixed bg-white rounded-lg shadow-xl overflow-hidden"
      style={{
        top: selection.position.top,
        left: selection.position.left,
        width: 200,
      }}
    >
      {componentTypes.map((type) => (
        <button
          key={type.value}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
          onClick={() => {
            onCreateComponent(type.value, selection.text);
            setSelection(null);
          }}
        >
          Convert to {type.label}
        </button>
      ))}
    </div>,
    document.body
  );
};
