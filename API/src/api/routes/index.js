const express = require('express');
const router = express.Router();

const pacientes = require('./pacientes');
const profissionais = require('./profissionais');
const agendamentos = require('./agendamentos');

router.use(express.json());

router.use('/pacientes', pacientes);
router.use('/profissionais', profissionais);
router.use('/agendamentos', agendamentos);

module.exports = router;
