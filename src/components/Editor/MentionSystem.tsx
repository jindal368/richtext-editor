"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { MentionData } from "@/lib/types/editor";

interface MentionSystemProps {
  isOpen: boolean;
  searchTerm: string;
  onClose: () => void;
  onSelect: (mention: MentionData) => void;
  position: { top: number; left: number };
}

// Dummy data for demonstration
const sampleMentions: MentionData[] = [
  {
    id: "1",
    type: "user",
    label: "John Doe",
    preview: {
      title: "Software Engineer",
      description: "Frontend Developer",
      imageUrl: "https://via.placeholder.com/40",
    },
  },
  {
    id: "2",
    type: "user",
    label: "Jane Smith",
    preview: {
      title: "Product Manager",
      description: "Product Strategy",
      imageUrl: "https://via.placeholder.com/40",
    },
  },
];

const fuzzySearch = (items: MentionData[], query: string): MentionData[] => {
  const lowercaseQuery = query.toLowerCase();
  return items.filter((item) => {
    const lowercaseLabel = item.label.toLowerCase();
    let queryIndex = 0;
    let itemIndex = 0;

    while (
      queryIndex < lowercaseQuery.length &&
      itemIndex < lowercaseLabel.length
    ) {
      if (lowercaseQuery[queryIndex] === lowercaseLabel[itemIndex]) {
        queryIndex++;
      }
      itemIndex++;
    }

    return queryIndex === lowercaseQuery.length;
  });
};

export const MentionSystem: React.FC<MentionSystemProps> = ({
  isOpen,
  searchTerm,
  onClose,
  onSelect,
  position,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredMentions = fuzzySearch(sampleMentions, searchTerm);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredMentions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredMentions[selectedIndex]) {
            onSelect(filteredMentions[selectedIndex]);
            onClose();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [isOpen, filteredMentions, selectedIndex, onSelect, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed bg-white rounded-lg shadow-xl w-64 max-h-96 overflow-y-auto z-50"
      style={{
        top: position.top + window.scrollY,
        left: position.left,
      }}
    >
      {filteredMentions.length > 0 ? (
        filteredMentions.map((mention, index) => (
          <button
            key={mention.id}
            className={`w-full px-3 py-2 flex items-center gap-3 text-black ${
              index === selectedIndex ? "bg-blue-50" : "hover:bg-gray-50"
            }`}
            onClick={() => {
              onSelect(mention);
              onClose();
            }}
          >
            {mention.preview?.imageUrl && (
              <img
                src={mention.preview.imageUrl}
                alt=""
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="flex-1 text-left">
              <div className="font-medium text-black">{mention.label}</div>
              {mention.preview?.title && (
                <div className="text-sm text-gray-500">
                  {mention.preview.title}
                </div>
              )}
            </div>
          </button>
        ))
      ) : (
        <div className="p-3 text-black">No results found</div>
      )}
    </div>
  );
};
