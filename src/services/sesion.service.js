'use strict';

const mongoose = require('mongoose');
const Session = require('../models/sesion.model');
const Patient = require('../models/paciente.model');

// Constantes para no tener "magic numbers" en el código y sea más readable
const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MIN_PAGE: 1,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
};

const SORT_ORDER = {
  ASCENDING: 1,
  DESCENDING: -1,
};

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
};

// Manejo de errores
const makeError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

// Se valida que existe el paciente antes de hacer operaciones
const validateObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw makeError('Invalid ID', HTTP_STATUS.BAD_REQUEST);
  }
};

// Funciones de servicio para sesiones
const validatePaginationParams = (page, limit) => {
  const validPage = Math.max(PAGINATION_CONFIG.MIN_PAGE, page || PAGINATION_CONFIG.DEFAULT_PAGE);
  const validLimit = Math.min(
    PAGINATION_CONFIG.MAX_LIMIT,
    Math.max(PAGINATION_CONFIG.MIN_LIMIT, limit || PAGINATION_CONFIG.DEFAULT_LIMIT)
  );
  return { validPage, validLimit };
};

// Ayuda con el cálculo de skip para paginación, para no repetir la lógica
const calculateSkip = (page, limit) => {
  return (page - 1) * limit;
};

// CREATE
const createSesion = async ({
  patientId,
  date,
  sessionType,
  therapist,
  status = 'scheduled',
  durationMinutes,
  exercises = [],
  overallScore,
  painLevel,
  clinicalNotes,
}) => {
  validateObjectId(patientId);
  const patient = await Patient.findOne({ _id: patientId, active: true });
  if (!patient) throw makeError('Patient not found', HTTP_STATUS.NOT_FOUND);

  return Session.create({
    patientId,
    date,
    sessionType,
    therapist,
    status,
    durationMinutes,
    exercises,
    overallScore,
    painLevel,
    clinicalNotes,
  });
};

// GET ALL
const getAllSesiones = async ({ page = PAGINATION_CONFIG.DEFAULT_PAGE, limit = PAGINATION_CONFIG.DEFAULT_LIMIT, patientId } = {}) => {
  const { validPage, validLimit } = validatePaginationParams(page, limit);
  const skip = calculateSkip(validPage, validLimit);

  const filter = {};
  if (patientId) {
    validateObjectId(patientId);
    filter.patientId = new mongoose.Types.ObjectId(patientId);
  }

  const [data, total] = await Promise.all([
    Session.find(filter)
      .populate('patientId', 'firstName lastName')
      .sort({ date: SORT_ORDER.DESCENDING })
      .skip(skip)
      .limit(validLimit),
    Session.countDocuments(filter),
  ]);

  return { data, total, page: validPage, limit: validLimit };
};

// GET BY ID
const getSesionById = async (id) => {
  validateObjectId(id);
  const session = await Session.findById(id).populate('patientId', 'firstName lastName email contact');
  if (!session) throw makeError('Session not found', HTTP_STATUS.NOT_FOUND);
  return session;
};

// UPDATE
const updateSesion = async (id, updates = {}) => {
  validateObjectId(id);

  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key, value]) => value !== undefined)
  );

  if (cleanUpdates.patientId) {
    validateObjectId(cleanUpdates.patientId);
    const patient = await Patient.findOne({ _id: cleanUpdates.patientId, active: true });
    if (!patient) throw makeError('Patient not found', HTTP_STATUS.NOT_FOUND);
  }

  const session = await Session.findByIdAndUpdate(id, cleanUpdates, {
    new: true,
    runValidators: true,
  }).populate('patientId', 'firstName lastName');

  if (!session) throw makeError('Session not found', HTTP_STATUS.NOT_FOUND);
  return session;
};

// DELETE
const deleteSesion = async (id) => {
  validateObjectId(id);
  const session = await Session.findByIdAndDelete(id);
  if (!session) throw makeError('Session not found', HTTP_STATUS.NOT_FOUND);
  return session;
};

// SEARCH
const searchSesiones = async ({
  patientId,
  sessionType,
  status,
  startDate,
  endDate,
  page = PAGINATION_CONFIG.DEFAULT_PAGE,
  limit = PAGINATION_CONFIG.DEFAULT_LIMIT,
} = {}) => {
  const { validPage, validLimit } = validatePaginationParams(page, limit);
  const skip = calculateSkip(validPage, validLimit);

  const filter = {};

  if (patientId) {
    validateObjectId(patientId);
    filter.patientId = new mongoose.Types.ObjectId(patientId);
  }

  if (sessionType) {
    filter.sessionType = sessionType;
  }

  if (status) {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const [data, total] = await Promise.all([
    Session.find(filter)
      .populate('patientId', 'firstName lastName')
      .sort({ date: SORT_ORDER.DESCENDING })
      .skip(skip)
      .limit(validLimit),
    Session.countDocuments(filter),
  ]);

  return { data, total, page: validPage, limit: validLimit };
};

module.exports = {
  createSesion,
  getAllSesiones,
  getSesionById,
  updateSesion,
  deleteSesion,
  searchSesiones,
};
