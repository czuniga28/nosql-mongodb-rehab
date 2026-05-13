'use strict';

const pacienteService = require('../services/paciente.service');

const createPaciente = async (req, res, next) => {
  try {

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Se requieren datos para crear el paciente' });
    }
    
    const { nombre, apellidos, fechaNacimiento, genero, contacto, diagnostico } = req.body;

    const paciente = await pacienteService.createPaciente({ nombre, apellidos, fechaNacimiento, genero, contacto, diagnostico });

    return res.status(201).json({ data: paciente });
  } catch (err) {
    return next(err);
  }
};

const getAllPacientes = async (req, res, next) => {
  try {
    const result = await pacienteService.getAllPacientes({
      page: parseInt(req.query.page, 10),
      limit: parseInt(req.query.limit, 10),
    });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
};

const getPacienteById = async (req, res, next) => {
  try {
    const paciente = await pacienteService.getPacienteById(req.params.id);
    return res.json({ data: paciente });
  } catch (err) {
    return next(err);
  }
};

const updatePaciente = async (req, res, next) => {
  try {
    const paciente = await pacienteService.updatePaciente(req.params.id, req.body);
    return res.json({ data: paciente });
  } catch (err) {
    return next(err);
  }
};

const deletePaciente = async (req, res, next) => {};

const searchPacientes = async (req, res, next) => {};

const getProgreso = async (req, res, next) => {};

module.exports = {
  createPaciente,
  getAllPacientes,
  getPacienteById,
  updatePaciente,
  deletePaciente,
  searchPacientes,
  getProgreso,
};
