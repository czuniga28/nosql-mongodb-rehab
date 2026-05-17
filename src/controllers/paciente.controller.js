'use strict';

const patientService = require('../services/paciente.service');

const createPatient = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Request body is required to create a patient' });
    }

    const { firstName, lastName, birthDate, gender, contact, diagnosis } = req.body;

    const patient = await patientService.createPatient({ firstName, lastName, birthDate, gender, contact, diagnosis });

    return res.status(201).json({ data: patient });
  } catch (err) {
    return next(err);
  }
};

const getAllPatients = async (req, res, next) => {
  try {
    const result = await patientService.getAllPatients({
      page:  parseInt(req.query.page, 10),
      limit: parseInt(req.query.limit, 10),
    });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const patient = await patientService.getPatientById(req.params.id);
    return res.json({ data: patient });
  } catch (err) {
    return next(err);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const patient = await patientService.updatePatient(req.params.id, req.body);
    return res.json({ data: patient });
  } catch (err) {
    return next(err);
  }
};

const deletePatient = async (req, res, next) => {
  try {
    const patient = await patientService.deletePatient(req.params.id);
    return res.json({ message: 'Patient deleted successfully', data: patient });
  } catch (err) {
    return next(err);
  }
};

const searchPatients = async (req, res, next) => {
  try {
    const { q, diagnosis, gender, page, limit } = req.query;
    const result = await patientService.searchPatients({
      q,
      diagnosis,
      gender,
      page:  parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
};

const getProgress = async (req, res, next) => {
  try {
    const weeks  = req.query.weeks ? parseInt(req.query.weeks, 10) : undefined;
    const result = await patientService.getProgress(req.params.id, { weeks });
    return res.json({ data: result });
  } catch (err) {
    return next(err);
  }
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
