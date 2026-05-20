// Compute match scores between a user's CV and all active jobs.
// Returns scored jobs sorted by best match.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#./ ]/g, "").trim();

interface CvExtracted {
  skills?: string[];
  summary?: string;
  experience?: Array<{ title?: string; description?: string; highlights?: string[] }>;
  projects?: Array<{ name?: string; description?: string; technologies?: string[] }>;
}

interface Job {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  nice_to_have_skills: string[];
}

function scoreJob(cv: CvExtracted, job: Job) {
  const cvSkills = new Set((cv.skills ?? []).map(norm).filter(Boolean));
  const projectTech = (cv.projects ?? []).flatMap((p) => p.technologies ?? []).map(norm);
  projectTech.forEach((t) => cvSkills.add(t));

  // Free-text bag from CV (titles, summary, highlights, descriptions)
  const bag = norm(
    [
      cv.summary ?? "",
      ...(cv.experience ?? []).flatMap((e) => [e.title ?? "", e.description ?? "", ...(e.highlights ?? [])]),
      ...(cv.projects ?? []).flatMap((p) => [p.name ?? "", p.description ?? ""]),
    ].join(" "),
  );

  const matched: string[] = [];
  const missing: string[] = [];

  for (const raw of job.required_skills) {
    const s = norm(raw);
    if (cvSkills.has(s) || bag.includes(s)) matched.push(raw);
    else missing.push(raw);
  }
  let bonus = 0;
  for (const raw of job.nice_to_have_skills) {
    const s = norm(raw);
    if (cvSkills.has(s) || bag.includes(s)) bonus += 1;
  }

  const reqTotal = Math.max(job.required_skills.length, 1);
  const reqRatio = matched.length / reqTotal;            // 0..1
  const niceTotal = Math.max(job.nice_to_have_skills.length, 1);
  const niceRatio = bonus / niceTotal;                    // 0..1

  // 80% required + 20% nice-to-have, scaled to 0..100
  const score = Math.round((reqRatio * 0.8 + niceRatio * 0.2) * 100);
  return { score, matched, missing };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json(401, { error: "Missing authorization" });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json(401, { error: "Invalid session" });
    const userId = userData.user.id;

    const { cvId } = await req.json().catch(() => ({}));
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Pick the requested CV, or the user's most recent ready CV
    let cvQuery = admin
      .from("cvs")
      .select("id, user_id, extracted, status, label")
      .eq("user_id", userId)
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .limit(1);
    if (cvId) {
      cvQuery = admin
        .from("cvs")
        .select("id, user_id, extracted, status, label")
        .eq("id", cvId)
        .eq("user_id", userId);
    }
    const { data: cvRows, error: cvErr } = await cvQuery;
    if (cvErr) throw cvErr;
    const cv = cvRows?.[0];
    if (!cv) return json(404, { error: "No ready CV found. Upload a CV first." });

    const { data: jobs, error: jErr } = await admin
      .from("jobs")
      .select("id, title, company, location, employment_type, work_mode, salary_min, salary_max, currency, description, required_skills, nice_to_have_skills, url, posted_at")
      .eq("is_active", true);
    if (jErr) throw jErr;

    const extracted = (cv.extracted ?? {}) as CvExtracted;
    const scored = (jobs ?? [])
      .map((j) => {
        const { score, matched, missing } = scoreJob(extracted, j as Job);
        return { ...j, match_score: score, matched_skills: matched, missing_skills: missing };
      })
      .sort((a, b) => b.match_score - a.match_score);

    return json(200, { cvId: cv.id, cvLabel: cv.label, jobs: scored });
  } catch (e) {
    console.error("match-jobs error", e);
    return json(500, { error: e instanceof Error ? e.message : "Unknown error" });
  }
});
