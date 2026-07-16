import { Exercise } from '../types';

export const defaultExercises: Exercise[] = [
  // Klatka piersiowa
  { id: 'ex-1', name: 'Wyciskanie sztangi na ławce poziomej', category: 'Klatka piersiowa' },
  { id: 'ex-2', name: 'Wyciskanie hantli na ławce skośnej dodatniej', category: 'Klatka piersiowa' },
  { id: 'ex-3', name: 'Rozpiętki na maszynie (Butterfly)', category: 'Klatka piersiowa' },
  { id: 'ex-4', name: 'Rozpiętki z hantlami na ławce poziomej', category: 'Klatka piersiowa' },
  { id: 'ex-5', name: 'Pompki na poręczach (Dipy klatkowe)', category: 'Klatka piersiowa' },

  // Plecy
  { id: 'ex-6', name: 'Martwy ciąg klasyczny', category: 'Plecy' },
  { id: 'ex-7', name: 'Podciąganie na drążku nachwytem', category: 'Plecy' },
  { id: 'ex-8', name: 'Wiosłowanie sztangą w opadzie tułowia', category: 'Plecy' },
  { id: 'ex-9', name: 'Wiosłowanie hantlem jednorącz', category: 'Plecy' },
  { id: 'ex-10', name: 'Ściąganie drążka wyciągu górnego do klatki', category: 'Plecy' },
  { id: 'ex-11', name: 'Przyciąganie uchwytu wyciągu dolnego', category: 'Plecy' },

  // Nogi
  { id: 'ex-12', name: 'Przysiad ze sztangą na plecach (Back Squat)', category: 'Nogi' },
  { id: 'ex-13', name: 'Przysiad bułgarski z hantlami', category: 'Nogi' },
  { id: 'ex-14', name: 'Wypychanie ciężaru na suwnicy (Leg Press)', category: 'Nogi' },
  { id: 'ex-15', name: 'Prostowanie nóg na maszynie', category: 'Nogi' },
  { id: 'ex-16', name: 'Uginanie nóg leżąc (Dwugłowe)', category: 'Nogi' },
  { id: 'ex-17', name: 'Wspięcia na palce stojąc (Łydki)', category: 'Nogi' },

  // Barki
  { id: 'ex-18', name: 'Wyciskanie żołnierskie (Overhead Press)', category: 'Barki' },
  { id: 'ex-19', name: 'Wyciskanie hantli siedząc', category: 'Barki' },
  { id: 'ex-20', name: 'Wznosy hantli bokiem stojąc', category: 'Barki' },
  { id: 'ex-21', name: 'Wznosy hantli w opadzie tułowia (Tył barku)', category: 'Barki' },
  { id: 'ex-22', name: 'Face Pulls', category: 'Barki' },

  // Ramiona (Biceps i Triceps)
  { id: 'ex-23', name: 'Uginanie ramion ze sztangą łamaną stojąc', category: 'Ramiona' },
  { id: 'ex-24', name: 'Uginanie ramion z hantlami z supinacją', category: 'Ramiona' },
  { id: 'ex-25', name: 'Uginanie ramion z hantlami chwytem młotkowym', category: 'Ramiona' },
  { id: 'ex-26', name: 'Wyciskanie francuskie ze sztangą łamaną leżąc', category: 'Ramiona' },
  { id: 'ex-27', name: 'Prostowanie ramion na wyciągu (Triceps pushdown)', category: 'Ramiona' },
  { id: 'ex-28', name: 'Dipy na poręczach (Tricepsowe)', category: 'Ramiona' },

  // Brzuch
  { id: 'ex-29', name: 'Plank (Deska)', category: 'Brzuch' },
  { id: 'ex-30', name: 'Allachy (Skłony na wyciągu klęcząc)', category: 'Brzuch' },
  { id: 'ex-31', name: 'Wznosy nóg w zwisie na drążku', category: 'Brzuch' },
  { id: 'ex-32', name: 'Brzuszki na ławce skośnej', category: 'Brzuch' },

  // Kardio
  { id: 'ex-33', name: 'Bieganie (Bieżnia)', category: 'Kardio' },
  { id: 'ex-34', name: 'Jazda na rowerze stacjonarnym', category: 'Kardio' },
  { id: 'ex-35', name: 'Wioślarz (Ergometr)', category: 'Kardio' },
  { id: 'ex-36', name: 'Schody (Stairmaster)', category: 'Kardio' }
];

export const defaultTemplates = [
  {
    id: 'temp-1',
    name: 'FBW (Full Body Workout) - Trening A',
    exercises: [
      { exerciseId: 'ex-12', name: 'Przysiad ze sztangą na plecach (Back Squat)', category: 'Nogi' as const, defaultSetsCount: 4 },
      { exerciseId: 'ex-1', name: 'Wyciskanie sztangi na ławce poziomej', category: 'Klatka piersiowa' as const, defaultSetsCount: 4 },
      { exerciseId: 'ex-8', name: 'Wiosłowanie sztangą w opadzie tułowia', category: 'Plecy' as const, defaultSetsCount: 4 },
      { exerciseId: 'ex-18', name: 'Wyciskanie żołnierskie (Overhead Press)', category: 'Barki' as const, defaultSetsCount: 3 },
      { exerciseId: 'ex-23', name: 'Uginanie ramion ze sztangą łamaną stojąc', category: 'Ramiona' as const, defaultSetsCount: 3 }
    ],
    notes: 'Trening ogólnorozwojowy skupiony na wielostawach.'
  },
  {
    id: 'temp-2',
    name: 'Push (Klatka, Barki, Triceps)',
    exercises: [
      { exerciseId: 'ex-1', name: 'Wyciskanie sztangi na ławce poziomej', category: 'Klatka piersiowa' as const, defaultSetsCount: 4 },
      { exerciseId: 'ex-2', name: 'Wyciskanie hantli na ławce skośnej dodatniej', category: 'Klatka piersiowa' as const, defaultSetsCount: 3 },
      { exerciseId: 'ex-19', name: 'Wyciskanie hantli siedząc', category: 'Barki' as const, defaultSetsCount: 3 },
      { exerciseId: 'ex-20', name: 'Wznosy hantli bokiem stojąc', category: 'Barki' as const, defaultSetsCount: 4 },
      { exerciseId: 'ex-26', name: 'Wyciskanie francuskie ze sztangą łamaną leżąc', category: 'Ramiona' as const, defaultSetsCount: 3 }
    ],
    notes: 'Skup się na progresji ciężarowej w wyciskaniu.'
  },
  {
    id: 'temp-3',
    name: 'Pull (Plecy, Tył barku, Biceps)',
    exercises: [
      { exerciseId: 'ex-7', name: 'Podciąganie na drążku nachwytem', category: 'Plecy' as const, defaultSetsCount: 4 },
      { exerciseId: 'ex-9', name: 'Wiosłowanie hantlem jednorącz', category: 'Plecy' as const, defaultSetsCount: 3 },
      { exerciseId: 'ex-10', name: 'Ściąganie drążka wyciągu górnego do klatki', category: 'Plecy' as const, defaultSetsCount: 3 },
      { exerciseId: 'ex-22', name: 'Face Pulls', category: 'Barki' as const, defaultSetsCount: 4 },
      { exerciseId: 'ex-24', name: 'Uginanie ramion z hantlami z supinacją', category: 'Ramiona' as const, defaultSetsCount: 3 }
    ],
    notes: 'Kontroluj fazę ekscentryczną przy każdym ruchu.'
  }
];
