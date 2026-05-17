'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const Patient  = require('../src/models/paciente.model');
const Session  = require('../src/models/sesion.model');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URI_LOCAL;

const daysAgo  = (d) => new Date(Date.now() - d * 86400000);
const daysAhead = (d) => new Date(Date.now() + d * 86400000);

// ── 10 Patients ───────────────────────────────────────────────────────────────
const patients = [
  {
    firstName: 'Carlos',    lastName: 'Méndez',
    birthDate: new Date('1985-03-12'), gender: 'male',
    contact: { phone: '8811-2233', email: 'carlos.mendez@email.com' },
    diagnosis: { type: 'Lumbalgia crónica', description: 'Hernia discal L4-L5 con irradiación a miembro inferior derecho', diagnosisDate: new Date('2024-01-10') },
    recoveryStatus: 'in_progress', recoveryLevel: 52,
  },
  {
    firstName: 'María',     lastName: 'Jiménez',
    birthDate: new Date('1992-07-25'), gender: 'female',
    contact: { phone: '8822-4455', email: 'maria.jimenez@email.com' },
    diagnosis: { type: 'Ruptura LCA', description: 'Ruptura parcial ligamento cruzado anterior rodilla derecha, post-quirúrgica semana 6', diagnosisDate: new Date('2024-03-05') },
    recoveryStatus: 'in_progress', recoveryLevel: 63,
  },
  {
    firstName: 'Andrés',    lastName: 'Solís',
    birthDate: new Date('1978-11-08'), gender: 'male',
    contact: { phone: '8833-6677', email: 'andres.solis@email.com' },
    diagnosis: { type: 'Fractura de clavícula', description: 'Fractura clavícula derecha post accidente de tránsito, fijación quirúrgica', diagnosisDate: new Date('2023-11-20') },
    recoveryStatus: 'advanced', recoveryLevel: 85,
  },
  {
    firstName: 'Lucía',     lastName: 'Vargas',
    birthDate: new Date('2001-05-17'), gender: 'female',
    contact: { phone: '8844-8899', email: 'lucia.vargas@email.com' },
    diagnosis: { type: 'Tendinitis rotuliana', description: 'Tendinitis rotuliana bilateral, mayor compromiso rodilla izquierda', diagnosisDate: new Date('2024-06-01') },
    recoveryStatus: 'in_progress', recoveryLevel: 38,
  },
  {
    firstName: 'Roberto',   lastName: 'Castillo',
    birthDate: new Date('1968-09-30'), gender: 'male',
    contact: { phone: '8855-0011', email: 'roberto.castillo@email.com' },
    diagnosis: { type: 'Secuelas ACV', description: 'Hemiparesia izquierda leve post accidente cerebrovascular isquémico', diagnosisDate: new Date('2023-08-15') },
    recoveryStatus: 'discharged', recoveryLevel: 96,
  },
  {
    firstName: 'Sofía',     lastName: 'Quesada',
    birthDate: new Date('1995-02-14'), gender: 'female',
    contact: { phone: '8866-1122', email: 'sofia.quesada@email.com' },
    diagnosis: { type: 'Escoliosis idiopática', description: 'Curva toracolumbar 28° Cobb, manejo conservador con ejercicio terapéutico', diagnosisDate: new Date('2024-04-20') },
    recoveryStatus: 'in_progress', recoveryLevel: 44,
  },
  {
    firstName: 'Diego',     lastName: 'Mora',
    birthDate: new Date('1990-08-03'), gender: 'male',
    contact: { phone: '8877-3344', email: 'diego.mora@email.com' },
    diagnosis: { type: 'Fractura de tobillo', description: 'Fractura bimaleolar tobillo izquierdo, 8 semanas post-ORIF', diagnosisDate: new Date('2024-05-01') },
    recoveryStatus: 'in_progress', recoveryLevel: 58,
  },
  {
    firstName: 'Valentina', lastName: 'Bravo',
    birthDate: new Date('1983-12-22'), gender: 'female',
    contact: { phone: '8888-5566', email: 'valentina.bravo@email.com' },
    diagnosis: { type: 'Lesión manguito rotador', description: 'Desgarro parcial supraespinoso hombro izquierdo, tratamiento conservador', diagnosisDate: new Date('2024-02-10') },
    recoveryStatus: 'advanced', recoveryLevel: 78,
  },
  {
    firstName: 'Mateo',     lastName: 'Herrera',
    birthDate: new Date('2003-09-11'), gender: 'male',
    contact: { phone: '8899-7788', email: 'mateo.herrera@email.com' },
    diagnosis: { type: 'Parálisis facial periférica', description: 'Parálisis de Bell, inicio 3 semanas, grado IV escala House-Brackmann', diagnosisDate: new Date('2024-07-15') },
    recoveryStatus: 'initial', recoveryLevel: 20,
  },
  {
    firstName: 'Carmen',    lastName: 'Ulate',
    birthDate: new Date('1957-04-05'), gender: 'female',
    contact: { phone: '8800-9900', email: 'carmen.ulate@email.com' },
    diagnosis: { type: 'Prótesis total de cadera', description: 'Artroplastia total cadera derecha por coxartrosis, 10 semanas post-op', diagnosisDate: new Date('2024-03-01') },
    recoveryStatus: 'in_progress', recoveryLevel: 67,
  },
];

// ── ~30 Sessions ──────────────────────────────────────────────────────────────
const buildSessions = (ids) => {
  const [carlos, maria, andres, lucia, roberto, sofia, diego, valentina, mateo, carmen] = ids;

  return [
    // ── Carlos Méndez — Lumbalgia (5 sesiones) ─────────────────────────────
    {
      patientId: carlos, date: daysAgo(42), sessionType: 'evaluation',
      therapist: 'Dra. Fernández', status: 'completed', durationMinutes: 50,
      painLevel: 8, overallScore: 32,
      clinicalNotes: 'Evaluación inicial. Flexión lumbar 30°, extensión dolorosa. Test SLR positivo derecho.',
      exercises: [
        { name: 'Estiramiento isquiotibiales', sets: 3, reps: 10, score: 35 },
        { name: 'Cat-Cow movilización lumbar', sets: 2, reps: 8, score: 30 },
      ],
    },
    {
      patientId: carlos, date: daysAgo(28), sessionType: 'therapy',
      therapist: 'Dra. Fernández', status: 'completed', durationMinutes: 60,
      painLevel: 6, overallScore: 48,
      clinicalNotes: 'Mejora en rango de flexión (45°). Inicia trabajo de estabilización central.',
      exercises: [
        { name: 'Puente glúteo', sets: 3, reps: 12, score: 55 },
        { name: 'Plancha abdominal', sets: 3, durationSeconds: 20, score: 45 },
        { name: 'Bird-dog', sets: 2, reps: 10, score: 44 },
      ],
    },
    {
      patientId: carlos, date: daysAgo(14), sessionType: 'strengthening',
      therapist: 'Dra. Fernández', status: 'completed', durationMinutes: 60,
      painLevel: 4, overallScore: 62,
      clinicalNotes: 'Tolerancia buena al ejercicio. Flexión 65°. Reduce analgésicos.',
      exercises: [
        { name: 'Sentadilla asistida', sets: 3, reps: 10, biomechanics: { kneeAngle: 70, symmetry: 80 }, score: 65 },
        { name: 'Puente glúteo con carga', sets: 3, reps: 12, score: 62 },
        { name: 'Plancha lateral', sets: 2, durationSeconds: 25, score: 58 },
      ],
    },
    {
      patientId: carlos, date: daysAgo(5), sessionType: 'strengthening',
      therapist: 'Dra. Fernández', status: 'completed', durationMinutes: 65,
      painLevel: 3, overallScore: 72,
      clinicalNotes: 'Progreso sostenido. Activo laboralmente desde esta semana.',
      exercises: [
        { name: 'Sentadilla libre', sets: 3, reps: 12, biomechanics: { kneeAngle: 85, symmetry: 88 }, score: 75 },
        { name: 'Peso muerto ligero', sets: 3, reps: 8, score: 70 },
        { name: 'Plancha abdominal', sets: 3, durationSeconds: 35, score: 72 },
      ],
    },
    {
      patientId: carlos, date: daysAhead(3), sessionType: 'strengthening',
      therapist: 'Dra. Fernández', status: 'scheduled', durationMinutes: 60,
      clinicalNotes: 'Próxima sesión programada. Continuar progresión de carga.',
    },

    // ── María Jiménez — Rodilla LCA (5 sesiones) ───────────────────────────
    {
      patientId: maria, date: daysAgo(35), sessionType: 'evaluation',
      therapist: 'Dr. Araya', status: 'completed', durationMinutes: 50,
      painLevel: 7, overallScore: 40,
      clinicalNotes: 'Post-op semana 6. Flexión activa 70°. Edema moderado. Marcha con bastón.',
      exercises: [
        { name: 'Flexión pasiva rodilla', sets: 3, reps: 10, biomechanics: { kneeAngle: 70 }, score: 42 },
        { name: 'Contracción cuádriceps isométrica', sets: 3, reps: 15, score: 38 },
      ],
    },
    {
      patientId: maria, date: daysAgo(21), sessionType: 'therapy',
      therapist: 'Dr. Araya', status: 'completed', durationMinutes: 55,
      painLevel: 5, overallScore: 55,
      clinicalNotes: 'Flexión activa 90°. Descarta bastón para interiores. Inicia propiocepción básica.',
      exercises: [
        { name: 'Flexión activa rodilla', sets: 3, reps: 12, biomechanics: { kneeAngle: 90 }, score: 58 },
        { name: 'Step-up 10 cm', sets: 3, reps: 10, score: 52 },
        { name: 'Equilibrio bipodal', sets: 3, durationSeconds: 30, biomechanics: { symmetry: 75 }, score: 55 },
      ],
    },
    {
      patientId: maria, date: daysAgo(10), sessionType: 'strengthening',
      therapist: 'Dr. Araya', status: 'completed', durationMinutes: 60,
      painLevel: 3, overallScore: 66,
      clinicalNotes: 'Excelente evolución. Flexión 115°. Inicia trote suave en cinta.',
      exercises: [
        { name: 'Prensa de pierna', sets: 3, reps: 12, score: 68 },
        { name: 'Step-up 20 cm', sets: 3, reps: 10, score: 65 },
        { name: 'Equilibrio monopodal', sets: 3, durationSeconds: 20, biomechanics: { symmetry: 83 }, score: 64 },
        { name: 'Trote cinta 5 km/h', sets: 1, durationSeconds: 300, score: 68 },
      ],
    },
    {
      patientId: maria, date: daysAgo(2), sessionType: 'strengthening',
      therapist: 'Dr. Araya', status: 'completed', durationMinutes: 65,
      painLevel: 2, overallScore: 74,
      clinicalNotes: 'Flexión completa 130°. Propone alta en 3 semanas si progresión continúa.',
      exercises: [
        { name: 'Sentadilla profunda', sets: 3, reps: 10, biomechanics: { kneeAngle: 130, symmetry: 90 }, score: 75 },
        { name: 'Zancada frontal', sets: 3, reps: 8, score: 73 },
        { name: 'Salto bipodal', sets: 3, reps: 10, score: 72 },
      ],
    },
    {
      patientId: maria, date: daysAhead(5), sessionType: 'evaluation',
      therapist: 'Dr. Araya', status: 'scheduled', durationMinutes: 50,
      clinicalNotes: 'Evaluación funcional previo a alta deportiva.',
    },

    // ── Andrés Solís — Hombro (3 sesiones) ────────────────────────────────
    {
      patientId: andres, date: daysAgo(30), sessionType: 'therapy',
      therapist: 'Lic. Mora', status: 'completed', durationMinutes: 45,
      painLevel: 3, overallScore: 76,
      clinicalNotes: 'Rotación externa 60°. Fuerza 4/5 deltoides. Mantenimiento.',
      exercises: [
        { name: 'Rotación externa con banda', sets: 3, reps: 15, biomechanics: { shoulderAngle: 60 }, score: 78 },
        { name: 'Elevación lateral', sets: 3, reps: 12, score: 75 },
        { name: 'Press de hombro ligero', sets: 2, reps: 10, score: 74 },
      ],
    },
    {
      patientId: andres, date: daysAgo(12), sessionType: 'stretching',
      therapist: 'Lic. Mora', status: 'completed', durationMinutes: 40,
      painLevel: 2, overallScore: 86,
      clinicalNotes: 'Amplitud articular casi completa. Abducción 170°. Preparando alta.',
      exercises: [
        { name: 'Estiramiento posterior hombro', sets: 3, reps: 10, biomechanics: { shoulderAngle: 170 }, score: 88 },
        { name: 'Movilización pendular', sets: 2, durationSeconds: 60, score: 85 },
        { name: 'Rotación interna con banda', sets: 3, reps: 15, score: 85 },
      ],
    },
    {
      patientId: andres, date: daysAhead(7), sessionType: 'evaluation',
      therapist: 'Lic. Mora', status: 'scheduled', durationMinutes: 45,
      clinicalNotes: 'Evaluación final. Alta planificada si mantiene progreso.',
    },

    // ── Lucía Vargas — Tendinitis (4 sesiones) ─────────────────────────────
    {
      patientId: lucia, date: daysAgo(18), sessionType: 'evaluation',
      therapist: 'Dra. Fernández', status: 'completed', durationMinutes: 45,
      painLevel: 8, overallScore: 22,
      clinicalNotes: 'Inflamación activa ambas rodillas. Test de Clarke positivo. Inicia protocolo RICE.',
      exercises: [
        { name: 'Extensión isométrica rodilla', sets: 2, reps: 8, score: 25 },
        { name: 'Estiramiento cuádriceps en decúbito', sets: 3, durationSeconds: 30, score: 20 },
      ],
    },
    {
      patientId: lucia, date: daysAgo(9), sessionType: 'therapy',
      therapist: 'Dra. Fernández', status: 'completed', durationMinutes: 45,
      painLevel: 6, overallScore: 38,
      clinicalNotes: 'Reducción de edema notable. Inicia fortalecimiento excéntrico suave.',
      exercises: [
        { name: 'Sentadilla excéntrica lenta', sets: 3, reps: 10, score: 40 },
        { name: 'Estiramiento cuádriceps bipodal', sets: 3, durationSeconds: 40, score: 36 },
        { name: 'Electroterapia TENS', sets: 1, durationSeconds: 600, score: 38 },
      ],
    },
    {
      patientId: lucia, date: daysAgo(2), sessionType: 'strengthening',
      therapist: 'Dra. Fernández', status: 'completed', durationMinutes: 50,
      painLevel: 4, overallScore: 50,
      clinicalNotes: 'Buena tolerancia al ejercicio excéntrico. Inicia actividad deportiva suave.',
      exercises: [
        { name: 'Sentadilla excéntrica con carga', sets: 3, reps: 12, biomechanics: { kneeAngle: 60 }, score: 52 },
        { name: 'Prensa de pierna', sets: 3, reps: 10, score: 50 },
        { name: 'Step-down', sets: 3, reps: 8, score: 48 },
      ],
    },
    {
      patientId: lucia, date: daysAhead(4), sessionType: 'strengthening',
      therapist: 'Dra. Fernández', status: 'scheduled', durationMinutes: 50,
      clinicalNotes: 'Continuar protocolo excéntrico. Evaluar retorno a entrenamiento.',
    },

    // ── Sofía Quesada — Escoliosis (3 sesiones) ────────────────────────────
    {
      patientId: sofia, date: daysAgo(25), sessionType: 'evaluation',
      therapist: 'Lic. Mora', status: 'completed', durationMinutes: 60,
      painLevel: 4, overallScore: 40,
      clinicalNotes: 'Curva toracolumbar 28° Cobb. Asimetría de hombros 15 mm. Inicia método Schroth.',
      exercises: [
        { name: 'Corrección postural en espejo', sets: 3, durationSeconds: 60, score: 38 },
        { name: 'Respiración rotatoria Schroth', sets: 3, reps: 10, score: 42 },
      ],
    },
    {
      patientId: sofia, date: daysAgo(11), sessionType: 'therapy',
      therapist: 'Lic. Mora', status: 'completed', durationMinutes: 60,
      painLevel: 3, overallScore: 52,
      clinicalNotes: 'Mejora en conciencia postural. Asimetría 10 mm. Dolor reducido.',
      exercises: [
        { name: 'Estiramiento en derotación', sets: 3, durationSeconds: 45, score: 55 },
        { name: 'Fortalecimiento concavidad', sets: 3, reps: 12, biomechanics: { symmetry: 70 }, score: 50 },
        { name: 'Ejercicio en barra', sets: 2, durationSeconds: 30, score: 52 },
      ],
    },
    {
      patientId: sofia, date: daysAhead(2), sessionType: 'therapy',
      therapist: 'Lic. Mora', status: 'scheduled', durationMinutes: 60,
      clinicalNotes: 'Agregar ejercicios de estabilización en colchoneta.',
    },

    // ── Diego Mora — Tobillo (3 sesiones) ──────────────────────────────────
    {
      patientId: diego, date: daysAgo(20), sessionType: 'evaluation',
      therapist: 'Dr. Araya', status: 'completed', durationMinutes: 45,
      painLevel: 6, overallScore: 45,
      clinicalNotes: 'Post-ORIF 8 semanas. Descarga parcial permitida. Flexión plantar 20°.',
      exercises: [
        { name: 'Movilización tobillo activo-asistida', sets: 3, reps: 10, biomechanics: { ankleAngle: 20 }, score: 45 },
        { name: 'Bombeo de pantorrilla', sets: 3, reps: 20, score: 46 },
      ],
    },
    {
      patientId: diego, date: daysAgo(7), sessionType: 'therapy',
      therapist: 'Dr. Araya', status: 'completed', durationMinutes: 55,
      painLevel: 4, overallScore: 60,
      clinicalNotes: 'Carga completa tolerada. Flexión dorsal 10°, plantar 35°. Inicia marcha sin ayuda.',
      exercises: [
        { name: 'Elevación de talones', sets: 3, reps: 15, biomechanics: { ankleAngle: 35 }, score: 62 },
        { name: 'Equilibrio tobillo en superficie inestable', sets: 3, durationSeconds: 30, score: 58 },
        { name: 'Marcha en rampa', sets: 3, durationSeconds: 120, score: 60 },
      ],
    },
    {
      patientId: diego, date: daysAhead(1), sessionType: 'strengthening',
      therapist: 'Dr. Araya', status: 'scheduled', durationMinutes: 55,
      clinicalNotes: 'Agregar trote suave y cambios de dirección.',
    },

    // ── Valentina Bravo — Manguito Rotador (3 sesiones) ────────────────────
    {
      patientId: valentina, date: daysAgo(33), sessionType: 'therapy',
      therapist: 'Lic. Mora', status: 'completed', durationMinutes: 50,
      painLevel: 5, overallScore: 58,
      clinicalNotes: 'Arco doloroso 70°–120°. Fuerza supraespinoso 3+/5. Inicia RICE + ejercicio.',
      exercises: [
        { name: 'Rotación interna isométrica', sets: 3, reps: 12, biomechanics: { shoulderAngle: 70 }, score: 58 },
        { name: 'Estiramiento cápsula posterior', sets: 3, durationSeconds: 30, score: 60 },
      ],
    },
    {
      patientId: valentina, date: daysAgo(15), sessionType: 'strengthening',
      therapist: 'Lic. Mora', status: 'completed', durationMinutes: 55,
      painLevel: 3, overallScore: 72,
      clinicalNotes: 'Arco doloroso reducido 80°–100°. Fuerza 4/5. Buena respuesta.',
      exercises: [
        { name: 'Press de hombro con banda', sets: 3, reps: 12, biomechanics: { shoulderAngle: 100 }, score: 74 },
        { name: 'Remo con banda', sets: 3, reps: 12, score: 72 },
        { name: 'Rotación externa con banda', sets: 3, reps: 15, score: 70 },
      ],
    },
    {
      patientId: valentina, date: daysAgo(3), sessionType: 'strengthening',
      therapist: 'Lic. Mora', status: 'completed', durationMinutes: 55,
      painLevel: 2, overallScore: 80,
      clinicalNotes: 'Sin arco doloroso. Fuerza 4+/5. Regresa a actividades laborales completas.',
      exercises: [
        { name: 'Press militar libre', sets: 3, reps: 10, biomechanics: { shoulderAngle: 160 }, score: 82 },
        { name: 'Dominadas asistidas', sets: 3, reps: 6, score: 78 },
        { name: 'Rotación externa con mancuerna', sets: 3, reps: 12, score: 80 },
      ],
    },

    // ── Mateo Herrera — Parálisis Facial (2 sesiones) ──────────────────────
    {
      patientId: mateo, date: daysAgo(10), sessionType: 'evaluation',
      therapist: 'Dra. Fernández', status: 'completed', durationMinutes: 40,
      painLevel: 2, overallScore: 20,
      clinicalNotes: 'Parálisis Bell grado IV HB. Sin oclusión ocular completa. Inicia masajes y electroestimulación.',
      exercises: [
        { name: 'Masaje facial suave', sets: 2, durationSeconds: 120, score: 22 },
        { name: 'Ejercicios de mímica guiados', sets: 3, reps: 10, score: 18 },
      ],
    },
    {
      patientId: mateo, date: daysAgo(3), sessionType: 'therapy',
      therapist: 'Dra. Fernández', status: 'completed', durationMinutes: 40,
      painLevel: 1, overallScore: 35,
      clinicalNotes: 'Movimiento incipiente en frente y mejilla. Oclusión ocular 80%. Progresa a grado III HB.',
      exercises: [
        { name: 'Fruncido de cejas activo-asistido', sets: 3, reps: 10, score: 38 },
        { name: 'Sonrisa forzada con espejo', sets: 3, reps: 12, score: 32 },
        { name: 'Electroestimulación facial', sets: 1, durationSeconds: 900, score: 35 },
      ],
    },

    // ── Carmen Ulate — Prótesis Cadera (3 sesiones) ────────────────────────
    {
      patientId: carmen, date: daysAgo(28), sessionType: 'evaluation',
      therapist: 'Dr. Araya', status: 'completed', durationMinutes: 60,
      painLevel: 5, overallScore: 52,
      clinicalNotes: 'Post-artroplastia 10 semanas. Marcha con bastón. Flexión cadera 85°. Sin luxación.',
      exercises: [
        { name: 'Abducción cadera en decúbito', sets: 3, reps: 15, score: 55 },
        { name: 'Extensión cadera de pie', sets: 3, reps: 12, score: 50 },
        { name: 'Marcha con bastón en pasillo', sets: 2, durationSeconds: 120, score: 52 },
      ],
    },
    {
      patientId: carmen, date: daysAgo(12), sessionType: 'strengthening',
      therapist: 'Dr. Araya', status: 'completed', durationMinutes: 60,
      painLevel: 3, overallScore: 65,
      clinicalNotes: 'Flexión cadera 100°. Descarta bastón en interiores. Sube escaleras con apoyo.',
      exercises: [
        { name: 'Sentadilla en silla', sets: 3, reps: 12, biomechanics: { symmetry: 78 }, score: 68 },
        { name: 'Step-up 10 cm', sets: 3, reps: 10, score: 64 },
        { name: 'Bicicleta estática 10 min', sets: 1, durationSeconds: 600, score: 63 },
      ],
    },
    {
      patientId: carmen, date: daysAhead(3), sessionType: 'strengthening',
      therapist: 'Dr. Araya', status: 'scheduled', durationMinutes: 60,
      clinicalNotes: 'Objetivo: subir escaleras sin apoyo y marcha exterior independiente.',
    },

    // ── Roberto Castillo — Dado de alta (1 sesión de cierre) ───────────────
    {
      patientId: roberto, date: daysAgo(60), sessionType: 'evaluation',
      therapist: 'Dr. Araya', status: 'completed', durationMinutes: 60,
      painLevel: 1, overallScore: 94,
      clinicalNotes: 'Sesión de alta. Marcha simétrica independiente. Fuerza 5/5 bilateral. ALTA DEFINITIVA.',
      exercises: [
        { name: 'Marcha en cinta 6 km/h', sets: 1, durationSeconds: 600, biomechanics: { symmetry: 95 }, score: 95 },
        { name: 'Equilibrio monopodal 30s', sets: 3, durationSeconds: 30, biomechanics: { symmetry: 93 }, score: 94 },
        { name: 'Escaleras 3 pisos', sets: 2, durationSeconds: 120, score: 93 },
      ],
    },
  ];
};

// ── Run ───────────────────────────────────────────────────────────────────────
const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await Patient.deleteMany({});
  await Session.deleteMany({});
  console.log('Collections cleared');

  const created = await Patient.insertMany(patients);
  console.log(`${created.length} patients inserted`);

  const sessions = buildSessions(created.map((p) => p._id));
  const createdSessions = await Session.insertMany(sessions);
  console.log(`${createdSessions.length} sessions inserted`);

  console.log('\nPatient IDs:');
  created.forEach((p) => console.log(`  ${p.firstName} ${p.lastName}: ${p._id}`));

  await mongoose.disconnect();
  console.log('\nDone.');
};

seed().catch((err) => { console.error('Seed error:', err.message); process.exit(1); });
