"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  fetchExerciseLibrary,
  exerciseImageUrls,
  exerciseSlug,
  type LibraryExercise,
} from "@/lib/exerciseLibrary";
import { Loader2, ChevronLeft, Dumbbell, AlertTriangle } from "lucide-react";

export default function ExerciseDetailPage() {
  const params = useParams();
  const slug = decodeURIComponent(String(params.id));

  const [exercise, setExercise] = useState<LibraryExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExerciseLibrary()
      .then((list) => {
        setExercise(list.find((ex) => exerciseSlug(ex) === slug) ?? null);
      })
      .catch(() => setError("Couldn't load the exercise library — check your internet connection and try again."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        {error ? <AlertTriangle className="size-5 text-red-500" /> : <p className="font-medium">Exercise not found</p>}
        {error && <p className="text-sm text-muted-foreground max-w-sm">{error}</p>}
        <Link href="/exercises" className="text-sm text-muted-foreground hover:text-foreground">
          Back to exercises
        </Link>
      </div>
    );
  }

  const images = exerciseImageUrls(exercise);
  const badges = [exercise.category, exercise.equipment, exercise.mechanic, exercise.level].filter(Boolean) as string[];

  return (
    <div className="space-y-8">
      <Link
        href="/exercises"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Exercises
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{exercise.name}</h1>
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {badges.map((b) => (
              <span key={b} className="text-xs bg-muted px-2.5 py-1 rounded-full capitalize">{b}</span>
            ))}
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 max-w-xl">
          {images.map((src, i) => (
            <ExerciseImage key={src} src={src} alt={`${exercise.name} — step ${i + 1}`} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Primary muscles
          </h2>
          {exercise.primaryMuscles?.length ? (
            <div className="flex flex-wrap gap-2">
              {exercise.primaryMuscles.map((m) => (
                <span key={m} className="text-xs bg-muted px-2.5 py-1 rounded-full capitalize">{m}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not specified.</p>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Secondary muscles
          </h2>
          {exercise.secondaryMuscles?.length ? (
            <div className="flex flex-wrap gap-2">
              {exercise.secondaryMuscles.map((m) => (
                <span key={m} className="text-xs bg-muted px-2.5 py-1 rounded-full capitalize">{m}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">None.</p>
          )}
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Instructions</h2>
        <Card className="p-6">
          {exercise.instructions?.length ? (
            <ol className="space-y-3 list-decimal list-inside text-sm">
              {exercise.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">No instructions available for this exercise.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function ExerciseImage({ src, alt }: { src: string; alt: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center p-3">
      {!imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain grayscale"
          onError={() => setImgError(true)}
        />
      ) : (
        <Dumbbell className="size-6 text-muted-foreground" />
      )}
    </div>
  );
}
