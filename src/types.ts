export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  isCustom?: boolean;
  notes?: string;
}

export type ExerciseCategory =
  | 'Klatka piersiowa'
  | 'Plecy'
  | 'Nogi'
  | 'Barki'
  | 'Ramiona'
  | 'Brzuch'
  | 'Kardio'
  | 'Inne';

export interface ExerciseSet {
  id: string;
  weight: number; // in kg
  reps: number;
  completed: boolean;
  isWarmup?: boolean;
  rpe?: number; // 1-10
}

export interface WorkoutExercise {
  id: string; // unique within this workout session
  exerciseId: string; // reference to global Exercise
  name: string;
  category: ExerciseCategory;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO string
  endTime: string; // ISO string
  duration: number; // in seconds
  exercises: WorkoutExercise[];
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: {
    exerciseId: string;
    name: string;
    category: ExerciseCategory;
    defaultSetsCount: number;
  }[];
  notes?: string;
}

export interface ExerciseHistoryPoint {
  date: string;
  weight: number;
  reps: number;
  volume: number;
  estimatedOneRepMax: number;
}
