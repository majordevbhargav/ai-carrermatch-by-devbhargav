import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, FileText, Loader2 } from "lucide-react";

const ACCEPTED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

interface Props {
  userId: string;
  onUploaded?: (cvId: string) => void;
}

export const CvUpload = ({ userId, onUploaded }: Props) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<"idle" | "uploading" | "parsing">("idle");

  const handleFile = useCallback(async (file: File) => {
    if (!ACCEPTED_MIME.includes(file.type) && !/\.(pdf|docx)$/i.test(file.name)) {
      toast.error("Please upload a PDF or DOCX file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File too large (max 10 MB).");
      return;
    }

    setStage("uploading");
    setProgress(15);

    try {
      // 1) Upload to user's folder in cvs bucket
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("cvs")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      setProgress(50);

      // 2) Insert CV row (status=pending)
      const { data: cvRow, error: insErr } = await supabase
        .from("cvs")
        .insert({
          user_id: userId,
          storage_path: path,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type || (ext === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
          label: file.name.replace(/\.(pdf|docx)$/i, ""),
          status: "pending",
        })
        .select("id")
        .single();
      if (insErr) throw insErr;
      setProgress(70);

      // 3) Trigger parsing edge function
      setStage("parsing");
      const { error: fnErr } = await supabase.functions.invoke("parse-cv", {
        body: { cvId: cvRow.id },
      });
      if (fnErr) throw fnErr;
      setProgress(100);

      toast.success("CV uploaded and parsed!");
      onUploaded?.(cvRow.id);
      navigate(`/cv/${cvRow.id}`);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
      setStage("idle");
      setProgress(0);
    }
  }, [userId, navigate, onUploaded]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const busy = stage !== "idle";

  return (
    <div
      className={`surface-card border-2 border-dashed transition-colors ${
        dragActive ? "border-primary bg-primary-soft" : "border-border"
      }`}
      onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={onDrop}
    >
      <div className="p-8 md:p-12 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-primary-soft text-primary grid place-items-center mb-4">
          {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
        </div>

        {!busy ? (
          <>
            <h3 className="font-display text-xl font-bold">Upload your CV</h3>
            <p className="text-sm text-muted-foreground mt-1.5">
              Drag & drop a <strong>PDF</strong> or <strong>DOCX</strong>, or click below. Max 10 MB.
            </p>
            <Button
              className="mt-5 bg-gradient-primary"
              onClick={() => inputRef.current?.click()}
            >
              <FileText className="h-4 w-4" /> Choose file
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
          </>
        ) : (
          <div className="max-w-sm mx-auto">
            <h3 className="font-display text-lg font-semibold">
              {stage === "uploading" ? "Uploading your CV…" : "AI is reading your CV…"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1.5">
              {stage === "uploading"
                ? "Securely transferring your file."
                : "Extracting skills, experience, education and projects."}
            </p>
            <Progress value={progress} className="mt-5" />
          </div>
        )}
      </div>
    </div>
  );
};
