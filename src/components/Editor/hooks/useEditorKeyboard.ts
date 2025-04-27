"use client";

import { useCallback } from "react";
import { EditorState } from "@/lib/types/editor";

export const useEditorKeyboard = (
  state: EditorState,
  setState: React.Dispatch<React.SetStateAction<EditorState>>,
  undo: () => void,
  redo: () => void
) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "z" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      if (e.key === "y" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        redo();
      }
    },
    [undo, redo]
  );

  return {
    handleKeyDown,
  };
};
