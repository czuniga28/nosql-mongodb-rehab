'use strict';

const { Router } = require('express');
const {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  searchPatients,
  getProgress,
} = require('../controllers/paciente.controller');

const router = Router();

// POST   /api/patients          — create patient
router.post('/', createPatient);

// GET    /api/patients          — list all (?page=1&limit=10)
router.get('/', getAllPatients);

// GET    /api/patients/search   — search/filter (?q=&diagnostico=&genero=)
// Must come BEFORE /:id so Express doesn't treat 'search' as an ID
router.get('/search', searchPatients);

// GET    /api/patients/:id/progress — weekly recovery aggregation (?weeks=8)
router.get('/:id/progress', getProgress);

// GET    /api/patients/:id      — get by ID
router.get('/:id', getPatientById);

// PUT    /api/patients/:id      — update patient
router.put('/:id', updatePatient);

// DELETE /api/patients/:id      — soft delete patient
router.delete('/:id', deletePatient);

module.exports = router;
