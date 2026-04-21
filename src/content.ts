import type { Lang } from "./i18n";

export type Experience = {
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: { es: string; en: string }[];
  tags: string[];
};

export type Project = {
  title: string;
  blurb: { es: string; en: string };
  tags: string[];
  href?: string;
};

export type CaseStudy = {
  slug: { es: string; en: string };
  title: { es: string; en: string };
  summary: { es: string; en: string };
  metrics: { label: { es: string; en: string }; value: string }[];
  tags: string[];
};

export const profile = {
  name: "Santiago Fernández",
  handle: "santifer",
  email: "hi@santifer.io",
  github: "https://github.com/santifer",
  location: { es: "Madrid, España · Remoto", en: "Madrid, Spain · Remote" },
};

export const experience: Experience[] = [
  {
    company: "Independent",
    role: "AI Product Engineer",
    period: "2024 — now",
    location: "Remote",
    bullets: [
      {
        es: "Construyo agentes IA de producción: RAG agéntico, evals como CI gate, observabilidad LLMOps custom.",
        en: "Building production AI agents: agentic RAG, evals as CI gate, custom LLMOps observability.",
      },
      {
        es: "Closed-loop de auto-curación: trazas → scoring online → tests auto-generados de fallos reales.",
        en: "Self-healing closed loop: traces → online scoring → auto-generated tests from real failures.",
      },
      {
        es: "Defensa multi-capa contra prompt injection con alertas en tiempo real.",
        en: "Multi-layer prompt-injection defense with real-time alerts.",
      },
    ],
    tags: ["Claude", "RAG", "pgvector", "Langfuse", "Evals"],
  },
  {
    company: "Santifer iRepair",
    role: "Founder · Operator",
    period: "2018 — 2024",
    location: "Madrid",
    bullets: [
      {
        es: "Fundé y escalé un negocio de reparación con sistema operativo en Airtable + automatizaciones.",
        en: "Founded and scaled a repair business with an Airtable-based OS + automations.",
      },
      {
        es: "Diseñé Career-Ops: sistema personal de tracking de oportunidades con scoring IA.",
        en: "Designed Career-Ops: personal opportunity-tracking system with AI scoring.",
      },
    ],
    tags: ["Airtable", "n8n", "Ops", "Founder"],
  },
  {
    company: "PM Collabs",
    role: "Automation Lead",
    period: "2022 — 2024",
    location: "Remote",
    bullets: [
      {
        es: "Implanté n8n como capa de automatización para equipos de producto.",
        en: "Rolled out n8n as the automation layer for product teams.",
      },
      {
        es: "SEO programático: pipelines que generan 1000+ páginas indexables al mes.",
        en: "Programmatic SEO: pipelines generating 1000+ indexable pages per month.",
      },
    ],
    tags: ["n8n", "SEO", "Pipelines"],
  },
];

export const projects: Project[] = [
  {
    title: "Self-Healing Chatbot",
    blurb: {
      es: "Chatbot que detecta sus propios fallos en producción y genera tests para no repetirlos.",
      en: "Chatbot that detects its own production failures and auto-generates tests to never repeat them.",
    },
    tags: ["Claude", "Langfuse", "CI/CD"],
  },
  {
    title: "Career-Ops",
    blurb: {
      es: "Sistema personal de tracking de oportunidades con scoring IA y dashboard custom.",
      en: "Personal opportunity-tracking system with AI scoring and custom dashboard.",
    },
    tags: ["Airtable", "GPT", "Dashboard"],
  },
  {
    title: "Agente IA Jacobo",
    blurb: {
      es: "Agente conversacional para automatizar onboarding interno con tool calling.",
      en: "Conversational agent that automates internal onboarding with tool calling.",
    },
    tags: ["Agent", "Tools", "RAG"],
  },
  {
    title: "Business OS · Airtable",
    blurb: {
      es: "Sistema operativo de negocio en Airtable: 12 tablas, 40+ automatizaciones.",
      en: "Business OS on Airtable: 12 tables, 40+ automations.",
    },
    tags: ["Airtable", "Ops"],
  },
  {
    title: "Programmatic SEO",
    blurb: {
      es: "Pipelines que generan 1000+ páginas SEO al mes con datos estructurados.",
      en: "Pipelines generating 1000+ SEO pages per month with structured data.",
    },
    tags: ["SEO", "Pipelines"],
  },
  {
    title: "n8n para PMs",
    blurb: {
      es: "Workshop y plantillas de automatización para equipos de producto.",
      en: "Workshop and automation templates for product teams.",
    },
    tags: ["n8n", "Workshop"],
  },
];

export const skillCategories = [
  {
    label: { es: "IA & LLMs", en: "AI & LLMs" },
    items: ["Claude Sonnet/Haiku", "GPT-5", "Gemini 2.5", "OpenAI Realtime", "Tool calling", "Function calling"],
  },
  {
    label: { es: "RAG & Vector", en: "RAG & Vector" },
    items: ["pgvector", "Hybrid search (BM25)", "Reranking", "Chunk strategies", "Embeddings"],
  },
  {
    label: { es: "LLMOps", en: "LLMOps" },
    items: ["Langfuse", "Evals (LLM-judge)", "Prompt registry", "CI gates", "Cost tracing"],
  },
  {
    label: { es: "Infra", en: "Infra" },
    items: ["Supabase", "Vercel Edge", "Postgres", "Edge Functions", "Deno"],
  },
  {
    label: { es: "Frontend", en: "Frontend" },
    items: ["React 18", "TypeScript", "Vite", "Tailwind", "Framer Motion"],
  },
  {
    label: { es: "Automatización", en: "Automation" },
    items: ["n8n", "Airtable", "Resend", "Webhooks", "GitHub Actions"],
  },
];

export const caseStudies: CaseStudy[] = [
  {
    slug: { es: "chatbot-que-se-cura-solo", en: "self-healing-chatbot" },
    title: {
      es: "El chatbot que se cura solo",
      en: "The self-healing chatbot",
    },
    summary: {
      es: "Closed-loop completo: trazas → scoring online con Haiku → si quality < 0.7 → auto-genera test → CI gate bloquea deploy hasta arreglarlo.",
      en: "Full closed loop: traces → online scoring with Haiku → if quality < 0.7 → auto-generate test → CI gate blocks deploy until fixed.",
    },
    metrics: [
      { label: { es: "Evals", en: "Evals" }, value: "71" },
      { label: { es: "Categorías", en: "Categories" }, value: "10" },
      { label: { es: "Coste / chat", en: "Cost / chat" }, value: "<$0.005" },
    ],
    tags: ["Closed-loop", "Evals", "CI/CD", "Langfuse"],
  },
  {
    slug: { es: "career-ops", en: "career-ops-system" },
    title: { es: "Career-Ops", en: "Career-Ops System" },
    summary: {
      es: "Sistema personal de tracking de oportunidades con scoring IA, integrado con LinkedIn y email.",
      en: "Personal opportunity-tracking system with AI scoring, integrated with LinkedIn and email.",
    },
    metrics: [
      { label: { es: "Oportunidades", en: "Opportunities" }, value: "300+" },
      { label: { es: "Modelos", en: "Models" }, value: "3" },
      { label: { es: "Tiempo ahorrado", en: "Time saved" }, value: "~6h/sem" },
    ],
    tags: ["Airtable", "GPT", "Scoring"],
  },
  {
    slug: { es: "seo-programatico", en: "programmatic-seo" },
    title: { es: "SEO Programático", en: "Programmatic SEO" },
    summary: {
      es: "Pipelines que generan 1000+ páginas indexables al mes con JSON-LD, sitemaps dinámicos y validación automática.",
      en: "Pipelines generating 1000+ indexable pages per month with JSON-LD, dynamic sitemaps and automated validation.",
    },
    metrics: [
      { label: { es: "Páginas / mes", en: "Pages / month" }, value: "1000+" },
      { label: { es: "Indexación", en: "Indexed" }, value: "92%" },
      { label: { es: "Build time", en: "Build time" }, value: "<3min" },
    ],
    tags: ["SEO", "Pipelines", "JSON-LD"],
  },
];

export const localized = <T,>(value: { es: T; en: T }, lang: Lang): T => value[lang];
