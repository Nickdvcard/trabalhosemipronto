const express = require('express');
const router = express.Router();

const pacientes = require('./pacientes');
const profissionais = require('./profissionais');
const agendamentos = require('./agendamentos');
const usuarios = require('./usuarios');
const profissoes = require('./profissoes');
const condicoes = require('./condicoes');


router.use(express.json());

router.use('/pacientes', pacientes);
router.use('/profissionais', profissionais);
router.use('/agendamentos', agendamentos);
router.use('/usuarios', usuarios);
router.use('/profissoes', profissoes);
router.use('/condicoes', condicoes);

module.exports = router;
