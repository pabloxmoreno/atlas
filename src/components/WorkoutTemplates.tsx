import React, { useState } from 'react';
import { Play, Plus, Trash2, Search, X, Dumbbell, Save, Check } from 'lucide-react';
import { WorkoutTemplate, Exercise, ExerciseCategory } from '../types';

interface WorkoutTemplatesProps {
  templates: WorkoutTemplate[];
  exercisesDatabase: Exercise[];
  onStartTemplateWorkout: (template: WorkoutTemplate) => void;
  onSaveTemplate: (template: WorkoutTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export default function WorkoutTemplates({
  templates,
  exercisesDatabase,
  onStartTemplateWorkout,
  onSaveTemplate,
  onDeleteTemplate,
}: WorkoutTemplatesProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateNotes, setTemplateNotes] = useState('');
  const [templateExercises, setTemplateExercises] = useState<{
    exerciseId: string;
    name: string;
    category: ExerciseCategory;
    defaultSetsCount: number;
  }[]>([]);

  const [showAddExercise, setShowAddExercise] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Wszystkie');

  const categories = ['Wszystkie', 'Klatka piersiowa', 'Plecy', 'Nogi', 'Barki', 'Ramiona', 'Brzuch', 'Kardio', 'Inne'];

  // Add exercise to the template creator
  const handleAddExerciseToTemplate = (ex: Exercise) => {
    const alreadyAdded = templateExercises.some((item) => item.exerciseId === ex.id);
    if (alreadyAdded) {
      alert('To ćwiczenie zostało już dodane do tego szablonu.');
      return;
    }

    setTemplateExercises([
      ...templateExercises,
      {
        exerciseId: ex.id,
        name: ex.name,
        category: ex.category,
        defaultSetsCount: 3, // default sets count
      },
    ]);
    setShowAddExercise(false);
  };

  // Remove exercise from template creator
  const handleRemoveExerciseFromTemplate = (exerciseId: string) => {
    setTemplateExercises(templateExercises.filter((item) => item.exerciseId !== exerciseId));
  };

  // Update set count in template creator
  const handleUpdateSetsCount = (exerciseId: string, count: number) => {
    const updated = templateExercises.map((item) => {
      if (item.exerciseId !== exerciseId) return item;
      return { ...item, defaultSetsCount: Math.max(1, Math.min(10, count)) };
    });
    setTemplateExercises(updated);
  };

  // Save the new template
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Wpisz nazwę szablonu.');
      return;
    }

    if (templateExercises.length === 0) {
      alert('Dodaj przynajmniej jedno ćwiczenie do szablonu.');
      return;
    }

    const newTemplate: WorkoutTemplate = {
      id: `temp-${Date.now()}`,
      name: templateName,
      exercises: templateExercises,
      notes: templateNotes,
    };

    onSaveTemplate(newTemplate);
    resetForm();
  };

  const resetForm = () => {
    setIsCreating(false);
    setTemplateName('');
    setTemplateNotes('');
    setTemplateExercises([]);
  };

  // Filter exercises for modal
  const filteredExercises = exercisesDatabase.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Wszystkie' || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header and Toggle Create */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
        <div>
          <h3 className="font-display font-bold text-lg text-white">Szablony treningowe</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Zapisane schematy ćwiczeń, które możesz błyskawicznie uruchomić.</p>
        </div>

        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Stwórz szablon
          </button>
        )}
      </div>

      {isCreating ? (
        /* TEMPLATE CREATOR INTERFACE */
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5 shadow-lg animate-fade-in">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <h4 className="font-display font-bold text-base text-zinc-200">Kreator nowego szablonu</h4>
            <button
              onClick={resetForm}
              className="text-zinc-500 hover:text-zinc-200 p-1 bg-zinc-800/40 hover:bg-zinc-800 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-1">Nazwa szablonu</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="np. Trening FBW - Dzień B, Góra ciała"
                className="w-full bg-zinc-950 text-zinc-100 placeholder-zinc-500 text-sm px-4 py-2.5 rounded-xl border border-zinc-800 focus:border-yellow-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-1">Opis lub notatka (opcjonalnie)</label>
              <textarea
                value={templateNotes}
                onChange={(e) => setTemplateNotes(e.target.value)}
                placeholder="np. Skup się na ciężarze, odpoczynki 2 minuty..."
                className="w-full bg-zinc-950 text-zinc-200 placeholder-zinc-500 text-xs p-3 rounded-xl border border-zinc-800 focus:border-yellow-400 focus:outline-none resize-none min-h-[60px]"
              />
            </div>
          </div>

          {/* Exercises inside creator */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Ćwiczenia w szablonie</label>
              <button
                onClick={() => setShowAddExercise(true)}
                className="text-xs text-yellow-400 hover:text-yellow-500 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Dodaj ćwiczenie
              </button>
            </div>

            {templateExercises.length === 0 ? (
              <div className="border border-dashed border-zinc-800 rounded-xl p-8 text-center text-zinc-500 bg-zinc-950/20">
                <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-30 text-zinc-400" />
                <p className="text-xs">Brak ćwiczeń w szablonie</p>
                <p className="text-[10px] text-zinc-600 mt-1">Kliknij powyższy przycisk, aby dodać ćwiczenia z bazy.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {templateExercises.map((item, index) => (
                  <div
                    key={item.exerciseId}
                    className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 flex justify-between items-center gap-4"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-zinc-200">
                        {index + 1}. {item.name}
                      </p>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase">{item.category}</span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                        <span>Serie:</span>
                        <input
                          type="number"
                          value={item.defaultSetsCount}
                          onChange={(e) => handleUpdateSetsCount(item.exerciseId, parseInt(e.target.value) || 1)}
                          className="w-10 bg-zinc-900 text-zinc-100 font-mono text-center font-bold border border-zinc-800 rounded-md py-1 outline-hidden text-xs"
                          min="1"
                          max="10"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveExerciseFromTemplate(item.exerciseId)}
                        className="text-zinc-500 hover:text-red-400 p-1.5 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Creator Buttons */}
          <div className="flex gap-3 pt-3 border-t border-zinc-800">
            <button
              onClick={resetForm}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
            >
              Anuluj
            </button>
            <button
              onClick={handleSaveTemplate}
              className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-yellow-400/5"
            >
              <Save className="w-4 h-4" /> Zapisz szablon
            </button>
          </div>
        </div>
      ) : (
        /* TEMPLATES LIST VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => {
            const isCustom = template.id.startsWith('temp-');

            return (
              <div
                key={template.id}
                className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-800 hover:bg-zinc-900/80 transition-all duration-200"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-display font-bold text-base text-zinc-100 leading-tight">
                      {template.name}
                    </h4>
                    {isCustom && (
                      <button
                        onClick={() => {
                          if (confirm('Czy na pewno chcesz usunąć ten szablon?')) {
                            onDeleteTemplate(template.id);
                          }
                        }}
                        className="text-zinc-500 hover:text-red-400 p-1 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
                        title="Usuń szablon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 min-h-[32px] mb-4">
                    {template.notes || 'Brak opisu dla tego szablonu treningowego.'}
                  </p>

                  {/* Exercises pre-view */}
                  <div className="space-y-1.5 border-t border-zinc-800/60 pt-3 mb-5">
                    {template.exercises.map((ex, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="text-zinc-300 font-medium truncate max-w-[200px]">{ex.name}</span>
                        <span className="text-zinc-500 font-mono text-[10px] font-bold">
                          {ex.defaultSetsCount} serii
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onStartTemplateWorkout(template)}
                  className="w-full py-3 bg-zinc-800 hover:bg-yellow-400 text-zinc-200 hover:text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-xs active:scale-98"
                >
                  <Play className="w-3.5 h-3.5 fill-current stroke-none" /> Rozpocznij ten trening
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* SEARCH/ADD EXERCISE MODAL FOR TEMPLATE CREATOR */}
      {showAddExercise && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-zinc-800 px-5 py-4 bg-zinc-900/50">
              <h3 className="font-display font-bold text-white text-base">Wybierz ćwiczenie do szablonu</h3>
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
                        ? 'bg-yellow-400 border-yellow-400 text-zinc-950'
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
                </div>
              ) : (
                filteredExercises.map((ex) => {
                  const isAdded = templateExercises.some((item) => item.exerciseId === ex.id);

                  return (
                    <button
                      key={ex.id}
                      onClick={() => handleAddExerciseToTemplate(ex)}
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
                          Dodaj
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
    </div>
  );
}
