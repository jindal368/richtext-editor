"use client";

import React from "react";
import { EditorState, TextFormatting } from "@/lib/types/editor";

interface ToolbarProps {
  onFormatText: (formatting: Partial<TextFormatting>) => void;
  currentFormatting: TextFormatting;
}

const ToolbarButton: React.FC<{
  isActive?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ isActive, onClick, children }) => (
  <button
    className={`p-2 rounded hover:bg-gray-100 text-black ${
      isActive ? "bg-gray-200" : ""
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const ToolbarDivider = () => <div className="w-px h-6 bg-gray-200 mx-2" />;

const fontOptions = [
  { label: "Arial", value: "arial" },
  { label: "Times New Roman", value: "times" },
  { label: "Courier New", value: "courier" },
];

const fontSizes = Array.from({ length: 12 }, (_, i) => i + 8); // 8 to 19

export const Toolbar: React.FC<ToolbarProps> = ({
  onFormatText,
  currentFormatting,
}) => {
  return (
    <div className="flex items-center space-x-1 px-2 py-1 border-b border-gray-200">
      <select className="w-32 px-2 py-1 text-sm border border-gray-200 rounded bg-white text-black">
        {fontOptions.map((font) => (
          <option key={font.value} value={font.value} className="text-black">
            {font.label}
          </option>
        ))}
      </select>

      <ToolbarDivider />

      <select className="w-16 px-2 py-1 text-sm border border-gray-200 rounded bg-white text-black">
        {fontSizes.map((size) => (
          <option key={size} value={size} className="text-black">
            {size}
          </option>
        ))}
      </select>

      <ToolbarDivider />

      <ToolbarButton
        isActive={currentFormatting.bold}
        onClick={() => onFormatText({ bold: !currentFormatting.bold })}
      >
        <span className="font-bold">B</span>
      </ToolbarButton>

      <ToolbarButton
        isActive={currentFormatting.italic}
        onClick={() => onFormatText({ italic: !currentFormatting.italic })}
      >
        <span className="italic">I</span>
      </ToolbarButton>

      <ToolbarButton
        isActive={currentFormatting.underline}
        onClick={() =>
          onFormatText({ underline: !currentFormatting.underline })
        }
      >
        <span className="underline">U</span>
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={() => {}}>
        <span className="text-left">⌘</span>
      </ToolbarButton>

      <ToolbarButton onClick={() => {}}>
        <span className="text-center">≡</span>
      </ToolbarButton>

      <ToolbarButton onClick={() => {}}>
        <span className="text-right">⌘</span>
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={() => {}}>
        <span>⊞</span>
      </ToolbarButton>

      <ToolbarButton onClick={() => {}}>
        <span>⊟</span>
      </ToolbarButton>

      <ToolbarDivider />

      <select
        className="px-2 py-1 text-sm border border-gray-200 rounded bg-white text-black"
        value={currentFormatting.heading || ""}
        onChange={(e) => {
          const value = e.target.value;
          onFormatText({
            heading: value
              ? (parseInt(value) as 1 | 2 | 3 | 4 | 5 | 6)
              : undefined,
          });
        }}
      >
        <option value="" className="text-black">
          Normal
        </option>
        <option value="1" className="text-black">
          Heading 1
        </option>
        <option value="2" className="text-black">
          Heading 2
        </option>
        <option value="3" className="text-black">
          Heading 3
        </option>
        <option value="4" className="text-black">
          Heading 4
        </option>
        <option value="5" className="text-black">
          Heading 5
        </option>
        <option value="6" className="text-black">
          Heading 6
        </option>
      </select>
    </div>
  );
};
