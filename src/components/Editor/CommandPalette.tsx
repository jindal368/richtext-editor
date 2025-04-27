/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { EditorCommand } from "@/lib/types/editor";

interface CommandPaletteProps {
  commands: EditorCommand[];
  isOpen: boolean;
  onClose: () => void;
  onSelectCommand: (command: EditorCommand) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  commands,
  isOpen,
  onClose,
  onSelectCommand,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearchTerm("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredCommands = commands.filter((command) =>
    command.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            onSelectCommand(filteredCommands[selectedIndex]);
            onClose();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredCommands, selectedIndex, onSelectCommand, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-start justify-center pt-32">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <input
            ref={inputRef}
            type="text"
            className="w-full px-4 py-2 text-lg outline-none text-black"
            placeholder="Type a command..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.map((command, index) => (
            <button
              key={command.id}
              className={`w-full px-4 py-3 text-left flex items-center justify-between text-black ${
                index === selectedIndex ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
              onClick={() => {
                onSelectCommand(command);
                onClose();
              }}
            >
              <span>{command.label}</span>
              {command.shortcut && (
                <span className="text-sm text-gray-500">
                  {command.shortcut}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
