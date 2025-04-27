"use client";

import { useCallback } from "react";
import { EditorState, TextFormatting } from "@/lib/types/editor";
import { useEditorHistory } from "./useEditorHistory";

export const useEditorKeyboardShortcuts = (
  state: EditorState,
  setState: React.Dispatch<React.SetStateAction<EditorState>>,
  setCurrentFormatting?: React.Dispatch<React.SetStateAction<TextFormatting>>,
  setIsCommandPaletteOpen?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { undo, redo, recordChange, canUndo, canRedo } = useEditorHistory(
    state,
    setState
  );

  const registerKeyboardShortcuts = useCallback(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle basic formatting shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case "b":
            e.preventDefault();
            setCurrentFormatting?.((prev) => ({ ...prev, bold: !prev.bold }));
            break;
          case "i":
            e.preventDefault();
            setCurrentFormatting?.((prev) => ({
              ...prev,
              italic: !prev.italic,
            }));
            break;
          case "u":
            e.preventDefault();
            setCurrentFormatting?.((prev) => ({
              ...prev,
              underline: !prev.underline,
            }));
            break;
          case "8":
            if (e.shiftKey) {
              e.preventDefault();
              // Custom action for Cmd+Shift+8
            }
            break;
          case "[":
            e.preventDefault();
            // Decrease indentation
            setState((prev) => ({
              ...prev,
              blocks: prev.blocks.map((block, i) =>
                i === prev.selection.start.block
                  ? { ...block, indent: Math.max(0, (block.indent || 0) - 1) }
                  : block
              ),
            }));
            break;
          case "]":
            e.preventDefault();
            // Increase indentation
            setState((prev) => ({
              ...prev,
              blocks: prev.blocks.map((block, i) =>
                i === prev.selection.start.block
                  ? { ...block, indent: (block.indent || 0) + 1 }
                  : block
              ),
            }));
            break;
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
        }
      }

      // Handle custom key sequences
      if (e.key === "/") {
        setIsCommandPaletteOpen?.(true);
      }

      // Handle keyboard navigation between blocks
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        const selection = window.getSelection();
        if (!selection || !selection.focusNode) return;

        const currentBlock = selection.focusNode.parentElement;
        if (!currentBlock?.getAttribute("data-block-index")) return;

        const currentIndex = parseInt(
          currentBlock.getAttribute("data-block-index") || "0",
          10
        );
        const nextIndex =
          e.key === "ArrowUp" ? currentIndex - 1 : currentIndex + 1;

        if (nextIndex >= 0 && nextIndex < state.blocks.length) {
          e.preventDefault();
          const nextBlock = document.querySelector(
            `[data-block-index="${nextIndex}"]`
          );
          if (nextBlock) {
            const range = document.createRange();
            range.selectNodeContents(nextBlock);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    setState,
    setCurrentFormatting,
    setIsCommandPaletteOpen,
    state.blocks.length,
    undo,
    redo,
  ]);

  return {
    registerKeyboardShortcuts,
    undo,
    redo,
    recordChange,
    canUndo,
    canRedo,
  };
};
