'use strict';

const { Router } = require('express');
const pacienteRoutes = require('./paciente.routes');
const sesionRoutes = require('./sesion.routes');

const router = Router();

router.use('/pacientes', pacienteRoutes);
router.use('/sesiones', sesionRoutes);

module.exports = router;
