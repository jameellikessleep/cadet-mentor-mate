// Generates a structured cadet lesson plan + slides + resources via Lovable AI
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { starLevel, cadetCount, lessonTopic, durationMinutes } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an expert UK Army Cadet Force (ACF) instructor designing lessons aligned to the ACF Star syllabus (Basic, 1-Star, 2-Star, 3-Star, 4-Star). Produce safe, age-appropriate, doctrinally-sound content. Use British military terminology and units. Reference the relevant ACF Cadet Training Manual chapter where possible.`;

    const userPrompt = `Design a complete ${durationMinutes}-minute lesson.

Star Level: ${starLevel}
Number of cadets: ${cadetCount}
Lesson topic: ${lessonTopic}

Build the lesson plan in standard military "time / notes / remarks" columns covering: introduction (aim, objectives, safety, revision), main teaching stages (EDIP - Explain, Demonstrate, Imitate, Practise), confirmation, and conclusion (summary, questions, look-forward, pack-away).

Also produce 8-14 teaching slides (title + concise bullets / key teaching points), and suggest reliable resources (YouTube search queries an instructor can run, worksheet/handout ideas, and references to the ACF manual).`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "build_lesson",
              description: "Return the structured lesson",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  aim: { type: "string" },
                  objectives: { type: "array", items: { type: "string" } },
                  safety: { type: "array", items: { type: "string" } },
                  equipment: { type: "array", items: { type: "string" } },
                  plan: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        time: { type: "string", description: "e.g. '0-5 min' or '5 min'" },
                        notes: { type: "string", description: "What the instructor teaches/says/does" },
                        remarks: { type: "string", description: "Method, aids, safety reminders, key points" },
                      },
                      required: ["time", "notes", "remarks"],
                      additionalProperties: false,
                    },
                  },
                  slides: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        bullets: { type: "array", items: { type: "string" } },
                        speakerNotes: { type: "string" },
                      },
                      required: ["title", "bullets", "speakerNotes"],
                      additionalProperties: false,
                    },
                  },
                  resources: {
                    type: "object",
                    properties: {
                      youtubeQueries: { type: "array", items: { type: "string" } },
                      worksheets: { type: "array", items: { type: "string" } },
                      references: { type: "array", items: { type: "string" } },
                    },
                    required: ["youtubeQueries", "worksheets", "references"],
                    additionalProperties: false,
                  },
                },
                required: ["title", "aim", "objectives", "safety", "equipment", "plan", "slides", "resources"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "build_lesson" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please wait and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned");
    const lesson = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ lesson }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
