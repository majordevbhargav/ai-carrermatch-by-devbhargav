import { motion } from "framer-motion";
import { Briefcase, MapPin } from "lucide-react";
import { Lang, t } from "@/i18n";
import { experience, localized } from "@/content";

export const ExperienceSection = ({ lang }: { lang: Lang }) => (
  <section id="experience" className="py-20 border-t border-border/50">
    <div className="container">
      <SectionHeader eyebrow="02" title={t(lang, "experience.title")} />
      <div className="mt-10 space-y-6">
        {experience.map((job, i) => (
          <motion.article
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="surface-card p-6 sm:p-8 hover:border-primary/30 transition-colors"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-primary">
                  <Briefcase className="size-3" />
                  {job.company}
                </div>
                <h3 className="mt-1 text-xl font-semibold">{job.role}</h3>
              </div>
              <div className="text-right text-sm text-muted-foreground font-mono">
                <div>{job.period}</div>
                <div className="flex items-center gap-1 justify-end mt-0.5 text-xs">
                  <MapPin className="size-3" /> {job.location}
                </div>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              {job.bullets.map((b, j) => (
                <li key={j} className="flex gap-2">
                  <span className="text-primary mt-1.5">▸</span>
                  <span>{localized(b, lang)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {job.tags.map((tag) => (
                <span key={tag} className="badge-tech">{tag}</span>
              ))}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export const SectionHeader = ({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) => (
  <div className="flex items-end justify-between gap-4">
    <div>
      <div className="font-mono text-xs text-primary mb-2">// {eyebrow}</div>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
    </div>
  </div>
);
