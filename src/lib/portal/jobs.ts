import { adminDb } from "@/lib/supabase/server";

/**
 * Generation jobs: the row-per-paid-generation contract.
 *
 * `/api/subscribe` is an unauthenticated, unrate-limited POST and is the wrong
 * template to copy here — cloning it for generation builds an open endpoint
 * that spends real money. Every generation instead: authenticated POST →
 * quota check → insert a row → return its id → client polls while the portal
 * plays its "finding them" sequence.
 *
 * Spec: docs/roadmap/phase-3-portal.md
 */

export type JobKind = "portrait" | "arc";
export type JobStatus = "pending" | "running" | "completed" | "failed";

export interface GenerationJob {
  id: string;
  kind: JobKind;
  status: JobStatus;
  result_url: string | null;
  error: string | null;
  created_at: string;
}

/**
 * Daily cap per user, per kind. Deliberately low to start — the owner can
 * raise it once real cost-per-user is known. Portraits cost money per call;
 * arcs are cheaper but still metered so a loop cannot run up a bill.
 */
export const DAILY_CAP: Record<JobKind, number> = {
  portrait: 3,
  arc: 5,
};

const DAY_MS = 24 * 60 * 60 * 1000;

export interface QuotaResult {
  allowed: boolean;
  used: number;
  cap: number;
}

/**
 * Counts the caller's jobs of this kind in the last 24h. No rate-limit
 * dependency needed: the (user_id, created_at desc) index makes this a cheap
 * bounded count, and it is checked *before* any provider call so a rejected
 * request costs nothing.
 *
 * Fails closed — if the count cannot be read, the request is refused rather
 * than waved through, because the failure mode of the alternative is a bill.
 */
export async function checkQuota(
  userId: string,
  kind: JobKind,
): Promise<QuotaResult> {
  const cap = DAILY_CAP[kind];
  const db = adminDb();
  if (!db) return { allowed: false, used: 0, cap };

  const since = new Date(Date.now() - DAY_MS).toISOString();
  const { count, error } = await db
    .from("generation_jobs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("kind", kind)
    .gte("created_at", since);

  if (error) {
    console.error("quota check failed", error);
    return { allowed: false, used: cap, cap };
  }

  const used = count ?? 0;
  return { allowed: used < cap, used, cap };
}

/** Enqueues a job row and returns its id. Call only after checkQuota passes. */
export async function createJob(
  userId: string,
  kind: JobKind,
  provider: string,
): Promise<string | null> {
  const db = adminDb();
  if (!db) return null;

  const { data, error } = await db
    .from("generation_jobs")
    .insert({ user_id: userId, kind, provider, status: "pending" })
    .select("id")
    .single();

  if (error || !data) {
    console.error("job insert failed", error);
    return null;
  }
  return data.id as string;
}

/** Records progress or the final result. Service-role only. */
export async function updateJob(
  jobId: string,
  patch: Partial<{
    status: JobStatus;
    provider_job_id: string;
    result_url: string;
    cost_cents: number;
    error: string;
  }>,
): Promise<void> {
  const db = adminDb();
  if (!db) return;
  const { error } = await db.from("generation_jobs").update(patch).eq("id", jobId);
  if (error) console.error("job update failed", error);
}

/**
 * Reads a job, scoped to its owner. The userId filter is not redundant with
 * RLS: this client uses the secret key and bypasses RLS entirely, so scoping
 * here is the only thing preventing one user polling another's job id.
 */
export async function readJob(
  userId: string,
  jobId: string,
): Promise<GenerationJob | null> {
  const db = adminDb();
  if (!db) return null;

  const { data, error } = await db
    .from("generation_jobs")
    .select("id,kind,status,result_url,error,created_at")
    .eq("id", jobId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as GenerationJob;
}
