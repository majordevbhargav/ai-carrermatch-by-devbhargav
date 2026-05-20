import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, ArrowLeft, GraduationCap, Briefcase, Code2, Wrench, FileText,
  RefreshCw, Save, Plus, Trash2, User, Globe, Award,
} from "lucide-react";
import { toast } from "sonner";

interface ExtractedExperience {
  title?: string; company?: string; location?: string;
  start_date?: string; end_date?: string; description?: string;
  highlights?: string[];
}
interface ExtractedEducation {
  institution?: string; degree?: string; field_of_study?: string;
  start_date?: string; end_date?: string; gpa?: string;
}
interface ExtractedProject {
  name?: string; description?: string; technologies?: string[]; url?: string;
}
interface Extracted {
  full_name?: string; email?: string; phone?: string; location?: string; website?: string;
  summary?: string;
  skills?: string[]; languages?: string[]; certifications?: string[];
  experience?: ExtractedExperience[];
  education?: ExtractedEducation[];
  projects?: ExtractedProject[];
}

interface CvRow {
  id: string;
  label: string;
  file_name: string;
  status: "pending" | "parsing" | "ready" | "failed";
  error: string | null;
  extracted: Extracted | null;
}

const emptyData: Extracted = {
  full_name: "", email: "", phone: "", location: "", website: "", summary: "",
  skills: [], languages: [], certifications: [],
  experience: [], education: [], projects: [],
};

const normalize = (e: Extracted | null): Extracted => ({
  ...emptyData,
  ...(e ?? {}),
  skills: e?.skills ?? [],
  languages: e?.languages ?? [],
  certifications: e?.certifications ?? [],
  experience: e?.experience ?? [],
  education: e?.education ?? [],
  projects: e?.projects ?? [],
});

const SectionCard = ({ icon: Icon, title, action, children }: {
  icon: any; title: string; action?: React.ReactNode; children: React.ReactNode;
}) => (
  <section className="surface-card p-6">
    <div className="flex items-center justify-between gap-3 mb-5">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="font-display text-lg font-bold">{title}</h2>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {children}
  </div>
);

// Tag/chip editor for string arrays
const TagEditor = ({ value, onChange, placeholder }: {
  value: string[]; onChange: (v: string[]) => void; placeholder: string;
}) => {
  const [draft, setDraft] = useState("");
  const add = () => {
    const items = draft.split(",").map((s) => s.trim()).filter(Boolean);
    if (!items.length) return;
    const next = Array.from(new Set([...value, ...items]));
    onChange(next);
    setDraft("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.length === 0 && (
          <span className="text-xs text-muted-foreground italic">Nothing yet — add below.</span>
        )}
        {value.map((tag, i) => (
          <span key={`${tag}-${i}`} className="chip bg-primary-soft text-primary border border-primary/15 group">
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="ml-1 opacity-60 hover:opacity-100"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
          }}
          placeholder={placeholder}
        />
        <Button type="button" variant="outline" onClick={add}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
    </div>
  );
};

const CvDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [cv, setCv] = useState<CvRow | null>(null);
  const [data, setData] = useState<Extracted>(emptyData);
  const [initialData, setInitialData] = useState<Extracted>(emptyData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reparsing, setReparsing] = useState(false);

  const load = async () => {
    if (!id) return;
    const { data: row, error } = await supabase
      .from("cvs")
      .select("id,label,file_name,status,error,extracted")
      .eq("id", id)
      .maybeSingle();
    if (error) toast.error(error.message);
    const typed = row as CvRow | null;
    setCv(typed);
    if (typed) {
      const n = normalize(typed.extracted);
      setData(n);
      setInitialData(n);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  // Poll while parsing
  useEffect(() => {
    if (cv?.status !== "parsing" && cv?.status !== "pending") return;
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [cv?.status]);

  const dirty = useMemo(
    () => JSON.stringify(data) !== JSON.stringify(initialData),
    [data, initialData],
  );

  const save = async () => {
    if (!cv) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("cvs")
        .update({ extracted: data as any })
        .eq("id", cv.id);
      if (error) throw error;
      setInitialData(data);
      toast.success("CV details saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const reparse = async () => {
    if (!cv) return;
    if (dirty && !confirm("You have unsaved edits. Re-parsing will overwrite them. Continue?")) return;
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

  // Helpers to update list items immutably
  const updateExp = (i: number, patch: Partial<ExtractedExperience>) =>
    setData((d) => ({ ...d, experience: d.experience!.map((e, j) => j === i ? { ...e, ...patch } : e) }));
  const updateEdu = (i: number, patch: Partial<ExtractedEducation>) =>
    setData((d) => ({ ...d, education: d.education!.map((e, j) => j === i ? { ...e, ...patch } : e) }));
  const updateProj = (i: number, patch: Partial<ExtractedProject>) =>
    setData((d) => ({ ...d, projects: d.projects!.map((p, j) => j === i ? { ...p, ...patch } : p) }));

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

  const isProcessing = cv.status === "pending" || cv.status === "parsing";

  return (
    <div className="min-h-dvh">
      <Helmet><title>{cv.label} · CareerMatch</title></Helmet>
      <AppHeader />

      <main className="container py-8 max-w-5xl pb-32">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold">{cv.label}</h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" /> {cv.file_name}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={reparse} disabled={reparsing || isProcessing}>
            {reparsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Re-parse with AI
          </Button>
        </div>

        {isProcessing && (
          <div className="surface-card p-8 text-center bg-primary-soft/40 border-primary/20">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-3" />
            <h2 className="font-display text-lg font-bold">AI is reading your CV…</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Extracting skills, experience, education and projects.
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
            <SectionCard icon={User} title="Profile">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name">
                  <Input value={data.full_name ?? ""} onChange={(e) => setData({ ...data, full_name: e.target.value })} />
                </Field>
                <Field label="Email">
                  <Input type="email" value={data.email ?? ""} onChange={(e) => setData({ ...data, email: e.target.value })} />
                </Field>
                <Field label="Phone">
                  <Input value={data.phone ?? ""} onChange={(e) => setData({ ...data, phone: e.target.value })} />
                </Field>
                <Field label="Location">
                  <Input value={data.location ?? ""} onChange={(e) => setData({ ...data, location: e.target.value })} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Website / portfolio">
                    <Input value={data.website ?? ""} onChange={(e) => setData({ ...data, website: e.target.value })} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Summary">
                    <Textarea
                      rows={4}
                      value={data.summary ?? ""}
                      onChange={(e) => setData({ ...data, summary: e.target.value })}
                      placeholder="A short overview used to tailor applications."
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={Wrench} title="Skills">
              <TagEditor
                value={data.skills ?? []}
                onChange={(v) => setData({ ...data, skills: v })}
                placeholder="Add a skill (Enter to confirm, comma to separate)"
              />
            </SectionCard>

            <SectionCard
              icon={Briefcase}
              title="Experience"
              action={
                <Button type="button" variant="outline" size="sm" onClick={() =>
                  setData({ ...data, experience: [...(data.experience ?? []), {}] })
                }>
                  <Plus className="h-4 w-4" /> Add role
                </Button>
              }
            >
              <div className="space-y-5">
                {(data.experience ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No roles yet.</p>
                )}
                {(data.experience ?? []).map((e, i) => (
                  <div key={i} className="rounded-xl border border-border p-4 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="Title">
                        <Input value={e.title ?? ""} onChange={(ev) => updateExp(i, { title: ev.target.value })} />
                      </Field>
                      <Field label="Company">
                        <Input value={e.company ?? ""} onChange={(ev) => updateExp(i, { company: ev.target.value })} />
                      </Field>
                      <Field label="Location">
                        <Input value={e.location ?? ""} onChange={(ev) => updateExp(i, { location: ev.target.value })} />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Start">
                          <Input value={e.start_date ?? ""} onChange={(ev) => updateExp(i, { start_date: ev.target.value })} placeholder="Jan 2024" />
                        </Field>
                        <Field label="End">
                          <Input value={e.end_date ?? ""} onChange={(ev) => updateExp(i, { end_date: ev.target.value })} placeholder="Present" />
                        </Field>
                      </div>
                    </div>
                    <Field label="Description">
                      <Textarea rows={2} value={e.description ?? ""} onChange={(ev) => updateExp(i, { description: ev.target.value })} />
                    </Field>
                    <Field label="Highlights (one per line)">
                      <Textarea
                        rows={3}
                        value={(e.highlights ?? []).join("\n")}
                        onChange={(ev) => updateExp(i, { highlights: ev.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                        placeholder="• Shipped X driving Y% improvement"
                      />
                    </Field>
                    <div className="flex justify-end">
                      <Button type="button" variant="ghost" size="sm" onClick={() =>
                        setData({ ...data, experience: data.experience!.filter((_, j) => j !== i) })
                      }>
                        <Trash2 className="h-4 w-4" /> Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              icon={GraduationCap}
              title="Education"
              action={
                <Button type="button" variant="outline" size="sm" onClick={() =>
                  setData({ ...data, education: [...(data.education ?? []), {}] })
                }>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              }
            >
              <div className="space-y-4">
                {(data.education ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No education yet.</p>
                )}
                {(data.education ?? []).map((e, i) => (
                  <div key={i} className="rounded-xl border border-border p-4 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="Institution">
                        <Input value={e.institution ?? ""} onChange={(ev) => updateEdu(i, { institution: ev.target.value })} />
                      </Field>
                      <Field label="Degree">
                        <Input value={e.degree ?? ""} onChange={(ev) => updateEdu(i, { degree: ev.target.value })} />
                      </Field>
                      <Field label="Field of study">
                        <Input value={e.field_of_study ?? ""} onChange={(ev) => updateEdu(i, { field_of_study: ev.target.value })} />
                      </Field>
                      <Field label="GPA">
                        <Input value={e.gpa ?? ""} onChange={(ev) => updateEdu(i, { gpa: ev.target.value })} />
                      </Field>
                      <Field label="Start">
                        <Input value={e.start_date ?? ""} onChange={(ev) => updateEdu(i, { start_date: ev.target.value })} />
                      </Field>
                      <Field label="End">
                        <Input value={e.end_date ?? ""} onChange={(ev) => updateEdu(i, { end_date: ev.target.value })} />
                      </Field>
                    </div>
                    <div className="flex justify-end">
                      <Button type="button" variant="ghost" size="sm" onClick={() =>
                        setData({ ...data, education: data.education!.filter((_, j) => j !== i) })
                      }>
                        <Trash2 className="h-4 w-4" /> Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              icon={Code2}
              title="Projects"
              action={
                <Button type="button" variant="outline" size="sm" onClick={() =>
                  setData({ ...data, projects: [...(data.projects ?? []), {}] })
                }>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              }
            >
              <div className="space-y-4">
                {(data.projects ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No projects yet.</p>
                )}
                {(data.projects ?? []).map((p, i) => (
                  <div key={i} className="rounded-xl border border-border p-4 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="Name">
                        <Input value={p.name ?? ""} onChange={(ev) => updateProj(i, { name: ev.target.value })} />
                      </Field>
                      <Field label="URL">
                        <Input value={p.url ?? ""} onChange={(ev) => updateProj(i, { url: ev.target.value })} />
                      </Field>
                    </div>
                    <Field label="Description">
                      <Textarea rows={2} value={p.description ?? ""} onChange={(ev) => updateProj(i, { description: ev.target.value })} />
                    </Field>
                    <Field label="Technologies">
                      <TagEditor
                        value={p.technologies ?? []}
                        onChange={(v) => updateProj(i, { technologies: v })}
                        placeholder="React, Postgres, …"
                      />
                    </Field>
                    <div className="flex justify-end">
                      <Button type="button" variant="ghost" size="sm" onClick={() =>
                        setData({ ...data, projects: data.projects!.filter((_, j) => j !== i) })
                      }>
                        <Trash2 className="h-4 w-4" /> Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard icon={Globe} title="Languages">
              <TagEditor
                value={data.languages ?? []}
                onChange={(v) => setData({ ...data, languages: v })}
                placeholder="English (native), Spanish (B2)…"
              />
            </SectionCard>

            <SectionCard icon={Award} title="Certifications">
              <TagEditor
                value={data.certifications ?? []}
                onChange={(v) => setData({ ...data, certifications: v })}
                placeholder="AWS Certified Cloud Practitioner…"
              />
            </SectionCard>
          </div>
        )}
      </main>

      {/* Sticky save bar */}
      {cv.status === "ready" && (
        <div className={`fixed bottom-0 inset-x-0 z-40 transition-transform ${dirty ? "translate-y-0" : "translate-y-full"}`}>
          <div className="container max-w-5xl pb-4">
            <div className="surface-elevated flex items-center justify-between gap-4 px-5 py-3 border border-border bg-background/95 backdrop-blur">
              <p className="text-sm">
                <span className="font-medium">Unsaved changes</span>
                <span className="text-muted-foreground"> — your edits are not yet stored.</span>
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setData(initialData)} disabled={saving}>
                  Discard
                </Button>
                <Button onClick={save} disabled={saving} className="bg-gradient-primary">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CvDetail;
