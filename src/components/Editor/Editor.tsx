/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  EditorState,
  TextFormatting,
  BlockNode,
  EditorCommand,
  MentionData,
} from "@/lib/types/editor";
import { useEditorKeyboardShortcuts } from "./hooks/useEditorKeyboardShortcuts";
import { useEditorClipboard } from "./hooks/useEditorClipboard";
import { useEditorHistory } from "./hooks/useEditorHistory";
import { Toolbar } from "./Toolbar";
import { CommandPalette } from "./CommandPalette";
import { MentionSystem } from "./MentionSystem";
import { MenuBar } from "./MenuBar";
import { InlineComponent } from "./InlineComponentSystem";
import { TextSelection } from "./TextSelection";

const initialState: EditorState = {
  blocks: [
    {
      type: "paragraph",
      children: [{ type: "text", text: "", formatting: {} }],
    },
  ],
  selection: {
    start: { block: 0, offset: 0 },
    end: { block: 0, offset: 0 },
    isCollapsed: true,
  },
  undoStack: [],
  redoStack: [],
  inlineComponents: [],
};

const editorCommands: EditorCommand[] = [
  {
    id: "heading1",
    label: "Heading 1",
    shortcut: "# ",
    execute: (state: EditorState) => ({
      ...state,
      blocks: state.blocks.map((block, i) =>
        i === state.selection.start.block
          ? {
              ...block,
              children: block.children.map((child) =>
                child.type === "text"
                  ? {
                      ...child,
                      formatting: { ...child.formatting, heading: 1 },
                    }
                  : child
              ),
            }
          : block
      ),
    }),
  },
  {
    id: "quote",
    label: "Quote Block",
    shortcut: "> ",
    execute: (state: EditorState) => ({
      ...state,
      blocks: state.blocks.map((block, i) =>
        i === state.selection.start.block ? { ...block, type: "quote" } : block
      ),
    }),
  },
  {
    id: "code",
    label: "Code Block",
    shortcut: "```",
    execute: (state: EditorState) => ({
      ...state,
      blocks: state.blocks.map((block, i) =>
        i === state.selection.start.block ? { ...block, type: "code" } : block
      ),
    }),
  },
];

export const Editor: React.FC = () => {
  const [state, setState] = useState<EditorState>(initialState);
  const [currentFormatting, setCurrentFormatting] = useState<TextFormatting>(
    {}
  );
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [mentionState, setMentionState] = useState<{
    isOpen: boolean;
    searchTerm: string;
    position: { top: number; left: number };
  }>({
    isOpen: false,
    searchTerm: "",
    position: { top: 0, left: 0 },
  });
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposing = useRef(false);

  const { handleUndo, handleRedo, pushToHistory } = useEditorHistory(
    state,
    setState
  );
  const { handleCopy, handlePaste, handleCut } = useEditorClipboard(
    state,
    setState
  );
  const { registerKeyboardShortcuts } = useEditorKeyboardShortcuts(
    state,
    setState
  );

  useEffect(() => {
    registerKeyboardShortcuts();
  }, [registerKeyboardShortcuts]);

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = () => {
    isComposing.current = false;
  };

  const updateBlockContent = useCallback(
    (blockIndex: number, content: string, formatting: TextFormatting) => {
      setState((prev) => {
        const newBlocks = [...prev.blocks];
        newBlocks[blockIndex] = {
          ...newBlocks[blockIndex],
          children: [{ type: "text", text: content, formatting }],
        };
        return { ...prev, blocks: newBlocks };
      });
    },
    []
  );

  const handleInput = useCallback(
    (event: React.FormEvent<HTMLDivElement>) => {
      if (isComposing.current) return;

      const selection = window.getSelection();
      if (!selection) return;

      const range = selection.getRangeAt(0);
      const blockElement = range.startContainer.parentElement;
      if (!blockElement?.getAttribute("data-block-index")) return;

      const blockIndex = parseInt(
        blockElement.getAttribute("data-block-index") || "0",
        10
      );
      const content = blockElement.textContent || "";

      // Check for command triggers
      if (content.startsWith("/")) {
        setIsCommandPaletteOpen(true);
        return;
      }

      // Check for mention triggers
      const lastAtIndex = content.lastIndexOf("@");
      if (lastAtIndex !== -1 && lastAtIndex < range.startOffset) {
        const searchTerm = content.slice(lastAtIndex + 1, range.startOffset);
        const rect = range.getBoundingClientRect();

        setMentionState({
          isOpen: true,
          searchTerm,
          position: {
            top: rect.bottom,
            left: rect.left,
          },
        });
      } else {
        setMentionState((prev) => ({ ...prev, isOpen: false }));
      }

      updateBlockContent(blockIndex, content, currentFormatting);
    },
    [updateBlockContent, currentFormatting]
  );

  const handleFormatText = useCallback(
    (formatting: Partial<TextFormatting>) => {
      setCurrentFormatting((prev) => ({ ...prev, ...formatting }));

      const selection = window.getSelection();
      if (!selection) return;

      const range = selection.getRangeAt(0);
      const blockElement = range.startContainer.parentElement;
      if (!blockElement?.getAttribute("data-block-index")) return;

      const blockIndex = parseInt(
        blockElement.getAttribute("data-block-index") || "0",
        10
      );
      const content = blockElement.textContent || "";

      updateBlockContent(blockIndex, content, {
        ...currentFormatting,
        ...formatting,
      });
    },
    [currentFormatting, updateBlockContent]
  );

  const handleCommandSelect = useCallback(
    (command: EditorCommand) => {
      setState(command.execute);
      pushToHistory(command.execute(state));
    },
    [state, pushToHistory]
  );

  const handleMentionSelect = useCallback(
    (mention: MentionData) => {
      const selection = window.getSelection();
      if (!selection) return;

      const range = selection.getRangeAt(0);
      const blockElement = range.startContainer.parentElement;
      if (!blockElement?.getAttribute("data-block-index")) return;

      const blockIndex = parseInt(
        blockElement.getAttribute("data-block-index") || "0",
        10
      );
      const content = blockElement.textContent || "";
      const lastAtIndex = content.lastIndexOf("@");

      if (lastAtIndex !== -1) {
        const newContent =
          content.slice(0, lastAtIndex) +
          `@${mention.label} ` +
          content.slice(range.startOffset);
        updateBlockContent(blockIndex, newContent, currentFormatting);
      }
    },
    [updateBlockContent, currentFormatting]
  );

  const getBlockStyle = (block: BlockNode) => {
    const formatting =
      block.children[0].type === "text" ? block.children[0].formatting : {};
    const styles: React.CSSProperties = {
      fontWeight: formatting.bold ? "bold" : "normal",
      fontStyle: formatting.italic ? "italic" : "normal",
      textDecoration: formatting.underline ? "underline" : "none",
    };

    if (formatting.heading) {
      styles.fontSize = `${2 - (formatting.heading - 1) * 0.2}rem`;
      styles.fontWeight = "bold";
      styles.marginTop = "1em";
      styles.marginBottom = "0.5em";
    }

    return styles;
  };

  const handleCreateComponent = useCallback((type: string, content: string) => {
    const selection = window.getSelection();
    if (!selection) return;

    const range = selection.getRangeAt(0);
    const blockElement = range.startContainer.parentElement;
    if (!blockElement?.getAttribute("data-block-index")) return;

    const blockIndex = parseInt(
      blockElement.getAttribute("data-block-index") || "0",
      10
    );
    const offset = range.startOffset;

    const newComponent = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      properties: {},
      blockIndex,
      offset,
    };

    setState((prev) => ({
      ...prev,
      inlineComponents: [...prev.inlineComponents, newComponent],
    }));

    // Remove the selected text
    range.deleteContents();
  }, []);

  const handleUpdateComponent = useCallback(
    (
      id: string,
      updates: { content?: string; properties?: Record<string, any> }
    ) => {
      setState((prev) => ({
        ...prev,
        inlineComponents: prev.inlineComponents.map((component) =>
          component.id === id ? { ...component, ...updates } : component
        ),
      }));
    },
    []
  );

  const handleMoveComponent = useCallback((id: string, direction: number) => {
    setState((prev) => {
      const index = prev.inlineComponents.findIndex((c) => c.id === id);
      if (index === -1) return prev;

      const newComponents = [...prev.inlineComponents];
      const [component] = newComponents.splice(index, 1);
      newComponents.splice(index + direction, 0, component);

      return {
        ...prev,
        inlineComponents: newComponents,
      };
    });
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col text-black">
      <div className="flex-none">
        <MenuBar />
        <Toolbar
          onFormatText={handleFormatText}
          currentFormatting={currentFormatting}
        />
      </div>

      <div className="flex-1 overflow-auto">
        <div
          ref={editorRef}
          className="max-w-7xl h-[1000px] mx-auto p-8 text-black"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onCut={handleCut}
        >
          {state.blocks.map((block, blockIndex) => (
            <div
              key={blockIndex}
              data-block-index={blockIndex}
              className="min-h-[1.5em] outline-none text-black relative"
              style={getBlockStyle(block)}
            >
              {block.children.map((child, childIndex) =>
                child.type === "text" ? (
                  <React.Fragment key={childIndex}>
                    {child.text}
                    {state.inlineComponents
                      .filter((comp) => comp.blockIndex === blockIndex)
                      .map((component) => (
                        <InlineComponent
                          key={component.id}
                          {...component}
                          onUpdate={handleUpdateComponent}
                          onMove={handleMoveComponent}
                        />
                      ))}
                  </React.Fragment>
                ) : null
              )}
            </div>
          ))}
        </div>
      </div>

      <TextSelection onCreateComponent={handleCreateComponent} />

      <CommandPalette
        commands={editorCommands}
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectCommand={handleCommandSelect}
      />

      <MentionSystem
        isOpen={mentionState.isOpen}
        searchTerm={mentionState.searchTerm}
        position={mentionState.position}
        onClose={() => setMentionState((prev) => ({ ...prev, isOpen: false }))}
        onSelect={handleMentionSelect}
      />
    </div>
  );
};
