import { motion } from "framer-motion";
import { Lang, t } from "@/i18n";
import { projects, skillCategories, caseStudies, localized } from "@/content";
import { SectionHeader } from "./ExperienceSection";
import { ArrowUpRight } from "lucide-react";

export const About = ({ lang }: { lang: Lang }) => (
  <section id="about" className="py-20 border-t border-border/50">
    <div className="container">
      <SectionHeader eyebrow="01" title={t(lang, "about.title")} />
      <p className="mt-6 max-w-3xl text-lg text-muted-foreground leading-relaxed">{t(lang, "about.body")}</p>
    </div>
  </section>
);

export const Projects = ({ lang }: { lang: Lang }) => (
  <section id="projects" className="py-20 border-t border-border/50">
    <div className="container">
      <SectionHeader eyebrow="03" title={t(lang, "projects.title")} />
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className="surface-card p-5 hover:border-primary/40 hover:shadow-[var(--glow-primary)] transition-all group"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base">{p.title}</h3>
              <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{localized(p.blurb, lang)}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {p.tags.map((t) => (
                <span key={t} className="badge-tech text-[10px] px-2 py-0.5">{t}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export const Skills = ({ lang }: { lang: Lang }) => (
  <section id="skills" className="py-20 border-t border-border/50">
    <div className="container">
      <SectionHeader eyebrow="04" title={t(lang, "skills.title")} subtitle={t(lang, "skills.subtitle")} />
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skillCategories.map((cat) => (
          <div key={cat.label.en} className="surface-card p-5">
            <div className="font-mono text-xs text-primary mb-3">{localized(cat.label, lang)}</div>
            <div className="flex flex-wrap gap-1.5">
              {cat.items.map((item) => (
                <span key={item} className="badge-tech">{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const ArchitectureSection = ({ lang }: { lang: Lang }) => (
  <section id="architecture" className="py-20 border-t border-border/50">
    <div className="container">
      <SectionHeader
        eyebrow="05"
        title={t(lang, "architecture.title")}
        subtitle={t(lang, "architecture.subtitle")}
      />
      <div className="mt-10 surface-card p-6 sm:p-8 overflow-hidden">
        <div className="font-mono text-xs sm:text-sm leading-relaxed text-muted-foreground space-y-1 overflow-x-auto">
          <div><span className="text-primary">user</span> → <span className="text-secondary">FloatingChat</span> → <span className="text-secondary">/api/chat</span></div>
          <div className="pl-6">├── system prompt <span className="text-primary">(Langfuse + fallback)</span></div>
          <div className="pl-6">├── tool_use decision <span className="text-primary">(Sonnet)</span></div>
          <div className="pl-6">├── <span className="text-secondary">agentic RAG</span> if needed:</div>
          <div className="pl-12">├── embeddings <span className="text-muted-foreground/70">(text-embedding-3-small)</span></div>
          <div className="pl-12">├── <span className="text-secondary">pgvector</span> + BM25 hybrid search</div>
          <div className="pl-12">└── <span className="text-secondary">Haiku</span> rerank + diversify</div>
          <div className="pl-6">├── Sonnet streaming generation</div>
          <div className="pl-6">├── <span className="text-primary">Langfuse</span> tracing — every span + cost</div>
          <div className="pl-6">└── waitUntil → Haiku scoring <span className="text-muted-foreground/70">(0ms latency)</span></div>
          <div className="mt-3 text-warning">⎯ closed loop ⎯</div>
          <div>quality &lt; 0.7 → auto-generate test → CI gate blocks deploy</div>
        </div>
      </div>
    </div>
  </section>
);

export const Cases = ({ lang }: { lang: Lang }) => (
  <section id="cases" className="py-20 border-t border-border/50">
    <div className="container">
      <SectionHeader eyebrow="06" title={t(lang, "cases.title")} subtitle={t(lang, "cases.subtitle")} />
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {caseStudies.map((c, i) => (
          <motion.article
            key={c.slug.en}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="surface-card p-6 group hover:border-primary/40 transition-colors"
          >
            <h3 className="text-lg font-semibold">{localized(c.title, lang)}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{localized(c.summary, lang)}</p>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
              {c.metrics.map((m) => (
                <div key={m.value}>
                  <div className="font-mono text-base text-primary font-semibold">{m.value}</div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">
                    {localized(m.label, lang)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-1">
              {c.tags.map((t) => (
                <span key={t} className="badge-tech text-[10px]">{t}</span>
              ))}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export const Contact = ({ lang }: { lang: Lang }) => (
  <section id="contact" className="py-20 border-t border-border/50">
    <div className="container max-w-2xl">
      <SectionHeader eyebrow="07" title={t(lang, "contact.title")} />
      <p className="mt-6 text-lg text-muted-foreground">{t(lang, "contact.body")}</p>
      <a
        href="mailto:hi@santifer.io"
        className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
      >
        hi@santifer.io →
      </a>
    </div>
  </section>
);

export const Footer = ({ lang }: { lang: Lang }) => (
  <footer className="border-t border-border/50 py-10 mt-10">
    <div className="container flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
      <span>© {new Date().getFullYear()} santifer · MIT</span>
      <span>{t(lang, "footer.built")}</span>
    </div>
  </footer>
);
