import React, { useState } from 'react';
import { Search, Plus, Dumbbell, Calendar, TrendingUp, ChevronRight, X, Heart, LineChart, Sparkles } from 'lucide-react';
import { Exercise, ExerciseCategory, WorkoutSession, ExerciseHistoryPoint } from '../types';

interface ExerciseDatabaseProps {
  exercises: Exercise[];
  workouts: WorkoutSession[];
  onAddCustomExercise: (name: string, category: ExerciseCategory) => void;
}

export default function ExerciseDatabase({
  exercises,
  workouts,
  onAddCustomExercise,
}: ExerciseDatabaseProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Wszystkie');
  
  // Custom exercise creator state
  const [isCreating, setIsCreating] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState<ExerciseCategory>('Klatka piersiowa');

  // Selected exercise detail view state
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [chartMetric, setChartMetric] = useState<'weight' | 'volume' | 'oneRepMax'>('oneRepMax');

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

  // Handle custom exercise submit
  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseName.trim()) {
      alert('Wprowadź nazwę ćwiczenia.');
      return;
    }

    onAddCustomExercise(newExerciseName.trim(), newExerciseCategory);
    setNewExerciseName('');
    setIsCreating(false);
  };

  // Extract history of a selected exercise
  const getExerciseHistory = (exId: string): ExerciseHistoryPoint[] => {
    const historyPoints: ExerciseHistoryPoint[] = [];

    // Sort workouts chronologically
    const sortedWorkouts = [...workouts].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    sortedWorkouts.forEach((session) => {
      const matchEx = session.exercises.find((ex) => ex.exerciseId === exId);
      if (matchEx) {
        // Find maximum weight, volume, and reps from completed sets
        const completedSets = matchEx.sets.filter((s) => s.completed);
        if (completedSets.length > 0) {
          let maxWeight = 0;
          let totalVolume = 0;
          let best1RM = 0;
          let associatedReps = 0;

          completedSets.forEach((set) => {
            const vol = set.weight * set.reps;
            totalVolume += vol;

            if (set.weight > maxWeight) {
              maxWeight = set.weight;
              associatedReps = set.reps;
            }

            // Epley 1RM formula: w * (1 + r / 30)
            const est1RM = set.reps === 1 ? set.weight : set.weight * (1 + set.reps / 30);
            if (est1RM > best1RM) {
              best1RM = est1RM;
            }
          });

          historyPoints.push({
            date: session.date,
            weight: maxWeight,
            reps: associatedReps,
            volume: totalVolume,
            estimatedOneRepMax: Math.round(best1RM * 10) / 10,
          });
        }
      }
    });

    return historyPoints;
  };

  // Filter exercises dictionary
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Wszystkie' || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeHistory = selectedExercise ? getExerciseHistory(selectedExercise.id) : [];

  // Custom SVG line chart render helper
  const renderSVGChart = (data: ExerciseHistoryPoint[], metric: 'weight' | 'volume' | 'oneRepMax') => {
    if (data.length === 0) return null;

    const width = 500;
    const height = 240;
    const padding = 40;

    // Extract values based on metric
    const values = data.map((d) => {
      if (metric === 'weight') return d.weight;
      if (metric === 'volume') return d.volume;
      return d.estimatedOneRepMax;
    });

    const minVal = Math.max(0, Math.min(...values) * 0.9 - 2); // padding below
    const maxVal = Math.max(...values) * 1.1 + 2; // padding above
    const valRange = maxVal - minVal || 1;

    const points = data.map((d, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2);
      const val = metric === 'weight' ? d.weight : metric === 'volume' ? d.volume : d.estimatedOneRepMax;
      const y = height - padding - ((val - minVal) / valRange) * (height - padding * 2);
      return { x, y, val, date: d.date };
    });

    // SVG path string creator
    let pathString = '';
    points.forEach((p, i) => {
      if (i === 0) pathString += `M ${p.x} ${p.y}`;
      else pathString += ` L ${p.x} ${p.y}`;
    });

    // Area path string (under line)
    let areaPathString = '';
    if (points.length > 0) {
      areaPathString = `${pathString} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    }

    // Y Axis Grid lines
    const gridLinesCount = 4;
    const gridLines = [];
    for (let i = 0; i <= gridLinesCount; i++) {
      const ratio = i / gridLinesCount;
      const val = minVal + ratio * valRange;
      const y = height - padding - ratio * (height - padding * 2);
      gridLines.push({ y, val: Math.round(val * 10) / 10 });
    }

    return (
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-4 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {/* Gradients */}
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F27D26" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#F27D26" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F27D26" />
              <stop offset="100%" stopColor="#FF8B38" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y Axis labels */}
          {gridLines.map((line, i) => (
            <g key={i} className="opacity-40">
              <line
                x1={padding}
                y1={line.y}
                x2={width - padding}
                y2={line.y}
                stroke="#27272a"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding - 8}
                y={line.y + 4}
                fill="#71717a"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="end"
              >
                {line.val}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          {points.length > 1 && (
            <path d={areaPathString} fill="url(#areaGrad)" />
          )}

          {/* Line Path */}
          {points.length > 1 ? (
            <path
              d={pathString}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : points.length === 1 ? (
            // Single point indicator
            <circle cx={points[0].x} cy={points[0].y} r="6" fill="#F27D26" />
          ) : null}

          {/* Data Points and Value Tooltips */}
          {points.map((p, i) => (
            <g key={i} className="group/point">
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#18181b"
                stroke="#F27D26"
                strokeWidth="2.5"
                className="transition-all duration-150 cursor-pointer hover:r-6"
              />
              
              {/* Tooltip value */}
              <text
                x={p.x}
                y={p.y - 10}
                fill="#f4f4f5"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                className="opacity-0 group-hover/point:opacity-100 transition-opacity bg-zinc-900 duration-150"
              >
                {p.val}
              </text>

              {/* Date label (X axis) for first, middle, and last points */}
              {(i === 0 || i === points.length - 1 || (points.length > 2 && i === Math.floor(points.length / 2))) && (
                <text
                  x={p.x}
                  y={height - padding + 18}
                  fill="#52525b"
                  fontSize="9"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                >
                  {p.date.split('-').slice(1).reverse().join('/')}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Categories Panel */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-lg text-white">Atlas Ćwiczeń</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Wyszukuj ćwiczenia, dodawaj własne i śledź progres siłowy.</p>
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-750 text-yellow-400 border border-zinc-700/80 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-xs"
          >
            {isCreating ? 'Ukryj formularz' : 'Dodaj własne ćwiczenie'}
          </button>
        </div>

        {/* CUSTOM EXERCISE FORM */}
        {isCreating && (
          <form
            onSubmit={handleSubmitCustom}
            className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 space-y-4 animate-fade-in"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block mb-1">
                  Nazwa ćwiczenia
                </label>
                <input
                  type="text"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="np. Wznosy hantli w leżeniu na brzuchu"
                  className="w-full bg-zinc-900 text-zinc-100 text-xs px-3.5 py-2.5 rounded-lg border border-zinc-800 focus:border-yellow-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block mb-1">
                  Grupa mięśniowa / Kategoria
                </label>
                <select
                  value={newExerciseCategory}
                  onChange={(e) => setNewExerciseCategory(e.target.value as ExerciseCategory)}
                  className="w-full bg-zinc-900 text-zinc-200 text-xs px-3.5 py-2.5 rounded-lg border border-zinc-800 focus:border-yellow-400 focus:outline-none transition-colors"
                >
                  {categories.filter((cat) => cat !== 'Wszystkie').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold rounded-lg text-xs cursor-pointer shadow-sm"
              >
                Stwórz i Zapisz
              </button>
            </div>
          </form>
        )}

        {/* SEARCH AND FILTER SCROLL */}
        <div className="space-y-3 pt-2 border-t border-zinc-800/60">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Wyszukaj ćwiczenie z bazy..."
              className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-500 text-xs pl-10 pr-4 py-3 rounded-xl border border-zinc-800 focus:border-yellow-400 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 select-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg whitespace-nowrap border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-yellow-400 border-yellow-400 text-zinc-950'
                    : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: Dictionary list left, stats/detail panel right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Dictionary Column */}
        <div className="lg:col-span-2 space-y-2 max-h-[500px] overflow-y-auto pr-1 bg-zinc-900/10 p-2 rounded-2xl border border-zinc-800/40">
          {filteredExercises.map((ex) => {
            const isSelected = selectedExercise?.id === ex.id;
            const workoutsCount = workouts.filter((w) =>
              w.exercises.some((item) => item.exerciseId === ex.id)
            ).length;

            return (
              <button
                key={ex.id}
                onClick={() => setSelectedExercise(ex)}
                className={`w-full flex items-center justify-between text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-yellow-400/5 border-yellow-400/40'
                    : 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-800/60 hover:border-zinc-750'
                }`}
              >
                <div className="space-y-0.5 truncate pr-2">
                  <p className={`font-semibold text-xs truncate ${isSelected ? 'text-yellow-400' : 'text-zinc-200'}`}>
                    {ex.name}
                  </p>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase">{ex.category}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {workoutsCount > 0 && (
                    <span className="text-[9px] bg-zinc-800 border border-zinc-700 text-zinc-400 font-bold px-1.5 py-0.5 rounded-sm">
                      {workoutsCount}x
                    </span>
                  )}
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-yellow-400' : 'text-zinc-500'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Chart Column */}
        <div className="lg:col-span-3">
          {selectedExercise ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5 shadow-lg animate-fade-in">
              <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-yellow-500 font-bold">
                    {selectedExercise.category}
                  </span>
                  <h4 className="font-display font-bold text-base text-white">{selectedExercise.name}</h4>
                </div>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="text-zinc-500 hover:text-zinc-200 p-1.5 bg-zinc-800/40 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {activeHistory.length === 0 ? (
                /* No history for selected exercise */
                <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
                  <LineChart className="w-10 h-10 mx-auto mb-2 opacity-30 text-zinc-400" />
                  <p className="text-xs font-semibold text-zinc-400">Brak danych treningowych</p>
                  <p className="text-[10px] text-zinc-600 mt-1 max-w-xs mx-auto">
                    Wykonaj to ćwiczenie i zapisz trening, aby wygenerować wykresy postępów i statystyki.
                  </p>
                </div>
              ) : (
                /* Stats and SVG Progress Chart */
                <div className="space-y-4">
                  {/* Selector for chart metric */}
                  <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-850 text-xs">
                    <button
                      onClick={() => setChartMetric('oneRepMax')}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        chartMetric === 'oneRepMax'
                          ? 'bg-yellow-400 text-zinc-950'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Est. 1RM
                    </button>
                    <button
                      onClick={() => setChartMetric('weight')}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        chartMetric === 'weight'
                          ? 'bg-yellow-400 text-zinc-950'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Max Ciężar
                    </button>
                    <button
                      onClick={() => setChartMetric('volume')}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        chartMetric === 'volume'
                          ? 'bg-yellow-400 text-zinc-950'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Tonaż
                    </button>
                  </div>

                  {/* SVG Chart display */}
                  {renderSVGChart(activeHistory, chartMetric)}

                  {/* Quick stats grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-zinc-950/60 border border-zinc-850 p-3 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-zinc-500 block">Najlepszy 1RM</span>
                      <span className="text-sm font-mono font-bold text-yellow-400 mt-0.5 block">
                        {Math.max(...activeHistory.map((h) => h.estimatedOneRepMax))} kg
                      </span>
                      <span className="text-[9px] text-zinc-500 block mt-0.5">epley formula</span>
                    </div>

                    <div className="bg-zinc-950/60 border border-zinc-850 p-3 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-zinc-500 block">Max Ciężar</span>
                      <span className="text-sm font-mono font-bold text-zinc-100 mt-0.5 block">
                        {Math.max(...activeHistory.map((h) => h.weight))} kg
                      </span>
                      <span className="text-[9px] text-zinc-500 block mt-0.5">
                        {activeHistory.find((h) => h.weight === Math.max(...activeHistory.map((x) => x.weight)))?.reps || 0} powt.
                      </span>
                    </div>

                    <div className="bg-zinc-950/60 border border-zinc-850 p-3 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-zinc-500 block">Treningi</span>
                      <span className="text-sm font-mono font-bold text-zinc-200 mt-0.5 block">
                        {activeHistory.length}
                      </span>
                      <span className="text-[9px] text-zinc-500 block mt-0.5">sesji ze spisem</span>
                    </div>
                  </div>

                  {/* Log list under chart */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block mb-2">
                      Historia wykonania
                    </span>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                      {activeHistory
                        .slice()
                        .reverse()
                        .map((point, index) => (
                          <div
                            key={index}
                            className="bg-zinc-950/40 border border-zinc-850 p-2.5 rounded-lg flex justify-between items-center text-xs"
                          >
                            <span className="font-medium text-zinc-400">{point.date}</span>
                            <div className="font-mono text-right flex items-center gap-4">
                              <span>
                                <strong className="text-zinc-200">{point.weight} kg</strong> × {point.reps}
                              </span>
                              <span className="text-zinc-600">|</span>
                              <span className="text-zinc-400 text-[10px]">
                                Tonaż: <strong className="text-emerald-400">{point.volume} kg</strong>
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl p-16 h-full text-zinc-500 text-center">
              <Sparkles className="w-12 h-12 text-yellow-400/20 mb-3 animate-pulse" />
              <p className="font-semibold text-zinc-400">Podgląd szczegółów ćwiczenia</p>
              <p className="text-xs text-zinc-600 mt-1 max-w-xs">
                Wybierz ćwiczenie z listy po lewej stronie, aby wyświetlić jego tonaż, szacowany 1RM oraz wykres siłowy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
