/* eslint-disable */
// @ts-nocheck
"use client";

import React from "react";

const menuItems = [
  { label: "File", key: "file" },
  { label: "Edit", key: "edit" },
  { label: "View", key: "view" },
  { label: "Insert", key: "insert" },
  { label: "Format", key: "format" },
  { label: "Tools", key: "tools" },
  { label: "Table", key: "table" },
];

export const MenuBar: React.FC = () => {
  return (
    <div className="flex items-center px-4 py-1 border-b border-gray-200 bg-gray-50">
      {menuItems.map((item) => (
        <button
          key={item.key}
          className="px-3 py-1 text-sm text-black hover:bg-gray-100 rounded"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};
