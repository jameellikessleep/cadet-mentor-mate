import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send } from "lucide-react";
import type { Lesson } from "@/lib/lesson-types";

type Msg = { role: "user" | "assistant"; content: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export function LessonChat({ lesson }: { lesson: Lesson }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/lesson-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
        },
        body: JSON.stringify({ messages: next, lesson }),
      });
      if (!res.ok || !res.body) throw new Error("Chat failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          const l = line.trim();
          if (!l.startsWith("data:")) continue;
          const data = l.slice(5).trim();
          if (data === "[DONE]") break;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
              scrollRef.current?.scrollTo({ top: 999999 });
            }
          } catch {}
        }
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry — something went wrong. Try again." }]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition no-print"
        aria-label="Ask the lesson assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-[min(380px,calc(100vw-2rem))] h-[520px] flex flex-col shadow-2xl no-print">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground rounded-t-lg">
        <div>
          <div className="font-bold text-sm">Lesson Assistant</div>
          <div className="text-xs opacity-80">Ask anything about this lesson</div>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close"><X className="w-4 h-4" /></button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
        {messages.length === 0 && (
          <div className="text-muted-foreground text-xs">
            Try: "Explain the safety points", "Give me a quick quiz question on this slide", "What does EDIP mean?"
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <div className={`inline-block rounded-lg px-3 py-2 max-w-[85%] whitespace-pre-wrap ${
              m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}>
              {m.content || "…"}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="p-2 border-t flex gap-2"
      >
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question…" disabled={loading} />
        <Button type="submit" size="icon" disabled={loading || !input.trim()}><Send className="w-4 h-4" /></Button>
      </form>
    </Card>
  );
}
