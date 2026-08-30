import React, { useState } from 'react';
import { Play, Plus, Dumbbell, Calendar, Clock, TrendingUp, Award, Flame, BarChart2, X, Layers, Activity, Search, ArrowRight, ChevronRight } from 'lucide-react';
import { WorkoutSession, WorkoutTemplate } from '../types';

interface DashboardProps {
  workouts: WorkoutSession[];
  templates: WorkoutTemplate[];
  onStartEmptyWorkout: () => void;
  onStartTemplateWorkout: (template: WorkoutTemplate) => void;
  onNavigateToTab: (tab: 'history' | 'templates' | 'exercises') => void;
  userWeight?: number;
  userHeight?: number;
}

export default function Dashboard({
  workouts,
  templates,
  onStartEmptyWorkout,
  onStartTemplateWorkout,
  onNavigateToTab,
}: DashboardProps) {
  // Start Workout Choice Modal State
  const [isStartWorkoutModalOpen, setIsStartWorkoutModalOpen] = useState(false);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');

  // Calculate stats
  const totalWorkouts = workouts.length;
  
  let totalSetsCount = 0;
  let totalRepsCount = 0;
  const totalVolume = workouts.reduce((sum, session) => {
    let sessionSum = 0;
    session.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.completed) {
          totalSetsCount++;
          totalRepsCount += set.reps;
          sessionSum += set.weight * set.reps;
        }
      });
    });
    return sum + sessionSum;
  }, 0);

  const avgVolume = totalWorkouts ? Math.round(totalVolume / totalWorkouts) : 0;
  const totalDurationMinutes = workouts.reduce((sum, s) => sum + s.duration, 0) / 60;
  const avgDurationMinutes = totalWorkouts
    ? Math.round(totalDurationMinutes / totalWorkouts)
    : 0;

  // Streak calculation
  const getWeeklyWorkoutStatus = () => {
    const today = new Date();
    const result = [];

    // Find start of current week (Monday)
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    // Polish days of week starting from Monday
    const polDays = ['Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + i);
      const targetDateString = targetDate.toISOString().split('T')[0];

      const hasWorkout = workouts.some((w) => w.date === targetDateString);
      const isToday = targetDate.toDateString() === today.toDateString();

      result.push({
        label: polDays[i],
        dateStr: targetDateString,
        completed: hasWorkout,
        isToday,
      });
    }

    return result;
  };

  const weeklyStreak = getWeeklyWorkoutStatus();
  const activeDaysCount = weeklyStreak.filter((d) => d.completed).length;

  // Find recent 2 workouts
  const recentWorkouts = [...workouts]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 2);

  // Format date in Polish helper
  const formatDatePolish = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
  };

  // Filtered templates inside the start workout modal
  const filteredTemplates = templates.filter((tpl) => {
    const q = templateSearchQuery.toLowerCase();
    return (
      tpl.name.toLowerCase().includes(q) ||
      (tpl.planName && tpl.planName.toLowerCase().includes(q)) ||
      (tpl.tag && tpl.tag.toLowerCase().includes(q)) ||
      tpl.exercises.some((e) => e.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Hero Welcome / Fast Start Panel */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-zinc-800 to-zinc-900 border border-zinc-700/60 p-6 shadow-xl">
        <div className="absolute right-0 bottom-0 translate-x-1/6 translate-y-1/6 opacity-5 pointer-events-none">
          <Dumbbell className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white">
              Gotowy na dzisiejszy trening?
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-md">
              Śledź swoje postępy siłowe, serie i tonaż na każdym treningu.
            </p>
          </div>
          
          <button
            id="btn-start-workout-choice"
            onClick={() => setIsStartWorkoutModalOpen(true)}
            className="flex items-center justify-center gap-2.5 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold px-6 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-500/10 active:scale-95 cursor-pointer text-center whitespace-nowrap self-stretch md:self-auto text-sm"
          >
            <Play className="w-5 h-5 fill-zinc-950 stroke-none" />
            <span>Rozpocznij trening</span>
          </button>
        </div>
      </div>

      {/* Week Progress / Activity */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" />
            <h3 className="font-display font-bold text-zinc-200">Twój tydzień</h3>
          </div>
          <span className="text-xs font-medium text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-full">
            Treningi: <strong className="text-orange-400">{activeDaysCount}/7</strong>
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weeklyStreak.map((day) => (
            <div
              key={day.label}
              className={`flex flex-col items-center justify-between p-2.5 rounded-xl border transition-all ${
                day.completed
                  ? 'bg-orange-500/10 border-orange-500/40'
                  : day.isToday
                  ? 'bg-zinc-800/80 border-zinc-600'
                  : 'bg-zinc-900/30 border-zinc-800/60'
              }`}
            >
              <span className={`text-xs font-medium ${day.completed ? 'text-orange-400' : 'text-zinc-500'}`}>
                {day.label}
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mt-2 transition-all ${
                  day.completed
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : day.isToday
                    ? 'bg-zinc-800 text-zinc-300 ring-2 ring-zinc-700'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-600'
                }`}
              >
                {day.completed ? (
                  <Award className="w-4 h-4 text-zinc-950 fill-zinc-950" />
                ) : (
                  <span className="text-[10px] font-bold">{day.completed ? '' : '•'}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COMPACT STATS SUMMARY ROW */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-zinc-800/60">
          <div className="p-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-lg text-yellow-400">
            <BarChart2 className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-xs sm:text-sm text-zinc-200">
            Podsumowanie treningów
          </span>
        </div>

        {/* 3 Inline Metrics in single compact block */}
        <div className="grid grid-cols-3 gap-2 divide-x divide-zinc-800/70 text-center">
          <div className="px-1">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Treningi</p>
            <p className="text-base sm:text-lg font-display font-bold text-zinc-100 mt-0.5">{totalWorkouts}</p>
            <p className="text-[9px] text-zinc-400 truncate">sesji</p>
          </div>
          <div className="px-1">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Śr. tonaż</p>
            <p className="text-base sm:text-lg font-display font-bold text-emerald-400 mt-0.5">
              {avgVolume > 1000 ? `${(avgVolume / 1000).toFixed(1)} t` : `${avgVolume} kg`}
            </p>
            <p className="text-[9px] text-zinc-400 truncate">na trening</p>
          </div>
          <div className="px-1">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Średni czas</p>
            <p className="text-base sm:text-lg font-display font-bold text-purple-400 mt-0.5">{avgDurationMinutes} min</p>
            <p className="text-[9px] text-zinc-400 truncate">na trening</p>
          </div>
        </div>
      </div>

      {/* Recent History Preview */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display font-bold text-lg text-zinc-200">Ostatnia aktywność</h3>
          <button
            onClick={() => onNavigateToTab('history')}
            className="text-xs font-semibold text-yellow-400 hover:underline cursor-pointer shrink-0"
          >
            Cała historia ({workouts.length})
          </button>
        </div>

        {recentWorkouts.length === 0 ? (
          <div className="border border-dashed border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
            <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-40 text-zinc-400" />
            <p className="text-sm font-medium">Brak zapisanych treningów</p>
            <p className="text-xs mt-1 text-zinc-600">Rozpocznij pierwszy trening, aby zapełnić historię.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentWorkouts.map((session) => {
              // Calculate tonnage for this session
              const sessionVolume = session.exercises.reduce((exSum, ex) => {
                return exSum + ex.sets.reduce((setSum, set) => setSum + (set.completed ? set.weight * set.reps : 0), 0);
              }, 0);

              return (
                <div
                  key={session.id}
                  className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-4 hover:border-zinc-800 transition-all cursor-pointer"
                  onClick={() => onNavigateToTab('history')}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-zinc-200 text-sm">{session.name}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 inline" /> {formatDatePolish(session.date)}
                        <span className="text-zinc-700">•</span>
                        <Clock className="w-3.5 h-3.5 inline" /> {Math.round(session.duration / 60)} min
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-emerald-400 block">
                        +{sessionVolume} kg
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {session.exercises.length} ćwiczeń
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-400 line-clamp-1 border-t border-zinc-800/50 pt-2 mt-2">
                    {session.exercises.map((ex) => ex.name).join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* START WORKOUT CHOICE MODAL (PUSTY TRENING VS WYBIERZ Z SZABLONU) */}
      {isStartWorkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 max-w-lg w-full space-y-5 shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 shrink-0">
              <div>
                <h3 className="font-display font-bold text-lg text-zinc-100">Rozpocznij trening</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Wybierz sposób rozpoczęcia sesji</p>
              </div>

              <button
                type="button"
                onClick={() => setIsStartWorkoutModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-800 hover:bg-zinc-700 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 overflow-y-auto pr-1">
              {/* Option 1: Pusty trening */}
              <div
                onClick={() => {
                  setIsStartWorkoutModalOpen(false);
                  onStartEmptyWorkout();
                }}
                className="p-4 bg-zinc-950 hover:bg-zinc-850/80 border border-zinc-800 hover:border-yellow-400/60 rounded-xl cursor-pointer transition-all group flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-yellow-400/10 border border-yellow-400/25 text-yellow-400 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-zinc-100 group-hover:text-yellow-400 transition-colors">
                      Pusty trening
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      Czysty arkusz – dodawaj dowolne ćwiczenia i serie w trakcie treningu.
                    </p>
                  </div>
                </div>

                <div className="p-2 bg-zinc-900 group-hover:bg-yellow-400 group-hover:text-zinc-950 text-zinc-400 rounded-lg transition-all shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Option 2: Wybierz z szablonu */}
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-zinc-200">Wybierz z szablonu</h4>
                    <p className="text-[11px] text-zinc-400">Uruchom gotowy plan treningowy</p>
                  </div>
                </div>

                {/* Template search if templates exist */}
                {templates.length > 3 && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type="text"
                      value={templateSearchQuery}
                      onChange={(e) => setTemplateSearchQuery(e.target.value)}
                      placeholder="Szukaj szablonu..."
                      className="w-full bg-zinc-900 text-zinc-100 text-xs pl-8.5 pr-3 py-2 rounded-lg border border-zinc-800 focus:border-yellow-400 focus:outline-none placeholder-zinc-500"
                    />
                  </div>
                )}

                {/* Templates list */}
                {templates.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-zinc-800 rounded-lg space-y-2">
                    <p className="text-xs text-zinc-400">Brak zapisanych szablonów.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsStartWorkoutModalOpen(false);
                        onNavigateToTab('templates');
                      }}
                      className="text-xs text-yellow-400 hover:underline font-semibold cursor-pointer"
                    >
                      Przejdź do zakładki Szablony i stwórz pierwszy plan &rarr;
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => {
                          setIsStartWorkoutModalOpen(false);
                          onStartTemplateWorkout(template);
                        }}
                        className="p-3 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800/90 hover:border-zinc-700 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-xs sm:text-sm text-zinc-200 group-hover:text-yellow-400 truncate">
                              {template.name}
                            </h5>
                            <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                              ({template.exercises.length} ćw.)
                            </span>
                          </div>
                          {template.planName && (
                            <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                              {template.planName} {template.tag ? `• ${template.tag}` : ''}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsStartWorkoutModalOpen(false);
                            onStartTemplateWorkout(template);
                          }}
                          className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold text-xs rounded-lg flex items-center gap-1 shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
                        >
                          <Play className="w-3 h-3 fill-current stroke-none" />
                          <span>Start</span>
                        </button>
                      </div>
                    ))}

                    {filteredTemplates.length === 0 && (
                      <p className="text-xs text-zinc-500 text-center py-3">Nie znaleziono szablonu dla podanej frazy.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-zinc-800 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsStartWorkoutModalOpen(false);
                  onNavigateToTab('templates');
                }}
                className="text-xs text-zinc-400 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Zarządzaj szablonami w zakładce &rarr;
              </button>

              <button
                type="button"
                onClick={() => setIsStartWorkoutModalOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
