'use strict';

const { Router } = require('express');
const {
  createPaciente,
  getAllPacientes,
  getPacienteById,
  updatePaciente,
  deletePaciente,
  searchPacientes,
  getProgreso,
} = require('../controllers/paciente.controller');

const router = Router();

// POST   /api/pacientes          — crear paciente
router.post('/', createPaciente);

// GET    /api/pacientes          — listar todos (?page=1&limit=10)
router.get('/', getAllPacientes);

// GET    /api/pacientes/search   — buscar/filtrar (?q=&diagnostico=&genero=)
// Debe ir ANTES de /:id para que Express no lo interprete como un ID
router.get('/search', searchPacientes);

// GET    /api/pacientes/:id/progreso — aggregation pipeline de recuperación (?semanas=8)
router.get('/:id/progreso', getProgreso);

// GET    /api/pacientes/:id      — obtener por ID
router.get('/:id', getPacienteById);

// PUT    /api/pacientes/:id      — actualizar paciente completo
router.put('/:id', updatePaciente);

// DELETE /api/pacientes/:id      — eliminar paciente
router.delete('/:id', deletePaciente);

module.exports = router;
