'use strict';

const { Router } = require('express');
const {
  createSesion,
  getAllSesiones,
  getSesionById,
  updateSesion,
  deleteSesion,
  searchSesiones,
} = require('../controllers/sesion.controller');

const router = Router();

// POST /api/sesiones - crea sesion
router.post('/', createSesion);

// GET /api/sesiones — lista todos los pacientes con paginación
router.get('/', getAllSesiones);

// GET /api/sesiones/search — filtrar sesiones por paciente, tipo, estado o rango de fechas
router.get('/search', searchSesiones);

// GET /api/sesiones/:id — obtener sesión por ID
router.get('/:id', getSesionById);

// PATCH /api/sesiones/:id — actualizar sesión por ID
router.patch('/:id', updateSesion);

// DELETE /api/sesiones/:id — eliminar sesión por ID
router.delete('/:id', deleteSesion);

module.exports = router;
