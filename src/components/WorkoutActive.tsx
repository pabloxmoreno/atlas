import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  Plus,
  Trash2,
  Check,
  Clock,
  Dumbbell,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Volume2,
  Copy,
  AlertTriangle,
  History,
  Info,
  HelpCircle,
  ChevronsUpDown,
} from 'lucide-react';
import { WorkoutSession, WorkoutExercise, ExerciseSet, Exercise, ExerciseCategory } from '../types';

interface WorkoutActiveProps {
  activeSession: WorkoutSession;
  exercisesDatabase: Exercise[];
  workouts?: WorkoutSession[];
  onUpdateSession: (session: WorkoutSession) => void;
  onFinishSession: () => void;
  onCancelSession: () => void;
  userWeight?: number;
  userHeight?: number;
}

export default function WorkoutActive({
  activeSession,
  exercisesDatabase,
  workouts = [],
  onUpdateSession,
  onFinishSession,
  onCancelSession,
  userWeight,
  userHeight,
}: WorkoutActiveProps) {
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Wszystkie');
  const [showTempoModal, setShowTempoModal] = useState(false);
  const [selectedTempoToExplain, setSelectedTempoToExplain] = useState<string | null>(null);

  // Collapsible exercises state - all open by default
  const [collapsedExercises, setCollapsedExercises] = useState<Record<string, boolean>>({});

  const toggleExerciseCollapse = (workoutExId: string) => {
    setCollapsedExercises((prev) => ({
      ...prev,
      [workoutExId]: !prev[workoutExId],
    }));
  };

  const allAreCollapsed =
    activeSession.exercises.length > 0 &&
    activeSession.exercises.every((ex) => collapsedExercises[ex.id]);

  const toggleAllExercises = () => {
    if (allAreCollapsed) {
      setCollapsedExercises({});
    } else {
      const all: Record<string, boolean> = {};
      activeSession.exercises.forEach((ex) => {
        all[ex.id] = true;
      });
      setCollapsedExercises(all);
    }
  };
  
  // Rest Timer State
  const [restDuration, setRestDuration] = useState(90); // default 90s
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null);
  const [restIsActive, setRestIsActive] = useState(false);
  const [autoStartRest, setAutoStartRest] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(new Date(activeSession.startTime).getTime());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Categories list
  const categories: string[] = [
    'Wszystkie',
    'Klatka piersiowa',
    'Plecy',
    'Nogi',
    'Barki',
    'Ramiona',
    'Brzuch',
    'Kardio',
    'Inne',
  ];

  // Active workout timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.floor((now - startTimeRef.current) / 1000);
      setElapsedSeconds(diff >= 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update session duration before saving
  useEffect(() => {
    onUpdateSession({
      ...activeSession,
      duration: elapsedSeconds,
    });
  }, [elapsedSeconds]);

  // Rest Timer logic
  useEffect(() => {
    if (restIsActive && restSecondsLeft !== null && restSecondsLeft > 0) {
      restTimerRef.current = setTimeout(() => {
        setRestSecondsLeft(restSecondsLeft - 1);
      }, 1000);
    } else if (restSecondsLeft === 0) {
      triggerRestEndBeep();
      setRestSecondsLeft(null);
      setRestIsActive(false);
    }

    return () => {
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
    };
  }, [restIsActive, restSecondsLeft]);

  // Synthesis-based sound beep
  const triggerRestEndBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playBeepTone = (frequency: number, duration: number, startTime: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      // High-low dual beep
      playBeepTone(880, 0.25, now);
      playBeepTone(880, 0.25, now + 0.35);
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  };

  // Format Elapsed time
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Rest timer control
  const startRestTimer = (secs: number) => {
    setRestSecondsLeft(secs);
    setRestIsActive(true);
  };

  const pauseResumeRest = () => {
    setRestIsActive(!restIsActive);
  };

  const adjustRestTime = (amount: number) => {
    if (restSecondsLeft === null) {
      const newVal = Math.max(10, restDuration + amount);
      setRestDuration(newVal);
    } else {
      setRestSecondsLeft(Math.max(0, restSecondsLeft + amount));
    }
  };

  // Add Exercise Handler
  const handleAddExerciseToWorkout = (ex: Exercise) => {
    const isAlreadyAdded = activeSession.exercises.some((item) => item.exerciseId === ex.id);
    if (isAlreadyAdded) {
      alert(`Ćwiczenie "${ex.name}" jest już dodane.`);
      return;
    }

    const newWorkoutEx: WorkoutExercise = {
      id: `we-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      exerciseId: ex.id,
      name: ex.name,
      category: ex.category,
      sets: [
        {
          id: `set-${Date.now()}-1`,
          weight: 0,
          reps: 0,
          completed: false,
        },
      ],
    };

    onUpdateSession({
      ...activeSession,
      exercises: [...activeSession.exercises, newWorkoutEx],
    });
    setShowAddExercise(false);
  };

  // Remove exercise from workout
  const handleRemoveExercise = (workoutExId: string) => {
    const updated = activeSession.exercises.filter((ex) => ex.id !== workoutExId);
    onUpdateSession({
      ...activeSession,
      exercises: updated,
    });
  };

  // Update set inputs (weight, reps, status)
  const handleUpdateSet = (workoutExId: string, setId: string, updates: Partial<ExerciseSet>) => {
    const updatedExercises = activeSession.exercises.map((ex) => {
      if (ex.id !== workoutExId) return ex;

      const updatedSets = ex.sets.map((set) => {
        if (set.id !== setId) return set;

        const updatedSet = { ...set, ...updates };

        // Auto start rest timer on completing a set
        if (updates.completed === true && autoStartRest) {
          startRestTimer(restDuration);
        }

        return updatedSet;
      });

      return { ...ex, sets: updatedSets };
    });

    onUpdateSession({
      ...activeSession,
      exercises: updatedExercises,
    });
  };

  // Add set to exercise
  const handleAddSetToExercise = (workoutExId: string) => {
    const updatedExercises = activeSession.exercises.map((ex) => {
      if (ex.id !== workoutExId) return ex;

      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet: ExerciseSet = {
        id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        weight: lastSet ? lastSet.weight : 0,
        reps: lastSet ? lastSet.reps : 0,
        completed: false,
        isWarmup: false,
      };

      return { ...ex, sets: [...ex.sets, newSet] };
    });

    onUpdateSession({
      ...activeSession,
      exercises: updatedExercises,
    });
  };

  // Copy last set
  const handleCopySet = (workoutExId: string, setIndex: number) => {
    const updatedExercises = activeSession.exercises.map((ex) => {
      if (ex.id !== workoutExId) return ex;

      const setToCopy = ex.sets[setIndex];
      const newSet: ExerciseSet = {
        id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        weight: setToCopy.weight,
        reps: setToCopy.reps,
        completed: false,
        isWarmup: setToCopy.isWarmup,
        rpe: setToCopy.rpe,
      };

      // Insert after the copied set
      const newSets = [...ex.sets];
      newSets.splice(setIndex + 1, 0, newSet);

      return { ...ex, sets: newSets };
    });

    onUpdateSession({
      ...activeSession,
      exercises: updatedExercises,
    });
  };

  // Remove set
  const handleRemoveSet = (workoutExId: string, setId: string) => {
    const updatedExercises = activeSession.exercises.map((ex) => {
      if (ex.id !== workoutExId) return ex;

      // Keep at least 1 set
      if (ex.sets.length <= 1) {
        alert('Ćwiczenie musi mieć przynajmniej jedną serię. Usuń całe ćwiczenie, jeśli go nie wykonywałeś.');
        return ex;
      }

      return { ...ex, sets: ex.sets.filter((set) => set.id !== setId) };
    });

    onUpdateSession({
      ...activeSession,
      exercises: updatedExercises,
    });
  };

  // Filtered exercises for add modal
  const filteredExercises = exercisesDatabase.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Wszystkie' || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Find historical data for an exercise and specific set
  const getPreviousSetData = (exerciseName: string, setIndex: number) => {
    if (!workouts || workouts.length === 0) return null;

    const pastSessions = [...workouts]
      .filter((w) => w.id !== activeSession.id && w.endTime)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    for (const session of pastSessions) {
      const exMatch = session.exercises.find(
        (e) => e.name.trim().toLowerCase() === exerciseName.trim().toLowerCase()
      );
      if (exMatch && exMatch.sets && exMatch.sets.length > 0) {
        const completedSets = exMatch.sets.filter((s) => s.completed || (s.weight > 0 && s.reps > 0));
        const targetSets = completedSets.length > 0 ? completedSets : exMatch.sets;

        const matchingSet = targetSets[setIndex] || targetSets[targetSets.length - 1];
        if (matchingSet && (matchingSet.weight > 0 || matchingSet.reps > 0)) {
          return {
            weight: matchingSet.weight,
            reps: matchingSet.reps,
            rpe: matchingSet.rpe,
            sessionDate: new Date(session.startTime).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }),
          };
        }
      }
    }
    return null;
  };

  const openTempoModal = (tempoString: string) => {
    setSelectedTempoToExplain(tempoString);
    setShowTempoModal(true);
  };

  return (
    <div className="space-y-5 pb-28">
      {/* Session Title and General Controls */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        {/* Title and stats */}
        <div className="space-y-2">
          <input
            type="text"
            value={activeSession.name}
            onChange={(e) => onUpdateSession({ ...activeSession, name: e.target.value })}
            className="text-lg sm:text-xl font-display font-bold text-white bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-yellow-400 focus:outline-none w-full py-0.5 transition-colors"
            placeholder="Nazwa treningu"
          />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-mono text-yellow-400 text-sm font-semibold">
              <Clock className="w-4 h-4" /> {formatTime(elapsedSeconds)}
            </span>
            <span>•</span>
            <span className="font-medium text-zinc-300">{activeSession.exercises.length} ćwiczeń</span>
            <span>•</span>
            <span className="font-medium text-zinc-400">
              {activeSession.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0)} serii wykonanych
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            id="btn-cancel-workout"
            onClick={() => setShowCancelConfirm(true)}
            className="w-full py-2.5 px-3 bg-zinc-800 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 border border-zinc-700/60 hover:border-red-500/30 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer text-center"
          >
            Anuluj
          </button>
          <button
            id="btn-finish-workout"
            onClick={onFinishSession}
            className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-zinc-950 font-bold text-sm rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/10 text-center flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Zakończ i Zapisz</span>
          </button>
        </div>

        {/* Full-view responsive Notes input - automatically adjusts to text without hidden overflow */}
        <div className="pt-3 border-t border-zinc-800/80">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Notatka do treningu
          </label>
          <textarea
            value={activeSession.notes || ''}
            onChange={(e) => onUpdateSession({ ...activeSession, notes: e.target.value })}
            placeholder="Wpisz notatkę do treningu (np. samopoczucie, dyspozycja, suplementacja)..."
            rows={Math.max(2, (activeSession.notes || '').split('\n').length)}
            className="w-full bg-zinc-950 text-xs text-zinc-200 placeholder-zinc-500 border border-zinc-800 focus:border-yellow-400/60 rounded-xl p-3 outline-hidden transition-colors h-auto overflow-visible leading-relaxed"
          />
        </div>
      </div>

      {/* Exercises Header with Expand/Collapse All */}
      {activeSession.exercises.length > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-zinc-400">
            Ćwiczenia w sesji ({activeSession.exercises.length})
          </span>
          <button
            type="button"
            onClick={toggleAllExercises}
            className="inline-flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 font-medium px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <ChevronsUpDown className="w-3.5 h-3.5" />
            <span>{allAreCollapsed ? 'Rozwiń wszystkie' : 'Zwiń wszystkie'}</span>
          </button>
        </div>
      )}

      {/* Exercises in Session */}
      <div className="space-y-4">
        {activeSession.exercises.length === 0 ? (
          <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-10 text-center text-zinc-500 bg-zinc-900/10">
            <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-30 text-zinc-400" />
            <p className="font-semibold text-zinc-400">Trening jest pusty</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto mb-5">
              Kliknij poniższy przycisk, aby dodać pierwsze ćwiczenie z bazy.
            </p>
            <button
              onClick={() => setShowAddExercise(true)}
              className="inline-flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700/80 rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Dodaj ćwiczenie
            </button>
          </div>
        ) : (
          activeSession.exercises.map((workoutEx, exIndex) => {
            const isCollapsed = !!collapsedExercises[workoutEx.id];
            const completedSetsCount = workoutEx.sets.filter((s) => s.completed).length;
            const totalSetsCount = workoutEx.sets.length;
            const exerciseTonnage = workoutEx.sets.reduce(
              (sum, s) => sum + (s.completed ? s.weight * s.reps : 0),
              0
            );

            return (
              <div
                key={workoutEx.id}
                className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl overflow-hidden shadow-xs transition-all"
              >
                {/* Exercise Header - Click to toggle collapse */}
                <div className="bg-zinc-900 border-b border-zinc-800/80 px-3.5 py-3 space-y-2">
                  <div className="flex justify-between items-center gap-2">
                    <div
                      onClick={() => toggleExerciseCollapse(workoutEx.id)}
                      className="flex-1 cursor-pointer flex items-center gap-2 select-none group"
                    >
                      <button
                        type="button"
                        className="text-zinc-400 group-hover:text-yellow-400 transition-colors p-0.5"
                      >
                        {isCollapsed ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-yellow-500 font-bold">
                            {workoutEx.category}
                          </span>
                          {isCollapsed && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                              {completedSetsCount}/{totalSetsCount} serii ({exerciseTonnage} kg)
                            </span>
                          )}
                        </div>
                        <h4 className="font-display font-bold text-sm text-zinc-100 group-hover:text-yellow-400 transition-colors">
                          {workoutEx.name}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRemoveExercise(workoutEx.id)}
                        className="text-zinc-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                        title="Usuń ćwiczenie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Plan guidelines if present */}
                  {(workoutEx.targetReps || workoutEx.tempo || workoutEx.rest || workoutEx.notes) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {workoutEx.targetReps && (
                        <span className="text-[11px] bg-zinc-800/90 border border-zinc-700/60 text-zinc-300 font-mono px-2 py-0.5 rounded-md font-semibold">
                          Powt: <strong className="text-yellow-400">{workoutEx.targetReps}</strong>
                        </span>
                      )}
                      {workoutEx.tempo && workoutEx.tempo !== '-' && (
                        <button
                          type="button"
                          onClick={() => openTempoModal(workoutEx.tempo || '2010')}
                          className="inline-flex items-center gap-1 text-[11px] bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-all active:scale-95"
                          title="Kliknij, aby zobaczyć wyjaśnienie tempa"
                        >
                          <span>Tempo: <strong className="text-cyan-400 underline decoration-dotted">{workoutEx.tempo}</strong></span>
                          <HelpCircle className="w-3 h-3 text-cyan-400" />
                        </button>
                      )}
                      {workoutEx.rest && (
                        <span className="text-[11px] bg-zinc-800/90 border border-zinc-700/60 text-zinc-300 font-mono px-2 py-0.5 rounded-md font-semibold">
                          Przerwa: <strong className="text-emerald-400">{workoutEx.rest}</strong>
                        </span>
                      )}
                      {workoutEx.notes && (
                        <p className="w-full text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-md font-medium mt-1 whitespace-pre-wrap leading-relaxed">
                          💡 {workoutEx.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Collapsible Content: Sets Table & Add Set */}
                {!isCollapsed && (
                  <>
                    {/* Sets Table - Fully responsive without horizontal scroll clipping */}
                    <div className="p-2 sm:p-3">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-800/60 text-[10px] sm:text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
                            <th className="py-2 text-center w-8">#</th>
                            <th className="py-2 text-center w-20 sm:w-24">Poprz.</th>
                            <th className="py-2 text-center w-12 sm:w-14">Typ</th>
                            <th className="py-2 text-center min-w-[64px]">Ciężar (kg)</th>
                            <th className="py-2 text-center min-w-[56px]">Powt.</th>
                            <th className="py-2 text-center w-10">✓</th>
                            <th className="py-2 text-center w-12">Opcje</th>
                          </tr>
                        </thead>
                        <tbody>
                          {workoutEx.sets.map((set, sIndex) => {
                            const prevSet = getPreviousSetData(workoutEx.name, sIndex);

                            return (
                              <tr
                                key={set.id}
                                className={`border-b border-zinc-800/30 transition-colors ${
                                  set.completed ? 'bg-emerald-500/5' : ''
                                }`}
                              >
                                {/* Set index */}
                                <td className="py-2 text-center font-mono text-xs text-zinc-400 font-bold">
                                  {sIndex + 1}
                                </td>

                                {/* Previous performance column */}
                                <td className="py-2 text-center px-1">
                                  {prevSet ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleUpdateSet(workoutEx.id, set.id, {
                                          weight: set.weight === 0 ? prevSet.weight : set.weight,
                                          reps: set.reps === 0 ? prevSet.reps : set.reps,
                                        });
                                      }}
                                      className="w-full inline-flex items-center justify-center gap-1 font-mono text-[11px] font-semibold text-zinc-400 hover:text-yellow-400 bg-zinc-950 hover:bg-yellow-400/10 border border-zinc-800 hover:border-yellow-400/30 px-1 py-1 rounded-md transition-all cursor-pointer truncate"
                                      title={`Poprzednio (${prevSet.sessionDate}): ${prevSet.weight}kg × ${prevSet.reps}. Kliknij, aby uzupełnić.`}
                                    >
                                      <span className="text-zinc-200">{prevSet.weight}k</span>
                                      <span className="text-zinc-500 text-[10px]">×</span>
                                      <span className="text-zinc-300">{prevSet.reps}</span>
                                    </button>
                                  ) : (
                                    <span className="font-mono text-xs text-zinc-600">—</span>
                                  )}
                                </td>

                                {/* Set type toggle */}
                                <td className="py-2 text-center px-1">
                                  <button
                                    onClick={() =>
                                      handleUpdateSet(workoutEx.id, set.id, {
                                        isWarmup: !set.isWarmup,
                                      })
                                    }
                                    className={`w-full text-[10px] font-bold py-1 px-1 rounded uppercase tracking-wider border cursor-pointer ${
                                      set.isWarmup
                                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                                        : 'bg-zinc-800/90 text-zinc-400 border-zinc-700/50 hover:border-zinc-600'
                                    }`}
                                    title="Przełącz seria rozgrzewkowa / robocza"
                                  >
                                    {set.isWarmup ? 'Rozg' : 'Rob'}
                                  </button>
                                </td>

                                {/* Weight input */}
                                <td className="py-2 text-center px-1">
                                  <input
                                    type="number"
                                    step="any"
                                    value={set.weight === 0 ? '' : set.weight}
                                    onChange={(e) =>
                                      handleUpdateSet(workoutEx.id, set.id, {
                                        weight: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    placeholder={prevSet ? String(prevSet.weight) : '0'}
                                    className="w-full bg-zinc-950 text-zinc-100 font-mono text-center font-bold border border-zinc-800 focus:border-yellow-400 rounded-lg py-1.5 text-sm outline-hidden"
                                  />
                                </td>

                                {/* Reps selector (1-15) */}
                                <td className="py-2 text-center px-1">
                                  <select
                                    value={set.reps || ''}
                                    onChange={(e) =>
                                      handleUpdateSet(workoutEx.id, set.id, {
                                        reps: parseInt(e.target.value, 10) || 0,
                                      })
                                    }
                                    className="w-full bg-zinc-950 text-zinc-100 font-mono text-center font-bold border border-zinc-800 focus:border-yellow-400 rounded-lg py-1.5 px-1 text-sm outline-hidden cursor-pointer"
                                  >
                                    <option value="" className="text-zinc-500 font-mono">
                                      -
                                    </option>
                                    {Array.from({ length: 15 }, (_, i) => i + 1).map((val) => (
                                      <option key={val} value={val} className="text-zinc-100 font-mono font-bold bg-zinc-900">
                                        {val}
                                      </option>
                                    ))}
                                    {set.reps > 15 && (
                                      <option value={set.reps} className="text-zinc-100 font-mono font-bold bg-zinc-900">
                                        {set.reps}
                                      </option>
                                    )}
                                  </select>
                                </td>

                                {/* Checkmark Status button */}
                                <td className="py-2 text-center px-1">
                                  <button
                                    onClick={() =>
                                      handleUpdateSet(workoutEx.id, set.id, {
                                        completed: !set.completed,
                                      })
                                    }
                                    className={`w-7 h-7 sm:w-8 sm:h-8 mx-auto rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                      set.completed
                                        ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-600 shadow-xs'
                                        : 'border border-zinc-700 bg-zinc-950 hover:border-zinc-500 text-transparent'
                                    }`}
                                  >
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  </button>
                                </td>

                                {/* Set actions */}
                                <td className="py-2 text-center px-1">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => handleCopySet(workoutEx.id, sIndex)}
                                      className="text-zinc-500 hover:text-zinc-200 p-1 rounded cursor-pointer transition-colors"
                                      title="Duplikuj serię"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleRemoveSet(workoutEx.id, set.id)}
                                      className="text-zinc-500 hover:text-red-400 p-1 rounded cursor-pointer transition-colors"
                                      title="Usuń serię"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Add set button inside exercise card */}
                    <div className="bg-zinc-900/40 border-t border-zinc-800/40 px-3.5 py-2 flex justify-between items-center text-xs">
                      <span className="text-zinc-400 font-mono text-[11px]">
                        Tonaż: <strong className="text-zinc-200">{exerciseTonnage} kg</strong>
                      </span>
                      <button
                        onClick={() => handleAddSetToExercise(workoutEx.id)}
                        className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 font-bold transition-all py-1 px-2.5 rounded-lg hover:bg-zinc-800/60 cursor-pointer text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Dodaj serię
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Button to add exercise */}
      {activeSession.exercises.length > 0 && (
        <button
          onClick={() => setShowAddExercise(true)}
          className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 py-3.5 rounded-xl text-sm font-semibold text-zinc-200 transition-all cursor-pointer active:scale-98"
        >
          <Plus className="w-5 h-5 text-yellow-400" /> Dodaj kolejne ćwiczenie
        </button>
      )}

      {/* Persistent Bottom REST TIMER Widget */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 p-4 pb-safe flex flex-col sm:flex-row items-center justify-between gap-4 max-w-lg mx-auto rounded-t-2xl shadow-2xl">
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <div className="flex items-center gap-2.5">
            <Clock className={`w-5 h-5 ${restSecondsLeft !== null ? 'text-yellow-400 animate-pulse' : 'text-zinc-500'}`} />
            <div>
              <p className="text-[11px] uppercase font-bold tracking-wider text-zinc-500">Stoper odpoczynku</p>
              <p className="text-lg font-mono font-bold text-zinc-100">
                {restSecondsLeft !== null ? formatTime(restSecondsLeft) : formatTime(restDuration)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => adjustRestTime(-15)}
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 flex items-center justify-center cursor-pointer"
              title="-15s"
            >
              -15
            </button>
            <button
              onClick={() => adjustRestTime(15)}
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 flex items-center justify-center cursor-pointer"
              title="+15s"
            >
              +15
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Auto Rest Toggle */}
          <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer mr-auto sm:mr-0 select-none">
            <input
              type="checkbox"
              checked={autoStartRest}
              onChange={(e) => setAutoStartRest(e.target.checked)}
              className="rounded-sm border-zinc-700 text-yellow-400 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            Autostart stoperu
          </label>

          {restSecondsLeft !== null ? (
            <button
              onClick={() => setRestSecondsLeft(null)}
              className="py-1.5 px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Anuluj
            </button>
          ) : (
            <button
              onClick={() => startRestTimer(restDuration)}
              className="py-1.5 px-4 bg-yellow-400 text-zinc-950 rounded-lg text-xs font-bold hover:bg-yellow-500 transition-all cursor-pointer flex items-center gap-1"
            >
              <Play className="w-3 h-3 fill-current stroke-none" /> Start ({restDuration}s)
            </button>
          )}
        </div>
      </div>

      {/* TEMPO EXPLANATION POPUP MODAL */}
      {showTempoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">Jak czytać tempo?</h3>
                  <p className="text-[11px] text-zinc-400">Czterocyfrowy kod kontroli powtórzenia</p>
                </div>
              </div>
              <button
                onClick={() => setShowTempoModal(false)}
                className="text-zinc-400 hover:text-white p-1.5 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedTempoToExplain && (
              <div className="bg-zinc-950 border border-cyan-500/30 rounded-xl p-3.5 text-center">
                <span className="text-[11px] text-zinc-400 uppercase font-bold block mb-1">Wybrane tempo w planie:</span>
                <span className="font-mono text-2xl font-bold tracking-widest text-cyan-400">
                  {selectedTempoToExplain}
                </span>
              </div>
            )}

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850 flex items-start gap-2.5">
                <span className="font-mono font-bold text-cyan-400 text-sm bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">1</span>
                <div>
                  <p className="font-bold text-zinc-100">Faza ekscentryczna (opuszczanie)</p>
                  <p className="text-zinc-400 text-[11px]">Czas opuszczania ciężaru w sekundach (np. schodzenie w dół w przysiadzie).</p>
                </div>
              </div>

              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850 flex items-start gap-2.5">
                <span className="font-mono font-bold text-cyan-400 text-sm bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">2</span>
                <div>
                  <p className="font-bold text-zinc-100">Pauza na dole (w rozciągnięciu)</p>
                  <p className="text-zinc-400 text-[11px]">Ile sekund zatrzymujesz ruch w najtrudniejszym dolnym punkcie (np. na klatce).</p>
                </div>
              </div>

              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850 flex items-start gap-2.5">
                <span className="font-mono font-bold text-cyan-400 text-sm bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">3</span>
                <div>
                  <p className="font-bold text-zinc-100">Faza koncentryczna (unoszenie / wyciskanie)</p>
                  <p className="text-zinc-400 text-[11px]">Czas podnoszenia ciężaru w górę (np. 1 = 1 sekunda dynamicznego wycisku, X = maksymalnie dynamicznie).</p>
                </div>
              </div>

              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850 flex items-start gap-2.5">
                <span className="font-mono font-bold text-cyan-400 text-sm bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">4</span>
                <div>
                  <p className="font-bold text-zinc-100">Pauza na górze (w spięciu)</p>
                  <p className="text-zinc-400 text-[11px]">Czas zatrzymania w pełnym wyproście lub maksymalnym skurczu mięśnia.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowTempoModal(false)}
                className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Rozumiem, wracam do treningu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH/ADD EXERCISE MODAL */}
      {showAddExercise && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-zinc-800 px-5 py-4 bg-zinc-900/50">
              <h3 className="font-display font-bold text-white text-base">Wybierz ćwiczenie</h3>
              <button
                onClick={() => setShowAddExercise(false)}
                className="text-zinc-500 hover:text-zinc-200 p-1.5 hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search and Filters */}
            <div className="p-4 bg-zinc-950 border-b border-zinc-800/60 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Szukaj ćwiczenia..."
                  className="w-full bg-zinc-900 text-zinc-100 placeholder-zinc-500 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 focus:border-yellow-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Horizontal Scroll category list */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 select-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg whitespace-nowrap border transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-yellow-400 border-yellow-400 text-zinc-950 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercises List scroll area */}
            <div className="overflow-y-auto flex-1 p-3 space-y-1 bg-zinc-950/20">
              {filteredExercises.length === 0 ? (
                <div className="py-12 text-center text-zinc-500">
                  <p className="text-sm">Nie znaleziono ćwiczenia o nazwie &quot;{searchQuery}&quot;</p>
                  <p className="text-xs text-zinc-600 mt-1">Upewnij się, że kategoria lub nazwa są poprawne.</p>
                </div>
              ) : (
                filteredExercises.map((ex) => {
                  const isAdded = activeSession.exercises.some((item) => item.exerciseId === ex.id);

                  return (
                    <button
                      key={ex.id}
                      onClick={() => handleAddExerciseToWorkout(ex)}
                      disabled={isAdded}
                      className={`w-full flex items-center justify-between text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-zinc-900/40 border-zinc-800/50 opacity-50'
                          : 'bg-zinc-900/30 hover:bg-zinc-900 border-zinc-800/60 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-sm text-zinc-100">{ex.name}</p>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5 inline-block">
                          {ex.category}
                        </span>
                      </div>

                      {isAdded ? (
                        <span className="text-[10px] bg-zinc-800 text-zinc-500 font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
                          Dodane
                        </span>
                      ) : (
                        <span className="text-[10px] bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
                          Wybierz
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION DIALOG */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-white text-lg">Porzucić trening?</h3>
              <p className="text-zinc-400 text-xs">
                Czy na pewno chcesz anulować ten trening? Wszystkie dzisiejsze serie i postępy zostaną usunięte.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Nie, kontynuuj
              </button>
              <button
                id="btn-confirm-cancel"
                onClick={() => {
                  setShowCancelConfirm(false);
                  onCancelSession();
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Tak, porzuć
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
