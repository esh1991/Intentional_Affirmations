/**
 * Portal audio: a tiny Web Audio mixer for the transmission bed and the
 * word-chord. No assets — every sound is synthesised, so there is nothing to
 * download and nothing to cache-bust.
 *
 * Two rules carried over from src/lib/sound.ts and kept absolute:
 *   1. Sound must never break an interaction. Everything is try/catch.
 *   2. Nothing plays before a user gesture (autoplay policy) — call
 *      `unlockAudio()` from the first pointer/key event.
 *
 * Preference (muted + volume) persists in localStorage so the choice
 * survives a reload, matching how the rest of the app stores UI state.
 */

const PREF_KEY = "mindsetEngineAudio";

interface AudioPrefs {
  muted: boolean;
  volume: number; // 0..1
}

const DEFAULT_PREFS: AudioPrefs = { muted: false, volume: 0.6 };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let prefs: AudioPrefs | null = null;

function loadPrefs(): AudioPrefs {
  if (prefs) return prefs;
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<AudioPrefs>) : {};
    prefs = {
      muted: parsed.muted ?? DEFAULT_PREFS.muted,
      volume:
        typeof parsed.volume === "number"
          ? Math.min(1, Math.max(0, parsed.volume))
          : DEFAULT_PREFS.volume,
    };
  } catch {
    prefs = { ...DEFAULT_PREFS };
  }
  return prefs;
}

function savePrefs(next: AudioPrefs): void {
  prefs = next;
  try {
    window.localStorage.setItem(PREF_KEY, JSON.stringify(next));
  } catch {
    // Private mode / quota — the in-memory value still applies this session.
  }
  if (master && ctx) {
    master.gain.setTargetAtTime(next.muted ? 0 : next.volume, ctx.currentTime, 0.02);
  }
}

export function isMuted(): boolean {
  return loadPrefs().muted;
}

export function getVolume(): number {
  return loadPrefs().volume;
}

export function setMuted(muted: boolean): void {
  savePrefs({ ...loadPrefs(), muted });
}

export function setVolume(volume: number): void {
  savePrefs({ ...loadPrefs(), volume: Math.min(1, Math.max(0, volume)) });
}

/** Lazily build the context. Returns null when audio is unavailable or muted. */
function engine(): { ctx: AudioContext; master: GainNode } | null {
  if (typeof window === "undefined") return null;
  const p = loadPrefs();
  if (p.muted) return null;
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = p.volume;
      master.connect(ctx.destination);
    }
    if (!master) return null;
    return { ctx, master };
  } catch {
    return null;
  }
}

/**
 * Resume the context from a user gesture. Browsers create contexts in a
 * "suspended" state until a real interaction happens.
 */
export function unlockAudio(): void {
  try {
    const e = engine();
    if (e && e.ctx.state === "suspended") void e.ctx.resume();
  } catch {
    // Nothing to unlock — stay silent.
  }
}

/* ------------------------------------------------------------------ *
 * The word-chord
 *
 * Each spoken word lights up and plays the next note of a rising major
 * pentatonic run; finishing the line resolves to a chord. Pentatonic means
 * any subset of the run is consonant, so lines of any length sound right.
 * ------------------------------------------------------------------ */

const ROOT_HZ = 196; // G3 — low enough to sit under speech
const PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31];

function hz(semitones: number): number {
  return ROOT_HZ * Math.pow(2, semitones / 12);
}

function tone(
  frequency: number,
  {
    at = 0,
    duration = 0.9,
    peak = 0.16,
    type = "sine",
  }: { at?: number; duration?: number; peak?: number; type?: OscillatorType } = {},
): void {
  const e = engine();
  if (!e) return;
  try {
    const start = e.ctx.currentTime + at;
    const osc = e.ctx.createOscillator();
    const gain = e.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    // Soft bell envelope: quick attack, long exponential tail.
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(e.master);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  } catch {
    // Sound must never break an interaction.
  }
}

/** Note for the Nth word of a line (0-based). Walks up the pentatonic run. */
export function playWordNote(index: number): void {
  tone(hz(PENTATONIC[index % PENTATONIC.length]), {
    duration: 0.85,
    peak: 0.13,
  });
}

/** The line landed — resolve the run into a chord that rings out. */
export function playChordResolve(): void {
  [0, 4, 7, 12].forEach((semitone, i) => {
    tone(hz(semitone + 12), { at: i * 0.045, duration: 2.4, peak: 0.11 });
  });
}

/** The moment of contact: a struck bowl with a long tail. */
export function playLockTone(): void {
  tone(hz(12), { duration: 3.2, peak: 0.14 });
  tone(hz(19), { at: 0.02, duration: 2.6, peak: 0.07 });
  tone(hz(24), { at: 0.05, duration: 2.0, peak: 0.05, type: "triangle" });
}

/* ------------------------------------------------------------------ *
 * The transmission bed
 * ------------------------------------------------------------------ */

let drone: { osc: OscillatorNode; sub: OscillatorNode; gain: GainNode } | null = null;

/** Sub-bass drone under the scanning sequence. Safe to call repeatedly. */
export function startDrone(): void {
  const e = engine();
  if (!e || drone) return;
  try {
    const now = e.ctx.currentTime;
    const gain = e.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 1.4);

    const osc = e.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(hz(-12), now);

    const sub = e.ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(hz(-24), now);

    const filter = e.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(220, now);

    osc.connect(filter);
    sub.connect(filter);
    filter.connect(gain);
    gain.connect(e.master);
    osc.start(now);
    sub.start(now);
    drone = { osc, sub, gain };
  } catch {
    drone = null;
  }
}

/** Locking: the drone climbs in pitch over `seconds`. */
export function riseDrone(seconds = 2): void {
  const e = engine();
  if (!e || !drone) return;
  try {
    const now = e.ctx.currentTime;
    drone.osc.frequency.exponentialRampToValueAtTime(hz(-5), now + seconds);
    drone.sub.frequency.exponentialRampToValueAtTime(hz(-17), now + seconds);
  } catch {
    // Ramp unavailable — the drone simply holds its pitch.
  }
}

/**
 * Contact. Silence is load-bearing: when it is the user's turn to speak the
 * bed drops out entirely, and nothing signals "you're up" better.
 */
export function stopDrone(fade = 0.6): void {
  const e = engine();
  if (!e || !drone) return;
  const current = drone;
  drone = null;
  try {
    const now = e.ctx.currentTime;
    current.gain.gain.cancelScheduledValues(now);
    current.gain.gain.setValueAtTime(Math.max(current.gain.gain.value, 0.0001), now);
    current.gain.gain.exponentialRampToValueAtTime(0.0001, now + fade);
    current.osc.stop(now + fade + 0.05);
    current.sub.stop(now + fade + 0.05);
  } catch {
    // Already stopped.
  }
}
