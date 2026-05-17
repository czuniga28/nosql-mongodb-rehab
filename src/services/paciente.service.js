'use strict';

const mongoose = require('mongoose');
const Patient  = require('../models/paciente.model');

const makeError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const validateObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw makeError('Invalid ID', 400);
};

const createPatient = async ({ firstName, lastName, birthDate, gender, contact, diagnosis }) => {
  return Patient.create({ firstName, lastName, birthDate, gender, contact, diagnosis });
};

const getAllPatients = async ({ page = 1, limit = 10 }) => {
  const safePage  = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const skip      = (safePage - 1) * safeLimit;

  const [data, total] = await Promise.all([
    Patient.find({ active: true }).sort({ lastName: 1, firstName: 1 }).skip(skip).limit(safeLimit),
    Patient.countDocuments({ active: true }),
  ]);

  return { data, total, page: safePage, limit: safeLimit };
};

const getPatientById = async (id) => {
  validateObjectId(id);
  const patient = await Patient.findOne({ _id: id, active: true });
  if (!patient) throw makeError('Patient not found', 404);
  return patient;
};

const updatePatient = async (id, { firstName, lastName, birthDate, gender, contact, diagnosis, recoveryStatus } = {}) => {
  validateObjectId(id);
  const updates = Object.fromEntries(
    Object.entries({ firstName, lastName, birthDate, gender, contact, diagnosis, recoveryStatus })
      .filter(([, v]) => v !== undefined)
  );

  const patient = await Patient.findOneAndUpdate(
    { _id: id, active: true },
    updates,
    { new: true, runValidators: true }
  );
  if (!patient) throw makeError('Patient not found', 404);
  return patient;
};

const deletePatient = async (id) => {
  validateObjectId(id);
  const patient = await Patient.findOneAndUpdate(
    { _id: id, active: true },
    { active: false },
    { new: true }
  );
  if (!patient) throw makeError('Patient not found', 404);
  return patient;
};

const searchPatients = async ({ q, diagnosis, gender, page = 1, limit = 10 } = {}) => {
  const safePage  = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const skip      = (safePage - 1) * safeLimit;

  const filter = { active: true };

  if (q) {
    const parts = q.trim().split(/\s+/);
    if (parts.length >= 2) {
      filter.$and = [
        { firstName: new RegExp(parts[0], 'i') },
        { lastName: new RegExp(parts.slice(1).join(' '), 'i') },
      ];
    } else {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ firstName: regex }, { lastName: regex }];
    }
  }
  if (diagnosis) filter['diagnosis.type'] = new RegExp(diagnosis, 'i');
  if (gender)    filter.gender = gender;

  const [data, total] = await Promise.all([
    Patient.find(filter).sort({ lastName: 1, firstName: 1 }).skip(skip).limit(safeLimit),
    Patient.countDocuments(filter),
  ]);

  return { data, total, page: safePage, limit: safeLimit };
};

const getProgress = async (id, { weeks = 8 } = {}) => {
  validateObjectId(id);

  const patient = await Patient.findOne({ _id: id, active: true }).lean();
  if (!patient) throw makeError('Patient not found', 404);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  const Session = require('../models/sesion.model');

  const sessions = await Session.aggregate([
    {
      $match: {
        patientId: patient._id,
        date:      { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%W', date: '$date' },
        },
        totalSessions: { $sum: 1 },
        averageLevel:  { $avg: '$recoveryLevel' },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id:           0,
        week:          '$_id',
        totalSessions: 1,
        averageLevel:  { $round: ['$averageLevel', 1] },
      },
    },
  ]);

  return {
    patient: {
      id:             patient._id,
      fullName:       `${patient.firstName} ${patient.lastName}`,
      recoveryStatus: patient.recoveryStatus,
      recoveryLevel:  patient.recoveryLevel,
    },
    weeks,
    startDate,
    sessions,
  };
};

module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  searchPatients,
  getProgress,
};
