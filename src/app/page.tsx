"use client";

import { Editor } from "@/components/Editor/Editor";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="min-h-screen max-w-6xl mx-auto bg-white shadow-lg">
        <Editor />
      </div>
    </main>
  );
}
