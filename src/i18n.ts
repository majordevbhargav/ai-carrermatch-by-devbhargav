export type Lang = "es" | "en";

export const SUPPORTED_LANGS: Lang[] = ["es", "en"];
export const DEFAULT_LANG: Lang = "es";

export const langFromPath = (pathname: string): Lang => {
  const seg = pathname.split("/").filter(Boolean)[0];
  return seg === "en" ? "en" : "es";
};

export const otherLang = (l: Lang): Lang => (l === "es" ? "en" : "es");

type Dict = Record<string, string>;

const es: Dict = {
  "nav.about": "Sobre mí",
  "nav.experience": "Experiencia",
  "nav.projects": "Proyectos",
  "nav.architecture": "Arquitectura",
  "nav.cases": "Casos",
  "nav.contact": "Contacto",
  "hero.role": "AI Product Engineer · LLMOps · Agentes",
  "hero.tagline": "Construyo lo que describo.",
  "hero.intro": "Este CV es un sistema de producción: chatbot dual con RAG agéntico, observabilidad LLMOps, 71 evals automatizados y un closed-loop que se cura solo.",
  "hero.cta.chat": "Habla con Santi (IA)",
  "hero.cta.cases": "Ver casos de estudio",
  "hero.terminal.line1": "whoami",
  "hero.terminal.line2": "AI Product Engineer · construyo agentes en producción",
  "hero.terminal.line3": "ls ./skills",
  "about.title": "Sobre mí",
  "about.body": "Diseño y construyo agentes IA de extremo a extremo: RAG agéntico, evals como CI gate, observabilidad y defensa contra inyección. Mi enfoque: medir todo, automatizar el feedback, iterar con datos reales de producción.",
  "experience.title": "Experiencia",
  "projects.title": "Proyectos destacados",
  "skills.title": "Stack",
  "skills.subtitle": "Lo que uso a diario",
  "architecture.title": "Arquitectura del Chatbot",
  "architecture.subtitle": "10 fases · trazado completo · coste por span",
  "architecture.cta": "Explorar diagrama",
  "cases.title": "Casos de estudio",
  "cases.subtitle": "Sistemas reales en producción, documentados.",
  "cases.read": "Leer",
  "contact.title": "Contacto",
  "contact.body": "¿Construimos algo? Escríbeme.",
  "contact.email": "Email",
  "footer.built": "Construido con Lovable Cloud, RAG híbrido y muchos evals.",
  "lang.switch": "EN",
  "chat.placeholder": "Pregúntame lo que quieras...",
  "chat.title": "Habla con Santi",
  "chat.subtitle": "IA · responde como Santiago",
  "chat.send": "Enviar",
  "chat.thinking": "Pensando…",
  "chat.welcome": "¡Hola! Soy Santi, la versión IA de Santiago. Pregúntame sobre mi experiencia, proyectos o stack.",
  "chat.quick.exp": "Cuéntame tu experiencia",
  "chat.quick.stack": "¿Qué stack usas?",
  "chat.quick.cases": "Háblame de Career-Ops",
  "chat.error": "Algo falló. Intenta de nuevo.",
  "chat.rag.sources": "Fuentes",
};

const en: Dict = {
  "nav.about": "About",
  "nav.experience": "Experience",
  "nav.projects": "Projects",
  "nav.architecture": "Architecture",
  "nav.cases": "Cases",
  "nav.contact": "Contact",
  "hero.role": "AI Product Engineer · LLMOps · Agents",
  "hero.tagline": "I build what I describe.",
  "hero.intro": "This CV is a production system: dual chatbot with agentic RAG, full LLMOps observability, 71 automated evals and a closed-loop that heals itself.",
  "hero.cta.chat": "Talk to Santi (AI)",
  "hero.cta.cases": "View case studies",
  "hero.terminal.line1": "whoami",
  "hero.terminal.line2": "AI Product Engineer · I ship agents to production",
  "hero.terminal.line3": "ls ./skills",
  "about.title": "About",
  "about.body": "I design and build end-to-end AI agents: agentic RAG, evals as CI gate, full observability and prompt-injection defense. My approach: measure everything, automate the feedback loop, iterate on real production data.",
  "experience.title": "Experience",
  "projects.title": "Featured projects",
  "skills.title": "Stack",
  "skills.subtitle": "What I use daily",
  "architecture.title": "Chatbot Architecture",
  "architecture.subtitle": "10 phases · full tracing · cost per span",
  "architecture.cta": "Explore diagram",
  "cases.title": "Case studies",
  "cases.subtitle": "Real systems in production, documented.",
  "cases.read": "Read",
  "contact.title": "Contact",
  "contact.body": "Want to build something? Reach out.",
  "contact.email": "Email",
  "footer.built": "Built with Lovable Cloud, hybrid RAG and lots of evals.",
  "lang.switch": "ES",
  "chat.placeholder": "Ask me anything...",
  "chat.title": "Talk to Santi",
  "chat.subtitle": "AI · answers as Santiago",
  "chat.send": "Send",
  "chat.thinking": "Thinking…",
  "chat.welcome": "Hi! I'm Santi, the AI version of Santiago. Ask me about my experience, projects or stack.",
  "chat.quick.exp": "Tell me about your experience",
  "chat.quick.stack": "What's your stack?",
  "chat.quick.cases": "Tell me about Career-Ops",
  "chat.error": "Something went wrong. Try again.",
  "chat.rag.sources": "Sources",
};

const dicts: Record<Lang, Dict> = { es, en };

export const t = (lang: Lang, key: string): string => dicts[lang][key] ?? key;

export const langPath = (lang: Lang, path = ""): string => {
  const clean = path.replace(/^\/+/, "");
  return `/${lang}${clean ? `/${clean}` : ""}`;
};
