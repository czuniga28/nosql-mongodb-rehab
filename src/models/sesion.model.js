'use strict';

const mongoose = require('mongoose');

// ── Sub-schema: datos biomecánicos por ejercicio ─────────────────────────────
const ejercicioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del ejercicio es obligatorio'],
      trim: true,
    },
    series: { type: Number, min: 1 },
    repeticiones: { type: Number, min: 0 },
    duracionSegundos: { type: Number, min: 0 },
    // Datos biomecánicos capturados (p.ej. ángulos de articulaciones)
    biomecanica: {
      anguloRodilla: { type: Number },       // grados
      anguloHombro: { type: Number },        // grados
      anguloTobillo: { type: Number },       // grados
      simetria: { type: Number, min: 0, max: 100 }, // % simetría corporal
    },
    // Puntuación del ejercicio individual (0–100)
    puntuacion: { type: Number, min: 0, max: 100 },
    notas: { type: String, trim: true },
  },
  { _id: false } // No genera _id para cada subdocumento
);

// ── Schema principal: Sesion ─────────────────────────────────────────────────
const sesionSchema = new mongoose.Schema(
  {
    pacienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paciente',
      required: [true, 'El paciente es obligatorio'],
      index: true,
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha de la sesión es obligatoria'],
      default: Date.now,
    },
    tipoSesion: {
      type: String,
      enum: ['evaluacion', 'terapia', 'fortalecimiento', 'estiramientos', 'cardio', 'otro'],
      required: [true, 'El tipo de sesión es obligatorio'],
    },
    terapeuta: {
      type: String,
      trim: true,
    },
    estado: {
      type: String,
      enum: ['programada', 'en_curso', 'completada', 'cancelada'],
      default: 'programada',
    },
    duracionMinutos: {
      type: Number,
      min: [1, 'La duración mínima es 1 minuto'],
    },
    // Lista de ejercicios realizados en la sesión
    ejercicios: [ejercicioSchema],
    // Puntuación global de la sesión (0–100), puede calcularse como promedio
    puntuacionGeneral: {
      type: Number,
      min: 0,
      max: 100,
    },
    // Nivel de dolor reportado por el paciente (escala 0–10)
    nivelDolor: {
      type: Number,
      min: 0,
      max: 10,
    },
    // Observaciones clínicas del terapeuta
    observaciones: {
      type: String,
      trim: true,
    },
    // Indicadores de progreso respecto a la sesión anterior
    progreso: {
      mejoraAngular: { type: Number },     // delta de ángulo en grados
      mejoraFuerza: { type: Number },      // delta en kg/N
      mejoraSimetria: { type: Number },    // delta en %
    },
  },
  {
    timestamps: true,  // createdAt, updatedAt
    versionKey: false,
  }
);

// ── Índices ───────────────────────────────────────────────────────────────────
sesionSchema.index({ pacienteId: 1, fecha: -1 });  // historial por paciente (más reciente primero)
sesionSchema.index({ tipoSesion: 1 });
sesionSchema.index({ estado: 1 });
sesionSchema.index({ fecha: -1 });

// ── Hook pre-save: calcular puntuacionGeneral si no viene en el body ──────────
sesionSchema.pre('save', function (next) {
  if (!this.puntuacionGeneral && this.ejercicios && this.ejercicios.length > 0) {
    const validos = this.ejercicios.filter((e) => e.puntuacion != null);
    if (validos.length > 0) {
      this.puntuacionGeneral = Math.round(
        validos.reduce((sum, e) => sum + e.puntuacion, 0) / validos.length
      );
    }
  }
  next();
});

const Sesion = mongoose.model('Sesion', sesionSchema);

module.exports = Sesion;
