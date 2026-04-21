import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { GlobalNav } from "@/components/GlobalNav";
import { Hero } from "@/components/Hero";
import { About, ArchitectureSection, Cases, Contact, Footer, Projects, Skills } from "@/components/Sections";
import { ExperienceSection } from "@/components/ExperienceSection";
import { FloatingChat } from "@/components/FloatingChat";
import { Lang, SUPPORTED_LANGS } from "@/i18n";
import { profile } from "@/content";

const Index = () => {
  const { lang: rawLang } = useParams<{ lang: string }>();
  const [chatOpen, setChatOpen] = useState(false);

  if (!rawLang || !SUPPORTED_LANGS.includes(rawLang as Lang)) {
    return <Navigate to="/es" replace />;
  }
  const lang = rawLang as Lang;

  const title =
    lang === "es"
      ? `${profile.name} · AI Product Engineer · LLMOps & Agentes`
      : `${profile.name} · AI Product Engineer · LLMOps & Agents`;
  const desc =
    lang === "es"
      ? "CV interactivo de producción: chatbot dual con RAG agéntico, observabilidad LLMOps, 71 evals automatizados y closed-loop de auto-curación."
      : "Production interactive CV: dual chatbot with agentic RAG, LLMOps observability, 71 automated evals and self-healing closed loop.";

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: profile.handle,
    jobTitle: lang === "es" ? "AI Product Engineer" : "AI Product Engineer",
    email: `mailto:${profile.email}`,
    url: typeof window !== "undefined" ? window.location.origin : "https://santifer.io",
    sameAs: [profile.github],
    knowsAbout: ["AI", "LLM", "RAG", "LLMOps", "Agents", "Evals", "Prompt Engineering"],
  };

  return (
    <>
      <Helmet>
        <html lang={lang} />
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="alternate" hrefLang="es" href={`/es`} />
        <link rel="alternate" hrefLang="en" href={`/en`} />
        <link rel="alternate" hrefLang="x-default" href={`/es`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(personJsonLd)}</script>
      </Helmet>

      <GlobalNav />
      <main>
        <Hero lang={lang} onOpenChat={() => setChatOpen(true)} />
        <About lang={lang} />
        <ExperienceSection lang={lang} />
        <Projects lang={lang} />
        <Skills lang={lang} />
        <ArchitectureSection lang={lang} />
        <Cases lang={lang} />
        <Contact lang={lang} />
      </main>
      <Footer lang={lang} />
      <FloatingChat lang={lang} open={chatOpen} setOpen={setChatOpen} />
    </>
  );
};

export default Index;
