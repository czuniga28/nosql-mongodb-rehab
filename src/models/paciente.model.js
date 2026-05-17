'use strict';

const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    birthDate: {
      type: Date,
      required: [true, 'Birth date is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    contact: {
      phone: { type: String, trim: true },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
      },
    },
    diagnosis: {
      type: {
        type: String,
        required: [true, 'Diagnosis type is required'],
        trim: true,
      },
      description:   { type: String, trim: true },
      diagnosisDate: { type: Date },
    },
    recoveryStatus: {
      type: String,
      enum: ['initial', 'in_progress', 'advanced', 'discharged'],
      default: 'initial',
    },
    // Score 0–100 updated after each session
    recoveryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
patientSchema.index({ lastName: 1, firstName: 1 }); // sort/search by name
patientSchema.index({ 'diagnosis.type': 1 });        // filter by diagnosis
patientSchema.index({ recoveryStatus: 1 });          // filter by status
patientSchema.index({ active: 1 });                  // soft-delete filter

// ── Virtual: full name ────────────────────────────────────────────────────────
patientSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
