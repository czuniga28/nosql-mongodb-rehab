'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const Patient  = require('../src/models/paciente.model');
const Session  = require('../src/models/sesion.model');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URI_LOCAL;

const patients = [
  {
    firstName: 'Carlos',
    lastName: 'Méndez',
    birthDate: new Date('1985-03-12'),
    gender: 'male',
    contact: { phone: '8811-2233', email: 'carlos.mendez@email.com' },
    diagnosis: { type: 'Lumbalgia crónica', description: 'Dolor lumbar recurrente por hernia discal L4-L5', diagnosisDate: new Date('2024-01-10') },
    recoveryStatus: 'in_progress',
    recoveryLevel: 45,
  },
  {
    firstName: 'María',
    lastName: 'Jiménez',
    birthDate: new Date('1992-07-25'),
    gender: 'female',
    contact: { phone: '8822-4455', email: 'maria.jimenez@email.com' },
    diagnosis: { type: 'Lesión de rodilla', description: 'Ruptura parcial de ligamento cruzado anterior', diagnosisDate: new Date('2024-03-05') },
    recoveryStatus: 'in_progress',
    recoveryLevel: 60,
  },
  {
    firstName: 'Andrés',
    lastName: 'Solís',
    birthDate: new Date('1978-11-08'),
    gender: 'male',
    contact: { phone: '8833-6677', email: 'andres.solis@email.com' },
    diagnosis: { type: 'Fractura de hombro', description: 'Fractura de clavícula derecha post accidente', diagnosisDate: new Date('2023-11-20') },
    recoveryStatus: 'advanced',
    recoveryLevel: 82,
  },
  {
    firstName: 'Lucía',
    lastName: 'Vargas',
    birthDate: new Date('2001-05-17'),
    gender: 'female',
    contact: { phone: '8844-8899', email: 'lucia.vargas@email.com' },
    diagnosis: { type: 'Tendinitis', description: 'Tendinitis rotuliana rodilla izquierda', diagnosisDate: new Date('2024-06-01') },
    recoveryStatus: 'initial',
    recoveryLevel: 15,
  },
  {
    firstName: 'Roberto',
    lastName: 'Castillo',
    birthDate: new Date('1968-09-30'),
    gender: 'male',
    contact: { phone: '8855-0011', email: 'roberto.castillo@email.com' },
    diagnosis: { type: 'ACV leve', description: 'Recuperación motora post accidente cerebrovascular', diagnosisDate: new Date('2023-08-15') },
    recoveryStatus: 'discharged',
    recoveryLevel: 95,
  },
];

const buildSessions = (patientIds) => {
  const [carlos, maria, andres, lucia, roberto] = patientIds;
  const now = new Date();
  const daysAgo = (d) => new Date(now - d * 86400000);

  return [
    // Carlos — lumbalgia
    {
      patientId: carlos,
      date: daysAgo(28),
      sessionType: 'evaluation',
      therapist: 'Dra. Fernández',
      status: 'completed',
      durationMinutes: 45,
      painLevel: 7,
      overallScore: 40,
      clinicalNotes: 'Evaluación inicial. Rango de movimiento lumbar reducido.',
      exercises: [
        { name: 'Estiramiento de isquiotibiales', sets: 3, reps: 10, score: 40, notes: 'Dolor moderado al extender' },
        { name: 'Puente glúteo', sets: 2, reps: 8, score: 50 },
      ],
    },
    {
      patientId: carlos,
      date: daysAgo(14),
      sessionType: 'therapy',
      therapist: 'Dra. Fernández',
      status: 'completed',
      durationMinutes: 60,
      painLevel: 5,
      overallScore: 55,
      clinicalNotes: 'Mejora notable. Dolor reducido con movilización.',
      exercises: [
        { name: 'Puente glúteo', sets: 3, reps: 12, score: 60 },
        { name: 'Plancha abdominal', sets: 3, durationSeconds: 20, score: 55 },
      ],
    },
    {
      patientId: carlos,
      date: daysAgo(3),
      sessionType: 'strengthening',
      therapist: 'Dra. Fernández',
      status: 'completed',
      durationMinutes: 60,
      painLevel: 3,
      overallScore: 70,
      clinicalNotes: 'Progreso sostenido. Inicia trabajo de fuerza.',
      exercises: [
        { name: 'Sentadilla asistida', sets: 3, reps: 10, score: 70 },
        { name: 'Plancha abdominal', sets: 3, durationSeconds: 30, score: 75 },
        { name: 'Puente glúteo', sets: 3, reps: 15, score: 72 },
      ],
    },

    // María — rodilla
    {
      patientId: maria,
      date: daysAgo(21),
      sessionType: 'evaluation',
      therapist: 'Dr. Araya',
      status: 'completed',
      durationMinutes: 50,
      painLevel: 6,
      overallScore: 45,
      clinicalNotes: 'Post-operatorio semana 4. Movilidad pasiva 60°.',
      exercises: [
        { name: 'Flexión pasiva de rodilla', sets: 3, reps: 10, biomechanics: { kneeAngle: 60 }, score: 45 },
        { name: 'Contracción cuádriceps isométrica', sets: 3, reps: 10, score: 55 },
      ],
    },
    {
      patientId: maria,
      date: daysAgo(7),
      sessionType: 'strengthening',
      therapist: 'Dr. Araya',
      status: 'completed',
      durationMinutes: 55,
      painLevel: 4,
      overallScore: 65,
      clinicalNotes: 'Flexión activa alcanza 90°. Buena evolución.',
      exercises: [
        { name: 'Flexión activa de rodilla', sets: 3, reps: 12, biomechanics: { kneeAngle: 90 }, score: 65 },
        { name: 'Prensa de pierna', sets: 3, reps: 10, score: 60 },
        { name: 'Step-up', sets: 3, reps: 8, score: 70 },
      ],
    },

    // Andrés — hombro
    {
      patientId: andres,
      date: daysAgo(10),
      sessionType: 'stretching',
      therapist: 'Lic. Mora',
      status: 'completed',
      durationMinutes: 40,
      painLevel: 2,
      overallScore: 80,
      clinicalNotes: 'Rango de movimiento casi completo. Preparando alta.',
      exercises: [
        { name: 'Rotación interna hombro', sets: 3, reps: 15, biomechanics: { shoulderAngle: 170 }, score: 85 },
        { name: 'Elevación frontal', sets: 3, reps: 12, score: 80 },
      ],
    },

    // Lucía — tendinitis
    {
      patientId: lucia,
      date: daysAgo(5),
      sessionType: 'evaluation',
      therapist: 'Dra. Fernández',
      status: 'completed',
      durationMinutes: 45,
      painLevel: 8,
      overallScore: 20,
      clinicalNotes: 'Inflamación activa. Inicio con crioterapia y reposo activo.',
      exercises: [
        { name: 'Extensión isométrica de rodilla', sets: 2, reps: 8, score: 25 },
      ],
    },
    {
      patientId: lucia,
      date: daysAgo(1),
      sessionType: 'therapy',
      therapist: 'Dra. Fernández',
      status: 'scheduled',
      durationMinutes: 45,
      painLevel: 6,
      clinicalNotes: 'Reducción de inflamación observada.',
    },

    // Roberto — post ACV
    {
      patientId: roberto,
      date: daysAgo(60),
      sessionType: 'therapy',
      therapist: 'Dr. Araya',
      status: 'completed',
      durationMinutes: 60,
      painLevel: 1,
      overallScore: 90,
      clinicalNotes: 'Última sesión antes del alta. Marcha independiente restaurada.',
      exercises: [
        { name: 'Marcha en cinta', sets: 1, durationSeconds: 600, biomechanics: { symmetry: 92 }, score: 90 },
        { name: 'Equilibrio monopodal', sets: 3, durationSeconds: 30, score: 88 },
      ],
    },
  ];
};

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await Patient.deleteMany({});
  await Session.deleteMany({});
  console.log('Collections cleared');

  const createdPatients = await Patient.insertMany(patients);
  console.log(`${createdPatients.length} patients inserted`);

  const patientIds = createdPatients.map((p) => p._id);
  const sessions = buildSessions(patientIds);
  const createdSessions = await Session.insertMany(sessions);
  console.log(`${createdSessions.length} sessions inserted`);

  console.log('\nSeed data IDs:');
  createdPatients.forEach((p) => {
    console.log(`  ${p.firstName} ${p.lastName}: ${p._id}`);
  });

  await mongoose.disconnect();
  console.log('\nDone. Database seeded successfully.');
};

seed().catch((err) => {
  console.error('Seed error:', err.message);
  process.exit(1);
});
