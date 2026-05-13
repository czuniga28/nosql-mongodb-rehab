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

// POST   /api/sesiones           — crear sesión
router.post('/', createSesion);

// GET    /api/sesiones           — listar todas (?page=1&limit=10&pacienteId=)
router.get('/', getAllSesiones);

// GET    /api/sesiones/search    — filtrar (?pacienteId=&tipoSesion=&fechaInicio=&fechaFin=&estado=)
// Debe ir ANTES de /:id
router.get('/search', searchSesiones);

// GET    /api/sesiones/:id       — obtener por ID
router.get('/:id', getSesionById);

// PATCH  /api/sesiones/:id       — actualización parcial
router.patch('/:id', updateSesion);

// DELETE /api/sesiones/:id       — eliminar sesión
router.delete('/:id', deleteSesion);

module.exports = router;
