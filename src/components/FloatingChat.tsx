import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquareText, Send, X, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Lang, t } from "@/i18n";

type Msg = { role: "user" | "assistant"; content: string };

interface Props {
  lang: Lang;
  open: boolean;
  setOpen: (v: boolean) => void;
}

export const FloatingChat = ({ lang, open, setOpen }: Props) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);

    // TODO (Phase 4): hook to /api/chat edge function with streaming + RAG
    // Placeholder local response so UI is testable now
    await new Promise((r) => setTimeout(r, 700));
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        content:
          lang === "es"
            ? "_(El backend del chatbot se conecta en la siguiente fase: edge function + RAG + Lovable AI streaming.)_\n\nPor ahora la UI está lista y verás aquí mis respuestas con **markdown**, fuentes y badges."
            : "_(The chatbot backend wires up next phase: edge function + RAG + Lovable AI streaming.)_\n\nFor now the UI is ready — you'll see my answers here with **markdown**, sources and badges.",
      },
    ]);
    setLoading(false);
  };

  const quickPrompts = [
    t(lang, "chat.quick.exp"),
    t(lang, "chat.quick.stack"),
    t(lang, "chat.quick.cases"),
  ];

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-5 z-50 size-14 rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground grid place-items-center shadow-[var(--glow-primary)] hover:scale-105 transition-transform"
      >
        {open ? <X className="size-6" /> : <MessageSquareText className="size-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 size-3 rounded-full bg-secondary animate-pulse-glow" />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-3 left-3 sm:left-auto sm:right-5 z-50 sm:w-[400px] max-h-[min(640px,calc(100vh-7rem))] flex flex-col surface-card overflow-hidden glass"
            role="dialog"
            aria-label="Chat with Santi"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface-2/50">
              <div className="size-9 rounded-full bg-gradient-to-br from-primary to-secondary grid place-items-center shrink-0">
                <Sparkles className="size-4 text-background" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm">{t(lang, "chat.title")}</div>
                <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-success animate-pulse" />
                  {t(lang, "chat.subtitle")}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.length === 0 && (
                <div className="text-sm text-muted-foreground py-2">{t(lang, "chat.welcome")}</div>
              )}
              {messages.map((m, i) => (
                <Bubble key={i} msg={m} />
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <Loader2 className="size-3 animate-spin" /> {t(lang, "chat.thinking")}
                </div>
              )}
            </div>

            {/* Quick prompts */}
            {messages.length === 0 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {quickPrompts.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-xs px-2.5 py-1.5 rounded-md border border-border bg-surface-2 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2 p-3 border-t border-border bg-surface-2/50"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t(lang, "chat.placeholder")}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label={t(lang, "chat.send")}
                className="size-8 grid place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                <Send className="size-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Bubble = ({ msg }: { msg: Msg }) => {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-surface-3 text-foreground rounded-bl-sm border border-border"
        }`}
      >
        {isUser ? (
          <span>{msg.content}</span>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-strong:text-primary prose-em:text-muted-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};
