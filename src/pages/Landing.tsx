import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { FeaturedJobs } from "@/components/FeaturedJobs";
import { Helmet } from "react-helmet-async";
import { Sparkles, Upload, Wand2, Target, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: Upload,
    title: "Upload your CV once",
    body: "Drop in your PDF or DOCX. We extract every skill, project and internship into a structured profile.",
  },
  {
    icon: Wand2,
    title: "AI tailors every application",
    body: "For each job posting, get a tuned CV variant and a personalized cover letter in seconds.",
  },
  {
    icon: Target,
    title: "Match score on every role",
    body: "Stop guessing. See a 0–100 fit score with a plain-English explanation of strengths and gaps.",
  },
];

const Landing = () => {
  const { session } = useAuth();
  const ctaTo = session ? "/dashboard" : "/auth";

  return (
    <div className="min-h-dvh">
      <Helmet>
        <title>CareerMatch · AI job applications for college students</title>
        <meta
          name="description"
          content="Upload your CV once. CareerMatch tailors your resume and cover letter to every job, scores your fit, and helps you apply faster."
        />
      </Helmet>

      <header className="container flex h-16 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost">Sign in</Button></Link>
          <Link to="/auth"><Button>Get started</Button></Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container pt-12 md:pt-20 pb-16 md:pb-24">
          <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
            <span className="chip bg-primary-soft text-primary border border-primary/20 mb-5">
              <Sparkles className="h-3.5 w-3.5" /> Built for students. Powered by AI.
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Land internships <span className="text-gradient">3× faster</span>
              <br className="hidden md:block" />
              with AI on your side.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your CV once. CareerMatch tailors a resume and cover letter to every job posting,
              scores how well you fit, and helps you apply without the busywork.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={ctaTo}>
                <Button size="lg" className="bg-gradient-primary hover:opacity-95 shadow-md w-full sm:w-auto">
                  Upload your CV <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#how">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  See how it works
                </Button>
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free while in beta · Your CV stays private
            </p>
          </div>

          {/* Floating preview card */}
          <div className="mx-auto mt-14 max-w-3xl">
            <div className="surface-elevated p-6 md:p-8 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
              <div className="relative grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">RESUME.PDF</div>
                  <div className="rounded-xl border border-border bg-background p-5 space-y-3">
                    <div className="h-3 w-2/3 rounded bg-muted" />
                    <div className="h-2 w-full rounded bg-muted" />
                    <div className="h-2 w-5/6 rounded bg-muted" />
                    <div className="h-2 w-4/6 rounded bg-muted" />
                    <div className="pt-2 flex gap-1.5 flex-wrap">
                      <span className="chip bg-primary-soft text-primary text-[10px]">React</span>
                      <span className="chip bg-primary-soft text-primary text-[10px]">Python</span>
                      <span className="chip bg-primary-soft text-primary text-[10px]">SQL</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">JOB MATCH</div>
                  <div className="rounded-xl border border-border bg-background p-5">
                    <div className="flex items-baseline justify-between mb-3">
                      <div className="font-semibold">Software Engineer Intern · Stripe</div>
                      <div className="text-2xl font-display font-bold text-success">92</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-foreground">
                        <Check className="h-4 w-4 text-success" /> 4/5 required skills matched
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Check className="h-4 w-4 text-success" /> Project relevance: high
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Check className="h-4 w-4 text-warning" /> Add experience with Go
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="how" className="container py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold">How it works</h2>
            <p className="mt-3 text-muted-foreground">
              Three steps from a generic CV to a portfolio of personalized applications.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="surface-card p-6 hover:shadow-lg transition-shadow">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="text-xs font-mono text-muted-foreground mb-1">STEP {i + 1}</div>
                <h3 className="font-display text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container py-20">
          <div className="surface-elevated bg-gradient-primary text-primary-foreground p-10 md:p-14 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Ready to land your next role?
            </h2>
            <p className="mt-3 opacity-90 max-w-xl mx-auto">
              Create a free account and upload your CV. Your AI co-pilot is one click away.
            </p>
            <Link to={ctaTo} className="inline-block mt-6">
              <Button size="lg" variant="secondary" className="shadow-lg">
                Get started for free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="container py-10 border-t border-border/60 mt-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <Logo />
          <div>© {new Date().getFullYear()} CareerMatch. Built for students.</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
