"use client";

import { useCallback, useRef } from "react";
import { EditorState } from "@/lib/types/editor";

const MAX_HISTORY_LENGTH = 100;

interface HistoryState {
  past: EditorState[];
  future: EditorState[];
}

export const useEditorHistory = (
  state: EditorState,
  setState: React.Dispatch<React.SetStateAction<EditorState>>
) => {
  const history = useRef<HistoryState>({
    past: [],
    future: [],
  });

  const pushToHistory = useCallback(
    (newState: EditorState) => {
      history.current = {
        past: [...history.current.past.slice(-MAX_HISTORY_LENGTH + 1), state],
        future: [],
      };
    },
    [state]
  );

  const undo = useCallback(() => {
    const { past, future } = history.current;
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    history.current = {
      past: newPast,
      future: [state, ...future],
    };

    setState(previous);
  }, [state, setState]);

  const redo = useCallback(() => {
    const { past, future } = history.current;
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    history.current = {
      past: [...past, state],
      future: newFuture,
    };

    setState(next);
  }, [state, setState]);

  const recordChange = useCallback(
    (newState: EditorState) => {
      pushToHistory(state);
      setState(newState);
    },
    [state, setState, pushToHistory]
  );

  const canUndo = history.current.past.length > 0;
  const canRedo = history.current.future.length > 0;

  return {
    undo,
    redo,
    recordChange,
    canUndo,
    canRedo,
  };
};
