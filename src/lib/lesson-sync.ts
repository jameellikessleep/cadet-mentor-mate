import { useEffect, useRef, useState } from "react";
import type { Lesson } from "@/lib/lesson-types";

const KEY = "cadet-lesson-current";
const CHANNEL = "cadet-lesson-sync";

export type SyncState = { lessonId: string; slideIndex: number };

export function saveCurrentLesson(lesson: Lesson) {
  const id = crypto.randomUUID();
  localStorage.setItem(KEY, JSON.stringify({ id, lesson }));
  return id;
}

export function loadCurrentLesson(): { id: string; lesson: Lesson } | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function broadcastSlide(state: SyncState) {
  const ch = new BroadcastChannel(CHANNEL);
  ch.postMessage(state);
  ch.close();
}

export function useSlideSync(onUpdate: (s: SyncState) => void) {
  const cb = useRef(onUpdate);
  cb.current = onUpdate;
  useEffect(() => {
    const ch = new BroadcastChannel(CHANNEL);
    ch.onmessage = (e) => cb.current(e.data as SyncState);
    return () => ch.close();
  }, []);
}

export function useStoredLesson() {
  const [data, setData] = useState<{ id: string; lesson: Lesson } | null>(null);
  useEffect(() => {
    setData(loadCurrentLesson());
    const onStorage = () => setData(loadCurrentLesson());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return data;
}
