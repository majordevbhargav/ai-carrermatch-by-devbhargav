import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Briefcase, Building2, Loader2, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow, format } from "date-fns";

type Status = "saved" | "applied" | "interview" | "offer" | "rejected";
const STATUSES: Status[] = ["saved", "applied", "interview", "offer", "rejected"];
const PIPELINE: Status[] = ["saved", "applied", "interview", "offer"];

interface Row {
  id: string;
  status: Status;
  match_score: number | null;
  created_at: string;
  updated_at: string;
  job: { id: string; title: string; company: string; location: string | null } | null;
}

const statusStyle: Record<Status, string> = {
  saved: "bg-muted text-muted-foreground border-border",
  applied: "bg-primary-soft text-primary border-primary/20",
  interview: "bg-accent-soft text-accent border-accent/20",
  offer: "bg-success-soft text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const Applications = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("applications")
      .select("id,status,match_score,created_at,updated_at,job:jobs(id,title,company,location)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as unknown as Row[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const updateStatus = async (id: string, status: Status) => {
    const { error } = await supabase
      .from("applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status, updated_at: new Date().toISOString() } : r)));
    toast.success(`Moved to ${status}`);
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this application?")) return;
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((rs) => rs.filter((r) => r.id !== id));
  };

  const grouped = STATUSES.map((s) => ({ status: s, items: rows.filter((r) => r.status === s) }));

  const timeline = useMemo(
    () => [...rows].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [rows],
  );

  const stageIndex = (s: Status) => (s === "rejected" ? -1 : PIPELINE.indexOf(s));

  return (
    <div className="min-h-dvh">
      <Helmet><title>Applications · CareerMatch</title></Helmet>
      <AppHeader />
      <main className="container py-10 max-w-5xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold">Applications</h1>
        <p className="text-muted-foreground mt-2">Track every role from saved through to offer.</p>

        {loading ? (
          <div className="surface-card p-16 text-center mt-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <div className="surface-card p-12 text-center mt-8">
            <Briefcase className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No applications yet.</p>
            <Link to="/jobs"><Button className="mt-4 bg-gradient-primary">Browse jobs</Button></Link>
          </div>
        ) : (
          <Tabs defaultValue="stages" className="mt-8">
            <TabsList>
              <TabsTrigger value="stages">Stages</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="stages" className="mt-6 space-y-8">
              {grouped.filter((g) => g.items.length > 0).map((g) => (
                <section key={g.status}>
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="font-display text-lg font-bold capitalize">{g.status}</h2>
                    <span className={`chip text-xs border ${statusStyle[g.status]}`}>{g.items.length}</span>
                  </div>
                  <ul className="space-y-3">
                    {g.items.map((r) => (
                      <li key={r.id} className="surface-card p-4 flex items-center gap-4 flex-wrap">
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary shrink-0">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">
                            {r.job?.title ?? "(removed job)"}
                            {r.job?.company && <span className="text-muted-foreground font-normal"> · {r.job.company}</span>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {r.job?.location ? `${r.job.location} · ` : ""}
                            {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                            {r.match_score != null && <> · <span className="text-foreground font-medium">{r.match_score}% match</span></>}
                          </div>
                        </div>
                        <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v as Status)}>
                          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label="Remove">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <ol className="relative border-l-2 border-border ml-3 space-y-6">
                {timeline.map((r) => {
                  const idx = stageIndex(r.status);
                  return (
                    <li key={r.id} className="pl-6 relative">
                      <span
                        className={`absolute -left-[9px] top-2 h-4 w-4 rounded-full border-2 border-background ${
                          r.status === "rejected"
                            ? "bg-destructive"
                            : r.status === "offer"
                            ? "bg-success"
                            : "bg-primary"
                        }`}
                      />
                      <div className="surface-card p-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="min-w-0">
                            <div className="font-semibold truncate">
                              {r.job?.title ?? "(removed job)"}
                              {r.job?.company && (
                                <span className="text-muted-foreground font-normal"> · {r.job.company}</span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Updated {format(new Date(r.updated_at), "MMM d, yyyy · h:mm a")}
                            </div>
                          </div>
                          <span className={`chip text-xs border capitalize ${statusStyle[r.status]}`}>{r.status}</span>
                        </div>

                        <div className="mt-4 flex items-center gap-1 text-xs">
                          {PIPELINE.map((s, i) => {
                            const reached = idx >= i && r.status !== "rejected";
                            const current = r.status === s;
                            return (
                              <div key={s} className="flex items-center gap-1 flex-1">
                                <div
                                  className={`flex items-center gap-1.5 ${
                                    reached ? "text-foreground" : "text-muted-foreground"
                                  } ${current ? "font-semibold" : ""}`}
                                >
                                  {reached ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                  ) : (
                                    <Circle className="h-3.5 w-3.5" />
                                  )}
                                  <span className="capitalize">{s}</span>
                                </div>
                                {i < PIPELINE.length - 1 && (
                                  <div
                                    className={`flex-1 h-0.5 ${
                                      idx > i && r.status !== "rejected" ? "bg-primary" : "bg-border"
                                    }`}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Applications;
