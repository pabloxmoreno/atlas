import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  History,
  LayoutGrid,
  FileText,
  TrendingUp,
  Settings,
  ChevronRight,
  Clock,
  Check,
  Zap,
} from 'lucide-react';
import { WorkoutSession, WorkoutTemplate, Exercise, ExerciseCategory } from './types';
import { defaultExercises, defaultTemplates } from './data/defaultExercises';

// Component Imports
import Dashboard from './components/Dashboard';
import WorkoutActive from './components/WorkoutActive';
import WorkoutLogs from './components/WorkoutLogs';
import WorkoutTemplates from './components/WorkoutTemplates';
import ExerciseDatabase from './components/ExerciseDatabase';
import BackupSettings from './components/BackupSettings';

type Tab = 'dashboard' | 'history' | 'templates' | 'exercises' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // App Data States
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  
  // Active Workout State
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);

  // User Profile States (Weight and Height)
  const [userWeight, setUserWeight] = useState<number>(80);
  const [userHeight, setUserHeight] = useState<number>(180);

  // Load initial data from localStorage on component mount
  useEffect(() => {
    try {
      const storedWorkouts = localStorage.getItem('atlas_workouts');
      if (storedWorkouts) {
        setWorkouts(JSON.parse(storedWorkouts));
      }

      const storedTemplates = localStorage.getItem('atlas_templates');
      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      } else {
        setTemplates(defaultTemplates);
        localStorage.setItem('atlas_templates', JSON.stringify(defaultTemplates));
      }

      const storedExercises = localStorage.getItem('atlas_exercises');
      if (storedExercises) {
        setExercises(JSON.parse(storedExercises));
      } else {
        setExercises(defaultExercises);
        localStorage.setItem('atlas_exercises', JSON.stringify(defaultExercises));
      }

      const storedActive = localStorage.getItem('atlas_active_session');
      if (storedActive) {
        setActiveSession(JSON.parse(storedActive));
      }

      // Profile settings
      const storedWeight = localStorage.getItem('atlas_user_weight');
      if (storedWeight) {
        setUserWeight(Number(storedWeight));
      }
      const storedHeight = localStorage.getItem('atlas_user_height');
      if (storedHeight) {
        setUserHeight(Number(storedHeight));
      }
    } catch (e) {
      console.error('Error loading data from localStorage:', e);
    }
  }, []);

  const handleUpdateWeight = (weight: number) => {
    setUserWeight(weight);
    localStorage.setItem('atlas_user_weight', String(weight));
  };

  const handleUpdateHeight = (height: number) => {
    setUserHeight(height);
    localStorage.setItem('atlas_user_height', String(height));
  };

  // Save active session in progress to avoid loss if tab reloads
  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('atlas_active_session', JSON.stringify(activeSession));
    } else {
      localStorage.removeItem('atlas_active_session');
    }
  }, [activeSession]);

  // Start a fresh, blank empty workout
  const handleStartEmptyWorkout = () => {
    const today = new Date().toISOString().split('T')[0];
    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      name: 'Pusty trening',
      date: today,
      startTime: new Date().toISOString(),
      endTime: '',
      duration: 0,
      exercises: [],
    };
    setActiveSession(newSession);
    setActiveTab('dashboard'); // keep dashboard layout, but render training
  };

  // Start workout from a predefined template
  const handleStartTemplateWorkout = (template: WorkoutTemplate) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Convert template exercises into active workout exercises
    const workoutExercises = template.exercises.map((te) => {
      const sets = Array.from({ length: te.defaultSetsCount }).map((_, i) => ({
        id: `set-${Date.now()}-${te.exerciseId}-${i}`,
        weight: 0,
        reps: 0,
        completed: false,
      }));

      return {
        id: `we-${Date.now()}-${te.exerciseId}`,
        exerciseId: te.exerciseId,
        name: te.name,
        category: te.category,
        sets,
      };
    });

    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      name: template.name,
      date: today,
      startTime: new Date().toISOString(),
      endTime: '',
      duration: 0,
      exercises: workoutExercises,
      notes: template.notes,
    };

    setActiveSession(newSession);
    setActiveTab('dashboard'); // keep focus on active training
  };

  // Update active workout state
  const handleUpdateActiveSession = (updated: WorkoutSession) => {
    setActiveSession(updated);
  };

  // Finish and save workout session
  const handleFinishActiveSession = () => {
    if (!activeSession) return;

    // Filter exercises that have at least 1 set completed, or warning if none
    const allSets = activeSession.exercises.flatMap((ex) => ex.sets);
    const completedSetsCount = allSets.filter((s) => s.completed).length;

    if (completedSetsCount === 0) {
      if (
        !confirm(
          'Nie zaznaczyłeś żadnej serii jako wykonanej (zakończonej). Czy na pewno chcesz zapisać pusty trening?'
        )
      ) {
        return;
      }
    }

    const finishedSession: WorkoutSession = {
      ...activeSession,
      endTime: new Date().toISOString(),
    };

    const updatedWorkouts = [finishedSession, ...workouts];
    setWorkouts(updatedWorkouts);
    localStorage.setItem('atlas_workouts', JSON.stringify(updatedWorkouts));
    
    // Clear active session
    setActiveSession(null);
    localStorage.removeItem('atlas_active_session');

    // Go to history log to inspect
    setActiveTab('history');
  };

  // Cancel and discard workout session
  const handleCancelActiveSession = () => {
    setActiveSession(null);
    localStorage.removeItem('atlas_active_session');
  };

  // Delete workout session from logs
  const handleDeleteSession = (sessionId: string) => {
    const updated = workouts.filter((w) => w.id !== sessionId);
    setWorkouts(updated);
    localStorage.setItem('atlas_workouts', JSON.stringify(updated));
  };

  // Create custom exercise
  const handleAddCustomExercise = (name: string, category: ExerciseCategory) => {
    const newEx: Exercise = {
      id: `ex-custom-${Date.now()}`,
      name,
      category,
      isCustom: true,
    };

    const updated = [newEx, ...exercises];
    setExercises(updated);
    localStorage.setItem('atlas_exercises', JSON.stringify(updated));
  };

  // Save new custom routine template
  const handleSaveTemplate = (newTemplate: WorkoutTemplate) => {
    const updated = [newTemplate, ...templates];
    setTemplates(updated);
    localStorage.setItem('atlas_templates', JSON.stringify(updated));
  };

  // Delete template
  const handleDeleteTemplate = (templateId: string) => {
    const updated = templates.filter((t) => t.id !== templateId);
    setTemplates(updated);
    localStorage.setItem('atlas_templates', JSON.stringify(updated));
  };

  // Backup Import Handler
  const handleImportData = (imported: {
    workouts: WorkoutSession[];
    templates: WorkoutTemplate[];
    exercises: Exercise[];
  }) => {
    setWorkouts(imported.workouts);
    setTemplates(imported.templates);
    setExercises(imported.exercises);

    localStorage.setItem('atlas_workouts', JSON.stringify(imported.workouts));
    localStorage.setItem('atlas_templates', JSON.stringify(imported.templates));
    localStorage.setItem('atlas_exercises', JSON.stringify(imported.exercises));
  };

  // Reset App Handler
  const handleClearAllData = () => {
    localStorage.clear();
    setWorkouts([]);
    setTemplates(defaultTemplates);
    setExercises(defaultExercises);
    setActiveSession(null);

    localStorage.setItem('atlas_templates', JSON.stringify(defaultTemplates));
    localStorage.setItem('atlas_exercises', JSON.stringify(defaultExercises));
  };

  // Main UI Tab Content Router
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            workouts={workouts}
            templates={templates}
            onStartEmptyWorkout={handleStartEmptyWorkout}
            onStartTemplateWorkout={handleStartTemplateWorkout}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            userWeight={userWeight}
            userHeight={userHeight}
          />
        );
      case 'history':
        return (
          <WorkoutLogs
            workouts={workouts}
            onDeleteSession={handleDeleteSession}
            userWeight={userWeight}
            userHeight={userHeight}
          />
        );
      case 'templates':
        return (
          <WorkoutTemplates
            templates={templates}
            exercisesDatabase={exercises}
            onStartTemplateWorkout={handleStartTemplateWorkout}
            onSaveTemplate={handleSaveTemplate}
            onDeleteTemplate={handleDeleteTemplate}
          />
        );
      case 'exercises':
        return (
          <ExerciseDatabase
            exercises={exercises}
            workouts={workouts}
            onAddCustomExercise={handleAddCustomExercise}
          />
        );
      case 'settings':
        return (
          <BackupSettings
            workouts={workouts}
            templates={templates}
            exercises={exercises}
            userWeight={userWeight}
            userHeight={userHeight}
            onUpdateWeight={handleUpdateWeight}
            onUpdateHeight={handleUpdateHeight}
            onImportData={handleImportData}
            onClearAllData={handleClearAllData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      
      {/* HEADER BAR */}
      <header 
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 14px)' }}
        className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900 px-4 pb-3.5 flex items-center justify-between max-w-lg mx-auto w-full"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-zinc-950 shadow-md shadow-yellow-400/10">
            <Dumbbell className="w-5 h-5 fill-zinc-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sm tracking-tight text-white">ATLAS</h1>
            <p className="text-[11px] text-zinc-500 font-mono tracking-wider font-bold">TRACKER TRENINGOWY</p>
          </div>
        </div>

        {/* Offline indicator */}
        <span className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[11px] font-bold px-2 py-1 rounded-md">
          <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
          OFFLINE PWA
        </span>
      </header>

      {/* WORKOUT IN PROGRESS BAR (MINIMIZED WIDGET) */}
      {activeSession && activeTab !== 'dashboard' && (
        <div
          onClick={() => setActiveTab('dashboard')}
          className="bg-yellow-400/10 border-y border-yellow-400/20 px-4 py-2 flex items-center justify-between text-xs cursor-pointer hover:bg-yellow-400/15 transition-all max-w-lg mx-auto w-full"
        >
          <div className="flex items-center gap-2 text-yellow-400 font-semibold truncate">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
            </span>
            <span className="truncate">Aktywny: {activeSession.name}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 text-zinc-400 text-[10px] font-mono">
            <span>Dotknij, aby otworzyć</span>
            <ChevronRight className="w-3.5 h-3.5 text-yellow-400" />
          </div>
        </div>
      )}

      {/* CORE TAB CONTAINER / APP CANVAS */}
      <main className="flex-1 w-full max-w-lg mx-auto p-4 pb-24">
        {activeSession && activeTab === 'dashboard' ? (
          /* When a workout is active and user is on dashboard, render the active workout layout */
          <WorkoutActive
            activeSession={activeSession}
            exercisesDatabase={exercises}
            onUpdateSession={handleUpdateActiveSession}
            onFinishSession={handleFinishActiveSession}
            onCancelSession={handleCancelActiveSession}
            userWeight={userWeight}
            userHeight={userHeight}
          />
        ) : (
          /* Render normal tabs */
          renderTabContent()
        )}
      </main>

      {/* RESPONSIVE BOTTOM NAVIGATION BAR FOR MOBILE standalone / iOS / Android */}
      <nav 
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
        className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-900 px-2 pt-2 max-w-lg mx-auto rounded-t-xl shadow-2xl"
      >
        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-yellow-400 bg-zinc-900/40'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <LayoutGrid className="w-5 h-5 stroke-[2]" />
            <span className="text-[11px] font-bold mt-1 tracking-wide">Panel</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'text-yellow-400 bg-zinc-900/40'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <History className="w-5 h-5 stroke-[2]" />
            <span className="text-[11px] font-bold mt-1 tracking-wide">Dziennik</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'templates'
                ? 'text-yellow-400 bg-zinc-900/40'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <FileText className="w-5 h-5 stroke-[2]" />
            <span className="text-[11px] font-bold mt-1 tracking-wide">Szablony</span>
          </button>

          <button
            onClick={() => setActiveTab('exercises')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'exercises'
                ? 'text-yellow-400 bg-zinc-900/40'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <TrendingUp className="w-5 h-5 stroke-[2]" />
            <span className="text-[11px] font-bold mt-1 tracking-wide">Wykresy</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'text-yellow-400 bg-zinc-900/40'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Settings className="w-5 h-5 stroke-[2]" />
            <span className="text-[11px] font-bold mt-1 tracking-wide">Profil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
