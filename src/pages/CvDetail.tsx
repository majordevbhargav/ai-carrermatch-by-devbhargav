import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Mail, Phone, Globe, MapPin, GraduationCap, Briefcase, Code2, Wrench, FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ExtractedExperience {
  title?: string;
  company?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  highlights?: string[];
}
interface ExtractedEducation {
  institution?: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  gpa?: string;
}
interface ExtractedProject {
  name?: string;
  description?: string;
  technologies?: string[];
  url?: string;
}
interface Extracted {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  summary?: string;
  skills?: string[];
  languages?: string[];
  experience?: ExtractedExperience[];
  education?: ExtractedEducation[];
  projects?: ExtractedProject[];
  certifications?: string[];
}

interface CvRow {
  id: string;
  label: string;
  file_name: string;
  status: "pending" | "parsing" | "ready" | "failed";
  error: string | null;
  extracted: Extracted | null;
  raw_text: string | null;
}

const Section = ({ icon: Icon, title, children, count }: { icon: any; title: string; children: React.ReactNode; count?: number }) => (
  <section className="surface-card p-6">
    <div className="flex items-center gap-2.5 mb-4">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
    {children}
  </section>
);

const CvDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [cv, setCv] = useState<CvRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [reparsing, setReparsing] = useState(false);

  const load = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from("cvs")
      .select("id,label,file_name,status,error,extracted,raw_text")
      .eq("id", id)
      .maybeSingle();
    if (error) toast.error(error.message);
    setCv(data as CvRow | null);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Poll while parsing
  useEffect(() => {
    if (cv?.status !== "parsing" && cv?.status !== "pending") return;
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cv?.status]);

  const reparse = async () => {
    if (!cv) return;
    setReparsing(true);
    try {
      const { error } = await supabase.functions.invoke("parse-cv", { body: { cvId: cv.id } });
      if (error) throw error;
      toast.success("Re-parsing started");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setReparsing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh">
        <AppHeader />
        <div className="container py-20 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="min-h-dvh">
        <AppHeader />
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">CV not found.</p>
          <Link to="/dashboard"><Button variant="link">Back to dashboard</Button></Link>
        </div>
      </div>
    );
  }

  const ex = cv.extracted ?? {};
  const isProcessing = cv.status === "pending" || cv.status === "parsing";

  return (
    <div className="min-h-dvh">
      <Helmet><title>{cv.label} · CareerMatch</title></Helmet>
      <AppHeader />

      <main className="container py-8 max-w-5xl">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">{cv.label}</h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" /> {cv.file_name}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={reparse} disabled={reparsing || isProcessing}>
            {reparsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Re-parse
          </Button>
        </div>

        {isProcessing && (
          <div className="surface-card p-8 text-center bg-primary-soft/40 border-primary/20">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-3" />
            <h2 className="font-display text-lg font-bold">AI is reading your CV…</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Extracting skills, experience, education and projects. This usually takes 5–15 seconds.
            </p>
          </div>
        )}

        {cv.status === "failed" && (
          <div className="surface-card p-6 border-destructive/30 bg-destructive/5">
            <h2 className="font-bold text-destructive">Parsing failed</h2>
            <p className="text-sm text-muted-foreground mt-1">{cv.error ?? "Unknown error"}</p>
            <Button className="mt-3" size="sm" onClick={reparse}>Try again</Button>
          </div>
        )}

        {cv.status === "ready" && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Header card */}
            <div className="surface-elevated p-6 md:p-8 bg-gradient-primary text-primary-foreground">
              <div className="text-xs uppercase tracking-wider opacity-80 mb-1">Profile</div>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold">
                {ex.full_name ?? "Your profile"}
              </h2>
              {ex.summary && <p className="mt-3 max-w-2xl opacity-95 leading-relaxed">{ex.summary}</p>}
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm opacity-95">
                {ex.email && <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{ex.email}</span>}
                {ex.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{ex.phone}</span>}
                {ex.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{ex.location}</span>}
                {ex.website && <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />{ex.website}</span>}
              </div>
            </div>

            {ex.skills && ex.skills.length > 0 && (
              <Section icon={Wrench} title="Skills" count={ex.skills.length}>
                <div className="flex flex-wrap gap-2">
                  {ex.skills.map((s) => (
                    <span key={s} className="chip bg-primary-soft text-primary border border-primary/15">{s}</span>
                  ))}
                </div>
              </Section>
            )}

            {ex.experience && ex.experience.length > 0 && (
              <Section icon={Briefcase} title="Experience" count={ex.experience.length}>
                <ol className="space-y-5">
                  {ex.experience.map((e, i) => (
                    <li key={i} className="border-l-2 border-primary/30 pl-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <h3 className="font-semibold">{e.title}{e.company && <span className="text-muted-foreground font-normal"> · {e.company}</span>}</h3>
                        <span className="text-xs text-muted-foreground font-mono">
                          {e.start_date ?? ""}{e.end_date ? ` – ${e.end_date}` : e.start_date ? " – present" : ""}
                        </span>
                      </div>
                      {e.location && <div className="text-xs text-muted-foreground">{e.location}</div>}
                      {e.description && <p className="text-sm mt-1.5 text-muted-foreground leading-relaxed">{e.description}</p>}
                      {e.highlights && e.highlights.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm list-disc pl-4 marker:text-primary">
                          {e.highlights.map((h, j) => <li key={j}>{h}</li>)}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {ex.education && ex.education.length > 0 && (
              <Section icon={GraduationCap} title="Education" count={ex.education.length}>
                <ul className="space-y-4">
                  {ex.education.map((e, i) => (
                    <li key={i}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <h3 className="font-semibold">{e.degree}{e.field_of_study && ` in ${e.field_of_study}`}</h3>
                        <span className="text-xs text-muted-foreground font-mono">
                          {e.start_date ?? ""}{e.end_date ? ` – ${e.end_date}` : ""}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">{e.institution}{e.gpa && ` · GPA ${e.gpa}`}</div>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {ex.projects && ex.projects.length > 0 && (
              <Section icon={Code2} title="Projects" count={ex.projects.length}>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {ex.projects.map((p, i) => (
                    <li key={i} className="rounded-xl border border-border p-4">
                      <h3 className="font-semibold">{p.name}</h3>
                      {p.description && <p className="text-sm text-muted-foreground mt-1">{p.description}</p>}
                      {p.technologies && p.technologies.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {p.technologies.map((t) => (
                            <span key={t} className="chip bg-muted text-muted-foreground text-[10px]">{t}</span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {ex.certifications && ex.certifications.length > 0 && (
              <Section icon={Wrench} title="Certifications" count={ex.certifications.length}>
                <ul className="list-disc pl-5 space-y-1 text-sm marker:text-primary">
                  {ex.certifications.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </Section>
            )}

            {ex.languages && ex.languages.length > 0 && (
              <Section icon={Globe} title="Languages" count={ex.languages.length}>
                <div className="flex flex-wrap gap-2">
                  {ex.languages.map((l) => (
                    <span key={l} className="chip bg-accent-soft text-accent border border-accent/15">{l}</span>
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CvDetail;
