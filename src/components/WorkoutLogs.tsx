import React, { useState } from 'react';
import { Calendar, Clock, TrendingUp, Dumbbell, Trash2, Search, ChevronDown, ChevronUp, AlertTriangle, Flame } from 'lucide-react';
import { WorkoutSession } from '../types';
import { calculateSessionCalories } from '../utils';

interface WorkoutLogsProps {
  workouts: WorkoutSession[];
  onDeleteSession: (sessionId: string) => void;
  userWeight: number;
  userHeight: number;
}

export default function WorkoutLogs({ workouts, onDeleteSession, userWeight, userHeight }: WorkoutLogsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  // Toggle expanded card state
  const toggleExpand = (sessionId: string) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  // Format Date (e.g., 12 lipiec 2026 r.)
  const formatDatePolishLong = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    });
  };

  // Format duration in minutes and seconds
  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins === 0) return `${remainingSecs}s`;
    return `${mins} min ${remainingSecs > 0 ? `${remainingSecs}s` : ''}`;
  };

  // Calculate volume/tonnage for a session
  const calculateSessionVolume = (session: WorkoutSession) => {
    return session.exercises.reduce((acc, ex) => {
      return (
        acc +
        ex.sets.reduce((setAcc, set) => {
          return setAcc + (set.completed ? set.weight * set.reps : 0);
        }, 0)
      );
    }, 0);
  };

  // Filter workouts by name, notes or exercise name
  const filteredWorkouts = workouts
    .filter((session) => {
      const nameMatch = session.name.toLowerCase().includes(searchQuery.toLowerCase());
      const notesMatch = session.notes?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      const exerciseMatch = session.exercises.some((ex) =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return nameMatch || notesMatch || exerciseMatch;
    })
    // Sort descending (newest first)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-lg text-white">Historia treningów</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Twoje dotychczasowe postępy zapisane w pamięci urządzenia.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj po nazwie, ćwiczeniu..."
            className="w-full bg-zinc-950 text-zinc-200 placeholder-zinc-500 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-zinc-800 focus:border-yellow-400 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Logs List */}
      {filteredWorkouts.length === 0 ? (
        <div className="border border-dashed border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
          <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-30 text-zinc-400" />
          <p className="font-semibold text-zinc-400">Brak treningów spełniających kryteria</p>
          <p className="text-xs text-zinc-600 mt-1">
            {searchQuery ? 'Spróbuj wpisać inną frazę wyszukiwania.' : 'Nie zapisałeś jeszcze żadnego treningu.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWorkouts.map((session) => {
            const isExpanded = !!expandedSessions[session.id];
            const sessionVolume = calculateSessionVolume(session);
            const totalSetsCount = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
            const completedSetsCount = session.exercises.reduce(
              (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
              0
            );
            const wCats = session.exercises.map((e) => e.category);
            const sessionCalories = calculateSessionCalories(session.duration, userWeight, userHeight, wCats);

            return (
              <div
                key={session.id}
                className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl overflow-hidden transition-all duration-200 hover:border-zinc-800"
              >
                {/* Summary Row */}
                <div
                  onClick={() => toggleExpand(session.id)}
                  className="p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1 flex-1">
                    <h4 className="font-display font-bold text-base text-zinc-200 group-hover:text-white">
                      {session.name}
                    </h4>
                    <p className="text-xs text-zinc-500 flex flex-wrap items-center gap-x-3 gap-y-1 font-medium capitalize">
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Calendar className="w-3.5 h-3.5" /> {formatDatePolishLong(session.date)}
                      </span>
                      <span className="hidden md:inline text-zinc-700">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {formatDuration(session.duration)}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-zinc-800/40 pt-3 md:pt-0">
                    <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-left md:text-right">
                      <div>
                        <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block">
                          Tonaż
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {sessionVolume} kg
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block">
                          Serie
                        </span>
                        <span className="text-xs font-mono font-bold text-zinc-300">
                          {completedSetsCount}/{totalSetsCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block">
                          Spalone
                        </span>
                        <span className="text-xs font-mono font-bold text-orange-400">
                          {sessionCalories} kcal
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessionToDelete(session.id);
                        }}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Usuń trening z historii"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-zinc-500 hover:text-zinc-300 p-1">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Row */}
                {isExpanded && (
                  <div className="border-t border-zinc-800/80 bg-zinc-950/40 px-5 py-4 space-y-4">
                    {session.notes && (
                      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-3 text-xs text-zinc-300">
                        <strong className="text-zinc-400 block mb-1">Notatka treningowa:</strong>
                        {session.notes}
                      </div>
                    )}

                    <div className="space-y-3">
                      {session.exercises.map((ex, index) => (
                        <div
                          key={ex.id}
                          className="bg-zinc-900/30 border border-zinc-800/40 rounded-xl p-4 space-y-3"
                        >
                          <div className="flex justify-between items-baseline">
                            <h5 className="font-bold text-sm text-zinc-200">
                              {index + 1}. {ex.name}
                            </h5>
                            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-extrabold bg-zinc-900 px-2 py-0.5 rounded-sm border border-zinc-800/50">
                              {ex.category}
                            </span>
                          </div>

                          {/* Sets completed summary */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {ex.sets.map((set, setIndex) => (
                              <div
                                key={set.id}
                                className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between ${
                                  set.completed
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                                    : 'bg-zinc-900/40 border-zinc-800 text-zinc-500'
                                }`}
                              >
                                <span className="font-bold text-xs text-zinc-500">S{setIndex + 1}</span>
                                <div className="text-right">
                                  <span className="font-bold text-zinc-100">{set.weight} kg</span>
                                  <span className="mx-1">×</span>
                                  <span className="font-bold text-yellow-400">{set.reps}</span>
                                  {set.rpe && (
                                    <span className="text-[11px] text-orange-400 font-bold ml-1.5 bg-orange-500/10 px-1 rounded-xs">
                                      RPE {set.rpe}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DELETE CONFIRM DIALOG */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-white text-lg">Usunąć trening?</h3>
              <p className="text-zinc-400 text-xs">
                Czy na pewno chcesz trwale usunąć ten trening z historii? Tej operacji nie można cofnąć.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSessionToDelete(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer animate-press"
              >
                Anuluj
              </button>
              <button
                onClick={() => {
                  onDeleteSession(sessionToDelete);
                  setSessionToDelete(null);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer animate-press"
              >
                Tak, usuń
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
