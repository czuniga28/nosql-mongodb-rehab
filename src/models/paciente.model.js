'use strict';

const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    apellidos: {
      type: String,
      required: [true, 'Los apellidos son obligatorios'],
      trim: true,
    },
    fechaNacimiento: {
      type: Date,
      required: [true, 'La fecha de nacimiento es obligatoria'],
    },
    genero: {
      type: String,
      enum: ['masculino', 'femenino', 'otro'],
      required: [true, 'El género es obligatorio'],
    },
    contacto: {
      telefono: { type: String, trim: true },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Formato de correo inválido'],
      },
    },
    diagnostico: {
      tipo: {
        type: String,
        required: [true, 'El tipo de diagnóstico es obligatorio'],
        trim: true,
      },
      descripcion: { type: String, trim: true },
      fechaDiagnostico: { type: Date },
    },
    estadoRecuperacion: {
      type: String,
      enum: ['inicial', 'en_progreso', 'avanzado', 'alta'],
      default: 'inicial',
    },
    // Score de 0–100 que se actualiza tras cada sesión
    nivelRecuperacion: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,  // agrega createdAt y updatedAt automáticamente
    versionKey: false,
  }
);

// ── Índices ──────────────────────────────────────────────────────────────────
pacienteSchema.index({ apellidos: 1, nombre: 1 });          // ordenación/búsqueda por nombre
pacienteSchema.index({ 'diagnostico.tipo': 1 });            // filtro por diagnóstico
pacienteSchema.index({ estadoRecuperacion: 1 });            // filtro por estado
pacienteSchema.index({ activo: 1 });                        // soft-delete filter

// ── Virtual: nombre completo ──────────────────────────────────────────────────
pacienteSchema.virtual('nombreCompleto').get(function () {
  return `${this.nombre} ${this.apellidos}`;
});

const Paciente = mongoose.model('Paciente', pacienteSchema);

module.exports = Paciente;
