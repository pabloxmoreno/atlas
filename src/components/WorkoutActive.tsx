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
  X,
  Volume2,
  Copy,
  ChevronUp,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { WorkoutSession, WorkoutExercise, ExerciseSet, Exercise, ExerciseCategory } from '../types';
import { calculateSessionCalories } from '../utils';

interface WorkoutActiveProps {
  activeSession: WorkoutSession;
  exercisesDatabase: Exercise[];
  onUpdateSession: (session: WorkoutSession) => void;
  onFinishSession: () => void;
  onCancelSession: () => void;
  userWeight: number;
  userHeight: number;
}

export default function WorkoutActive({
  activeSession,
  exercisesDatabase,
  onUpdateSession,
  onFinishSession,
  onCancelSession,
  userWeight,
  userHeight,
}: WorkoutActiveProps) {
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Wszystkie');
  
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

  return (
    <div className="space-y-6 pb-28">
      {/* Session Title and General Controls */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1 w-full md:w-auto">
            <input
              type="text"
              value={activeSession.name}
              onChange={(e) => onUpdateSession({ ...activeSession, name: e.target.value })}
              className="text-xl font-display font-bold text-white bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-yellow-400 focus:outline-none w-full md:w-80 py-0.5 transition-colors"
              placeholder="Nazwa treningu"
            />
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 font-mono text-yellow-400 text-sm font-semibold">
                <Clock className="w-4 h-4" /> {formatTime(elapsedSeconds)}
              </span>
              <span>•</span>
              <span>{activeSession.exercises.length} ćwiczeń</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-orange-400 font-semibold">
                <Flame className="w-3.5 h-3.5 fill-orange-400/20 text-orange-400" /> {calculateSessionCalories(elapsedSeconds, userWeight, userHeight, activeSession.exercises.map(e => e.category))} kcal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              id="btn-cancel-workout"
              onClick={() => setShowCancelConfirm(true)}
              className="flex-1 md:flex-none py-2.5 px-4 bg-zinc-800 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 border border-zinc-700/60 hover:border-red-500/30 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer text-center"
            >
              Anuluj
            </button>
            <button
              id="btn-finish-workout"
              onClick={onFinishSession}
              className="flex-1 md:flex-none py-2.5 px-5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-sm rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/10 text-center"
            >
              Zakończ i Zapisz
            </button>
          </div>
        </div>

        {/* Notes input */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80">
          <textarea
            value={activeSession.notes || ''}
            onChange={(e) => onUpdateSession({ ...activeSession, notes: e.target.value })}
            placeholder="Dodaj opcjonalną notatkę do całego treningu (np. poziom zmęczenia, sen)..."
            className="w-full bg-zinc-950 text-xs text-zinc-300 placeholder-zinc-500 border border-zinc-800 focus:border-yellow-400/50 rounded-xl p-3 outline-hidden resize-none min-h-[50px] transition-colors"
          />
        </div>
      </div>

      {/* Exercises in Session */}
      <div className="space-y-5">
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
          activeSession.exercises.map((workoutEx, exIndex) => (
            <div
              key={workoutEx.id}
              className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Exercise Header */}
              <div className="flex justify-between items-center bg-zinc-900/90 border-b border-zinc-800/80 px-4 py-3.5">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-yellow-500 font-bold">
                    {workoutEx.category}
                  </span>
                  <h4 className="font-display font-bold text-sm text-zinc-100">{workoutEx.name}</h4>
                </div>
                <button
                  onClick={() => handleRemoveExercise(workoutEx.id)}
                  className="text-zinc-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                  title="Usuń ćwiczenie"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Sets Table */}
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[340px]">
                  <thead>
                    <tr className="border-b border-zinc-800/60 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <th className="py-2 text-center w-12">Seria</th>
                      <th className="py-2 pl-2">Typ</th>
                      <th className="py-2">Ciężar (kg)</th>
                      <th className="py-2">Powtórzenia</th>
                      <th className="py-2 text-center w-16">RPE</th>
                      <th className="py-2 text-center w-12">Status</th>
                      <th className="py-2 text-center w-20">Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workoutEx.sets.map((set, sIndex) => (
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

                        {/* Set type toggle */}
                        <td className="py-2 pl-2">
                          <button
                            onClick={() =>
                              handleUpdateSet(workoutEx.id, set.id, {
                                isWarmup: !set.isWarmup,
                              })
                            }
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide border cursor-pointer ${
                              set.isWarmup
                                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700/40 hover:border-zinc-600'
                            }`}
                            title="Przełącz seria rozgrzewkowa / robocza"
                          >
                            {set.isWarmup ? 'Rozgrz' : 'Roboc'}
                          </button>
                        </td>

                        {/* Weight input */}
                        <td className="py-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="any"
                              value={set.weight === 0 ? '' : set.weight}
                              onChange={(e) =>
                                handleUpdateSet(workoutEx.id, set.id, {
                                  weight: parseFloat(e.target.value) || 0,
                                })
                              }
                              placeholder="0"
                              className="w-16 bg-zinc-950 text-zinc-100 font-mono text-center font-bold border border-zinc-800 focus:border-yellow-400 rounded-md py-1 text-sm outline-hidden"
                            />
                          </div>
                        </td>

                        {/* Reps input */}
                        <td className="py-2">
                          <input
                            type="number"
                            value={set.reps === 0 ? '' : set.reps}
                            onChange={(e) =>
                              handleUpdateSet(workoutEx.id, set.id, {
                                reps: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            placeholder="0"
                            className="w-14 bg-zinc-950 text-zinc-100 font-mono text-center font-bold border border-zinc-800 focus:border-yellow-400 rounded-md py-1 text-sm outline-hidden"
                          />
                        </td>

                        {/* RPE Selector */}
                        <td className="py-2 text-center">
                          <select
                            value={set.rpe || ''}
                            onChange={(e) =>
                              handleUpdateSet(workoutEx.id, set.id, {
                                rpe: e.target.value ? parseInt(e.target.value, 10) : undefined,
                              })
                            }
                            className="bg-zinc-950 text-zinc-300 font-mono text-xs border border-zinc-800 rounded-md py-1 px-1.5 outline-hidden focus:border-yellow-400"
                          >
                            <option value="">-</option>
                            {[10, 9, 8, 7, 6, 5].map((val) => (
                              <option key={val} value={val}>
                                {val}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Checkmark Status button */}
                        <td className="py-2 text-center">
                          <button
                            onClick={() =>
                              handleUpdateSet(workoutEx.id, set.id, {
                                completed: !set.completed,
                              })
                            }
                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                              set.completed
                                ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-600'
                                : 'border border-zinc-700 bg-zinc-950 hover:border-zinc-500 text-transparent'
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        </td>

                        {/* Set actions */}
                        <td className="py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleCopySet(workoutEx.id, sIndex)}
                              className="text-zinc-500 hover:text-zinc-300 p-1 rounded-sm cursor-pointer"
                              title="Duplikuj serię"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveSet(workoutEx.id, set.id)}
                              className="text-zinc-500 hover:text-red-400 p-1 rounded-sm cursor-pointer"
                              title="Usuń serię"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add set button inside exercise card */}
              <div className="bg-zinc-900/20 border-t border-zinc-800/30 px-4 py-2 flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-mono text-[10px]">
                  Tonaż: {workoutEx.sets.reduce((sum, s) => sum + (s.completed ? s.weight * s.reps : 0), 0)} kg
                </span>
                <button
                  onClick={() => handleAddSetToExercise(workoutEx.id)}
                  className="flex items-center gap-1 text-yellow-400 hover:text-yellow-500 font-bold transition-all py-1.5 px-3 rounded-lg hover:bg-zinc-800/40 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Dodaj serię
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Button to add exercise */}
      {activeSession.exercises.length > 0 && (
        <button
          onClick={() => setShowAddExercise(true)}
          className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 py-4 rounded-xl text-sm font-semibold text-zinc-200 transition-all cursor-pointer active:scale-98"
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
              <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Stoper odpoczynku</p>
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
