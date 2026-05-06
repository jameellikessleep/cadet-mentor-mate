import type { Slide } from "@/lib/lesson-types";

export function SlideView({ slide, index, total }: { slide: Slide; index: number; total: number }) {
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-background to-muted text-foreground p-12 flex flex-col">
      <div className="absolute top-6 right-8 text-xs tracking-[0.3em] uppercase text-muted-foreground">
        Slide {index + 1} / {total}
      </div>
      <div className="absolute top-6 left-8 h-1 w-16 bg-primary rounded-full" />
      <h1 className="mt-12 text-5xl font-bold tracking-tight text-primary">{slide.title}</h1>
      <ul className="mt-10 space-y-5 text-2xl leading-relaxed">
        {slide.bullets.map((b, i) => (
          <li key={i} className="flex gap-4">
            <span className="text-primary font-bold">▸</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto text-xs uppercase tracking-widest text-muted-foreground">
        ACF Cadet Lesson
      </div>
    </div>
  );
}
