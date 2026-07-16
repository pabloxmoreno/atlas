import React from 'react';
import { Play, Plus, Dumbbell, Flame, Calendar, Clock, TrendingUp, Award, Zap } from 'lucide-react';
import { WorkoutSession, WorkoutTemplate } from '../types';
import { calculateSessionCalories } from '../utils';

interface DashboardProps {
  workouts: WorkoutSession[];
  templates: WorkoutTemplate[];
  onStartEmptyWorkout: () => void;
  onStartTemplateWorkout: (template: WorkoutTemplate) => void;
  onNavigateToTab: (tab: 'history' | 'templates' | 'exercises') => void;
  userWeight: number;
  userHeight: number;
}

export default function Dashboard({
  workouts,
  templates,
  onStartEmptyWorkout,
  onStartTemplateWorkout,
  onNavigateToTab,
  userWeight,
  userHeight,
}: DashboardProps) {
  // Calculate stats
  const totalWorkouts = workouts.length;
  
  const totalVolume = workouts.reduce((sum, session) => {
    let sessionSum = 0;
    session.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.completed) {
          sessionSum += set.weight * set.reps;
        }
      });
    });
    return sum + sessionSum;
  }, 0);

  const avgDurationMinutes = totalWorkouts
    ? Math.round(
        workouts.reduce((sum, s) => sum + s.duration, 0) / totalWorkouts / 60
      )
    : 0;

  const totalCalories = workouts.reduce((sum, w) => {
    const cats = w.exercises.map((e) => e.category);
    return sum + calculateSessionCalories(w.duration, userWeight, userHeight, cats);
  }, 0);

  // Streak calculation (current consecutive weeks or days with workouts)
  // Let's check workouts in the last 7 days for a quick weekly summary
  const getWeeklyWorkoutStatus = () => {
    const today = new Date();
    const days = ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];
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
              Zapisuj swoje postępy bez dostępu do internetu. Dane są zapisywane w pamięci urządzenia.
            </p>
          </div>
          
          <button
            id="btn-start-empty-workout"
            onClick={onStartEmptyWorkout}
            className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-500/10 active:scale-95 cursor-pointer text-center whitespace-nowrap self-stretch md:self-auto"
          >
            <Play className="w-5 h-5 fill-zinc-950 stroke-none" />
            Rozpocznij pusty trening
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

      {/* Key Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 flex flex-col justify-between">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl w-fit mb-3">
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Wszystkie</p>
            <p className="text-xl font-display font-bold text-zinc-200 mt-0.5">{totalWorkouts}</p>
            <p className="text-[10px] text-zinc-400 mt-1">sesje</p>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 flex flex-col justify-between">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl w-fit mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Łączny tonaż</p>
            <p className="text-xl font-display font-bold text-zinc-200 mt-0.5">
              {totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume} kg`}
            </p>
            <p className="text-[10px] text-zinc-400 mt-1">przerzucone</p>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 flex flex-col justify-between">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl w-fit mb-3">
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Średni czas</p>
            <p className="text-xl font-display font-bold text-zinc-200 mt-0.5">{avgDurationMinutes}</p>
            <p className="text-[10px] text-zinc-400 mt-1">minut / trening</p>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 flex flex-col justify-between">
          <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl w-fit mb-3">
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Spalone kalorie</p>
            <p className="text-xl font-display font-bold text-zinc-200 mt-0.5">
              {totalCalories > 1000 ? `${(totalCalories / 1000).toFixed(1)}k` : totalCalories}
            </p>
            <p className="text-[10px] text-zinc-400 mt-1">kcal spalone</p>
          </div>
        </div>
      </div>

      {/* Templates Quick Start */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-bold text-lg text-zinc-200">Wybierz szablon treningu</h3>
          <button
            onClick={() => onNavigateToTab('templates')}
            className="text-xs font-semibold text-yellow-400 hover:underline cursor-pointer"
          >
            Wszystkie szablony ({templates.length})
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {templates.slice(0, 3).map((template) => (
            <div
              key={template.id}
              className="group bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-4 flex justify-between items-center transition-all duration-200 shadow-xs"
            >
              <div className="space-y-1 pr-4">
                <h4 className="font-bold text-zinc-200 group-hover:text-white transition-colors">
                  {template.name}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-1">{template.notes || 'Brak opisu.'}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.exercises.slice(0, 4).map((ex, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-zinc-800 border border-zinc-700/40 text-zinc-300 px-2 py-0.5 rounded-sm font-medium"
                    >
                      {ex.name.split(' ')[0]}... ({ex.defaultSetsCount}s)
                    </span>
                  ))}
                  {template.exercises.length > 4 && (
                    <span className="text-[10px] bg-zinc-800/40 border border-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-sm">
                      +{template.exercises.length - 4}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onStartTemplateWorkout(template)}
                className="flex items-center justify-center p-3 bg-zinc-800 hover:bg-yellow-400 text-zinc-300 hover:text-zinc-950 rounded-xl transition-all duration-200 cursor-pointer active:scale-95"
                title="Rozpocznij trening na podstawie szablonu"
              >
                <Play className="w-4 h-4 fill-current stroke-none" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent History Preview */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-bold text-lg text-zinc-200">Ostatnia aktywność</h3>
          <button
            onClick={() => onNavigateToTab('history')}
            className="text-xs font-semibold text-yellow-400 hover:underline cursor-pointer"
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
    </div>
  );
}
