import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Dumbbell,
  Calendar,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  X,
  LineChart,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  BarChart3,
  Layers,
  PieChart,
  Trophy,
  Activity,
  Filter,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Exercise, ExerciseCategory, WorkoutSession, ExerciseHistoryPoint } from '../types';

interface ExerciseDatabaseProps {
  exercises: Exercise[];
  workouts: WorkoutSession[];
  onAddCustomExercise: (name: string, category: ExerciseCategory) => void;
  onDeleteExercise?: (exerciseId: string) => void;
}

type MainViewMode = 'exercise_progress' | 'volume_overview' | 'muscle_groups' | 'dictionary';

export default function ExerciseDatabase({
  exercises,
  workouts,
  onAddCustomExercise,
  onDeleteExercise,
}: ExerciseDatabaseProps) {
  // Main tab view inside Wykresy
  const [viewMode, setViewMode] = useState<MainViewMode>('exercise_progress');

  // Exercise selection & search modal/dropdown state
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Wszystkie');

  // Selected exercise state
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [chartMetric, setChartMetric] = useState<'oneRepMax' | 'weight' | 'volume'>('oneRepMax');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  // Custom exercise creation modal/form
  const [isCreating, setIsCreating] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState<ExerciseCategory>('Klatka piersiowa');

  // Delete exercise confirmation modal state
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);

  // Volume timeline active bar index
  const [selectedWorkoutIndex, setSelectedWorkoutIndex] = useState<number | null>(null);

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

  // Map of exerciseId -> frequency in recorded workouts
  const exerciseStatsMap = useMemo(() => {
    const map: Record<string, { count: number; lastDate: string }> = {};
    workouts.forEach((w) => {
      w.exercises.forEach((ex) => {
        if (!map[ex.exerciseId]) {
          map[ex.exerciseId] = { count: 0, lastDate: w.date };
        }
        map[ex.exerciseId].count += 1;
        if (new Date(w.date) > new Date(map[ex.exerciseId].lastDate)) {
          map[ex.exerciseId].lastDate = w.date;
        }
      });
    });
    return map;
  }, [workouts]);

  // Set default selected exercise on mount or when workouts change
  useEffect(() => {
    if (!selectedExerciseId) {
      // Prioritize exercise with most recorded workouts
      let bestExId = '';
      let maxCount = -1;
      exercises.forEach((ex) => {
        const count = exerciseStatsMap[ex.id]?.count || 0;
        if (count > maxCount) {
          maxCount = count;
          bestExId = ex.id;
        }
      });
      setSelectedExerciseId(bestExId || exercises[0]?.id || '');
    }
  }, [exercises, exerciseStatsMap, selectedExerciseId]);

  const selectedExercise = useMemo(() => {
    return exercises.find((e) => e.id === selectedExerciseId) || exercises[0] || null;
  }, [exercises, selectedExerciseId]);

  // Extract history of the currently selected exercise
  const exerciseHistory: ExerciseHistoryPoint[] = useMemo(() => {
    if (!selectedExercise) return [];

    const historyPoints: ExerciseHistoryPoint[] = [];

    // Chronological order (oldest to newest)
    const sortedWorkouts = [...workouts].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedWorkouts.forEach((session) => {
      const matchEx = session.exercises.find((ex) => ex.exerciseId === selectedExercise.id);
      if (matchEx) {
        const validSets = matchEx.sets.filter((s) => s.completed || (s.weight > 0 && s.reps > 0));
        if (validSets.length > 0) {
          let maxWeight = 0;
          let totalVolume = 0;
          let best1RM = 0;
          let associatedReps = 0;

          validSets.forEach((set) => {
            const vol = set.weight * set.reps;
            totalVolume += vol;

            if (set.weight > maxWeight) {
              maxWeight = set.weight;
              associatedReps = set.reps;
            }

            // Epley formula: weight * (1 + reps / 30)
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
  }, [workouts, selectedExercise]);

  // Active point index for the selected exercise history
  const currentPointIndex = useMemo(() => {
    if (exerciseHistory.length === 0) return 0;
    if (
      selectedPointIndex !== null &&
      selectedPointIndex >= 0 &&
      selectedPointIndex < exerciseHistory.length
    ) {
      return selectedPointIndex;
    }
    return exerciseHistory.length - 1;
  }, [exerciseHistory, selectedPointIndex]);

  const currentPoint = exerciseHistory[currentPointIndex] || null;
  const prevPoint = currentPointIndex > 0 ? exerciseHistory[currentPointIndex - 1] : null;

  // Handle custom exercise creation
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

  // Format short date (e.g. 15.08)
  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}`;
    }
    return dateStr;
  };

  // Sort exercises for picker: those with workout history at the top
  const sortedAndFilteredExercises = useMemo(() => {
    return exercises
      .filter((ex) => {
        const matchesSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase());
        const matchesCat = selectedCategory === 'Wszystkie' || ex.category === selectedCategory;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        const aCount = exerciseStatsMap[a.id]?.count || 0;
        const bCount = exerciseStatsMap[b.id]?.count || 0;
        if (bCount !== aCount) return bCount - aCount;
        return a.name.localeCompare(b.name, 'pl');
      });
  }, [exercises, exerciseSearch, selectedCategory, exerciseStatsMap]);

  // Overall chronological workouts for volume timeline
  const chronologicalWorkouts = useMemo(() => {
    return [...workouts]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((w) => {
        const volume = w.exercises.reduce((exSum, ex) => {
          return (
            exSum +
            ex.sets.reduce((setSum, set) => setSum + (set.completed ? set.weight * set.reps : 0), 0)
          );
        }, 0);
        const completedSets = w.exercises.reduce((exSum, ex) => {
          return exSum + ex.sets.filter((s) => s.completed).length;
        }, 0);
        return {
          id: w.id,
          name: w.name,
          date: w.date,
          volume,
          completedSets,
          duration: w.duration,
        };
      });
  }, [workouts]);

  // Muscle group volume & set count calculations
  const muscleGroupStats = useMemo(() => {
    const stats: Record<string, { volume: number; sets: number; exercisesCount: number }> = {};
    categories
      .filter((c) => c !== 'Wszystkie')
      .forEach((cat) => {
        stats[cat] = { volume: 0, sets: 0, exercisesCount: 0 };
      });

    workouts.forEach((w) => {
      w.exercises.forEach((ex) => {
        const cat = ex.category || 'Inne';
        if (!stats[cat]) {
          stats[cat] = { volume: 0, sets: 0, exercisesCount: 0 };
        }
        ex.sets.forEach((s) => {
          if (s.completed || s.weight > 0) {
            stats[cat].volume += s.weight * s.reps;
            stats[cat].sets += 1;
          }
        });
      });
    });

    const totalVolume = Object.values(stats).reduce((acc, curr) => acc + curr.volume, 0);

    return Object.entries(stats)
      .map(([name, data]) => ({
        name,
        volume: data.volume,
        sets: data.sets,
        percentage: totalVolume > 0 ? Math.round((data.volume / totalVolume) * 100) : 0,
      }))
      .sort((a, b) => b.volume - a.volume);
  }, [workouts, categories]);

  // ==========================================
  // RENDER: EXERCISE STRENGTH CHART (SVG NATIVE)
  // ==========================================
  const renderExerciseProgressionChart = () => {
    if (exerciseHistory.length === 0) {
      return (
        <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto text-yellow-400">
            <LineChart className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-zinc-200 text-sm">Brak historii dla tego ćwiczenia</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              Wykonaj i zapisz to ćwiczenie podczas treningu, aby pojawił się tutaj wykres progresu siłowego.
            </p>
          </div>
          <button
            onClick={() => setIsExercisePickerOpen(true)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Wybierz inne ćwiczenie
          </button>
        </div>
      );
    }

    // Chart Dimensions designed for mobile container (width: 380-460px viewBox)
    const svgWidth = 380;
    const svgHeight = 190;
    const paddingLeft = 42;
    const paddingRight = 20;
    const paddingTop = 22;
    const paddingBottom = 32;

    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingTop - paddingBottom;

    const metricIsWeight = chartMetric === 'weight';
    const metricIsVolume = chartMetric === 'volume';

    const values = exerciseHistory.map((d) => {
      if (metricIsWeight) return d.weight;
      if (metricIsVolume) return d.volume;
      return d.estimatedOneRepMax;
    });

    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const range = rawMax - rawMin;

    const minVal = Math.max(0, Math.floor(rawMin - (range > 0 ? range * 0.15 : rawMin * 0.1) - 1));
    const maxVal = Math.ceil(rawMax + (range > 0 ? range * 0.15 : rawMax * 0.1) + 1);
    const valRange = maxVal - minVal || 1;

    const points = exerciseHistory.map((d, index) => {
      const x =
        exerciseHistory.length === 1
          ? paddingLeft + plotWidth / 2
          : paddingLeft + (index / (exerciseHistory.length - 1)) * plotWidth;

      const val = metricIsWeight ? d.weight : metricIsVolume ? d.volume : d.estimatedOneRepMax;
      const y = paddingTop + plotHeight - ((val - minVal) / valRange) * plotHeight;
      return { x, y, val, date: d.date, index };
    });

    // Build SVG path
    let linePath = '';
    points.forEach((p, i) => {
      if (i === 0) {
        linePath += `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      } else {
        const prev = points[i - 1];
        const cx = (prev.x + p.x) / 2;
        linePath += ` C ${cx.toFixed(1)} ${prev.y.toFixed(1)}, ${cx.toFixed(1)} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      }
    });

    let areaPath = '';
    if (points.length > 1) {
      const bottomY = paddingTop + plotHeight;
      const firstX = points[0].x.toFixed(1);
      const lastX = points[points.length - 1].x.toFixed(1);
      areaPath = `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    }

    const gridTicks = [
      { val: minVal, y: paddingTop + plotHeight },
      { val: Math.round((minVal + maxVal) / 2), y: paddingTop + plotHeight * 0.5 },
      { val: maxVal, y: paddingTop },
    ];

    const activePoint = points[currentPointIndex] || points[points.length - 1];

    // Label stride
    const maxLabels = 4;
    const labelIndices = new Set<number>();
    if (points.length <= maxLabels) {
      points.forEach((_, i) => labelIndices.add(i));
    } else {
      labelIndices.add(0);
      labelIndices.add(points.length - 1);
      const step = (points.length - 1) / (maxLabels - 1);
      for (let i = 1; i < maxLabels - 1; i++) {
        labelIndices.add(Math.round(i * step));
      }
    }

    return (
      <div className="space-y-4">
        {/* Selected Data Point Spotlight Card */}
        {currentPoint && (
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-yellow-400/30 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-zinc-200">
                  🗓️ {currentPoint.date}
                </span>
                {currentPointIndex === exerciseHistory.length - 1 && (
                  <span className="text-[10px] font-bold bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-md">
                    Ostatni
                  </span>
                )}
              </div>

              {prevPoint && (
                <div className="text-xs font-mono font-bold flex items-center gap-1">
                  {currentPoint.weight > prevPoint.weight ? (
                    <span className="text-emerald-400 flex items-center">
                      <ArrowUpRight className="w-4 h-4" /> +{(currentPoint.weight - prevPoint.weight).toFixed(1)} kg
                    </span>
                  ) : currentPoint.weight < prevPoint.weight ? (
                    <span className="text-red-400 flex items-center">
                      <ArrowDownRight className="w-4 h-4" /> -{(prevPoint.weight - currentPoint.weight).toFixed(1)} kg
                    </span>
                  ) : (
                    <span className="text-zinc-500 flex items-center">
                      <Minus className="w-3.5 h-3.5" /> 0 kg
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-zinc-950/80 border border-zinc-800/80 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Ciężar max</span>
                <span className="text-base sm:text-lg font-mono font-bold text-zinc-100 mt-0.5 block">
                  {currentPoint.weight} kg
                </span>
                <span className="text-[10px] text-zinc-400">× {currentPoint.reps} powt.</span>
              </div>

              <div className="bg-zinc-950/80 border border-yellow-400/20 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-yellow-500 block">Est. 1RM</span>
                <span className="text-base sm:text-lg font-mono font-bold text-yellow-400 mt-0.5 block">
                  {currentPoint.estimatedOneRepMax} kg
                </span>
                <span className="text-[10px] text-zinc-500">max siła</span>
              </div>

              <div className="bg-zinc-950/80 border border-zinc-800/80 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Tonaż ćw.</span>
                <span className="text-base sm:text-lg font-mono font-bold text-emerald-400 mt-0.5 block">
                  {currentPoint.volume} kg
                </span>
                <span className="text-[10px] text-zinc-400">objętość</span>
              </div>
            </div>
          </div>
        )}

        {/* Metric Selector */}
        <div className="flex bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setChartMetric('oneRepMax')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              chartMetric === 'oneRepMax'
                ? 'bg-yellow-400 text-zinc-950 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Est. 1RM</span>
          </button>
          <button
            onClick={() => setChartMetric('weight')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              chartMetric === 'weight'
                ? 'bg-yellow-400 text-zinc-950 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Max Ciężar</span>
          </button>
          <button
            onClick={() => setChartMetric('volume')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              chartMetric === 'volume'
                ? 'bg-yellow-400 text-zinc-950 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tonaż</span>
          </button>
        </div>

        {/* Main Interactive SVG Chart Box */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-md">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-900 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Sesja {currentPointIndex + 1} z {exerciseHistory.length}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedPointIndex(Math.max(0, currentPointIndex - 1))}
                disabled={currentPointIndex <= 0}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Poprzedni trening"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setSelectedPointIndex(Math.min(exerciseHistory.length - 1, currentPointIndex + 1))
                }
                disabled={currentPointIndex >= exerciseHistory.length - 1}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Następny trening"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
            <defs>
              <linearGradient id="exGradFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EAB308" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#EAB308" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="exGradLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#CA8A04" />
                <stop offset="50%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#FACC15" />
              </linearGradient>
            </defs>

            {/* Grid ticks */}
            {gridTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={tick.y}
                  x2={svgWidth - paddingRight}
                  y2={tick.y}
                  stroke="#27272a"
                  strokeWidth="1"
                  strokeDasharray={i === 0 ? 'none' : '3 3'}
                />
                <text
                  x={paddingLeft - 6}
                  y={tick.y + 4}
                  fill="#71717a"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  {tick.val}
                </text>
              </g>
            ))}

            {/* Area */}
            {points.length > 1 && <path d={areaPath} fill="url(#exGradFill)" />}

            {/* Line */}
            {points.length > 1 ? (
              <path
                d={linePath}
                fill="none"
                stroke="url(#exGradLine)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <circle cx={points[0].x} cy={points[0].y} r="6" fill="#EAB308" />
            )}

            {/* Active Vertical Line */}
            {activePoint && (
              <g>
                <line
                  x1={activePoint.x}
                  y1={paddingTop}
                  x2={activePoint.x}
                  y2={paddingTop + plotHeight}
                  stroke="#EAB308"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
                <circle cx={activePoint.x} cy={activePoint.y} r="10" fill="#EAB308" fillOpacity="0.2" />
              </g>
            )}

            {/* Hit points */}
            {points.map((p) => {
              const isSelected = p.index === currentPointIndex;
              return (
                <g key={p.index} className="cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? '6' : '4'}
                    fill={isSelected ? '#FACC15' : '#18181b'}
                    stroke={isSelected ? '#FFFFFF' : '#CA8A04'}
                    strokeWidth={isSelected ? '2.5' : '2'}
                  />
                  {/* Large touch hitbox */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="22"
                    fill="transparent"
                    onClick={() => setSelectedPointIndex(p.index)}
                    onTouchStart={() => setSelectedPointIndex(p.index)}
                  />
                </g>
              );
            })}

            {/* X Labels */}
            {points.map((p) => {
              if (!labelIndices.has(p.index)) return null;
              const isSelected = p.index === currentPointIndex;
              return (
                <text
                  key={`label-${p.index}`}
                  x={p.x}
                  y={paddingTop + plotHeight + 18}
                  fill={isSelected ? '#FACC15' : '#71717a'}
                  fontSize="10"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {formatShortDate(p.date)}
                </text>
              );
            })}
          </svg>
          <p className="text-[10px] text-zinc-500 text-center mt-2 font-medium">
            Dotknij dowolny punkt na osi, aby przełączyć dane treningu
          </p>
        </div>

        {/* History Breakdown Table */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-1">
            <span>Zapisane sesje</span>
            <span>Ciężar / Tonaż</span>
          </div>

          <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-0.5">
            {exerciseHistory
              .slice()
              .reverse()
              .map((point, revIdx) => {
                const originalIdx = exerciseHistory.length - 1 - revIdx;
                const isSelected = originalIdx === currentPointIndex;

                return (
                  <div
                    key={originalIdx}
                    onClick={() => setSelectedPointIndex(originalIdx)}
                    className={`p-2.5 rounded-xl flex justify-between items-center text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-yellow-400/10 border border-yellow-400/40 text-white shadow-xs'
                        : 'bg-zinc-950/40 hover:bg-zinc-950 border border-zinc-800/70 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-400">{point.date}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                    </div>

                    <div className="font-mono text-right flex items-center gap-3">
                      <span>
                        <strong className="text-zinc-100 font-bold">{point.weight} kg</strong> × {point.reps}
                      </span>
                      <span className="text-zinc-600">|</span>
                      <span className="text-emerald-400 font-semibold text-[11px]">
                        {point.volume} kg
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER: OVERALL VOLUME TIMELINE (SVG BAR CHART)
  // ==========================================
  const renderVolumeOverview = () => {
    if (chronologicalWorkouts.length === 0) {
      return (
        <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl p-8 text-center space-y-3">
          <BarChart3 className="w-10 h-10 mx-auto text-zinc-600" />
          <h4 className="font-bold text-zinc-300 text-sm">Brak zapisanych treningów</h4>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Ukończ swój pierwszy trening, aby zobaczyć całościowy tonaż i statystyki sesji na wykresie słupkowym.
          </p>
        </div>
      );
    }

    const activeIdx =
      selectedWorkoutIndex !== null &&
      selectedWorkoutIndex >= 0 &&
      selectedWorkoutIndex < chronologicalWorkouts.length
        ? selectedWorkoutIndex
        : chronologicalWorkouts.length - 1;

    const activeSession = chronologicalWorkouts[activeIdx];

    // Chart Dimensions
    const svgWidth = 380;
    const svgHeight = 190;
    const paddingLeft = 44;
    const paddingRight = 16;
    const paddingTop = 20;
    const paddingBottom = 34;

    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingTop - paddingBottom;

    const volumes = chronologicalWorkouts.map((w) => w.volume);
    const maxVol = Math.max(...volumes, 100);

    const barWidth = Math.min(28, Math.max(12, plotWidth / (chronologicalWorkouts.length * 1.6)));
    const totalBars = chronologicalWorkouts.length;
    const stepX = totalBars > 1 ? (plotWidth - barWidth) / (totalBars - 1) : 0;

    return (
      <div className="space-y-4">
        {/* Active Workout Readout */}
        {activeSession && (
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-300">
                🗓️ {activeSession.date}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                ⏱️ {Math.round(activeSession.duration / 60)} min
              </span>
            </div>
            <h4 className="font-bold text-sm text-zinc-100">{activeSession.name}</h4>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80">
              <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Tonaż całkowity</span>
                <span className="text-base font-mono font-bold text-yellow-400 mt-0.5 block">
                  {activeSession.volume > 1000
                    ? `${(activeSession.volume / 1000).toFixed(2)} t`
                    : `${activeSession.volume} kg`}
                </span>
              </div>
              <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Wykonane serie</span>
                <span className="text-base font-mono font-bold text-emerald-400 mt-0.5 block">
                  {activeSession.completedSets} serii
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bar Chart Container */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-md">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-900 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Tonaż w kolejnych treningach ({chronologicalWorkouts.length})
            </span>
          </div>

          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
            {/* Grid lines */}
            {[0, 0.5, 1].map((ratio, i) => {
              const y = paddingTop + plotHeight * (1 - ratio);
              const val = Math.round(maxVol * ratio);
              return (
                <g key={i}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="#27272a"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={paddingLeft - 6}
                    y={y + 4}
                    fill="#71717a"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    {val > 1000 ? `${(val / 1000).toFixed(1)}t` : val}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {chronologicalWorkouts.map((w, idx) => {
              const x = totalBars === 1 ? paddingLeft + plotWidth / 2 - barWidth / 2 : paddingLeft + idx * stepX;
              const barHeight = Math.max(4, (w.volume / maxVol) * plotHeight);
              const y = paddingTop + plotHeight - barHeight;
              const isSelected = idx === activeIdx;

              return (
                <g key={w.id} className="cursor-pointer">
                  {/* Visual Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="4"
                    fill={isSelected ? '#FACC15' : '#71717a'}
                    opacity={isSelected ? 1 : 0.6}
                    className="transition-all duration-200"
                  />
                  {/* Label under bar */}
                  <text
                    x={x + barWidth / 2}
                    y={paddingTop + plotHeight + 16}
                    fill={isSelected ? '#FACC15' : '#71717a'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {formatShortDate(w.date)}
                  </text>
                  {/* Hitbox */}
                  <rect
                    x={x - 4}
                    y={paddingTop}
                    width={barWidth + 8}
                    height={plotHeight + 20}
                    fill="transparent"
                    onClick={() => setSelectedWorkoutIndex(idx)}
                    onTouchStart={() => setSelectedWorkoutIndex(idx)}
                  />
                </g>
              );
            })}
          </svg>
          <p className="text-[10px] text-zinc-500 text-center mt-2 font-medium">
            Dotknij słupek, aby sprawdzić szczegóły danego treningu
          </p>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER: MUSCLE GROUPS DISTRIBUTION
  // ==========================================
  const renderMuscleGroups = () => {
    return (
      <div className="space-y-4">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <div>
            <h4 className="font-bold text-sm text-zinc-100">Rozkład objętości na partie</h4>
            <p className="text-xs text-zinc-500">
              Procentowy udział przerzuconego tonażu oraz liczba wykonanych serii dla poszczególnych partii.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {muscleGroupStats.map((stat) => (
              <div key={stat.name} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-200">{stat.name}</span>
                  <div className="flex items-center gap-2 font-mono text-zinc-400">
                    <span>{stat.sets} serii</span>
                    <span>•</span>
                    <span className="font-bold text-yellow-400">{stat.percentage}%</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800/80">
                  <div
                    className="bg-yellow-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(3, stat.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER: EXERCISE DICTIONARY (ATLAS)
  // ==========================================
  const renderDictionary = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              placeholder="Szukaj w bazie ćwiczeń..."
              className="w-full bg-zinc-900 text-zinc-100 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-zinc-800 focus:border-yellow-400 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Dodaj</span>
          </button>
        </div>

        {/* Categories scroll */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 select-none scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-yellow-400 border-yellow-400 text-zinc-950'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Custom Exercise Form */}
        {isCreating && (
          <form
            onSubmit={handleSubmitCustom}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 animate-fade-in"
          >
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block mb-1">
                Nazwa ćwiczenia
              </label>
              <input
                type="text"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="np. Wznosy hantli bokiem"
                className="w-full bg-zinc-950 text-zinc-100 text-xs px-3 py-2 rounded-lg border border-zinc-800 focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block mb-1">
                Kategoria
              </label>
              <select
                value={newExerciseCategory}
                onChange={(e) => setNewExerciseCategory(e.target.value as ExerciseCategory)}
                className="w-full bg-zinc-950 text-zinc-200 text-xs px-3 py-2 rounded-lg border border-zinc-800 focus:border-yellow-400 focus:outline-none"
              >
                {categories
                  .filter((cat) => cat !== 'Wszystkie')
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg text-xs font-semibold"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-yellow-400 text-zinc-950 font-bold rounded-lg text-xs"
              >
                Zapisz
              </button>
            </div>
          </form>
        )}

        {/* Exercises List */}
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-0.5">
          {sortedAndFilteredExercises.map((ex) => {
            const count = exerciseStatsMap[ex.id]?.count || 0;
            return (
              <div
                key={ex.id}
                onClick={() => {
                  setSelectedExerciseId(ex.id);
                  setViewMode('exercise_progress');
                }}
                className="p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="min-w-0 pr-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-xs sm:text-sm text-zinc-100 truncate">{ex.name}</h4>
                    {ex.isCustom && (
                      <span className="text-[9px] font-mono font-bold bg-yellow-400/15 text-yellow-400 border border-yellow-400/30 px-1.5 py-0.2 rounded shrink-0">
                        Własne
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">{ex.category}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {count > 0 ? (
                    <span className="text-[10px] font-mono font-bold bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-md">
                      {count} sesji
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-600">0 sesji</span>
                  )}
                  
                  {/* Delete button */}
                  {onDeleteExercise && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExerciseToDelete(ex);
                      }}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Usuń ćwiczenie"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top View Mode Navigation Pills */}
      <div className="grid grid-cols-4 gap-1 bg-zinc-900/80 p-1 rounded-2xl border border-zinc-800 text-[11px] font-bold">
        <button
          onClick={() => setViewMode('exercise_progress')}
          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            viewMode === 'exercise_progress'
              ? 'bg-yellow-400 text-zinc-950 shadow-md shadow-yellow-400/10'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="truncate">Siła / 1RM</span>
        </button>

        <button
          onClick={() => setViewMode('volume_overview')}
          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            viewMode === 'volume_overview'
              ? 'bg-yellow-400 text-zinc-950 shadow-md shadow-yellow-400/10'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="truncate">Tonaż</span>
        </button>

        <button
          onClick={() => setViewMode('muscle_groups')}
          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            viewMode === 'muscle_groups'
              ? 'bg-yellow-400 text-zinc-950 shadow-md shadow-yellow-400/10'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span className="truncate">Partie</span>
        </button>

        <button
          onClick={() => setViewMode('dictionary')}
          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            viewMode === 'dictionary'
              ? 'bg-yellow-400 text-zinc-950 shadow-md shadow-yellow-400/10'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span className="truncate">Atlas</span>
        </button>
      </div>

      {/* Main Exercise Selector Bar (Only in exercise_progress view) */}
      {viewMode === 'exercise_progress' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-md">
                {selectedExercise?.category || 'Ćwiczenie'}
              </span>
              <h3 className="font-bold text-base text-zinc-100 mt-1 truncate">
                {selectedExercise?.name || 'Wybierz ćwiczenie'}
              </h3>
            </div>

            <button
              onClick={() => setIsExercisePickerOpen(true)}
              className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Zmień</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE VIEW CONTENT */}
      {viewMode === 'exercise_progress' && renderExerciseProgressionChart()}
      {viewMode === 'volume_overview' && renderVolumeOverview()}
      {viewMode === 'muscle_groups' && renderMuscleGroups()}
      {viewMode === 'dictionary' && renderDictionary()}

      {/* EXERCISE PICKER FULL MODAL */}
      {isExercisePickerOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex flex-col p-4 animate-fade-in max-w-lg mx-auto">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
            <div>
              <h3 className="font-bold text-sm text-zinc-100">Wybierz ćwiczenie do wykresu</h3>
              <p className="text-[10px] text-zinc-500">Kliknij ćwiczenie, aby przeanalizować progres</p>
            </div>
            <button
              onClick={() => setIsExercisePickerOpen(false)}
              className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                placeholder="Wyszukaj ćwiczenie..."
                autoFocus
                className="w-full bg-zinc-900 text-zinc-100 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-zinc-800 focus:border-yellow-400 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setIsExercisePickerOpen(false);
                setViewMode('dictionary');
                setIsCreating(true);
              }}
              className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 cursor-pointer"
              title="Dodaj nowe ćwiczenie"
            >
              <Plus className="w-4 h-4" />
              <span>Nowe</span>
            </button>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 select-none scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-semibold px-3 py-1 rounded-lg whitespace-nowrap border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-yellow-400 border-yellow-400 text-zinc-950'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {sortedAndFilteredExercises.map((ex) => {
              const count = exerciseStatsMap[ex.id]?.count || 0;
              const isSelected = ex.id === selectedExerciseId;

              return (
                <div
                  key={ex.id}
                  onClick={() => {
                    setSelectedExerciseId(ex.id);
                    setIsExercisePickerOpen(false);
                    setSelectedPointIndex(null);
                  }}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-yellow-400/10 border-yellow-400 text-white'
                      : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80 text-zinc-200'
                  }`}
                >
                  <div className="min-w-0 pr-2 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-xs font-semibold truncate ${isSelected ? 'text-yellow-400 font-bold' : ''}`}>
                        {ex.name}
                      </p>
                      {ex.isCustom && (
                        <span className="text-[9px] font-mono font-bold bg-yellow-400/15 text-yellow-400 border border-yellow-400/30 px-1.5 py-0.2 rounded shrink-0">
                          Własne
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">{ex.category}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {count > 0 ? (
                      <span className="text-[10px] font-mono font-bold bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-md">
                        {count} sesji
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-600">brak sesji</span>
                    )}

                    {onDeleteExercise && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExerciseToDelete(ex);
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Usuń ćwiczenie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DELETE EXERCISE CONFIRMATION MODAL */}
      {exerciseToDelete && (
        <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-100">Usuń ćwiczenie</h4>
                <p className="text-xs text-zinc-400">Potwierdzenie usunięcia</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Czy na pewno chcesz usunąć ćwiczenie <strong className="text-white">«{exerciseToDelete.name}»</strong> z bazy ćwiczeń?
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setExerciseToDelete(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteExercise) {
                    onDeleteExercise(exerciseToDelete.id);
                    if (selectedExerciseId === exerciseToDelete.id) {
                      const remaining = exercises.filter((e) => e.id !== exerciseToDelete.id);
                      setSelectedExerciseId(remaining[0]?.id || '');
                      setSelectedPointIndex(null);
                    }
                  }
                  setExerciseToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/20 transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Usuń ćwiczenie</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
