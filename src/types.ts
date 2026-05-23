export type BadgeType = "fire" | "blue" | "gold" | "rest";

export interface Exercise {
  name: string;
  sets: string;
  setsCount: number;
  repsText: string;
  video_url?: string;
}

export interface Finisher {
  label: string;
  text: string;
  type: "time" | "amrap" | "reps" | "duration" | "none";
  durationSeconds?: number;
  targetCount?: number;
}

export interface WorkoutDay {
  id: string; // e.g., "day-1"
  number: number;
  name: string;
  category: string;
  badge: string;
  badgeType: BadgeType;
  exercises: Exercise[];
  core?: Exercise[];
  circuitRounds?: string; // for Day 6
  finisher?: Finisher;
}

export interface WorkoutProgress {
  dayId: string;
  warmupCompleted: boolean;
  exerciseSetsCompleted: { [exerciseName: string]: boolean[] }; // map exercise.name -> boolean array for each set
  coreSetsCompleted: { [exerciseName: string]: boolean[] };
  finisherCompleted: boolean;
  isFullyCompleted: boolean;
  completedAt?: string;
  workoutDurationSeconds?: number;
}

export interface NutritionProfile {
  weight: number;
  weightUnit: "kg" | "lbs";
  height: number;
  goal: "shred" | "lean_bulk" | "pure_strength";
  activityLevel: "active" | "extreme";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  steps: number;
}

export interface DailyIntake {
  date: string; // YYYY-MM-DD
  calories: number;
  protein: number;
  water: number; // in ml
  steps: number;
}

export interface HistoryLog {
  id: string;
  dayId: string;
  dayNumber: number;
  dayName: string;
  completedAt: string;
  durationSeconds: number;
  streakAtCompletion: number;
}

export interface TechniqueDrill {
  id: string;
  name: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Beast";
  targetMuscle: string;
  description: string;
  regressionSteps: string[];
  keyCues: string[];
  tips: string;
}
