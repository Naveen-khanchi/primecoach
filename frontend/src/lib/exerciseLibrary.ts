const DATASET_URL =
  "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/dist/exercises.json";
const IMAGE_BASE_URL =
  "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/";

export interface LibraryExercise {
  id?: string;
  name: string;
  category?: string;
  equipment?: string | null;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  level?: string;
  mechanic?: string | null;
  instructions?: string[];
  images?: string[];
}

let cache: LibraryExercise[] | null = null;
let inFlight: Promise<LibraryExercise[]> | null = null;

/**
 * Fetches the free-exercise-db dataset (public, static, no key/rate-limit)
 * directly from the browser. Cached in memory for the life of the tab so
 * filtering doesn't re-fetch — this is reference data, not user data.
 */
export async function fetchExerciseLibrary(): Promise<LibraryExercise[]> {
  if (cache) return cache;
  if (inFlight) return inFlight;

  inFlight = fetch(DATASET_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Exercise library fetch failed: ${res.status}`);
      return res.json();
    })
    .then((data: LibraryExercise[]) => {
      cache = Array.isArray(data) ? data : [];
      return cache;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export function exerciseImageUrl(exercise: LibraryExercise): string | null {
  const path = exercise.images?.[0];
  return path ? `${IMAGE_BASE_URL}${path}` : null;
}

export function exerciseImageUrls(exercise: LibraryExercise): string[] {
  return (exercise.images ?? []).map((path) => `${IMAGE_BASE_URL}${path}`);
}

/** Stable identifier for routing — falls back to name since `id` isn't guaranteed on every entry. */
export function exerciseSlug(exercise: LibraryExercise): string {
  return exercise.id ?? exercise.name;
}
