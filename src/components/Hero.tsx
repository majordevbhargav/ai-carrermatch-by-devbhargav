import { motion } from "framer-motion";
import { ArrowRight, MessageSquareText, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Lang, t } from "@/i18n";

interface Props {
  lang: Lang;
  onOpenChat: () => void;
}

const LINES = (lang: Lang) => [
  { prompt: t(lang, "hero.terminal.line1"), out: t(lang, "hero.terminal.line2") },
  { prompt: t(lang, "hero.terminal.line3"), out: "claude · pgvector · langfuse · evals · n8n · supabase" },
];

export const Hero = ({ lang, onOpenChat }: Props) => {
  const [step, setStep] = useState(0);
  const lines = LINES(lang);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, lines.length * 2)), 700);
    return () => clearInterval(id);
  }, [lines.length]);

  return (
    <section className="relative pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-mono text-primary mb-6">
            <Sparkles className="size-3" />
            {t(lang, "hero.role")}
          </div>

          <h1 className="font-sans text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
            <span className="text-gradient">{t(lang, "hero.tagline")}</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            {t(lang, "hero.intro")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={onOpenChat}
              className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90 shadow-[var(--glow-primary)]"
            >
              <MessageSquareText className="size-4" />
              {t(lang, "hero.cta.chat")}
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#cases">
                {t(lang, "hero.cta.cases")}
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-12 surface-card overflow-hidden max-w-2xl"
        >
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-surface-2">
            <span className="size-2.5 rounded-full bg-destructive/70" />
            <span className="size-2.5 rounded-full bg-warning/70" />
            <span className="size-2.5 rounded-full bg-success/70" />
            <span className="ml-3 font-mono text-xs text-muted-foreground">~/santifer</span>
          </div>
          <div className="p-5 font-mono text-sm space-y-2 min-h-[160px]">
            {lines.map((l, i) => {
              const promptShown = step >= i * 2;
              const outShown = step >= i * 2 + 1;
              return (
                <div key={i}>
                  {promptShown && (
                    <div>
                      <span className="text-primary">$ </span>
                      <span className="text-foreground">{l.prompt}</span>
                    </div>
                  )}
                  {outShown && <div className="text-muted-foreground pl-4">{l.out}</div>}
                </div>
              );
            })}
            {step >= lines.length * 2 && (
              <div>
                <span className="text-primary">$ </span>
                <span className="blink-caret text-primary">▊</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
