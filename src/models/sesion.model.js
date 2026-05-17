'use strict';

const mongoose = require('mongoose');

// ── Sub-schema: biomechanical data per exercise ───────────────────────────────
const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
    },
    sets:            { type: Number, min: 1 },
    reps:            { type: Number, min: 0 },
    durationSeconds: { type: Number, min: 0 },
    // Biomechanical data captured (e.g. joint angles)
    biomechanics: {
      kneeAngle:     { type: Number }, // degrees
      shoulderAngle: { type: Number }, // degrees
      ankleAngle:    { type: Number }, // degrees
      symmetry:      { type: Number, min: 0, max: 100 }, // % body symmetry
    },
    // Individual exercise score (0–100)
    score: { type: Number, min: 0, max: 100 },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

// ── Main schema: Session ──────────────────────────────────────────────────────
const sessionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Session date is required'],
      default: Date.now,
    },
    sessionType: {
      type: String,
      enum: ['evaluation', 'therapy', 'strengthening', 'stretching', 'cardio', 'other'],
      required: [true, 'Session type is required'],
    },
    therapist: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    durationMinutes: {
      type: Number,
      min: [1, 'Minimum duration is 1 minute'],
    },
    // List of exercises performed in the session
    exercises: [exerciseSchema],
    // Overall session score (0–100), can be computed as an average
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    // Pain level reported by the patient (scale 0–10)
    painLevel: {
      type: Number,
      min: 0,
      max: 10,
    },
    // Clinical notes from the therapist
    clinicalNotes: {
      type: String,
      trim: true,
    },
    // Progress indicators compared to the previous session
    progress: {
      angularImprovement:  { type: Number }, // angle delta in degrees
      strengthImprovement: { type: Number }, // delta in kg/N
      symmetryImprovement: { type: Number }, // delta in %
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
sessionSchema.index({ patientId: 1, date: -1 }); // patient history (most recent first)
sessionSchema.index({ sessionType: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ date: -1 });

// ── Pre-save hook: compute overallScore if not provided ───────────────────────
sessionSchema.pre('save', function (next) {
  if (!this.overallScore && this.exercises && this.exercises.length > 0) {
    const scored = this.exercises.filter((e) => e.score != null);
    if (scored.length > 0) {
      this.overallScore = Math.round(
        scored.reduce((sum, e) => sum + e.score, 0) / scored.length
      );
    }
  }
  next();
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
