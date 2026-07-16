import { WorkoutSession } from './types';

// Standard MET values for categories
export const CATEGORY_METS: Record<string, number> = {
  'Klatka piersiowa': 5.5,
  'Plecy': 5.5,
  'Nogi': 6.5,
  'Barki': 5.5,
  'Ramiona': 5.0,
  'Brzuch': 4.5,
  'Kardio': 8.0,
  'Inne': 5.0,
};

/**
 * Calculates BMR using the Mifflin-St Jeor formula (assuming average age 30 and neutral factor)
 */
export function calculateBMR(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm) return 0;
  // Neutral formula: 10 * weight + 6.25 * height - 150
  return 10 * weightKg + 6.25 * heightCm - 150;
}

/**
 * Calculates Body Mass Index (BMI)
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm) return 0;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/**
 * Gets a descriptive category for BMI
 */
export function getBMIDescription(bmi: number): string {
  if (bmi < 18.5) return 'Niedowaga';
  if (bmi < 25) return 'Waga prawidłowa';
  if (bmi < 30) return 'Nadwaga';
  return 'Otyłość';
}

/**
 * Calculates calories burned for a single workout session based on weight and height
 */
export function calculateSessionCalories(
  durationInSeconds: number,
  weightKg: number,
  heightCm: number,
  categories: string[]
): number {
  if (!durationInSeconds || !weightKg || !heightCm) return 0;
  
  // Find average MET
  let totalMet = 0;
  if (categories.length > 0) {
    const sum = categories.reduce((acc, cat) => acc + (CATEGORY_METS[cat] || 5.0), 0);
    totalMet = sum / categories.length;
  } else {
    totalMet = 5.0; // default general gym training MET
  }

  const bmr = calculateBMR(weightKg, heightCm);
  // Hourly BMR expenditure
  const hourlyBmr = bmr / 24;
  
  // Total calories = MET * (BMR/24) * duration_hours
  const durationHours = durationInSeconds / 3600;
  const calories = totalMet * hourlyBmr * durationHours;

  return Math.round(calories);
}

/**
 * Formats user's training data for pasting into an AI (Gemini, ChatGPT, etc.)
 */
export function formatDataForAI(
  workouts: WorkoutSession[],
  weightKg: number,
  heightCm: number,
  daysLimit = 30
): string {
  const now = new Date();
  const limitDate = new Date();
  limitDate.setDate(now.getDate() - daysLimit);

  // Filter workouts within the last X days
  const filteredWorkouts = workouts.filter((w) => {
    const wDate = new Date(w.date);
    return wDate >= limitDate;
  });

  // Calculate stats
  const totalWorkouts = filteredWorkouts.length;
  const totalVolume = filteredWorkouts.reduce((sum, session) => {
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

  const totalDurationSeconds = filteredWorkouts.reduce((sum, w) => sum + w.duration, 0);
  const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

  // Calculate calories burned
  const totalCalories = filteredWorkouts.reduce((sum, w) => {
    const cats = w.exercises.map((e) => e.category);
    return sum + calculateSessionCalories(w.duration, weightKg, heightCm, cats);
  }, 0);

  const bmi = calculateBMI(weightKg, heightCm);
  const bmiDesc = getBMIDescription(bmi);
  const bmr = calculateBMR(weightKg, heightCm);

  let output = ``;
  output += `# DANE TRENINGOWE UŻYTKOWNIKA DO ANALIZY AI\n`;
  output += `Aplikacja: ATLAS Gym Tracker\n`;
  output += `Wygenerowano: ${now.toLocaleDateString('pl-PL')} ${now.toLocaleTimeString('pl-PL')}\n`;
  output += `Zakres danych: Ostatnie ${daysLimit} dni (od ${limitDate.toLocaleDateString('pl-PL')})\n\n`;

  output += `## 1. PARAMETRY FIZYCZNE UŻYTKOWNIKA\n`;
  output += `- Wzrost: ${heightCm} cm\n`;
  output += `- Waga: ${weightKg} kg\n`;
  output += `- Wskaźnik BMI: ${bmi.toFixed(1)} (${bmiDesc})\n`;
  output += `- Podstawowa Przemiana Materii (BMR): ${Math.round(bmr)} kcal/dzień\n\n`;

  output += `## 2. STATYSTYKI Z OSTATNICH ${daysLimit} DNI\n`;
  output += `- Liczba treningów: ${totalWorkouts}\n`;
  output += `- Łączny czas aktywności: ${totalDurationMinutes} minut (${(totalDurationSeconds / 3600).toFixed(1)} godz.)\n`;
  output += `- Łączny przerzucony ciężar (tonaż): ${totalVolume} kg\n`;
  output += `- Szacowane spalone kalorie: ${totalCalories} kcal\n\n`;

  output += `## 3. HISTORIA TRENINGÓW (SZCZEGÓŁOWA)\n`;

  if (filteredWorkouts.length === 0) {
    output += `Brak zarejestrowanych treningów w wybranym okresie.\n`;
  } else {
    // Sort oldest first or newest first? Let's do newest first
    const sorted = [...filteredWorkouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    sorted.forEach((w, idx) => {
      const wVolume = w.exercises.reduce((exSum, ex) => {
        return exSum + ex.sets.reduce((setSum, set) => setSum + (set.completed ? set.weight * set.reps : 0), 0);
      }, 0);
      const wCats = w.exercises.map((e) => e.category);
      const wCals = calculateSessionCalories(w.duration, weightKg, heightCm, wCats);

      output += `### Trening ${totalWorkouts - idx}: ${w.name}\n`;
      output += `- Data: ${w.date}\n`;
      output += `- Czas trwania: ${Math.round(w.duration / 60)} min\n`;
      output += `- Tonaż: ${wVolume} kg\n`;
      output += `- Spalone kalorie: ${wCals} kcal\n`;
      if (w.notes) {
        output += `- Notatki: ${w.notes}\n`;
      }
      output += `- Ćwiczenia:\n`;

      w.exercises.forEach((ex, eIdx) => {
        output += `  ${eIdx + 1}. ${ex.name} [Kategoria: ${ex.category}]\n`;
        const completedSets = ex.sets.filter((s) => s.completed);
        if (completedSets.length === 0) {
          output += `     * Brak zaliczonych serii *\n`;
        } else {
          completedSets.forEach((s, sIdx) => {
            output += `     - Seria ${sIdx + 1}: ${s.weight} kg x ${s.reps} powt. ${s.isWarmup ? '(Rozgrzewka)' : ''}${s.rpe ? ` [RPE: ${s.rpe}]` : ''}\n`;
          });
        }
      });
      output += `\n`;
    });
  }

  output += `\n## 4. PROPONOWANE PROMPTY / PYTANIA DO AI (SKOPIUJ JEDNO Z PONIŻSZYCH I WYŚLIJ RAZEM Z TYM TEKSTEM)\n`;
  output += `### Opcja A (Analiza progresu i błędy):\n`;
  output += `> "Przeanalizuj moje dane treningowe z ostatniego miesiąca. Jakie błędy popełniam w doborze ćwiczeń, objętości lub intensywności (RPE)? Podaj 3 konkretne, naukowe wskazówki, które pozwolą mi szybciej budować siłę i masę mięśniową."\n\n`;
  
  output += `### Opcja B (Zbilansowanie planu):\n`;
  output += `> "Na podstawie mojego tonażu, kategorii ćwiczeń i częstotliwości, czy mój plan treningowy jest dobrze zbalansowany? Czy nie przeciążam żadnej partii mięśniowej kosztem innej? Zaproponuj ewentualne korekty."\n\n`;

  output += `### Opcja C (Dieta i kalorie):\n`;
  output += `> "Biorąc pod uwagę moje parametry (waga, wzrost, BMI, BMR) oraz tonaż i spalone kalorie z treningów, ułóż dla mnie optymalne zapotrzebowanie kaloryczne oraz rozkład makroskładników (białko, tłuszcze, węglowodany) dla celu budowania suchej masy mięśniowej / redukcji tkanki tłuszczowej."\n`;

  return output;
}
