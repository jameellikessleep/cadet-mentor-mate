import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSlideSync, useStoredLesson } from "@/lib/lesson-sync";
import { SlideView } from "@/components/SlideView";

export const Route = createFileRoute("/present")({
  component: PresentPage,
  head: () => ({ meta: [{ title: "Presenting" }] }),
});

function PresentPage() {
  const stored = useStoredLesson();
  const [idx, setIdx] = useState(0);

  useSlideSync((s) => setIdx(s.slideIndex));

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "f" || e.key === "F") {
        document.documentElement.requestFullscreen?.();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!stored) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">No lesson loaded.</div>;
  }
  const slide = stored.lesson.slides[idx] ?? stored.lesson.slides[0];

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="w-full h-full max-w-[100vw] max-h-[100vh] aspect-video">
        <SlideView slide={slide} index={idx} total={stored.lesson.slides.length} />
      </div>
    </div>
  );
}
