import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Building2, MapPin, Briefcase, Clock, ArrowRight, Sparkles,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  employment_type: string | null;
  work_mode: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  required_skills: string[];
  posted_at: string;
}

const COMPANY_COLORS: Record<string, string> = {
  Linear: "bg-slate-900 text-white",
  Vercel: "bg-black text-white",
  Spotify: "bg-green-600 text-white",
  "Hugging Face": "bg-yellow-400 text-yellow-900",
  Figma: "bg-red-500 text-white",
  Stripe: "bg-indigo-600 text-white",
};

const companyBadge = (name: string) =>
  COMPANY_COLORS[name] ?? "bg-primary-soft text-primary";

const formatSalary = (j: Job) => {
  if (!j.salary_min && !j.salary_max) return null;
  const c = j.currency ?? "USD";
  const fmt = (n: number) => `${c} ${n.toLocaleString()}`;
  if (j.salary_min && j.salary_max) return `${fmt(j.salary_min)} – ${fmt(j.salary_max)}`;
  return fmt(j.salary_min ?? j.salary_max!);
};

const daysAgo = (d: string) => {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  return diff <= 0 ? "Today" : diff === 1 ? "1 day ago" : `${diff} days ago`;
};

export const FeaturedJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .order("posted_at", { ascending: false })
      .limit(6)
      .then(({ data, error }) => {
        if (!error && data) setJobs(data as Job[]);
        setLoading(false);
      });
  }, []);

  const companies = Array.from(new Map(jobs.map((j) => [j.company, j])).values());

  return (
    <div className="w-full max-w-5xl mx-auto mt-16 space-y-10">
      {/* Company strip */}
      {companies.length > 0 && (
        <div className="text-center space-y-4">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {companies.map((j) => (
              <span
                key={j.company}
                className={`chip px-4 py-2 text-sm font-semibold ${companyBadge(j.company)}`}
              >
                <Building2 className="h-3.5 w-3.5" />
                {j.company}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            Open roles right now
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Browse internships and new-grad positions from top companies.
          </p>
        </div>
        <Link to="/auth">
          <Button variant="outline" size="sm" className="gap-1">
            Sign in to apply <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Job grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="surface-card p-5 animate-pulse space-y-3">
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="h-3 w-1/3 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((j) => {
            const salary = formatSalary(j);
            return (
              <div
                key={j.id}
                className="surface-card p-5 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className={`chip text-[10px] ${companyBadge(j.company)}`}
                  >
                    {j.company}
                  </span>
                  <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {daysAgo(j.posted_at)}
                  </span>
                </div>

                <h3 className="font-display text-base font-bold leading-snug">
                  {j.title}
                </h3>

                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {j.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {j.location}
                    </span>
                  )}
                  {j.employment_type && (
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> {j.employment_type}
                    </span>
                  )}
                  {j.work_mode && <span>{j.work_mode}</span>}
                </div>

                {salary && (
                  <p className="mt-2 text-xs font-medium text-foreground">
                    {salary}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {j.required_skills.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="chip text-[10px] bg-primary-soft text-primary border border-primary/20"
                    >
                      {s}
                    </span>
                  ))}
                  {j.required_skills.length > 4 && (
                    <span className="chip text-[10px] bg-muted text-muted-foreground border border-border">
                      +{j.required_skills.length - 4}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-4 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Sign in to see your match score
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        New roles added weekly. Upload your CV to get AI-tailored cover letters for every application.
      </p>
    </div>
  );
};
