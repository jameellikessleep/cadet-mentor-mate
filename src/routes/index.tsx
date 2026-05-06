import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { saveCurrentLesson } from "@/lib/lesson-sync";
import type { Lesson } from "@/lib/lesson-types";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Cadet Lesson Builder — ACF Star Syllabus" },
      { name: "description", content: "Generate ACF cadet lesson plans, slides, and resources by Star level and topic." },
    ],
  }),
});

const STAR_LEVELS = ["Basic", "1-Star", "2-Star", "3-Star", "4-Star"];

function Index() {
  const navigate = useNavigate();
  const [starLevel, setStarLevel] = useState("1-Star");
  const [cadetCount, setCadetCount] = useState(12);
  const [lessonTopic, setLessonTopic] = useState("Fieldcraft — Camouflage and Concealment");
  const [duration, setDuration] = useState(40);
  const [loading, setLoading] = useState(false);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-lesson", {
        body: { starLevel, cadetCount, lessonTopic, durationMinutes: duration },
      });
      if (error) throw error;
      if (!data?.lesson) throw new Error("No lesson returned");
      saveCurrentLesson(data.lesson as Lesson);
      navigate({ to: "/lesson" });
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to generate";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-4">
          <div className="h-10 w-10 rounded bg-primary flex items-center justify-center text-primary-foreground font-black">★</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Cadet Lesson Builder</h1>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">UK ACF Star Syllabus</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-1">New Lesson</h2>
          <p className="text-sm text-muted-foreground mb-8">
            AI drafts a lesson plan (Time / Notes / Remarks), teaching slides and resources.
          </p>

          <form onSubmit={onGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Star Level</Label>
                <Select value={starLevel} onValueChange={setStarLevel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STAR_LEVELS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Number of cadets</Label>
                <Input type="number" min={1} max={60} value={cadetCount}
                  onChange={(e) => setCadetCount(parseInt(e.target.value || "0"))} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lesson topic</Label>
              <Input value={lessonTopic} onChange={(e) => setLessonTopic(e.target.value)}
                placeholder="e.g. Fieldcraft, Drill, Map & Compass, Skill at Arms" required maxLength={200} />
            </div>

            <div className="space-y-2">
              <Label>Lesson duration (minutes)</Label>
              <Input type="number" min={10} max={180} value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value || "0"))} required />
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Generating lesson…" : "Generate Lesson"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
