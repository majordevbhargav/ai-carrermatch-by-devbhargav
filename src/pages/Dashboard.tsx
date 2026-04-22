import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { CvUpload } from "@/components/CvUpload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Trash2, CheckCircle2, AlertCircle, Loader2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CvRow {
  id: string;
  label: string;
  file_name: string;
  status: "pending" | "parsing" | "ready" | "failed";
  is_primary: boolean;
  created_at: string;
  error: string | null;
}

const StatusPill = ({ status }: { status: CvRow["status"] }) => {
  const map = {
    ready: { label: "Ready", icon: CheckCircle2, cls: "bg-success-soft text-success" },
    parsing: { label: "Parsing", icon: Loader2, cls: "bg-primary-soft text-primary animate-pulse-soft" },
    pending: { label: "Pending", icon: Clock, cls: "bg-muted text-muted-foreground" },
    failed: { label: "Failed", icon: AlertCircle, cls: "bg-destructive/10 text-destructive" },
  } as const;
  const s = map[status];
  const Icon = s.icon;
  return (
    <span className={`chip ${s.cls}`}>
      <Icon className={`h-3 w-3 ${status === "parsing" ? "animate-spin" : ""}`} />
      {s.label}
    </span>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [cvs, setCvs] = useState<CvRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("cvs")
      .select("id,label,file_name,status,is_primary,created_at,error")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      return;
    }
    setCvs((data ?? []) as CvRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleDelete = async (cv: CvRow) => {
    if (!confirm(`Delete "${cv.label}"?`)) return;
    const { error } = await supabase.from("cvs").delete().eq("id", cv.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("CV deleted");
    load();
  };

  return (
    <div className="min-h-dvh">
      <Helmet>
        <title>Dashboard · CareerMatch</title>
      </Helmet>
      <AppHeader />

      <main className="container py-10 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Welcome{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload a CV to get started. We'll extract your details so AI can tailor it to every job.
          </p>
        </div>

        {user && <CvUpload userId={user.id} onUploaded={load} />}

        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Your CVs</h2>
            <span className="text-sm text-muted-foreground">{cvs.length} total</span>
          </div>

          {loading ? (
            <div className="surface-card p-12 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : cvs.length === 0 ? (
            <div className="surface-card p-12 text-center">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No CVs yet. Upload one above to begin.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {cvs.map((cv) => (
                <li key={cv.id} className="surface-card p-4 flex items-center gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/cv/${cv.id}`} className="font-semibold truncate block hover:text-primary">
                      {cv.label}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="truncate">{cv.file_name}</span>
                      <span>·</span>
                      <span>uploaded {formatDistanceToNow(new Date(cv.created_at), { addSuffix: true })}</span>
                    </div>
                    {cv.error && (
                      <div className="text-xs text-destructive mt-1">{cv.error}</div>
                    )}
                  </div>
                  <StatusPill status={cv.status} />
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cv)} aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
