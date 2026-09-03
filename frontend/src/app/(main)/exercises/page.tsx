"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchExerciseLibrary, exerciseImageUrl, exerciseSlug, type LibraryExercise } from "@/lib/exerciseLibrary";
import { Loader2, Search, Dumbbell, AlertTriangle, ChevronRight } from "lucide-react";

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const PAGE_SIZE = 60;

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<LibraryExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState("all");
  const [equipment, setEquipment] = useState("all");
  const [level, setLevel] = useState("all");

  useEffect(() => {
    fetchExerciseLibrary()
      .then(setExercises)
      .catch(() => setError("Couldn't load the exercise library — check your internet connection and try again."))
      .finally(() => setLoading(false));
  }, []);

  const { muscles, equipmentOptions, levels } = useMemo(() => {
    const muscleSet = new Set<string>();
    const equipmentSet = new Set<string>();
    const levelSet = new Set<string>();
    exercises.forEach((ex) => {
      ex.primaryMuscles?.forEach((m) => muscleSet.add(m));
      if (ex.equipment) equipmentSet.add(ex.equipment);
      if (ex.level) levelSet.add(ex.level);
    });
    return {
      muscles: Array.from(muscleSet).sort(),
      equipmentOptions: Array.from(equipmentSet).sort(),
      levels: Array.from(levelSet).sort(),
    };
  }, [exercises]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exercises.filter((ex) => {
      if (q && !ex.name.toLowerCase().includes(q)) return false;
      if (muscle !== "all" && !ex.primaryMuscles?.includes(muscle)) return false;
      if (equipment !== "all" && ex.equipment !== equipment) return false;
      if (level !== "all" && ex.level !== level) return false;
      return true;
    });
  }, [exercises, search, muscle, equipment, level]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <AlertTriangle className="size-5 text-red-500" />
        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>
        <p className="text-muted-foreground mt-1">
          {filtered.length.toLocaleString()} of {exercises.length.toLocaleString()} exercises
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <select className={`${selectClass} capitalize`} value={muscle} onChange={(e) => setMuscle(e.target.value)}>
          <option value="all">All muscles</option>
          {muscles.map((m) => (
            <option key={m} value={m} className="capitalize">{m}</option>
          ))}
        </select>
        <select className={selectClass} value={equipment} onChange={(e) => setEquipment(e.target.value)}>
          <option value="all">All equipment</option>
          {equipmentOptions.map((eq) => (
            <option key={eq} value={eq}>{eq}</option>
          ))}
        </select>
        <select className={`${selectClass} capitalize`} value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="all">All levels</option>
          {levels.map((l) => (
            <option key={l} value={l} className="capitalize">{l}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 flex flex-col items-center text-center gap-2">
          <Dumbbell className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No exercises match those filters.</p>
        </Card>
      ) : (
        <>
          <Card className="p-0 overflow-hidden">
            <ul className="divide-y">
              {filtered.slice(0, PAGE_SIZE).map((ex) => (
                <ExerciseRow key={ex.id ?? ex.name} exercise={ex} />
              ))}
            </ul>
          </Card>
          {filtered.length > PAGE_SIZE && (
            <p className="text-center text-sm text-muted-foreground">
              Showing {PAGE_SIZE} of {filtered.length.toLocaleString()} — narrow your search to see more.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function ExerciseRow({ exercise }: { exercise: LibraryExercise }) {
  const [imgError, setImgError] = useState(false);
  const src = exerciseImageUrl(exercise);
  const badges = [...(exercise.primaryMuscles?.slice(0, 1) ?? []), exercise.equipment, exercise.level].filter(
    Boolean
  ) as string[];

  return (
    <li>
      <Link
        href={`/exercises/${encodeURIComponent(exerciseSlug(exercise))}`}
        className="group flex items-center gap-4 px-4 py-3 hover:bg-muted transition-colors"
      >
        <div className="size-11 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
          {src && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={exercise.name}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-[filter]"
              onError={() => setImgError(true)}
            />
          ) : (
            <Dumbbell className="size-4 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{exercise.name}</p>
          <p className="text-[11px] text-muted-foreground capitalize mt-0.5">{badges.join(" · ")}</p>
        </div>

        <ChevronRight className="size-4 text-muted-foreground shrink-0" />
      </Link>
    </li>
  );
}
