export type TextFormatting = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  heading?: 1 | 2 | 3 | 4 | 5 | 6;
};

export type BlockType =
  | "paragraph"
  | "quote"
  | "code"
  | "callout"
  | "list-item";

export interface TextNode {
  type: "text";
  text: string;
  formatting: TextFormatting;
}

export interface InteractiveNode {
  type: "interactive";
  componentType: string;
  props: Record<string, any>;
}

export interface BlockNode {
  type: BlockType;
  children: (TextNode | InteractiveNode)[];
  indent?: number;
}

export interface InlineComponent {
  id: string;
  type: string;
  content: string;
  properties: Record<string, any>;
  blockIndex: number;
  offset: number;
}

export interface EditorState {
  blocks: BlockNode[];
  selection: {
    start: { block: number; offset: number };
    end: { block: number; offset: number };
    isCollapsed: boolean;
  };
  undoStack: EditorState[];
  redoStack: EditorState[];
  inlineComponents: InlineComponent[];
}

export interface EditorCommand {
  id: string;
  label: string;
  shortcut?: string;
  execute: (state: EditorState) => EditorState;
}

export interface MentionData {
  id: string;
  type: string;
  label: string;
  preview?: {
    title: string;
    description?: string;
    imageUrl?: string;
  };
}
