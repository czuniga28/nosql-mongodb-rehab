'use strict';

const mongoose = require('mongoose');
const Paciente = require('../models/paciente.model');

const makeError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const validateObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw makeError('ID inválido', 400);
};

const createPaciente = async ({ nombre, apellidos, fechaNacimiento, genero, contacto, diagnostico }) => {
  return Paciente.create({ nombre, apellidos, fechaNacimiento, genero, contacto, diagnostico });
};

const getAllPacientes = async ({ page = 1, limit = 10 }) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  const [data, total] = await Promise.all([
    Paciente.find({ activo: true }).sort({ apellidos: 1, nombre: 1 }).skip(skip).limit(safeLimit),
    Paciente.countDocuments({ activo: true }),
  ]);

  return { data, total, page: safePage, limit: safeLimit };
};

const getPacienteById = async (id) => {
  validateObjectId(id);
  const paciente = await Paciente.findOne({ _id: id, activo: true });
  if (!paciente) throw makeError('Paciente no encontrado', 404);
  return paciente;
};

const updatePaciente = async (id, body) => {
  validateObjectId(id);
  const { nombre, apellidos, fechaNacimiento, genero, contacto, diagnostico, estadoRecuperacion } = body;
  const updates = Object.fromEntries(
    Object.entries({ nombre, apellidos, fechaNacimiento, genero, contacto, diagnostico, estadoRecuperacion })
      .filter(([, v]) => v !== undefined)
  );

  const paciente = await Paciente.findOneAndUpdate(
    { _id: id, activo: true },
    updates,
    { new: true, runValidators: true }
  );
  if (!paciente) throw makeError('Paciente no encontrado', 404);
  return paciente;
};

module.exports = { createPaciente, getAllPacientes, getPacienteById, updatePaciente };
