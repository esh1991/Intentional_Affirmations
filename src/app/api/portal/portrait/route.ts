import { requireUser } from "@/lib/supabase/server";
import { checkQuota, createJob, updateJob } from "@/lib/portal/jobs";
import { isBlobEnabled, putPortrait } from "@/lib/portal/blob";
import {
  ACCEPTED_TYPES,
  MAX_SELFIE_BYTES,
  generatePortrait,
  portraitGenerationEnabled,
} from "@/lib/portal/portrait";
import { isDomainKey } from "@/lib/portal/domains";

/**
 * Brings a future self into focus.
 *
 * This is the one endpoint in the app that spends real money per call and
 * handles a photo of the caller's face, so the order of operations matters:
 * authenticate → validate the upload → check quota → only then call fal.
 *
 * The selfie is never written to our storage — see src/lib/portal/portrait.ts.
 * It lives in this request body, goes to fal as a data URI for processing, and
 * is gone when the request ends.
 */
export const maxDuration = 300;

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  const { user, db } = auth;

  if (!portraitGenerationEnabled() || !isBlobEnabled()) {
    return Response.json({ error: "Not configured." }, { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) return Response.json({ error: "Bad request." }, { status: 400 });

  const file = form.get("selfie");
  if (!(file instanceof File)) {
    return Response.json({ error: "No photo received." }, { status: 400 });
  }
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return Response.json(
      { error: "Use a JPEG, PNG or WebP photo." },
      { status: 415 },
    );
  }
  if (file.size > MAX_SELFIE_BYTES) {
    return Response.json({ error: "That photo is too large." }, { status: 413 });
  }

  const domain = String(form.get("domain") ?? "");
  if (!isDomainKey(domain)) {
    return Response.json({ error: "Unknown domain." }, { status: 400 });
  }
  const goal = String(form.get("goal") ?? "").slice(0, 200);
  const rawHorizon = String(form.get("horizon") ?? "1y");
  const horizon = rawHorizon === "6m" || rawHorizon === "3y" ? rawHorizon : "1y";

  const quota = await checkQuota(user.id, "portrait");
  if (!quota.allowed) {
    return Response.json(
      {
        error: `You've reached ${quota.cap} portraits for today. The line reopens tomorrow.`,
        used: quota.used,
        cap: quota.cap,
      },
      { status: 429 },
    );
  }

  const jobId = await createJob(user.id, "portrait", "fal");
  if (!jobId) return Response.json({ error: "Couldn't start." }, { status: 503 });

  try {
    await updateJob(jobId, { status: "running" });

    const bytes = Buffer.from(await file.arrayBuffer());
    const selfieDataUri = `data:${file.type};base64,${bytes.toString("base64")}`;

    const portrait = await generatePortrait({
      selfieDataUri,
      domain,
      goal,
      horizon,
    });

    // Row first, so the blob is keyed by a real id and deletion can find it.
    const { data: row, error: rowError } = await db
      .from("future_selves")
      .insert({
        user_id: user.id,
        domain,
        goal,
        horizon,
        persona: {},
      })
      .select("id")
      .single();
    if (rowError || !row) throw new Error(rowError?.message ?? "insert failed");

    const pathname = await putPortrait(
      user.id,
      row.id,
      portrait.bytes,
      portrait.contentType,
    );
    if (!pathname) throw new Error("Couldn't store the portrait.");

    await db
      .from("future_selves")
      .update({ portrait_url: pathname, provider_ref: "fal:nano-banana/edit" })
      .eq("id", row.id);

    await updateJob(jobId, { status: "completed", result_url: row.id });

    return Response.json({ futureSelfId: row.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("portrait generation failed", message);
    await updateJob(jobId, { status: "failed", error: message.slice(0, 500) });
    return Response.json(
      { error: "Couldn't bring them into focus — try again." },
      { status: 502 },
    );
  }
}
