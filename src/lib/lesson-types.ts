export type LessonPlanRow = { time: string; notes: string; remarks: string };
export type Slide = { title: string; bullets: string[]; speakerNotes: string };
export type Lesson = {
  title: string;
  aim: string;
  objectives: string[];
  safety: string[];
  equipment: string[];
  plan: LessonPlanRow[];
  slides: Slide[];
  resources: {
    youtubeQueries: string[];
    worksheets: string[];
    references: string[];
  };
};

export type LessonInput = {
  starLevel: string;
  cadetCount: number;
  lessonTopic: string;
  durationMinutes: number;
};
