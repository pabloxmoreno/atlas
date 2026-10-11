import { Exercise, WorkoutTemplate } from '../types';

export const defaultExercises: Exercise[] = [
  // Klatka piersiowa
  { id: 'ex-1', name: 'Wyciskanie sztangi leżąc (poziom)', category: 'Klatka piersiowa' },
  { id: 'ex-2', name: 'Wyciskanie hantli na ławce skośnej dodatniej', category: 'Klatka piersiowa' },
  { id: 'ex-3', name: 'Rozpiętki na maszynie (Pec Deck / Butterfly)', category: 'Klatka piersiowa' },
  { id: 'ex-4', name: 'Rozpiętki z hantlami na ławce poziomej', category: 'Klatka piersiowa' },
  { id: 'ex-5', name: 'Pompki na poręczach (Dipy klatkowe)', category: 'Klatka piersiowa' },
  { id: 'ex-38', name: 'Wyciskanie sztangi na skosie dodatnim', category: 'Klatka piersiowa' },
  { id: 'ex-42', name: 'Wyciskanie na maszynie (klatka - płasko)', category: 'Klatka piersiowa' },

  // Plecy
  { id: 'ex-6', name: 'Martwy ciąg klasyczny', category: 'Plecy' },
  { id: 'ex-7', name: 'Podciąganie na drążku (lub wyciąg)', category: 'Plecy' },
  { id: 'ex-8', name: 'Wiosłowanie sztangą w opadzie tułowia', category: 'Plecy' },
  { id: 'ex-9', name: 'Wiosłowanie hantlem jednorącz', category: 'Plecy' },
  { id: 'ex-10', name: 'Ściąganie drążka szeroko (nachwyt)', category: 'Plecy' },
  { id: 'ex-11', name: 'Wiosłowanie na wyciągu dolnym siedząc', category: 'Plecy' },
  { id: 'ex-40', name: 'Ściąganie drążka (chwyt neutralny)', category: 'Plecy' },
  { id: 'ex-47', name: 'Wiosłowanie na maszynie (Hammer)', category: 'Plecy' },
  { id: 'ex-49', name: 'Narciarz (ściąganie na prostych r.)', category: 'Plecy' },
  { id: 'ex-51', name: 'Ściąganie na maszynie (Hammer/Iso-Lateral) - chwyt wąski/neutralny', category: 'Plecy' },

  // Nogi
  { id: 'ex-12', name: 'Przysiad ze sztangą na plecach (Back Squat)', category: 'Nogi' },
  { id: 'ex-13', name: 'Przysiad bułgarski', category: 'Nogi' },
  { id: 'ex-14', name: 'Wyciskanie na suwnicy (Leg Press)', category: 'Nogi' },
  { id: 'ex-15', name: 'Prostowanie nóg na maszynie', category: 'Nogi' },
  { id: 'ex-16', name: 'Uginanie nóg leżąc (Dwugłowe)', category: 'Nogi' },
  { id: 'ex-17', name: 'Wspięcia na palce stojąc', category: 'Nogi' },
  { id: 'ex-39', name: 'Mostki biodrowe (Hip Thrust)', category: 'Nogi' },
  { id: 'ex-45', name: 'Goblet Squat (z lekkim hantlem)', category: 'Nogi' },
  { id: 'ex-46', name: 'Wspięcia na palce siedząc', category: 'Nogi' },
  { id: 'ex-48', name: 'Odwodzenie nóg na maszynie siedząc', category: 'Nogi' },

  // Barki
  { id: 'ex-18', name: 'Wyciskanie żołnierskie (Overhead Press)', category: 'Barki' },
  { id: 'ex-19', name: 'Wyciskanie hantli siedząc', category: 'Barki' },
  { id: 'ex-20', name: 'Wznosy bokiem z hantlami', category: 'Barki' },
  { id: 'ex-21', name: 'Wznosy hantli w opadzie tułowia (Tył barku)', category: 'Barki' },
  { id: 'ex-22', name: 'Face pulls (wyciąg z liną)', category: 'Barki' },
  { id: 'ex-37', name: 'Wyciskanie na maszynie siedząc (barki)', category: 'Barki' },
  { id: 'ex-43', name: 'Wznosy bokiem na wyciągu (linka)', category: 'Barki' },
  { id: 'ex-50', name: 'Krzyżowanie linek wyciągu górnego (tył barku)', category: 'Barki' },

  // Ramiona (Biceps i Triceps)
  { id: 'ex-23', name: 'Uginanie ramion ze sztangą łamaną stojąc', category: 'Ramiona' },
  { id: 'ex-24', name: 'Uginanie z hantlami z supinacją', category: 'Ramiona' },
  { id: 'ex-25', name: 'Uginanie ramion z hantlami chwytem młotkowym', category: 'Ramiona' },
  { id: 'ex-26', name: 'Wyciskanie francuskie ze sztangą łamaną leżąc', category: 'Ramiona' },
  { id: 'ex-27', name: 'Prostowanie ramion na wyciągu (drążek)', category: 'Ramiona' },
  { id: 'ex-28', name: 'Dipy na poręczach (Tricepsowe)', category: 'Ramiona' },
  { id: 'ex-41', name: 'Uginanie na modlitewniku (sztanga/maszyna)', category: 'Ramiona' },
  { id: 'ex-44', name: 'Francuskie na wyciągu (linka nad głową)', category: 'Ramiona' },

  // Brzuch
  { id: 'ex-29', name: 'Deska (Plank)', category: 'Brzuch' },
  { id: 'ex-30', name: 'Allahy (spięcia brzucha na wyciągu)', category: 'Brzuch' },
  { id: 'ex-31', name: 'Wznosy nóg w zwisie na drążku', category: 'Brzuch' },
  { id: 'ex-32', name: 'Brzuszki na ławce skośnej', category: 'Brzuch' },
  { id: 'ex-52', name: 'Martwy robak (Dead Bug)', category: 'Brzuch' },

  // Kardio
  { id: 'ex-33', name: 'Bieganie (Bieżnia)', category: 'Kardio' },
  { id: 'ex-34', name: 'Jazda na rowerze stacjonarnym', category: 'Kardio' },
  { id: 'ex-35', name: 'Wioślarz (Ergometr)', category: 'Kardio' },
  { id: 'ex-36', name: 'Schody (Stairmaster)', category: 'Kardio' }
];

export const defaultTemplates: WorkoutTemplate[] = [
  {
    id: 'temp-ppl-push-a',
    name: 'Dzień 1: Push A (Siła - Klatka, Barki, Triceps)',
    planName: 'PPL Redukcja (Push/Pull)',
    tag: 'Siła - Klatka, Barki, Triceps',
    notes: 'Cel: Hipertrofia i Siła na redukcji (deficyt kaloryczny 2300 kcal). Skupienie na sile wielostawów góry ciała. Nogi realizowane osobno z fizjoterapeutą.',
    exercises: [
      {
        exerciseId: 'ex-1',
        name: 'Wyciskanie sztangi leżąc (poziom)',
        category: 'Klatka piersiowa',
        defaultSetsCount: 4,
        targetReps: '4-6',
        tempo: '2-0-1-0',
        rest: '120-150s'
      },
      {
        exerciseId: 'ex-37',
        name: 'Wyciskanie na maszynie siedząc (barki)',
        category: 'Barki',
        defaultSetsCount: 4,
        targetReps: '6-8',
        tempo: '2-0-1-0',
        rest: '120s'
      },
      {
        exerciseId: 'ex-38',
        name: 'Wyciskanie sztangi na skosie dodatnim',
        category: 'Klatka piersiowa',
        defaultSetsCount: 3,
        targetReps: '8-10',
        tempo: '3-0-1-1',
        rest: '90s'
      },
      {
        exerciseId: 'ex-20',
        name: 'Wznosy bokiem z hantlami',
        category: 'Barki',
        defaultSetsCount: 4,
        targetReps: '12-15',
        tempo: '2-0-1-1',
        rest: '60s'
      },
      {
        exerciseId: 'ex-27',
        name: 'Prostowanie ramion na wyciągu (drążek)',
        category: 'Ramiona',
        defaultSetsCount: 3,
        targetReps: '8-12',
        tempo: '2-0-1-1',
        rest: '90s'
      }
    ]
  },
  {
    id: 'temp-ppl-pull-a',
    name: 'Dzień 2: Pull A (Siła - Plecy, Tył barku, Biceps, Brzuch)',
    planName: 'PPL Redukcja (Push/Pull)',
    tag: 'Siła - Plecy, Tył barku, Biceps, Brzuch',
    notes: 'Cel: Hipertrofia i Siła na redukcji (deficyt kaloryczny 2300 kcal). Ćwiczenia siłowe na plecy i tył barku. Martwy robak na stabilizację core.',
    exercises: [
      {
        exerciseId: 'ex-7',
        name: 'Podciąganie na drążku (lub wyciąg)',
        category: 'Plecy',
        defaultSetsCount: 4,
        targetReps: '4-6',
        tempo: '2-0-1-1',
        rest: '120-150s'
      },
      {
        exerciseId: 'ex-11',
        name: 'Wiosłowanie na wyciągu dolnym siedząc',
        category: 'Plecy',
        defaultSetsCount: 4,
        targetReps: '6-8',
        tempo: '2-0-1-1',
        rest: '120s'
      },
      {
        exerciseId: 'ex-51',
        name: 'Ściąganie na maszynie (Hammer/Iso-Lateral) - chwyt wąski/neutralny',
        category: 'Plecy',
        defaultSetsCount: 3,
        targetReps: '10-12',
        tempo: '3-0-1-1',
        rest: '90s'
      },
      {
        exerciseId: 'ex-22',
        name: 'Face pulls (wyciąg z liną)',
        category: 'Barki',
        defaultSetsCount: 3,
        targetReps: '15',
        tempo: '2-0-1-2',
        rest: '60s'
      },
      {
        exerciseId: 'ex-41',
        name: 'Uginanie na modlitewniku (sztanga/maszyna)',
        category: 'Ramiona',
        defaultSetsCount: 3,
        targetReps: '8-10',
        tempo: '3-0-1-0',
        rest: '90s'
      },
      {
        exerciseId: 'ex-52',
        name: 'Martwy robak (Dead Bug)',
        category: 'Brzuch',
        defaultSetsCount: 3,
        targetReps: '10-12 na stronę',
        tempo: '2-0-2-0',
        rest: '60s'
      }
    ]
  },
  {
    id: 'temp-ppl-push-b',
    name: 'Dzień 4: Push B (Hipertrofia - Klatka, Barki, Triceps)',
    planName: 'PPL Redukcja (Push/Pull)',
    tag: 'Hipertrofia - Klatka, Barki, Triceps',
    notes: 'Cel: Hipertrofia na redukcji (deficyt kaloryczny 2300 kcal). Większa objętość, kontrolowane tempo i izolacje (klatka, barki, triceps).',
    exercises: [
      {
        exerciseId: 'ex-42',
        name: 'Wyciskanie na maszynie (klatka - płasko)',
        category: 'Klatka piersiowa',
        defaultSetsCount: 4,
        targetReps: '8-10',
        tempo: '3-0-1-1',
        rest: '90s'
      },
      {
        exerciseId: 'ex-3',
        name: 'Rozpiętki na maszynie (Pec Deck)',
        category: 'Klatka piersiowa',
        defaultSetsCount: 3,
        targetReps: '12-15',
        tempo: '2-1-1-1',
        rest: '60s'
      },
      {
        exerciseId: 'ex-43',
        name: 'Wznosy bokiem na wyciągu (linka)',
        category: 'Barki',
        defaultSetsCount: 4,
        targetReps: '12-15',
        tempo: '2-0-1-1',
        rest: '60s'
      },
      {
        exerciseId: 'ex-44',
        name: 'Francuskie na wyciągu (linka nad głową)',
        category: 'Ramiona',
        defaultSetsCount: 3,
        targetReps: '12-15',
        tempo: '2-0-1-1',
        rest: '60s'
      }
    ]
  },
  {
    id: 'temp-ppl-pull-b',
    name: 'Dzień 5: Pull B (Hipertrofia - Plecy, Tył barku, Biceps, Brzuch)',
    planName: 'PPL Redukcja (Push/Pull)',
    tag: 'Hipertrofia - Plecy, Tył barku, Biceps, Brzuch',
    notes: 'Cel: Hipertrofia na redukcji (deficyt kaloryczny 2300 kcal). Pompujące ćwiczenia na plecy, tył barku, biceps oraz spięcia brzucha (Allahy).',
    exercises: [
      {
        exerciseId: 'ex-47',
        name: 'Wiosłowanie na maszynie (Hammer)',
        category: 'Plecy',
        defaultSetsCount: 4,
        targetReps: '8-12',
        tempo: '3-0-1-1',
        rest: '90s'
      },
      {
        exerciseId: 'ex-10',
        name: 'Ściąganie drążka szeroko (nachwyt)',
        category: 'Plecy',
        defaultSetsCount: 3,
        targetReps: '10-12',
        tempo: '3-0-1-1',
        rest: '90s'
      },
      {
        exerciseId: 'ex-49',
        name: 'Narciarz (ściąganie na prostych r.)',
        category: 'Plecy',
        defaultSetsCount: 3,
        targetReps: '12-15',
        tempo: '2-0-1-1',
        rest: '60s'
      },
      {
        exerciseId: 'ex-50',
        name: 'Krzyżowanie linek wyciągu górnego (tył barku)',
        category: 'Barki',
        defaultSetsCount: 3,
        targetReps: '15',
        tempo: '2-0-1-1',
        rest: '60s'
      },
      {
        exerciseId: 'ex-24',
        name: 'Uginanie z hantlami z supinacją',
        category: 'Ramiona',
        defaultSetsCount: 3,
        targetReps: '10-12',
        tempo: '3-0-1-1',
        rest: '90s'
      },
      {
        exerciseId: 'ex-30',
        name: 'Allahy (spięcia brzucha na wyciągu)',
        category: 'Brzuch',
        defaultSetsCount: 3,
        targetReps: '15-20',
        tempo: '2-0-1-1',
        rest: '60s'
      }
    ]
  },
  {
    id: 'temp-1',
    name: 'FBW (Full Body Workout) - Trening A',
    planName: 'FBW Classic',
    exercises: [
      { exerciseId: 'ex-12', name: 'Przysiad ze sztangą na plecach (Back Squat)', category: 'Nogi', defaultSetsCount: 4 },
      { exerciseId: 'ex-1', name: 'Wyciskanie sztangi leżąc (poziom)', category: 'Klatka piersiowa', defaultSetsCount: 4 },
      { exerciseId: 'ex-8', name: 'Wiosłowanie sztangą w opadzie tułowia', category: 'Plecy', defaultSetsCount: 4 },
      { exerciseId: 'ex-18', name: 'Wyciskanie żołnierskie (Overhead Press)', category: 'Barki', defaultSetsCount: 3 },
      { exerciseId: 'ex-23', name: 'Uginanie ramion ze sztangą łamaną stojąc', category: 'Ramiona', defaultSetsCount: 3 }
    ],
    notes: 'Trening ogólnorozwojowy skupiony na wielostawach.'
  }
];
