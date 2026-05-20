import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2, MapPin, Briefcase, Building2, Sparkles, ExternalLink, Check, X, Search,
} from "lucide-react";
import { Link } from "react-router-dom";

interface ScoredJob {
  id: string;
  title: string;
  company: string;
  location: string | null;
  employment_type: string | null;
  work_mode: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  description: string;
  required_skills: string[];
  nice_to_have_skills: string[];
  url: string | null;
  posted_at: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
}

const formatSalary = (j: ScoredJob) => {
  if (!j.salary_min && !j.salary_max) return null;
  const c = j.currency ?? "USD";
  const fmt = (n: number) => `${c} ${n.toLocaleString()}`;
  if (j.salary_min && j.salary_max) return `${fmt(j.salary_min)} – ${fmt(j.salary_max)}`;
  return fmt(j.salary_min ?? j.salary_max!);
};

const scoreColor = (s: number) =>
  s >= 75 ? "bg-success-soft text-success border-success/20"
  : s >= 50 ? "bg-primary-soft text-primary border-primary/20"
  : "bg-muted text-muted-foreground border-border";

const Jobs = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<ScoredJob[]>([]);
  const [cvLabel, setCvLabel] = useState<string | null>(null);
  const [cvId, setCvId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [openJob, setOpenJob] = useState<ScoredJob | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [{ data: matchData, error: matchErr }, appsRes] = await Promise.all([
        supabase.functions.invoke("match-jobs", { body: {} }),
        supabase.from("applications").select("job_id").eq("user_id", user.id),
      ]);
      if (matchErr) throw matchErr;
      const payload = matchData as { cvId: string; cvLabel: string; jobs: ScoredJob[] };
      setCvId(payload.cvId);
      setCvLabel(payload.cvLabel);
      setJobs(payload.jobs);
      setAppliedIds(new Set((appsRes.data ?? []).map((a) => a.job_id)));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load jobs";
      if (msg.toLowerCase().includes("no ready cv")) {
        setJobs([]);
        setCvId(null);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) =>
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      (j.location ?? "").toLowerCase().includes(q) ||
      j.required_skills.some((s) => s.toLowerCase().includes(q))
    );
  }, [jobs, query]);

  const openApply = (job: ScoredJob) => {
    setOpenJob(job);
    setCoverLetter(
      `Hi ${job.company} team,\n\nI'm excited to apply for the ${job.title} role. With experience in ${job.matched_skills.slice(0, 4).join(", ") || "the relevant skills"}, I believe I can contribute meaningfully from day one.\n\nLooking forward to hearing from you.\n\nBest regards`
    );
  };

  const submitApply = async (status: "saved" | "applied") => {
    if (!openJob || !user) return;
    setApplying(true);
    try {
      const { error } = await supabase.from("applications").upsert(
        {
          user_id: user.id,
          job_id: openJob.id,
          cv_id: cvId,
          status,
          match_score: openJob.match_score,
          cover_letter: coverLetter,
        },
        { onConflict: "user_id,job_id" },
      );
      if (error) throw error;
      setAppliedIds((s) => new Set(s).add(openJob.id));
      toast.success(status === "applied" ? "Application submitted!" : "Saved to your list");
      setOpenJob(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-dvh">
      <Helmet><title>Jobs · CareerMatch</title></Helmet>
      <AppHeader />

      <main className="container py-10 max-w-5xl">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-2">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Matched jobs</h1>
            <p className="text-muted-foreground mt-2">
              {cvLabel
                ? <>Scored against your CV <strong>{cvLabel}</strong>.</>
                : "Upload a CV to see how you match against open roles."}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs, skills, companies"
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="surface-card p-16 text-center mt-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : !cvId ? (
          <div className="surface-card p-12 text-center mt-8">
            <Sparkles className="h-8 w-8 mx-auto text-primary mb-3" />
            <h2 className="font-display text-xl font-bold">No CV to match yet</h2>
            <p className="text-muted-foreground mt-1 max-w-md mx-auto">
              Upload a CV from your dashboard. We'll extract your skills and instantly score every job against your profile.
            </p>
            <Link to="/dashboard">
              <Button className="mt-5 bg-gradient-primary">Upload a CV</Button>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="surface-card p-12 text-center mt-8 text-muted-foreground">
            No jobs match your search.
          </div>
        ) : (
          <ul className="space-y-4 mt-8">
            {filtered.map((j) => {
              const applied = appliedIds.has(j.id);
              const salary = formatSalary(j);
              return (
                <li key={j.id} className="surface-card p-5 md:p-6">
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary shrink-0">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="font-display text-lg font-bold">{j.title}</h3>
                          <p className="text-sm text-muted-foreground">{j.company}</p>
                        </div>
                        <span className={`chip border ${scoreColor(j.match_score)} font-mono text-xs`}>
                          <Sparkles className="h-3 w-3" /> {j.match_score}% match
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                        {j.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{j.location}</span>}
                        {j.employment_type && <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" />{j.employment_type}</span>}
                        {j.work_mode && <span>{j.work_mode}</span>}
                        {salary && <span className="font-medium text-foreground">{salary}</span>}
                      </div>
                      <p className="text-sm mt-3 line-clamp-2 text-muted-foreground">{j.description}</p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {j.matched_skills.slice(0, 8).map((s) => (
                          <span key={s} className="chip text-[10px] bg-success-soft text-success border border-success/20">
                            <Check className="h-3 w-3" />{s}
                          </span>
                        ))}
                        {j.missing_skills.slice(0, 4).map((s) => (
                          <span key={s} className="chip text-[10px] bg-muted text-muted-foreground border border-border">
                            <X className="h-3 w-3" />{s}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {applied ? (
                          <span className="chip bg-success-soft text-success border border-success/20">
                            <Check className="h-3 w-3" /> Applied
                          </span>
                        ) : (
                          <Button size="sm" className="bg-gradient-primary" onClick={() => openApply(j)}>
                            Apply with AI tailoring
                          </Button>
                        )}
                        {j.url && (
                          <a href={j.url} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline">
                              View posting <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <Dialog open={!!openJob} onOpenChange={(o) => !o && setOpenJob(null)}>
        <DialogContent className="max-w-2xl">
          {openJob && (
            <>
              <DialogHeader>
                <DialogTitle>Apply to {openJob.title}</DialogTitle>
                <DialogDescription>
                  at {openJob.company} · {openJob.match_score}% match
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  Using CV: <strong className="text-foreground">{cvLabel}</strong>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Cover letter</label>
                  <Textarea
                    rows={10}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="mt-1.5 font-sans text-sm"
                  />
                </div>
                {openJob.missing_skills.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Tip: this role asks for <strong>{openJob.missing_skills.join(", ")}</strong>.
                    Mention transferable experience if relevant.
                  </p>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => submitApply("saved")} disabled={applying}>
                  Save for later
                </Button>
                <Button onClick={() => submitApply("applied")} disabled={applying} className="bg-gradient-primary">
                  {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Submit application
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Jobs;
