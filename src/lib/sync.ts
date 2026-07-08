import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import type { SessionEntry } from "@/lib/sessions";
import { readSessions } from "@/lib/sessions";
import { readStars, restoreStars } from "@/lib/stars";
import { readLastPractice, readStreak, restoreStreak } from "@/lib/streak";
import {
  type JourneyMap,
  type JourneyState,
  parseJourneys,
  readJourneysRaw,
  restoreJourneys,
} from "@/lib/journeys";
import { type Favorite, readFavorites, restoreFavorites } from "@/lib/favorites";

/**
 * Cloud sync for signed-in users (Phase 2 M1). localStorage stays the source
 * the UI reads — anonymous practice is untouched. When signed in:
 *
 * - `syncNow()` (on sign-in / page load): fetch cloud state, merge with local
 *   (streak = freshest/max, stars = max, journey days = union, favorites =
 *   union), write the merged result back to BOTH sides. The session log is
 *   uploaded once per user per device (flag below).
 * - `syncCompletion()` (after every completion): insert the session row and
 *   push the just-updated local snapshot.
 *
 * All of it is fire-and-forget: sync failures must never break practice.
 */

const SESSIONS_UPLOADED_FLAG = "mindsetEngineSessionsUploaded";

/** Local-day ISO date (YYYY-MM-DD) from a toDateString() value (or now). */
function toLocalISO(dateString?: string | null): string | null {
  const d = dateString ? new Date(dateString) : new Date();
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** toDateString() value from a local-day ISO date. */
function fromLocalISO(iso: string | null): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).toDateString();
}

/** A streak only counts if its last practice was today or yesterday. */
function effectiveStreak(count: number, lastISO: string | null): number {
  const today = toLocalISO();
  const yesterday = toLocalISO(
    new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString(),
  );
  return lastISO === today || lastISO === yesterday ? count : 0;
}

function sessionRow(userId: string, entry: SessionEntry) {
  return {
    user_id: userId,
    affirmation: entry.affirmation,
    mode: entry.mode,
    category: entry.category,
    match_score: entry.matchScore,
    attempts: entry.attempts,
    input: entry.input,
    journey_day: entry.journeyDay ?? null,
    journey_duration: entry.journeyDuration ?? null,
    completed_at: entry.completedAt,
  };
}

interface CloudJourneyRow {
  mode: string;
  category: string;
  duration: number;
  started_at: string;
  completed_days: string[];
}

/** Prefer the state with more progress; union days when durations match. */
function mergeJourney(local: JourneyState, cloud: JourneyState): JourneyState {
  if (local.duration !== cloud.duration) {
    return local.completedDays.length >= cloud.completedDays.length ? local : cloud;
  }
  const days = [...new Set([...cloud.completedDays, ...local.completedDays])];
  return {
    duration: local.duration,
    startedAt: cloud.startedAt || local.startedAt,
    completedDays: days,
  };
}

/** Full two-way merge. Runs once per page load when a session appears. */
export async function syncNow(user: User): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    const [streakRes, starsRes, journeysRes, favoritesRes] = await Promise.all([
      supabase.from("streaks").select("current_streak,longest_streak,last_practice_date").eq("user_id", user.id).maybeSingle(),
      supabase.from("stars").select("star_count").eq("user_id", user.id).maybeSingle(),
      supabase.from("journeys").select("mode,category,duration,started_at,completed_days").eq("user_id", user.id),
      supabase.from("favorites").select("affirmation,mode,category,created_at").eq("user_id", user.id),
    ]);

    // Streak: freshest wins; longest is the max ever seen.
    const localStreak = readStreak();
    const localLastISO = toLocalISO(readLastPractice());
    const cloud = streakRes.data;
    const cloudLastISO = cloud?.last_practice_date ?? null;
    const localEffective = effectiveStreak(localStreak, localLastISO);
    const cloudEffective = effectiveStreak(cloud?.current_streak ?? 0, cloudLastISO);
    const mergedStreak = Math.max(localEffective, cloudEffective);
    const mergedLastISO =
      (localLastISO ?? "") >= (cloudLastISO ?? "") ? localLastISO : cloudLastISO;
    const mergedLongest = Math.max(
      cloud?.longest_streak ?? 0,
      localStreak,
      mergedStreak,
    );
    restoreStreak(mergedStreak, fromLocalISO(mergedLastISO));

    // Stars: max of the 0-2 cycle.
    const mergedStars = Math.max(readStars(), starsRes.data?.star_count ?? 0);
    restoreStars(mergedStars);

    // Journeys: merge per mode/category key.
    const localJourneys = parseJourneys(readJourneysRaw());
    const merged: JourneyMap = { ...localJourneys };
    for (const row of (journeysRes.data ?? []) as CloudJourneyRow[]) {
      const key = `${row.mode}/${row.category}`;
      const cloudState: JourneyState = {
        duration: row.duration as JourneyState["duration"],
        startedAt: row.started_at,
        completedDays: Array.isArray(row.completed_days) ? row.completed_days : [],
      };
      merged[key] = merged[key] ? mergeJourney(merged[key], cloudState) : cloudState;
    }
    restoreJourneys(merged);

    // Favorites: union by affirmation.
    const byAffirmation = new Map<string, Favorite>();
    for (const f of readFavorites()) byAffirmation.set(f.affirmation, f);
    for (const row of favoritesRes.data ?? []) {
      if (!byAffirmation.has(row.affirmation)) {
        byAffirmation.set(row.affirmation, {
          affirmation: row.affirmation,
          mode: row.mode,
          category: row.category,
          addedAt: row.created_at,
        });
      }
    }
    const mergedFavorites = [...byAffirmation.values()];
    restoreFavorites(mergedFavorites);

    // Push the merged snapshot back up.
    await Promise.all([
      supabase.from("streaks").upsert({
        user_id: user.id,
        current_streak: mergedStreak,
        longest_streak: mergedLongest,
        last_practice_date: mergedLastISO,
        updated_at: new Date().toISOString(),
      }),
      supabase.from("stars").upsert({
        user_id: user.id,
        star_count: mergedStars,
        updated_at: new Date().toISOString(),
      }),
      ...Object.entries(merged).map(([key, state]) => {
        const [mode, ...rest] = key.split("/");
        return supabase.from("journeys").upsert({
          user_id: user.id,
          mode,
          category: rest.join("/"),
          duration: state.duration,
          started_at: state.startedAt,
          completed_days: state.completedDays,
          updated_at: new Date().toISOString(),
        });
      }),
      mergedFavorites.length
        ? supabase.from("favorites").upsert(
            mergedFavorites.map((f) => ({
              user_id: user.id,
              affirmation: f.affirmation,
              mode: f.mode,
              category: f.category,
              created_at: f.addedAt,
            })),
            { onConflict: "user_id,affirmation" },
          )
        : Promise.resolve(),
    ]);

    // Session log: append-only, uploaded once per user per device.
    const flag = `${SESSIONS_UPLOADED_FLAG}:${user.id}`;
    if (!localStorage.getItem(flag)) {
      const log = readSessions();
      if (log.length) {
        const { error } = await supabase
          .from("sessions")
          .insert(log.map((entry) => sessionRow(user.id, entry)));
        if (error) throw error;
      }
      localStorage.setItem(flag, new Date().toISOString());
    }
  } catch (error) {
    console.warn("sync: merge failed (will retry next load)", error);
  }
}

/** Dual-write after a completion. Local state is already updated. */
export async function syncCompletion(entry: SessionEntry): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return;

    const journeys = parseJourneys(readJourneysRaw());
    const journeyState = journeys[`${entry.mode}/${entry.category}`];
    const currentStreak = readStreak();
    const { data: cloudStreak } = await supabase
      .from("streaks")
      .select("longest_streak")
      .eq("user_id", user.id)
      .maybeSingle();
    await Promise.all([
      supabase.from("sessions").insert(sessionRow(user.id, entry)),
      supabase.from("streaks").upsert({
        user_id: user.id,
        current_streak: currentStreak,
        longest_streak: Math.max(currentStreak, cloudStreak?.longest_streak ?? 0),
        last_practice_date: toLocalISO(readLastPractice()),
        updated_at: new Date().toISOString(),
      }),
      supabase.from("stars").upsert({
        user_id: user.id,
        star_count: readStars(),
        updated_at: new Date().toISOString(),
      }),
      journeyState
        ? supabase.from("journeys").upsert({
            user_id: user.id,
            mode: entry.mode,
            category: entry.category,
            duration: journeyState.duration,
            started_at: journeyState.startedAt,
            completed_days: journeyState.completedDays,
            updated_at: new Date().toISOString(),
          })
        : Promise.resolve(),
    ]);
  } catch (error) {
    console.warn("sync: completion push failed", error);
  }
}

/** Push a favorite toggle. */
export async function syncFavorite(
  favorite: Favorite,
  nowFavorited: boolean,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return;
    if (nowFavorited) {
      await supabase.from("favorites").upsert(
        {
          user_id: user.id,
          affirmation: favorite.affirmation,
          mode: favorite.mode,
          category: favorite.category,
          created_at: favorite.addedAt,
        },
        { onConflict: "user_id,affirmation" },
      );
    } else {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("affirmation", favorite.affirmation);
    }
  } catch (error) {
    console.warn("sync: favorite push failed", error);
  }
}
