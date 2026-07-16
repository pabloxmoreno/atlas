import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Ruler,
  BrainCircuit,
  Clipboard,
  Check,
} from 'lucide-react';
import { WorkoutSession, WorkoutTemplate, Exercise } from '../types';
import { calculateBMI, calculateBMR, getBMIDescription, formatDataForAI } from '../utils';

interface BackupSettingsProps {
  workouts: WorkoutSession[];
  templates: WorkoutTemplate[];
  exercises: Exercise[];
  userWeight: number;
  userHeight: number;
  onUpdateWeight: (weight: number) => void;
  onUpdateHeight: (height: number) => void;
  onImportData: (data: { workouts: WorkoutSession[]; templates: WorkoutTemplate[]; exercises: Exercise[] }) => void;
  onClearAllData: () => void;
}

export default function BackupSettings({
  workouts,
  templates,
  exercises,
  userWeight,
  userHeight,
  onUpdateWeight,
  onUpdateHeight,
  onImportData,
  onClearAllData,
}: BackupSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // AI Export settings state
  const [aiDaysLimit, setAiDaysLimit] = useState<number>(30);
  const [copiedAI, setCopiedAI] = useState<boolean>(false);

  // Compute stats for physical profile
  const bmi = calculateBMI(userWeight, userHeight);
  const bmr = calculateBMR(userWeight, userHeight);
  const bmiDesc = getBMIDescription(bmi);

  // Compute formatting for export
  const rawFormattedAIReport = formatDataForAI(workouts, userWeight, userHeight, aiDaysLimit);

  // Trigger JSON Export file download
  const handleExportData = () => {
    try {
      const backupObj = {
        app: 'AtlasTracker',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        data: {
          workouts,
          templates,
          exercises,
        },
      };

      const jsonStr = JSON.stringify(backupObj, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `atlas_gym_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Błąd podczas eksportowania danych: ' + e);
    }
  };

  // Trigger JSON file import
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Simple structure validation
        if (parsed.app !== 'AtlasTracker' || !parsed.data) {
          throw new Error('Niepoprawny format pliku kopii zapasowej Atlas Gym.');
        }

        const { workouts: impWorkouts, templates: impTemplates, exercises: impExercises } = parsed.data;

        if (!Array.isArray(impWorkouts) || !Array.isArray(impTemplates) || !Array.isArray(impExercises)) {
          throw new Error('Kopia zapasowa zawiera uszkodzone kolekcje danych.');
        }

        onImportData({
          workouts: impWorkouts,
          templates: impTemplates,
          exercises: impExercises,
        });

        setImportStatus({
          type: 'success',
          message: `Kopia została wczytana pomyślnie! Zaimportowano ${impWorkouts.length} treningów, ${impTemplates.length} szablonów, oraz ${impExercises.length} ćwiczeń.`,
        });

        // Clear input value
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: 'Błąd wczytywania kopii: ' + err.message,
        });
      }
    };

    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Copy AI report to clipboard
  const handleCopyToClipboard = () => {
    try {
      navigator.clipboard.writeText(rawFormattedAIReport);
      setCopiedAI(true);
      setTimeout(() => {
        setCopiedAI(false);
      }, 2500);
    } catch (e) {
      alert('Nie udało się skopiować raportu: ' + e);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. PHYSICAL PROFILE SECTION */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-yellow-400" />
          <h3 className="font-display font-bold text-lg text-white">Twój Profil Fizyczny</h3>
        </div>
        <p className="text-xs text-zinc-400">
          Wprowadź swoje parametry ciała, aby system mógł dokładnie kalkulować spalone kalorie na treningach siłowych oraz kardio.
        </p>

        <div className="grid grid-cols-2 gap-4 pt-2">
          {/* Weight Input */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 space-y-1.5 focus-within:border-yellow-400 transition-colors">
            <label className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider block">
              Twoja waga (kg)
            </label>
            <div className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={userWeight || ''}
                onChange={(e) => onUpdateWeight(parseFloat(e.target.value) || 0)}
                className="bg-transparent text-sm text-white font-mono font-bold focus:outline-none w-full"
                placeholder="np. 80"
              />
            </div>
          </div>

          {/* Height Input */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 space-y-1.5 focus-within:border-yellow-400 transition-colors">
            <label className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider block">
              Twój wzrost (cm)
            </label>
            <div className="flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="number"
                step="1"
                min="100"
                max="250"
                value={userHeight || ''}
                onChange={(e) => onUpdateHeight(parseInt(e.target.value) || 0)}
                className="bg-transparent text-sm text-white font-mono font-bold focus:outline-none w-full"
                placeholder="np. 180"
              />
            </div>
          </div>
        </div>

        {/* Dynamic biological indicators */}
        {userWeight > 0 && userHeight > 0 && (
          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div className="bg-zinc-850/50 rounded-xl p-3 border border-zinc-800/40">
              <span className="text-zinc-500 text-[10px] font-mono font-bold uppercase block">Wskaźnik BMI</span>
              <span className="font-mono text-sm font-bold text-zinc-200">{bmi.toFixed(1)}</span>
              <span className="text-[10px] text-zinc-400 ml-1.5 font-medium">({bmiDesc})</span>
            </div>
            <div className="bg-zinc-850/50 rounded-xl p-3 border border-zinc-800/40">
              <span className="text-zinc-500 text-[10px] font-mono font-bold uppercase block">Zapotrzebowanie BMR</span>
              <span className="font-mono text-sm font-bold text-zinc-200">{Math.round(bmr)} kcal</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5 font-medium">dzienna przemiana</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. EXPORT FOR AI CONSOLE */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-yellow-400" />
            <h3 className="font-display font-bold text-lg text-white">Trener AI - Eksport danych</h3>
          </div>
          <span className="text-[9px] font-mono font-bold bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-sm">
            AI READY
          </span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Eksportuj swoje postępy z ostatniego miesiąca do czystego, ustrukturyzowanego formatu Markdown. Skopiuj raport, wklej go do dowolnej sztucznej inteligencji (Gemini, ChatGPT) i poproś o profesjonalne porady!
        </p>

        {/* Range selectors */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold mr-1">Okres:</span>
          {[
            { label: 'Ostatnie 14 dni', val: 14 },
            { label: 'Ostatni miesiąc', val: 30 },
            { label: 'Ostatnie 3 miesiące', val: 90 },
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => setAiDaysLimit(opt.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                aiDaysLimit === opt.val
                  ? 'bg-yellow-400 text-zinc-950 border-yellow-400 shadow-sm'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Preview Container with Copy HUD */}
        <div className="relative group rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950">
          <div className="absolute top-2.5 right-2.5 z-10">
            <button
              onClick={handleCopyToClipboard}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                copiedAI
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60'
              }`}
            >
              {copiedAI ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  Skopiowano raport!
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" />
                  Kopiuj raport dla AI
                </>
              )}
            </button>
          </div>

          {/* Raw Text Output Container */}
          <textarea
            readOnly
            value={rawFormattedAIReport}
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            className="w-full h-44 bg-transparent text-[10px] font-mono text-zinc-400 p-4 pt-14 focus:outline-none resize-none leading-relaxed overflow-y-auto"
            placeholder="Wprowadź treningi, aby wygenerować raport."
          />
        </div>

        {/* Prompt guidance */}
        <div className="bg-zinc-950 rounded-xl p-3.5 border border-zinc-800 text-xs space-y-2">
          <p className="font-bold text-zinc-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> Jak uzyskać porady od AI?
          </p>
          <ol className="list-decimal list-inside text-zinc-400 text-[11px] space-y-1.5 pl-0.5 leading-relaxed">
            <li>
              Dotknij przycisku <strong className="text-zinc-200">Kopiuj raport dla AI</strong> powyżej.
            </li>
            <li>
              Otwórz swojego ulubionego asystenta AI (np. <strong className="text-zinc-200">Gemini</strong> lub <strong className="text-zinc-200">ChatGPT</strong>).
            </li>
            <li>
              Wklej skopiowany tekst i wyślij go wraz z dołączonymi gotowymi pytaniami znajdującymi się na końcu raportu!
            </li>
          </ol>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Column */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
          <h4 className="font-display font-bold text-sm text-zinc-200">Kopia Zapasowa (JSON)</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Pobierz pełną kopię zapasową swoich treningów, planów i ćwiczeń na dysk swojego urządzenia. Możesz ją wgrać na innym telefonie lub po wyczyszczeniu przeglądarki.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleExportData}
              className="flex-1 py-3 px-4 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-700 rounded-xl text-xs font-bold text-zinc-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-yellow-400" />
              Eksportuj kopie (.json)
            </button>

            <button
              onClick={triggerFileInput}
              className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-yellow-400/5"
            >
              <Upload className="w-4 h-4 text-zinc-950" />
              Importuj kopie (.json)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          {/* Import Status Alert */}
          {importStatus && (
            <div
              className={`p-4 rounded-xl border flex gap-3 text-xs leading-relaxed ${
                importStatus.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/20 text-red-300'
              }`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
              )}
              <div>
                <p className="font-bold">{importStatus.type === 'success' ? 'Sukces' : 'Błąd'}</p>
                <p className="mt-0.5 text-zinc-300">{importStatus.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone Column */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
          <h4 className="font-display font-bold text-sm text-red-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> Strefa Niebezpieczna
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Spowoduje to całkowite usunięcie wszystkich Twoich treningów, niestandardowych ćwiczeń i planów treningowych z pamięci tego urządzenia. Ta operacja jest natychmiastowa i nieodwracalna.
          </p>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Wyczyść wszystkie dane
          </button>
        </div>
      </div>

      {/* DETAILED DANGER ZONE DIALOG */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-white text-lg">Całkowity Reset Danych?</h3>
              <p className="text-zinc-400 text-xs">
                Czy na pewno chcesz usunąć całą historię treningową? Tej operacji nie można cofnąć. Wszystkie dane zostaną trwale utracone, a aplikacja powróci do ustawień fabrycznych.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Anuluj
              </button>
              <button
                onClick={() => {
                  onClearAllData();
                  setShowResetConfirm(false);
                  setImportStatus({
                    type: 'success',
                    message: 'Aplikacja została pomyślnie zresetowana do ustawień początkowych.',
                  });
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Tak, wyczyść wszystko
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
