"use client";

import { useCallback } from "react";
import { EditorState, TextNode, BlockNode } from "@/lib/types/editor";

const parseHtmlContent = (html: string): BlockNode[] => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  return Array.from(tempDiv.children).map((element) => {
    const formatting = {
      bold: window.getComputedStyle(element).fontWeight === "bold",
      italic: window.getComputedStyle(element).fontStyle === "italic",
      underline: window
        .getComputedStyle(element)
        .textDecoration.includes("underline"),
    };

    // Detect block type
    let type: BlockNode["type"] = "paragraph";
    if (element.tagName === "BLOCKQUOTE") type = "quote";
    if (element.tagName === "PRE") type = "code";
    if (element.classList.contains("callout")) type = "callout";

    const textNode: TextNode = {
      type: "text",
      text: element.textContent || "",
      formatting,
    };

    return {
      type,
      children: [textNode],
      indent: parseInt(element.getAttribute("data-indent") || "0"),
    };
  });
};

export const useEditorClipboard = (
  state: EditorState,
  setState: React.Dispatch<React.SetStateAction<EditorState>>
) => {
  const handleCopy = useCallback(
    (e: ClipboardEvent) => {
      e.preventDefault();
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      // Get selected content with formatting
      const range = selection.getRangeAt(0);
      const content = range.cloneContents();
      const tempDiv = document.createElement("div");
      tempDiv.appendChild(content);

      // Store both plain text and formatted content
      e.clipboardData?.setData("text/plain", tempDiv.textContent || "");
      e.clipboardData?.setData("text/html", tempDiv.innerHTML);

      // Store custom editor format
      const startBlock = range.startContainer.parentElement;
      const endBlock = range.endContainer.parentElement;
      if (
        startBlock?.hasAttribute("data-block-index") &&
        endBlock?.hasAttribute("data-block-index")
      ) {
        const startIndex = parseInt(
          startBlock.getAttribute("data-block-index") || "0",
          10
        );
        const endIndex = parseInt(
          endBlock.getAttribute("data-block-index") || "0",
          10
        );

        const selectedBlocks = state.blocks.slice(startIndex, endIndex + 1);
        e.clipboardData?.setData(
          "application/x-editor-blocks",
          JSON.stringify(selectedBlocks)
        );
      }
    },
    [state.blocks]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      e.preventDefault();
      const selection = window.getSelection();
      if (!selection) return;

      const range = selection.getRangeAt(0);
      const blockElement = range.startContainer.parentElement;
      if (!blockElement?.hasAttribute("data-block-index")) return;

      const blockIndex = parseInt(
        blockElement.getAttribute("data-block-index") || "0",
        10
      );

      // Try to paste editor-specific format first
      const editorBlocks = e.clipboardData?.getData(
        "application/x-editor-blocks"
      );
      if (editorBlocks) {
        try {
          const blocks = JSON.parse(editorBlocks) as BlockNode[];
          setState((prev) => ({
            ...prev,
            blocks: [
              ...prev.blocks.slice(0, blockIndex),
              ...blocks,
              ...prev.blocks.slice(blockIndex + 1),
            ],
          }));
          return;
        } catch (error) {
          console.error("Failed to parse editor blocks:", error);
        }
      }

      // Try HTML format next
      const html = e.clipboardData?.getData("text/html");
      if (html) {
        const blocks = parseHtmlContent(html);
        setState((prev) => ({
          ...prev,
          blocks: [
            ...prev.blocks.slice(0, blockIndex),
            ...blocks,
            ...prev.blocks.slice(blockIndex + 1),
          ],
        }));
        return;
      }

      // Fall back to plain text
      const text = e.clipboardData?.getData("text/plain") || "";
      const lines = text.split("\n");
      const blocks: BlockNode[] = lines.map((line) => ({
        type: "paragraph",
        children: [
          {
            type: "text",
            text: line,
            formatting: {},
          },
        ],
      }));

      setState((prev) => ({
        ...prev,
        blocks: [
          ...prev.blocks.slice(0, blockIndex),
          ...blocks,
          ...prev.blocks.slice(blockIndex + 1),
        ],
      }));
    },
    [setState]
  );

  const handleCut = useCallback(
    (e: ClipboardEvent) => {
      handleCopy(e);

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const range = selection.getRangeAt(0);
      const startBlock = range.startContainer.parentElement;
      const endBlock = range.endContainer.parentElement;

      if (
        startBlock?.hasAttribute("data-block-index") &&
        endBlock?.hasAttribute("data-block-index")
      ) {
        const startIndex = parseInt(
          startBlock.getAttribute("data-block-index") || "0",
          10
        );
        const endIndex = parseInt(
          endBlock.getAttribute("data-block-index") || "0",
          10
        );

        setState((prev) => ({
          ...prev,
          blocks: [
            ...prev.blocks.slice(0, startIndex),
            ...prev.blocks.slice(endIndex + 1),
          ],
        }));
      }
    },
    [handleCopy, setState]
  );

  return {
    handleCopy,
    handlePaste,
    handleCut,
  };
};
