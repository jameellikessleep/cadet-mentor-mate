import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { SlideView } from "@/components/SlideView";
import { LessonChat } from "@/components/LessonChat";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Lesson } from "@/lib/lesson-types";

export const Route = createFileRoute("/shared/$id")({
  component: SharedLesson,
  head: () => ({ meta: [{ title: "Shared Lesson — ACF" }] }),
});

function SharedLesson() {
  const { id } = Route.useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [planOpen, setPlanOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("shared_lessons")
        .select("lesson")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) { setError("Lesson not found."); return; }
      setLesson(data.lesson as Lesson);
    })();
  }, [id]);

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="p-8 text-center max-w-md">
        <p className="mb-4">{error}</p>
        <Link to="/"><Button>Create a lesson</Button></Link>
      </Card>
    </div>
  );
  if (!lesson) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  const slide = lesson.slides[idx];
  const total = lesson.slides.length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Shared lesson</div>
            <h1 className="text-lg font-bold">{lesson.title}</h1>
          </div>
          <Button size="sm" variant="outline" onClick={() => setPlanOpen((o) => !o)}>
            {planOpen ? "Hide plan" : "Show lesson plan"}
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        <Card className="aspect-video overflow-hidden">
          <SlideView slide={slide} index={idx} total={total} />
        </Card>
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
          </Button>
          <div className="text-sm text-muted-foreground">Slide {idx + 1} of {total}</div>
          <Button onClick={() => setIdx((i) => Math.min(total - 1, i + 1))} disabled={idx === total - 1}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <Card className="p-4">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Speaker notes</h3>
          <p className="text-sm leading-relaxed">{slide.speakerNotes}</p>
        </Card>

        {planOpen && (
          <>
            <Card className="p-5">
              <h2 className="font-bold mb-2">Aim</h2>
              <p className="text-sm mb-4">{lesson.aim}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-1">Objectives</h3>
                  <ul className="list-disc pl-5 space-y-1">{lesson.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Safety</h3>
                  <ul className="list-disc pl-5 space-y-1">{lesson.safety.map((o, i) => <li key={i}>{o}</li>)}</ul>
                </div>
              </div>
            </Card>
            <Card className="overflow-hidden">
              <div className="px-5 pt-4 pb-2 bg-primary text-primary-foreground">
                <h2 className="font-bold tracking-wide uppercase text-sm">Lesson Plan</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Time</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lesson.plan.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs align-top">{row.time}</TableCell>
                      <TableCell className="text-sm align-top">{row.notes}</TableCell>
                      <TableCell className="text-sm align-top text-muted-foreground">{row.remarks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </>
        )}
      </div>

      <LessonChat lesson={lesson} />
    </div>
  );
}
