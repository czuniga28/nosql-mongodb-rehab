'use strict';

const sesionService = require('../services/sesion.service');

const createSesion = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Request body is required to create a session' });
    }

    const { patientId, date, sessionType, therapist, status, durationMinutes, exercises, overallScore, painLevel, clinicalNotes } = req.body;

    const sesion = await sesionService.createSesion({
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

    return res.status(201).json({ data: sesion });
  } catch (err) {
    return next(err);
  }
};

const getAllSesiones = async (req, res, next) => {
  try {
    const result = await sesionService.getAllSesiones({
      page: parseInt(req.query.page, 10),
      limit: parseInt(req.query.limit, 10),
      patientId: req.query.patientId,
    });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
};

const getSesionById = async (req, res, next) => {
  try {
    const sesion = await sesionService.getSesionById(req.params.id);
    return res.json({ data: sesion });
  } catch (err) {
    return next(err);
  }
};

const updateSesion = async (req, res, next) => {
  try {
    const sesion = await sesionService.updateSesion(req.params.id, req.body);
    return res.json({ data: sesion });
  } catch (err) {
    return next(err);
  }
};

const deleteSesion = async (req, res, next) => {
  try {
    const sesion = await sesionService.deleteSesion(req.params.id);
    return res.json({ message: 'Session deleted successfully', data: sesion });
  } catch (err) {
    return next(err);
  }
};

const searchSesiones = async (req, res, next) => {
  try {
    const { patientId, sessionType, status, startDate, endDate, page, limit } = req.query;
    const result = await sesionService.searchSesiones({
      patientId,
      sessionType,
      status,
      startDate,
      endDate,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createSesion,
  getAllSesiones,
  getSesionById,
  updateSesion,
  deleteSesion,
  searchSesiones,
};
