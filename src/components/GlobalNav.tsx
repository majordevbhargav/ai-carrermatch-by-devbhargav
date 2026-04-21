import { Link, useLocation } from "react-router-dom";
import { Globe, Github, Mail, Terminal } from "lucide-react";
import { langFromPath, langPath, otherLang, t, profile } from "@/lib/site";

export const GlobalNav = () => {
  const loc = useLocation();
  const lang = langFromPath(loc.pathname);
  const swap = otherLang(lang);
  // Swap language: keep the path tail
  const tail = loc.pathname.replace(/^\/(es|en)/, "");
  const swapHref = `/${swap}${tail}`;

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/50">
      <div className="container flex h-14 items-center justify-between">
        <Link to={langPath(lang)} className="flex items-center gap-2 group">
          <div className="size-7 rounded-md bg-gradient-to-br from-primary to-secondary grid place-items-center">
            <Terminal className="size-4 text-background" />
          </div>
          <span className="font-mono text-sm font-semibold tracking-tight">
            {profile.handle}
            <span className="text-primary blink-caret">_</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {[
            { key: "nav.about", href: "#about" },
            { key: "nav.experience", href: "#experience" },
            { key: "nav.projects", href: "#projects" },
            { key: "nav.architecture", href: "#architecture" },
            { key: "nav.cases", href: "#cases" },
            { key: "nav.contact", href: "#contact" },
          ].map(({ key, href }) => (
            <a
              key={key}
              href={href}
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {t(lang, key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            to={swapHref}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            aria-label="Switch language"
          >
            <Globe className="size-3.5" />
            {t(lang, "lang.switch")}
          </Link>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Github className="size-4" />
          </a>
          <a
            href={`mailto:${profile.email}`}
            aria-label="Email"
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Mail className="size-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
