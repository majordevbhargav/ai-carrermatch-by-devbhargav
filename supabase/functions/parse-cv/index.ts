// Parse a CV (PDF or DOCX) from the `cvs` storage bucket and extract structured data
// using Lovable AI. Persists raw_text + extracted JSON to public.cvs.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { extractText, getDocumentProxy } from "https://esm.sh/unpdf@0.12.1";
import mammoth from "https://esm.sh/mammoth@1.8.0";

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

const SYSTEM_PROMPT = `You are a CV/resume parser. Extract structured data from the raw CV text the user provides.
- Be conservative: never invent details that are not in the text.
- Normalize dates to "MMM YYYY" or "YYYY" when possible. If only a year is present, use the year. If "present" / "current", set end_date to "Present".
- Skills should be technical or professional skills (max 40), deduplicated.
- experience.highlights = bulleted accomplishments under the role (max 6 per role).
- If a field is not present in the text, omit it (do not return empty strings).
- summary = 1–3 sentence overview, written in first person if the CV uses first person.`;

const TOOL = {
  type: "function",
  function: {
    name: "save_cv_data",
    description: "Save the structured CV data extracted from the input text.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        full_name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        location: { type: "string" },
        website: { type: "string" },
        summary: { type: "string" },
        skills: { type: "array", items: { type: "string" } },
        languages: { type: "array", items: { type: "string" } },
        certifications: { type: "array", items: { type: "string" } },
        experience: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              company: { type: "string" },
              location: { type: "string" },
              start_date: { type: "string" },
              end_date: { type: "string" },
              description: { type: "string" },
              highlights: { type: "array", items: { type: "string" } },
            },
          },
        },
        education: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              institution: { type: "string" },
              degree: { type: "string" },
              field_of_study: { type: "string" },
              start_date: { type: "string" },
              end_date: { type: "string" },
              gpa: { type: "string" },
            },
          },
        },
        projects: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              technologies: { type: "array", items: { type: "string" } },
              url: { type: "string" },
            },
          },
        },
      },
      required: [],
    },
  },
};

async function extractTextFromBytes(bytes: Uint8Array, mime: string, fileName: string): Promise<string> {
  const isPdf =
    mime === "application/pdf" ||
    fileName.toLowerCase().endsWith(".pdf");
  const isDocx =
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.toLowerCase().endsWith(".docx");

  if (isPdf) {
    const pdf = await getDocumentProxy(bytes);
    const { text } = await extractText(pdf, { mergePages: true });
    return Array.isArray(text) ? text.join("\n") : text;
  }
  if (isDocx) {
    // mammoth expects a Node Buffer-like object; pass arrayBuffer
    const result = await mammoth.extractRawText({ arrayBuffer: bytes.buffer });
    return result.value;
  }
  throw new Error(`Unsupported file type: ${mime || fileName}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Authenticate caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json(401, { error: "Missing authorization" });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json(500, { error: "LOVABLE_API_KEY not configured" });

    // Verify user via the JWT
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json(401, { error: "Invalid session" });
    const userId = userData.user.id;

    const { cvId } = await req.json();
    if (!cvId || typeof cvId !== "string") return json(400, { error: "cvId required" });

    // Service-role client for DB updates and storage download
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Load the CV row, verify ownership
    const { data: cv, error: cvErr } = await admin
      .from("cvs")
      .select("id, user_id, storage_path, file_name, mime_type")
      .eq("id", cvId)
      .maybeSingle();
    if (cvErr) throw cvErr;
    if (!cv) return json(404, { error: "CV not found" });
    if (cv.user_id !== userId) return json(403, { error: "Forbidden" });

    await admin.from("cvs").update({ status: "parsing", error: null }).eq("id", cvId);

    // Download the file
    const { data: blob, error: dlErr } = await admin.storage.from("cvs").download(cv.storage_path);
    if (dlErr || !blob) throw new Error(`Download failed: ${dlErr?.message ?? "no blob"}`);
    const bytes = new Uint8Array(await blob.arrayBuffer());

    // Extract raw text
    let rawText: string;
    try {
      rawText = await extractTextFromBytes(bytes, cv.mime_type ?? "", cv.file_name);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to read file";
      await admin.from("cvs").update({ status: "failed", error: msg }).eq("id", cvId);
      return json(422, { error: msg });
    }

    rawText = rawText.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    if (rawText.length < 30) {
      const msg = "Could not extract enough text from the file. Is it a scanned PDF?";
      await admin.from("cvs").update({ status: "failed", error: msg, raw_text: rawText }).eq("id", cvId);
      return json(422, { error: msg });
    }
    // Truncate very long CVs to keep token usage bounded
    const truncated = rawText.length > 18000 ? rawText.slice(0, 18000) : rawText;

    // Call Lovable AI Gateway with tool calling for structured output
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Extract structured data from this CV text:\n\n${truncated}` },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "save_cv_data" } },
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      const msg = aiRes.status === 429
        ? "AI rate limit reached, please try again in a minute."
        : aiRes.status === 402
          ? "AI credits exhausted. Add credits in Lovable workspace settings."
          : `AI gateway error (${aiRes.status}): ${text.slice(0, 200)}`;
      await admin.from("cvs").update({ status: "failed", error: msg, raw_text: rawText }).eq("id", cvId);
      return json(aiRes.status === 429 || aiRes.status === 402 ? aiRes.status : 502, { error: msg });
    }

    const aiJson = await aiRes.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = toolCall?.function?.arguments;
    if (!argsStr) {
      const msg = "AI did not return structured data";
      await admin.from("cvs").update({ status: "failed", error: msg, raw_text: rawText }).eq("id", cvId);
      return json(502, { error: msg });
    }

    let extracted: Record<string, unknown>;
    try {
      extracted = JSON.parse(argsStr);
    } catch (e) {
      const msg = "AI returned invalid JSON";
      await admin.from("cvs").update({ status: "failed", error: msg, raw_text: rawText }).eq("id", cvId);
      return json(502, { error: msg });
    }

    await admin
      .from("cvs")
      .update({ status: "ready", extracted, raw_text: rawText, error: null })
      .eq("id", cvId);

    return json(200, { ok: true, cvId, extracted });
  } catch (e) {
    console.error("parse-cv error", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return json(500, { error: msg });
  }
});
