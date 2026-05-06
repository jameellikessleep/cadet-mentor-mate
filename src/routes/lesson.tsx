import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { broadcastSlide, useStoredLesson } from "@/lib/lesson-sync";
import { SlideView } from "@/components/SlideView";
import { ChevronLeft, ChevronRight, Monitor, FileDown } from "lucide-react";

export const Route = createFileRoute("/lesson")({
  component: LessonPage,
  head: () => ({ meta: [{ title: "Lesson — Presenter View" }] }),
});

function LessonPage() {
  const stored = useStoredLesson();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (stored) broadcastSlide({ lessonId: stored.id, slideIndex: idx });
  }, [idx, stored]);

  if (!stored) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="mb-4">No lesson found. Generate one first.</p>
          <Link to="/"><Button>Back</Button></Link>
        </Card>
      </div>
    );
  }

  const { lesson } = stored;
  const slide = lesson.slides[idx];
  const total = lesson.slides.length;

  function openAudience() {
    window.open("/present", "cadet-audience", "noopener");
  }

  function printPlan() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card no-print">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <Link to="/" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">← New lesson</Link>
            <h1 className="text-lg font-bold">{lesson.title}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={printPlan}><FileDown className="w-4 h-4 mr-2" />Print plan</Button>
            <Button onClick={openAudience} size="sm"><Monitor className="w-4 h-4 mr-2" />Open audience window</Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Slide preview + controls */}
        <div className="space-y-4 no-print">
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
        </div>

        {/* Lesson plan (instructor only) */}
        <div className="space-y-4 print-area">
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
              <div className="md:col-span-2">
                <h3 className="font-semibold mb-1">Equipment</h3>
                <ul className="list-disc pl-5 space-y-1">{lesson.equipment.map((o, i) => <li key={i}>{o}</li>)}</ul>
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

          <Card className="p-5 space-y-4 text-sm">
            <h2 className="font-bold">Resources</h2>
            <div>
              <h3 className="font-semibold mb-1">YouTube searches</h3>
              <ul className="space-y-1">
                {lesson.resources.youtubeQueries.map((q, i) => (
                  <li key={i}>
                    <a className="text-accent hover:underline" target="_blank" rel="noreferrer"
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`}>
                      {q}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Worksheet ideas</h3>
              <ul className="list-disc pl-5 space-y-1">{lesson.resources.worksheets.map((w, i) => <li key={i}>{w}</li>)}</ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">References</h3>
              <ul className="list-disc pl-5 space-y-1">{lesson.resources.references.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
